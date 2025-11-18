const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET;
const API_KEY = import.meta.env.VITE_PICKER_API_KEY;

// Tab names
const PURCHASES_TAB = import.meta.env.VITE_PURCHASES_TAB;
const VALIDATION_TAB = import.meta.env.VITE_VALIDATION_TAB;

/**
 * Fetches data from a specific sheet tab
 * @param {string} sheetName - Name of the sheet tab
 * @param {string} accessToken - OAuth2 access token from Google Sign-In
 * @returns {Promise<Array>} Array of rows, where each row is an array of cell values
 */
const fetchSheetData = async (sheetName, accessToken) => {
    if (!accessToken) {
        throw new Error('Access token is required but was not provided');
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(sheetName)}?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`API Error Response:`, errorBody);

            if (response.status === 401) {
                throw new Error(`Authentication failed (401). Please sign in again.`);
            }
            if (response.status === 404) {
                throw new Error(`Spreadsheet or sheet "${sheetName}" not found. Make sure you selected the correct file and it has the required tabs.`);
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.values || [];
    } catch (error) {
        console.error(`Error fetching ${sheetName}:`, error);
        throw error;
    }
};

/**
 * Deletes a purchase row by Request ID from the Purchases tab
 * @param {string} requestId - The Request ID to delete
 * @param {string} accessToken - OAuth2 access token from Google Sign-In
 * @returns {Promise<Object>} Response from the API
 */
export const deletePurchaseByRequestId = async (requestId, accessToken) => {
    try {
        // Fetch all purchases to find the row index
        const purchases = await fetchSheetData(PURCHASES_TAB, accessToken);
        const headers = purchases[0] || [];
        const dataRows = purchases.slice(1);

        const rowIndex = dataRows.findIndex(row => row[headers.indexOf('Request ID')] === requestId);

        if (rowIndex === -1) {
            throw new Error(`Request ID ${requestId} not found`);
        }

        // Row index in the sheet (0-based) including header row
        const actualRowIndex = rowIndex + 1; // +1 for header row

        // Get sheet ID
        const sheetInfoUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=sheets.properties&key=${API_KEY}`;
        const sheetInfoResp = await fetch(sheetInfoUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        });

        if (!sheetInfoResp.ok) {
            throw new Error(`Failed to fetch spreadsheet info: ${sheetInfoResp.status}`);
        }

        const sheetInfo = await sheetInfoResp.json();
        const sheet = sheetInfo.sheets.find(s => s.properties.title === PURCHASES_TAB);
        if (!sheet) {
            throw new Error(`Sheet "${PURCHASES_TAB}" not found`);
        }
        const sheetId = sheet.properties.sheetId;

        // Build batchUpdate request
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}:batchUpdate?key=${API_KEY}`;
        const body = {
            requests: [
                {
                    deleteDimension: {
                        range: {
                            sheetId,
                            dimension: 'ROWS',
                            startIndex: actualRowIndex,
                            endIndex: actualRowIndex + 1
                        }
                    }
                }
            ]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`Failed to delete row: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error deleting purchase with Request ID ${requestId}:`, error);
        throw error;
    }
};

/**
 * Fetches purchases data and returns as array of objects
 * @param {string} accessToken - OAuth2 access token from Google Sign-In
 * @returns {Promise<Array>} Array of purchase objects
 */
export const fetchPurchases = async (accessToken) => {
    const rows = await fetchSheetData(PURCHASES_TAB, accessToken);

    if (rows.length === 0) {
        return [];
    }

    const headers = rows[0];
    const purchases = rows.slice(1).map(row => {
        const purchase = {};
        headers.forEach((header, index) => {
            purchase[header] = row[index] || '';
        });
        return purchase;
    });

    return purchases;
};

/**
 * Fetches validation data (groups and people matrix)
 * @param {string} accessToken - OAuth2 access token from Google Sign-In
 * @returns {Promise<Object>} Object with groups as keys and people arrays as values
 */
export const fetchValidation = async (accessToken) => {
    const rows = await fetchSheetData(VALIDATION_TAB, accessToken);

    if (rows.length === 0) {
        return {};
    }

    // First row contains the column headers (group names)
    const headers = rows[0];
    const validation = {};

    // Initialize each group as an empty array
    headers.forEach(header => {
        if (header) validation[header] = [];
    });

    // Process data rows (starting from row 1, skipping the header row)
    rows.slice(1).forEach(row => {
        row.forEach((cell, colIndex) => {
            const groupName = headers[colIndex];
            // Only add non-empty cells that aren't "Tier 3/4" text
            if (groupName && cell && cell.trim() !== '' && !cell.includes('Tier')) {
                validation[groupName].push(cell.trim());
            }
        });
    });

    return validation;
};

