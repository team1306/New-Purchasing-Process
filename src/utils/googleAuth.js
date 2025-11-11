const GOOGLE_CLIENT_ID = import.meta.env.VITE_ID;

let tokenClient;
let accessToken = null;

/**
 * Initialize Google Sign-In and OAuth2 for Sheets access
 */
export const initializeGoogleSignIn = (callback, onComplete) => {
    // Wait for Google script to load
    const checkGoogleLoaded = setInterval(() => {
        if (window.google) {
            clearInterval(checkGoogleLoaded);

            // Initialize Sign-In for authentication
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: callback,
                auto_select: true,
                use_fedcm_for_prompt: true,
            });

            // Initialize OAuth2 token client for Sheets API access
            tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/spreadsheets',
                callback: (tokenResponse) => {
                    if (tokenResponse.access_token) {
                        accessToken = tokenResponse.access_token;
                        // Save token to localStorage for auto-login
                        localStorage.setItem('sheets_access_token', accessToken);
                        localStorage.setItem('sheets_token_expiry', Date.now() + (tokenResponse.expires_in * 1000));
                    }
                },
            });

            // Check for saved token
            const savedToken = localStorage.getItem('sheets_access_token');
            const tokenExpiry = localStorage.getItem('sheets_token_expiry');

            if (savedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
                // Token is still valid
                accessToken = savedToken;
            }

            // Try to prompt automatic sign-in
            window.google.accounts.id.prompt((notification) => {
                if (onComplete) onComplete();
            });
        }
    }, 100);
};

/**
 * Request Sheets API access token
 * Will prompt user for permission if needed
 */
export const requestSheetsAccess = () => {
    return new Promise((resolve, reject) => {
        // Check if we have a valid saved token
        const savedToken = localStorage.getItem('sheets_access_token');
        const tokenExpiry = localStorage.getItem('sheets_token_expiry');

        if (savedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
            accessToken = savedToken;
            resolve(accessToken);
            return;
        }

        if (!tokenClient) {
            reject(new Error('Token client not initialized'));
            return;
        }

        tokenClient.callback = (tokenResponse) => {
            if (tokenResponse.error) {
                reject(tokenResponse);
                return;
            }
            accessToken = tokenResponse.access_token;
            // Save token
            localStorage.setItem('sheets_access_token', accessToken);
            localStorage.setItem('sheets_token_expiry', Date.now() + (tokenResponse.expires_in * 1000));
            resolve(accessToken);
        };

        // Request token with prompt='' to avoid showing consent screen if already granted
        tokenClient.requestAccessToken({ prompt: '' });
    });
};

/**
 * Get the current access token
 */
export const getAccessToken = () => {
    // Check if saved token is still valid
    const savedToken = localStorage.getItem('sheets_access_token');
    const tokenExpiry = localStorage.getItem('sheets_token_expiry');

    if (savedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
        return savedToken;
    }

    return accessToken;
};

export const getRefreshedAccessToken = async () => {
    let token = getAccessToken();
    if (!token) token = await requestSheetsAccess();
    return token;
}

/**
 * Clear saved tokens on sign out
 */
export const clearTokens = () => {
    accessToken = null;
    localStorage.removeItem('sheets_access_token');
    localStorage.removeItem('sheets_token_expiry');
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