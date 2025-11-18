const GOOGLE_CLIENT_ID = import.meta.env.VITE_ID;
const EXPECTED_SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET;

let tokenClient;
let accessToken = null;
let pickerInited = false;
let gisInited = false;

/**
 * Initialize Google OAuth (combines sign-in and Drive access)
 */
export const initializeGoogleAuth = (onComplete) => {
    // Wait for Google script to load
    const checkGoogleLoaded = setInterval(() => {
        if (window.google && window.gapi) {
            clearInterval(checkGoogleLoaded);

            // Initialize OAuth2 token client with drive.file scope only
            // This scope only grants access to files the app creates or that the user explicitly selects
            tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/drive.file openid email profile',
                callback: (tokenResponse) => {
                    if (tokenResponse.access_token) {
                        accessToken = tokenResponse.access_token;
                        // Save token to localStorage
                        localStorage.setItem('drive_access_token', accessToken);
                        localStorage.setItem('drive_token_expiry', Date.now() + (tokenResponse.expires_in * 1000));
                    }
                },
            });

            gisInited = true;

            // Load picker API
            window.gapi.load('picker', () => {
                pickerInited = true;
            });

            if (onComplete) onComplete();
        }
    }, 100);
};

/**
 * Request OAuth access (sign in and get Drive permissions in one step)
 */
export const requestOAuthAccess = () => {
    return new Promise((resolve, reject) => {
        if (!tokenClient) {
            reject(new Error('OAuth client not initialized'));
            return;
        }

        tokenClient.callback = (tokenResponse) => {
            if (tokenResponse.error) {
                reject(new Error(`OAuth error: ${tokenResponse.error}`));
                return;
            }

            // Extract user info from ID token if available
            if (tokenResponse.id_token) {
                const userInfo = parseJwt(tokenResponse.id_token);
                accessToken = tokenResponse.access_token;
                localStorage.setItem('drive_access_token', accessToken);
                localStorage.setItem('drive_token_expiry', Date.now() + (tokenResponse.expires_in * 1000));

                resolve({
                    accessToken,
                    user: {
                        name: userInfo.name,
                        email: userInfo.email,
                        picture: userInfo.picture
                    }
                });
            } else {
                // Fallback: just return access token
                accessToken = tokenResponse.access_token;
                localStorage.setItem('drive_access_token', accessToken);
                localStorage.setItem('drive_token_expiry', Date.now() + (tokenResponse.expires_in * 1000));

                // Fetch user info separately
                fetchUserInfo(accessToken)
                    .then(user => resolve({ accessToken, user }))
                    .catch(() => resolve({ accessToken, user: null }));
            }
        };

        // Request access token with prompt
        try {
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } catch (err) {
            reject(new Error('Failed to request access token'));
        }
    });
};

/**
 * Fetch user info from Google API
 */
const fetchUserInfo = async (token) => {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user info');
    }

    const data = await response.json();
    return {
        name: data.name,
        email: data.email,
        picture: data.picture
    };
};

/**
 * Check if we have a valid saved session
 */
export const hasValidSession = () => {
    const savedToken = localStorage.getItem('drive_access_token');
    const tokenExpiry = localStorage.getItem('drive_token_expiry');

    return savedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry);
};

/**
 * Get saved access token and user info
 */
export const getSavedSession = async () => {
    if (!hasValidSession()) {
        return null;
    }

    const savedToken = localStorage.getItem('drive_access_token');
    accessToken = savedToken;

    try {
        const user = await fetchUserInfo(savedToken);
        return { accessToken: savedToken, user };
    } catch (err) {
        console.error('Failed to fetch user info:', err);
        return { accessToken: savedToken, user: null };
    }
};

/**
 * Show Google Drive Picker to select spreadsheet
 */
export const showDrivePicker = () => {
    return new Promise((resolve, reject) => {
        if (!pickerInited || !gisInited) {
            reject(new Error('Google Picker not initialized'));
            return;
        }

        if (!accessToken) {
            reject(new Error('No access token available'));
            return;
        }

        createPicker(resolve, reject);
    });
};

/**
 * Create and show the picker with Shared Drive support
 */
