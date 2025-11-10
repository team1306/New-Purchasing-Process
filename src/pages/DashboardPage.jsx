import { useState, useEffect } from 'react';
import { LogOut, User, Mail, Search, Package, Calendar, DollarSign, Filter, X, CheckCircle, AlertCircle, XCircle, RefreshCw } from 'lucide-react';
import { fetchPurchases, fetchValidation, updatePurchaseByRequestId } from '../utils/googleSheets';

// Easy to modify category list
const CATEGORIES = [
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
const STATES = [
    'Pending Approval',
    'Approved',
    'Received',
    'Purchased',
    'On Hold'
];

export default function Dashboard({ user, accessToken, onSignOut }) {
    const [purchases, setPurchases] = useState([]);
    const [filteredPurchases, setFilteredPurchases] = useState([]);
    const [validation, setValidation] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedStates, setSelectedStates] = useState([]);
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [approvalLoading, setApprovalLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

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
            const [purchasesData, validationData] = await Promise.all([
                fetchPurchases(),
                fetchValidation()
            ]);

            // Sort by Date Requested (most recent first)
            const sorted = purchasesData.sort((a, b) => {
                const dateA = new Date(a['Date Requested']);
                const dateB = new Date(b['Date Requested']);
                return dateB - dateA; // Descending order
            });

            setPurchases(sorted);
            setFilteredPurchases(sorted);
            setValidation(validationData);
            setError(null);
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
            setError(null);
        } catch (err) {
            console.error('Error refreshing data:', err);
            alert('Failed to refresh data. Please try again.');
        } finally {
            setRefreshing(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        if (!amount) return '$0.00';
        const num = parseFloat(amount);
        return isNaN(num) ? amount : `${num.toFixed(2)}`;
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

    const getUserApprovalPermissions = () => {
        const userName = user.name;
        const permissions = {
            canStudentApprove: false,
            studentApprovalLimit: 0,
            canMentorApprove: false,
            mentorApprovalLimit: 0
        };

        // Check Presidents column - can student approve any request
        if (validation['Presidents']?.includes(userName)) {
            permissions.canStudentApprove = true;
            permissions.studentApprovalLimit = Infinity;
        }
        // Check Leadership column - can student approve up to $500
        else if (validation['Leadership']?.includes(userName)) {
            permissions.canStudentApprove = true;
            permissions.studentApprovalLimit = 500;
        }

        // Check Mentor column - can mentor approve up to $500
        if (validation['Mentor']?.includes(userName)) {
            permissions.canMentorApprove = true;
            permissions.mentorApprovalLimit = 500;
        }
        // Check Directors column - can mentor approve any request
        else if (validation['Directors']?.includes(userName)) {
            permissions.canMentorApprove = true;
            permissions.mentorApprovalLimit = Infinity;
        }

        return permissions;
    };

    const canApproveRequest = (purchase, approvalType) => {
        const totalCost = parseFloat(purchase['Total Cost']) || 0;

        // Nobody can approve requests over $2000
        if (totalCost > 2000) {
            return { canApprove: false, reason: 'Requests over $2,000 cannot be approved' };
        }

        const permissions = getUserApprovalPermissions();

        if (approvalType === 'student') {
            if (!permissions.canStudentApprove) {
                return { canApprove: false, reason: 'You do not have student approval permissions' };
            }
            if (totalCost > permissions.studentApprovalLimit) {
                return { canApprove: false, reason: `You can only student approve requests up to ${permissions.studentApprovalLimit}` };
            }
            return { canApprove: true };
        }

        if (approvalType === 'mentor') {
            if (!permissions.canMentorApprove) {
                return { canApprove: false, reason: 'You do not have mentor approval permissions' };
            }
            if (totalCost > permissions.mentorApprovalLimit) {
                return { canApprove: false, reason: `You can only mentor approve requests up to ${permissions.mentorApprovalLimit}` };
            }
            return { canApprove: true };
        }

        return { canApprove: false, reason: 'Unknown approval type' };
    };

    const handleApprove = async (purchase, approvalType) => {
        if (!accessToken) {
            alert('Authentication token not found. Please sign in again.');
            return;
        }

        try {
            setApprovalLoading(true);

            const updates = {};

            if (approvalType === 'student') {
                updates['S Approver'] = user.name;
            } else if (approvalType === 'mentor') {
                updates['M Approver'] = user.name;
            }

            // Call the update function
            await updatePurchaseByRequestId(purchase['Request ID'], updates, accessToken);

            // Reload purchases to reflect the change
            await loadPurchases();

            // Update the selected purchase to show the new approver
            const updatedPurchase = { ...selectedPurchase, ...updates };
            setSelectedPurchase(updatedPurchase);

            alert(`Successfully approved as ${approvalType}!`);
        } catch (err) {
            console.error('Error approving purchase:', err);
            alert(`Failed to approve purchase: ${err.message}`);
        } finally {
            setApprovalLoading(false);
        }
    };

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
                                    onClick={() => setSelectedPurchase(purchase)}
                                    className="p-6 hover:bg-gray-50 transition duration-150 cursor-pointer"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-800">
                                                    {purchase['Item Description'] || 'No description'}
                                                </h3>
                                                {purchase['State'] && (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        purchase['State'] === 'Approved' ? 'bg-green-100 text-green-800' :
                                                            purchase['State'] === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                purchase['State'] === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {purchase['State']}
                                                    </span>
                                                )}
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
                                                        <p className="font-medium">{formatCurrency(purchase['Total Cost'])}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {purchase['Comments'] && (
                                                <p className="mt-3 text-sm text-gray-600 italic">
                                                    "{purchase['Comments']}"
                                                </p>
                                            )}

                                            {purchase['Item Link'] && (
                                                <a
                                                    href={purchase['Item Link']}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                                                >
                                                    View Item Link →
                                                </a>
                                            )}
                                        </div>

                                        <div className="ml-4 text-right">
                                            <p className="text-sm text-gray-500">Request ID</p>
                                            <p className="font-mono text-sm font-semibold text-gray-700">
                                                {purchase['Request ID'] || `REQ-${index + 1}`}
                                            </p>
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
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedPurchase(null)}>
                        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white sticky top-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold mb-1">{selectedPurchase['Item Description']}</h2>
                                        <p className="text-blue-100">Request ID: {selectedPurchase['Request ID']}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedPurchase(null)}
                                        className="text-white hover:bg-white/20 rounded-lg p-2 transition"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Status Badge */}
                                {selectedPurchase['State'] && (
                                    <div className="flex justify-center">
                                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                            selectedPurchase['State'] === 'Approved' ? 'bg-green-100 text-green-800' :
                                                selectedPurchase['State'] === 'Pending approval' ? 'bg-yellow-100 text-yellow-800' :
                                                    selectedPurchase['State'] === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                        }`}>
                                            {selectedPurchase['State']}
                                        </span>
                                    </div>
                                )}

                                {/* Basic Info Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-500 mb-1">Date Requested</p>
                                        <p className="font-semibold text-gray-800">{formatDate(selectedPurchase['Date Requested'])}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-500 mb-1">Requester</p>
                                        <p className="font-semibold text-gray-800">{selectedPurchase['Requester'] || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-500 mb-1">Category</p>
                                        <p className="font-semibold text-gray-800">{selectedPurchase['Category'] || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-500 mb-1">Quantity</p>
                                        <p className="font-semibold text-gray-800">{selectedPurchase['Quantity'] || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Cost Info */}
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-sm text-blue-700 mb-1">Unit Price</p>
                                            <p className="font-bold text-blue-900">{formatCurrency(selectedPurchase['Unit Price'])}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-blue-700 mb-1">Shipping</p>
                                            <p className="font-bold text-blue-900">{formatCurrency(selectedPurchase['Shipping'])}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-blue-700 mb-1">Total Cost</p>
                                            <p className="font-bold text-blue-900 text-xl">{formatCurrency(selectedPurchase['Total Cost'])}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Item Link */}
                                {selectedPurchase['Item Link'] && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-2">Item Link</p>
                                        <a
                                            href={selectedPurchase['Item Link']}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-700 hover:underline break-all"
                                        >
                                            {selectedPurchase['Item Link']}
                                        </a>
                                    </div>
                                )}

                                {/* Comments */}
                                {selectedPurchase['Comments'] && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-2">Comments</p>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-800 italic">"{selectedPurchase['Comments']}"</p>
                                        </div>
                                    </div>
                                )}

                                {/* Purchase Info */}
                                {(selectedPurchase['Date Purchased'] || selectedPurchase['Order Number']) && (
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedPurchase['Date Purchased'] && (
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Date Purchased</p>
                                                <p className="font-semibold text-gray-800">{formatDate(selectedPurchase['Date Purchased'])}</p>
                                            </div>
                                        )}
                                        {selectedPurchase['Order Number'] && (
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Order Number</p>
                                                <p className="font-semibold text-gray-800">{selectedPurchase['Order Number']}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Approvals Section */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Approvals</h3>

                                    {/* Warning if over $2000 */}
                                    {parseFloat(selectedPurchase['Total Cost']) > 2000 && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start">
                                            <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-red-800">Cannot Approve</p>
                                                <p className="text-sm text-red-700">Requests over $2,000 cannot be approved through this system.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Warning if user cannot approve */}
                                    {!getUserApprovalPermissions().canStudentApprove && !getUserApprovalPermissions().canMentorApprove && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 flex items-start">
                                            <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-yellow-800">No Approval Permissions</p>
                                                <p className="text-sm text-yellow-700">You are not authorized to approve purchase requests.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Student Approver */}
                                    <div className="bg-gray-50 p-4 rounded-lg mb-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Student Approver</p>
                                                {selectedPurchase['S Approver'] ? (
                                                    <div className="flex items-center">
                                                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                                        <p className="font-semibold text-gray-800">{selectedPurchase['S Approver']}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-500 italic">Not yet approved</p>
                                                )}
                                            </div>
                                            {!selectedPurchase['S Approver'] && (() => {
                                                const approval = canApproveRequest(selectedPurchase, 'student');
                                                return approval.canApprove ? (
                                                    <button
                                                        onClick={() => handleApprove(selectedPurchase, 'student')}
                                                        disabled={approvalLoading}
                                                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                                                    >
                                                        {approvalLoading ? 'Approving...' : 'Approve as Student'}
                                                    </button>
                                                ) : null;
                                            })()}
                                        </div>
                                    </div>

                                    {/* Mentor Approver */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Mentor Approver</p>
                                                {selectedPurchase['M Approver'] ? (
                                                    <div className="flex items-center">
                                                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                                        <p className="font-semibold text-gray-800">{selectedPurchase['M Approver']}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-500 italic">Not yet approved</p>
                                                )}
                                            </div>
                                            {!selectedPurchase['M Approver'] && (() => {
                                                const approval = canApproveRequest(selectedPurchase, 'mentor');
                                                return approval.canApprove ? (
                                                    <button
                                                        onClick={() => handleApprove(selectedPurchase, 'mentor')}
                                                        disabled={approvalLoading}
                                                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                                                    >
                                                        {approvalLoading ? 'Approving...' : 'Approve as Mentor'}
                                                    </button>
                                                ) : null;
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}