/**
 * Fetches all data from both tabs
 * @param {string} accessToken - OAuth2 access token from Google Sign-In
 * @returns {Promise<Object>} Object containing purchases and validation data
 */
export const fetchAllData = async (accessToken) => {
    try {
        const [purchases, validation] = await Promise.all([
            fetchPurchases(accessToken),
            fetchValidation(accessToken)
        ]);

        return {
            purchases,
            validation
        };
    } catch (error) {
        console.error('Error fetching all data:', error);
        throw error;
    }
};

/**
 * Updates a specific cell or range in the Purchases tab
 * @param {string} range - A1 notation (e.g., 'A2' or 'A2:C5')
 * @param {Array|string} values - Single value or 2D array of values
 * @param {string} accessToken - OAuth2 access token from Google Sign-In
 * @returns {Promise<Object>} Response from the API
 */
export const updatePurchases = async (range, values, accessToken) => {
    const fullRange = `${PURCHASES_TAB}!${range}`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${fullRange}?valueInputOption=USER_ENTERED&key=${API_KEY}`;

    // Convert single value to 2D array format
    const valueArray = Array.isArray(values) ? values : [[values]];

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                values: valueArray
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating purchases:', error);
        throw error;
    }
};

/**
 * Updates a specific row in the Purchases tab by Request ID
 * @param {string} requestId - The Request ID to find
 * @param {Object} updates - Object with column headers as keys and new values
 * @param {string} accessToken - OAuth2 access token from Google Sign-In
 * @returns {Promise<Object>} Response from the API
 */
export const updatePurchaseByRequestId = async (requestId, updates, accessToken) => {
    // First fetch all purchases to find the row
    const purchases = await fetchPurchases(accessToken);
    const rowIndex = purchases.findIndex(p => p['Request ID'] === requestId);

    if (rowIndex === -1) {
        throw new Error(`Request ID ${requestId} not found`);
    }

    // Row index + 2 because: +1 for header row, +1 for 0-based to 1-based indexing
    const actualRowNumber = rowIndex + 2;

    // Get the header row to map column names to letters
    const headers = await fetchSheetData(PURCHASES_TAB, accessToken);
    const headerRow = headers[0];

    // Update each field
    const updatePromises = Object.entries(updates).map(([columnName, value]) => {
        const colIndex = headerRow.indexOf(columnName);
        if (colIndex === -1) {
            console.warn(`Column "${columnName}" not found`);
            return null;
        }

        // Convert column index to letter (A=0, B=1, etc.)
        const colLetter = String.fromCharCode(65 + colIndex);
        const cellRange = `${colLetter}${actualRowNumber}`;

        return updatePurchases(cellRange, value, accessToken);
    });

    return Promise.all(updatePromises.filter(p => p !== null));
};

/**
 * Creates a new purchase request in the Purchases tab
 * @param {Object} purchaseData - Object containing all purchase fields
 * @param {string} accessToken - OAuth2 access token from Google Sign-In
 * @returns {Promise<Object>} Response from the API
 */
export const createPurchase = async (purchaseData, accessToken) => {
    try {
        // Fetch existing purchases to get the header row
        const rows = await fetchSheetData(PURCHASES_TAB, accessToken);
        const headerRow = rows[0];
        if (!headerRow) throw new Error('Header row not found in Purchases sheet');

        // Generate a unique Request ID using Unix timestamp
        const requestId = Math.floor(Date.now() / 1000);

        // Map header to values; ensure all values are strings and non-null
        const newRow = headerRow.map(header => {
            if (header === 'Request ID') return String(requestId);
            const value = purchaseData[header];
            return value != null ? String(value) : '';
        });

        // Determine next empty row number
        const nextRowNumber = rows.length + 1; // +1 because sheet rows are 1-based

        // Build A1 notation for first column only; Sheets will fill remaining columns
        const range = `A${nextRowNumber}`;

        // Wrap the row in a 2D array for API
        const valueArray = [newRow];

        // Call updatePurchases helper
        return await updatePurchases(range, valueArray, accessToken);

    } catch (error) {
        console.error('Error creating new purchase:', error);
        throw error;
    }
};