const createPicker = (resolve, reject) => {
    // Create view for regular Drive
    const docsView = new window.google.picker.DocsView(window.google.picker.ViewId.SPREADSHEETS)
        .setIncludeFolders(true)
        .setSelectFolderEnabled(false);

    // Create view for Shared Drives
    const sharedDriveView = new window.google.picker.DocsView(window.google.picker.ViewId.SPREADSHEETS)
        .setIncludeFolders(true)
        .setSelectFolderEnabled(false)
        .setEnableDrives(true); // Enable Shared Drives

    const picker = new window.google.picker.PickerBuilder()
        .addView(docsView)
        .addView(sharedDriveView)
        .enableFeature(window.google.picker.Feature.SUPPORT_DRIVES) // Critical for Shared Drives
        .setOAuthToken(accessToken)
        .setDeveloperKey(import.meta.env.VITE_PICKER_API_KEY)
        .setCallback(async (data) => {
            if (data.action === window.google.picker.Action.PICKED) {
                const doc = data.docs[0];
                const spreadsheetId = doc.id;

                try {
                    // Validate spreadsheet ID matches
                    if (spreadsheetId !== EXPECTED_SPREADSHEET_ID) {
                        throw new Error('Selected spreadsheet does not match the expected purchasing sheet');
                    }

                    // Request explicit permission to access this file
                    // For Shared Drive files, we need supportsAllDrives parameter
                    await requestFilePermission(spreadsheetId);

                    // Save the selected spreadsheet
                    localStorage.setItem('selected_spreadsheet_id', spreadsheetId);

                    // Validate tabs
                    await validateSpreadsheetTabs(spreadsheetId);

                    resolve(spreadsheetId);
                } catch (err) {
                    reject(new Error(`Invalid spreadsheet: ${err.message}`));
                }
            } else if (data.action === window.google.picker.Action.CANCEL) {
                reject(new Error('Picker cancelled'));
            }
        })
        .build();

    picker.setVisible(true);
};

/**
 * Request explicit permission to access the file
 * Uses Drive API to establish proper access for Shared Drive files
 */
const requestFilePermission = async (spreadsheetId) => {
    const apiKey = import.meta.env.VITE_PICKER_API_KEY;

    console.log('Establishing access to file...');

    // First, try to get file metadata via Drive API to establish access
    // This "opens" the file with our token
    try {
        const driveResponse = await fetch(
            `https://www.googleapis.com/drive/v3/files/${spreadsheetId}?fields=id,name,mimeType,capabilities&supportsAllDrives=true&key=${apiKey}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        if (driveResponse.ok) {
            const fileInfo = await driveResponse.json();
            console.log('File accessed via Drive API:', fileInfo.name);

            // Now wait a moment for the permission to propagate to Sheets API
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Try accessing via Sheets API
            const sheetsResponse = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?includeGridData=false&supportsAllDrives=true&key=${apiKey}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (sheetsResponse.ok) {
                console.log('Successfully accessed via Sheets API');
                return await sheetsResponse.json();
            }

            const errorText = await sheetsResponse.text();
            console.error('Sheets API error:', errorText);
            throw new Error('Drive API succeeded but Sheets API failed. The file may not be properly shared.');
        }

        const errorText = await driveResponse.text();
        console.log(driveResponse)
        console.error('Drive API error:', errorText);
        throw new Error('Cannot access file via Drive API. Please ensure you have access to this file.');

    } catch (error) {
        console.error('Permission request failed:', error);
        throw new Error('Cannot establish access to the file.');
    }
};

/**
 * Validate that the spreadsheet has the required tabs
 */
const validateSpreadsheetTabs = async (spreadsheetId) => {
    const apiKey = import.meta.env.VITE_PICKER_API_KEY;

    // Small delay to let permission propagate
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties&key=${apiKey}`,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        }
    );

    if (!response.ok) {
        throw new Error(`Cannot access spreadsheet (${response.status})`);
    }

    const data = await response.json();

    // Validate that required tabs exist
    if (!data.sheets || data.sheets.length === 0) {
        throw new Error('Spreadsheet has no sheets');
    }

    const sheetTitles = data.sheets.map(sheet => sheet.properties.title);
    const purchasesTab = import.meta.env.VITE_PURCHASES_TAB;
    const validationTab = import.meta.env.VITE_VALIDATION_TAB;

    if (!sheetTitles.includes(purchasesTab)) {
        throw new Error(`Spreadsheet is missing the required "${purchasesTab}" tab`);
    }

    if (!sheetTitles.includes(validationTab)) {
        throw new Error(`Spreadsheet is missing the required "${validationTab}" tab`);
    }

    return true;
};

/**
 * Check if user has already selected and validated a spreadsheet
 */
export const hasValidSpreadsheet = () => {
    const savedSpreadsheetId = localStorage.getItem('selected_spreadsheet_id');
    return savedSpreadsheetId === EXPECTED_SPREADSHEET_ID;
};

/**
 * Get the current access token
 */
export const getAccessToken = () => {
    // Check if saved token is still valid
    const savedToken = localStorage.getItem('drive_access_token');
    const tokenExpiry = localStorage.getItem('drive_token_expiry');

    if (savedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
        return savedToken;
    }

    return accessToken;
};

export const getRefreshedAccessToken = async () => {
    let token = getAccessToken();
    if (!token) {
        throw new Error('No valid access token. Please sign in again.');
    }
    return token;
}

/**
 * Clear saved tokens and spreadsheet selection on sign out
 */
export const clearTokens = () => {
    accessToken = null;
    localStorage.removeItem('drive_access_token');
    localStorage.removeItem('drive_token_expiry');
    localStorage.removeItem('selected_spreadsheet_id');
};

export const parseJwt = (token) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );
    return JSON.parse(jsonPayload);
};