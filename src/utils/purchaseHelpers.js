export const CATEGORIES = [
    'Robot',
    'Inventory',
    'Outreach',
    'Field',
    'Competition',
    'Tools',
    'Consumables',
    'Other'
];

export const STATES = [
    'Pending Approval',
    'Approved',
    'Received',
    'Purchased',
    'On Hold',
    'Completed'
];

export const STATE_COLORS = {
    'Pending Approval': 'bg-yellow-100 text-yellow-800',
    'Approved': 'bg-blue-100 text-blue-800',
    'Received': 'bg-green-100 text-green-800',
    'Purchased': 'bg-purple-100 text-purple-800',
    'On Hold': 'bg-gray-100 text-gray-800',
    'Completed': 'bg-green-100 text-green-800'
};

export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    const num = parseFloat(amount);
    return isNaN(num) ? amount : `$${num.toFixed(2)}`;
};

export const parseCurrency = (formatted) => {
    if (!formatted) return 0;
    const num = parseFloat(formatted.replace(/[^0-9.-]+/g, ''));
    return isNaN(num) ? 0 : num;
};

export const calculateTotalCost = (purchase) => {
    const itemPrice = parseCurrency(purchase['Unit Price']) ?? 0;
    const quantity = parseCurrency(purchase['Quantity']) ?? 0;
    const shipping = parseCurrency(purchase['Shipping']) ?? 0;
    const cost = (itemPrice * quantity) + shipping;
    return formatCurrency(cost);
};

export const getRequestTier = (totalCost) => {
    if (totalCost <= 500) return 'tier1';
    if (totalCost <= 2000) return 'tier2';
    return 'tier3';
};

export const getAvailableStateTransitions = (currentState) => {
    const transitions = {
        'Pending Approval': ['On Hold'],
        'Approved': ['Purchased', 'On Hold'],
        'Purchased': ['Received', 'Completed'],
        'On Hold': ['Pending Approval'],
    };
    return transitions[currentState] || [];
};