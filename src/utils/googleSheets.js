const SPREADSHEET_ID = '1CY6O9AULg9PiHQ9gy7nzOth4446plJyVEBunKZ8a7X8';
const API_KEY = 'AIzaSyAYCPj5v3IfCW2zowYhM0G5bpCp-DbUOjM'; // Get from Google Cloud Console

// Tab names
const PURCHASES_TAB = 'Item List';
const VALIDATION_TAB = 'Validation Lists';

/**
 * Fetches data from a specific sheet tab
 * @param {string} sheetName - Name of the sheet tab
 * @returns {Promise<Array>} Array of rows, where each row is an array of cell values
 */
const fetchSheetData = async (sheetName) => {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}?key=${API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
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
 * Fetches purchases data and returns as array of objects
 * @returns {Promise<Array>} Array of purchase objects
 */
export const fetchPurchases = async () => {
    const rows = await fetchSheetData(PURCHASES_TAB);

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
 * @returns {Promise<Object>} Object with groups as keys and people arrays as values
 */
export const fetchValidation = async () => {
    const rows = await fetchSheetData(VALIDATION_TAB);

    if (rows.length === 0) {
        return {};
    }

    const groups = rows[0]; // First row contains group names
    const validation = {};

    // Initialize each group as an empty array
    groups.forEach(group => {
        if (group) validation[group] = [];
    });

    // Process each person row
    rows.slice(1).forEach(row => {
        row.forEach((person, index) => {
            const group = groups[index];
            if (group && person) {
                validation[group].push(person);
            }
        });
    });

    return validation;
};

/**
 * Fetches all data from both tabs
 * @returns {Promise<Object>} Object containing purchases and validation data
 */
export const fetchAllData = async () => {
    try {
        const [purchases, validation] = await Promise.all([
            fetchPurchases(),
            fetchValidation()
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
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${fullRange}?valueInputOption=USER_ENTERED`;

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
    const purchases = await fetchPurchases();
    const rowIndex = purchases.findIndex(p => p['Request ID'] === requestId);

    if (rowIndex === -1) {
        throw new Error(`Request ID ${requestId} not found`);
    }

    // Row index + 2 because: +1 for header row, +1 for 0-based to 1-based indexing
    const actualRowNumber = rowIndex + 2;

    // Get the header row to map column names to letters
    const headers = await fetchSheetData(PURCHASES_TAB);
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