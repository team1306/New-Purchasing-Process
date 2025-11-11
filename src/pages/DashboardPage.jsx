import { useState, useEffect } from 'react';
import { LogOut, User, Search, Package, Calendar, DollarSign, Filter, X, RefreshCw, Plus } from 'lucide-react';
import {
    fetchPurchases,
    fetchValidation, updatePurchaseByRequestId,
} from '../utils/googleSheets';
import RequestForm from "./RequestForm.jsx";
import PurchaseDetailModal from "./PurchaseDetails.jsx";
import {getAccessToken} from "../utils/googleAuth.js";

// Easy to modify category list
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

// State filter options
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

export const StateBadge = ({ state }) => {
    if (!state) return null;

    const colorClass = STATE_COLORS[state] || 'bg-gray-100 text-gray-800';

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}>{state}</span>
    );
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

export const calculateTotalCost = (purchase) => {
    const itemPrice = parseCurrency(purchase['Unit Price']) ?? 0;
    const quantity = parseCurrency(purchase['Quantity']) ?? 0;
    const shipping = parseCurrency(purchase['Shipping']) ?? 0;

    const cost = (itemPrice * quantity) + shipping;
    purchase['Total Cost'] = formatCurrency(cost);
    return purchase['Total Cost'];
};

export const parseCurrency = (formatted) => {
    if (!formatted) return 0;
    // Remove any non-numeric characters except for the decimal point
    const num = parseFloat(formatted.replace(/[^0-9.-]+/g, ''));
    return isNaN(num) ? 0 : num;
};

export default function Dashboard({ user, onSignOut }) {
    const [purchases, setPurchases] = useState([]);
    const [filteredPurchases, setFilteredPurchases] = useState([]);
    const [validation, setValidation] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedStates, setSelectedStates] = useState([]);
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        loadPurchases();
    }, []);

    useEffect(() => {
        // Filter purchases based on search query, categories, and states
        let filtered = purchases;

        // Filter by search query
        if (searchQuery.trim() !== '') {
            filtered = filtered.filter(purchase =>
                purchase['Item Description']?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by categories
        if (selectedCategories.length > 0) {
            filtered = filtered.filter(purchase =>
                selectedCategories.includes(purchase['Category'])
            );
        }

        // Filter by states
        if (selectedStates.length > 0) {
            filtered = filtered.filter(purchase =>
                selectedStates.includes(purchase['State'])
            );
        }

        setFilteredPurchases(filtered);
    }, [searchQuery, selectedCategories, selectedStates, purchases]);

    const loadPurchases = async () => {
        try {
            setLoading(true);
            await handleRefresh();
        } catch (err) {
            console.error('Error loading data:', err);
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            const [purchasesData, validationData] = await Promise.all([
                fetchPurchases(),
                fetchValidation()
            ]);

            // Sort by Date Requested (most recent first)
            const sorted = purchasesData.sort((a, b) => {
                const dateA = new Date(a['Date Requested']);
                const dateB = new Date(b['Date Requested']);
                return dateB - dateA;
            });

            setPurchases(sorted);
            setFilteredPurchases(sorted);
            setValidation(validationData);

            // Update the selected purchase with fresh data if modal is open
            if (selectedPurchase) {
                const updatedPurchase = sorted.find(
                    p => p['Request ID'] === selectedPurchase['Request ID']
                );
                if (updatedPurchase) {
                    setSelectedPurchase(updatedPurchase);
                }
            }

            setError(null);
        } catch (err) {
            console.error('Error refreshing data:', err);
            alert('Failed to refresh data. Please try again.');
        } finally {
            setRefreshing(false);
        }
    };

    const getAvailableStateTransitions = (currentState) => {
        // Regular users have limited transitions
        const transitions = {
            'Pending Approval': ['On Hold'],
            'Approved': ['Purchased', 'On Hold'],
            'Purchased': ['Received', 'Completed'],
            'On Hold': ['Pending Approval'],
        };

        return transitions[currentState] || [];
    };

    const handleStateChange = async (purchase, newState) => {
        try {
            const updatedPurchase = {
                ...purchase,
                'State': newState
            };

            await updatePurchaseByRequestId(purchase['Request ID'], updatedPurchase, getAccessToken());
            setOpenDropdownId(null); // Close dropdown after state change
            await loadPurchases();
        } catch (err) {
            console.error('Error updating state:', err);
            alert('Failed to update state. Please try again.');
        }
    };

    const toggleCategory = (category) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const toggleState = (state) => {
        setSelectedStates(prev =>
            prev.includes(state)
                ? prev.filter(s => s !== state)
                : [...prev, state]
        );
    };

    const clearAllFilters = () => {
        setSelectedCategories([]);
        setSelectedStates([]);
        setSearchQuery('');
    };

    const activeFilterCount = selectedCategories.length + selectedStates.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-7xl mx-auto pt-8">
                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
                                    <p className="text-blue-100">Purchase Requests</p>
                                </div>
                                <button
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center"
                                    title="Refresh data"
                                >
                                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                    {refreshing ? 'Refreshing...' : 'Refresh'}
                                </button>
                                <button
                                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-semibold"
                                    onClick={() => setShowCreateForm(true)}
                                >
                                    <Plus size={16} /> Create Request
                                </button>

                                {showCreateForm && (
                                    <RequestForm
                                        user={user}
                                        onClose={() => setShowCreateForm(false)}
                                        onCreated={loadPurchases}
                                        presetFields={{ 'State': 'Pending Approval' }}
                                    />
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <img
                                    src={user.picture}
                                    alt="Profile"
                                    className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
                                />
                                <div className="text-right">
                                    <p className="font-semibold">{user.name}</p>
                                    <p className="text-sm text-blue-100">{user.email}</p>
                                </div>
                                <button
                                    onClick={onSignOut}
                                    className="ml-4 bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="p-6 border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by item description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    {/* Filter Options */}
                    <div className="p-6 border-b bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-gray-600" />
                                <h3 className="font-semibold text-gray-800">Filters</h3>
                                {activeFilterCount > 0 && (
                                    <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </div>
                            {activeFilterCount > 0 && (
                                <button
                                    onClick={clearAllFilters}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                                >
                                    <X className="w-4 h-4" />
                                    Clear All
                                </button>
                            )}
                        </div>

                        {/* Category Filters */}
                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Category</p>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => toggleCategory(category)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                                            selectedCategories.includes(category)
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400'
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* State Filters */}
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">State</p>
                            <div className="flex flex-wrap gap-2">
                                {STATES.map(state => (
                                    <button
                                        key={state}
                                        onClick={() => toggleState(state)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                                            selectedStates.includes(state)
                                                ? 'bg-indigo-600 text-white shadow-md'
                                                : 'bg-white text-gray-700 border border-gray-300 hover:border-indigo-400'
                                        }`}
                                    >
                                        {state}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Purchases List */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading purchases...</p>
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center">
                            <p className="text-red-600 mb-4">{error}</p>
                            <button
                                onClick={loadPurchases}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : filteredPurchases.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg">
                                {searchQuery ? 'No purchases found matching your search' : 'No purchases yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredPurchases.map((purchase, index) => (
                                <div
                                    key={index}
                                    className="p-6 hover:bg-gray-50 transition duration-150"
                                >
                                    <div className="flex justify-between items-start">
                                        <div
                                            className="flex-1 cursor-pointer"
                                            onClick={() => setSelectedPurchase(purchase)}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-800">
                                                    {purchase['Item Description'] || 'No description'}
                                                </h3>
                                                {purchase['State'] && <StateBadge state={purchase['State']} />}
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">Requested</p>
                                                        <p className="font-medium">{formatDate(purchase['Date Requested'])}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center text-sm text-gray-600">
                                                    <User className="w-4 h-4 mr-2 text-gray-400" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">Requester</p>
                                                        <p className="font-medium">{purchase['Requester'] || 'N/A'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Package className="w-4 h-4 mr-2 text-gray-400" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">Category</p>
                                                        <p className="font-medium">{purchase['Category'] || 'N/A'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center text-sm text-gray-600">
                                                    <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">Total Cost</p>
                                                        <p className="font-medium">{calculateTotalCost(purchase)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {purchase['Comments'] && (
                                                <p className="mt-3 text-sm text-gray-600 italic">
                                                    {purchase['Comments']}
                                                </p>
                                            )}

                                            {purchase['Item Link'] && (
                                                <a
                                                    href={purchase['Item Link']}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    View Item Link →
                                                </a>
                                            )}
                                        </div>

                                        <div className="ml-4 text-right flex flex-col items-end gap-3">
                                            <div>
                                                <p className="text-sm text-gray-500">Request ID</p>
                                                <p className="font-mono text-sm font-semibold text-gray-700">
                                                    {purchase['Request ID'] || `REQ-${index + 1}`}
                                                </p>
                                            </div>

                                            {/* State Change Buttons */}
                                            {(() => {
                                                const availableStates = getAvailableStateTransitions(
                                                    purchase['State'],
                                                    user.name
                                                );

                                                if (availableStates.length > 0) {
                                                    return (
                                                        <div className="flex flex-col gap-2">
                                                            <p className="text-xs text-gray-500 font-medium">Change State:</p>
                                                            {availableStates.map(state => (
                                                                <button
                                                                    key={state}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (window.confirm(`Change state to "${state}"?`)) {
                                                                            handleStateChange(purchase, state);
                                                                        }
                                                                    }}
                                                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition duration-200 whitespace-nowrap ${STATE_COLORS[state]} hover:opacity-80 hover:shadow-md`}
                                                                >
                                                                    → {state}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Results Count */}
                {!loading && !error && filteredPurchases.length > 0 && (
                    <div className="mt-4 text-center text-sm text-gray-600">
                        Showing {filteredPurchases.length} of {purchases.length} purchase{purchases.length !== 1 ? 's' : ''}
                    </div>
                )}

                {/* Purchase Detail Modal */}
                {selectedPurchase && (
                    <PurchaseDetailModal
                        purchase={selectedPurchase}
                        user={user}
                        validation={validation}
                        onClose={() => setSelectedPurchase(null)}
                        onUpdate={loadPurchases}
                    />
                )}
            </div>
        </div>
    );
}