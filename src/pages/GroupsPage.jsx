import { useState } from 'react';
import { ChevronDown, ChevronRight, Package, Check } from 'lucide-react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import SearchBar from '../components/dashboard/SearchBar';
import FilterPanel from '../components/dashboard/FilterPanel';
import PurchaseDetailModal from '../components/PurchaseDetailModal';
import RequestForm from '../components/RequestForm';
import BulkActionBar from '../components/dashboard/BulkActionBar';
import GroupCard from '../components/groups/GroupCard';
import { useAlert } from '../components/AlertContext';
import { applyFiltersAndSort } from '../utils/filterHelpers';
import { parseCurrency, formatCurrency } from '../utils/purchaseHelpers';

export default function GroupsPage({
                                       user,
                                       onSignOut,
                                       purchases,
                                       validation,
                                       loading,
                                       error,
                                       refreshing,
                                       onRefresh,
                                       onRetry,
                                       onUpdatePurchase,
                                       onLoadPurchases,
                                       viewMode,
                                       onToggleViewMode
                                   }) {
    const { showError, showConfirm } = useAlert();
    const [expandedGroups, setExpandedGroups] = useState(new Set());
    const [ungroupedExpanded, setUngroupedExpanded] = useState(true);
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingShipping, setEditingShipping] = useState(null);
    const [shippingValue, setShippingValue] = useState('');

    // Selection state
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedPurchases, setSelectedPurchases] = useState([]);

    // Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedStates, setSelectedStates] = useState([]);
    const [needsApprovalFilter, setNeedsApprovalFilter] = useState(false);
    const [sortOption, setSortOption] = useState('newest');

    const isDirector = validation['Directors']?.includes(user.name);

    // Group purchases by Group Name
    const groupPurchases = () => {
        const grouped = new Map();
        const ungrouped = [];

        purchases.forEach(purchase => {
            const groupName = purchase['Group Name']?.trim();
            if (groupName && groupName !== '') {
                if (!grouped.has(groupName)) {
                    grouped.set(groupName, []);
                }
                grouped.get(groupName).push(purchase);
            } else {
                ungrouped.push(purchase);
            }
        });

        return { grouped: Array.from(grouped.entries()), ungrouped };
    };

    const { grouped, ungrouped } = groupPurchases();

    // Apply filters to a list of purchases
    const applyFilters = (purchaseList) => {
        return applyFiltersAndSort(purchaseList, {
            searchQuery,
            selectedCategories,
            selectedStates,
            needsApprovalFilter,
            sortOption,
            validation,
            userName: user.name
        });
    };

    const toggleGroup = (groupName) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(groupName)) {
                next.delete(groupName);
            } else {
                next.add(groupName);
            }
            return next;
        });
    };

    const toggleAllGroups = () => {
        if (expandedGroups.size === grouped.length) {
            setExpandedGroups(new Set());
        } else {
            setExpandedGroups(new Set(grouped.map(([name]) => name)));
        }
    };

    const handleStateChange = async (purchase, newState) => {
        try {
            const updates = { 'State': newState };

            if (newState === 'Purchased') {
                const today = new Date();
                const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000))
                    .toISOString()
                    .split('T')[0];
                updates['Date Purchased'] = localDate;
            }

            if (newState === 'Received') {
                const today = new Date();
                const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000))
                    .toISOString()
                    .split('T')[0];
                updates['Date Received'] = localDate;
            }

            await onUpdatePurchase(purchase['Request ID'], updates);
        } catch (err) {
            await showError('Failed to update state. Please try again.');
        }
    };

    const handleShippingEdit = (purchase) => {
        setEditingShipping(purchase['Request ID']);
        const currentShipping = purchase['Shipping'] ? parseCurrency(purchase['Shipping']).toString() : '0';
        setShippingValue(currentShipping);
    };

    const handleShippingSave = async (purchase) => {
        try {
            const numericValue = parseFloat(shippingValue);
            if (isNaN(numericValue) || numericValue < 0) {
                await showError('Please enter a valid shipping cost');
                return;
            }

            await onUpdatePurchase(purchase['Request ID'], {
                'Shipping': formatCurrency(numericValue)
            });

            setEditingShipping(null);
            setShippingValue('');
        } catch (err) {
            await showError('Failed to update shipping. Please try again.');
        }
    };

    const handleShippingCancel = () => {
        setEditingShipping(null);
        setShippingValue('');
    };

    const handleToggleSelectionMode = () => {
        setSelectionMode(!selectionMode);
        if (selectionMode) {
            setSelectedPurchases([]);
        }
    };

    const handleToggleSelect = (purchase) => {
        setSelectedPurchases(prev => {
            const isSelected = prev.some(p => p['Request ID'] === purchase['Request ID']);

            if (isSelected) {
                return prev.filter(p => p['Request ID'] !== purchase['Request ID']);
            } else {
                if (prev.length === 0 || prev[0]['State'] === purchase['State']) {
                    return [...prev, purchase];
                }
                return prev;
            }
        });
    };

    const handleToggleSelectGroup = (groupPurchases) => {
        const allSelected = groupPurchases.every(p =>
            selectedPurchases.some(sp => sp['Request ID'] === p['Request ID'])
        );

        if (allSelected) {
            // Deselect all in group
            setSelectedPurchases(prev =>
                prev.filter(p => !groupPurchases.some(gp => gp['Request ID'] === p['Request ID']))
            );
        } else {
            // Select all in group (if they have the same state as already selected)
            const firstState = selectedPurchases.length > 0 ? selectedPurchases[0]['State'] : groupPurchases[0]['State'];
            const selectablePurchases = groupPurchases.filter(p => p['State'] === firstState);

            setSelectedPurchases(prev => {
                const newSelection = [...prev];
                selectablePurchases.forEach(p => {
                    if (!newSelection.some(sp => sp['Request ID'] === p['Request ID'])) {
                        newSelection.push(p);
                    }
                });
                return newSelection;
            });
        }
    };

    const handleBulkStateChange = async (newState) => {
        const confirmed = await showConfirm(
            `Change ${selectedPurchases.length} item${selectedPurchases.length !== 1 ? 's' : ''} to "${newState}"?`,
            { confirmText: 'Change All', cancelText: 'Cancel' }
        );

        if (!confirmed) return;

        try {
            const updates = { 'State': newState };

            if (newState === 'Purchased') {
                const today = new Date();
                const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000))
                    .toISOString()
                    .split('T')[0];
                updates['Date Purchased'] = localDate;
            }

            if (newState === 'Received') {
                const today = new Date();
                const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000))
                    .toISOString()
                    .split('T')[0];
                updates['Date Received'] = localDate;
            }

            await Promise.all(
                selectedPurchases.map(purchase =>
                    onUpdatePurchase(purchase['Request ID'], updates)
                )
            );

            setSelectedPurchases([]);
            setSelectionMode(false);
        } catch (err) {
            await showError('Failed to update some items. Please try again.');
        }
    };

    const clearAllFilters = () => {
        setSelectedCategories([]);
        setSelectedStates([]);
        setSearchQuery('');
        setNeedsApprovalFilter(false);
        setSortOption('newest');
    };

    const activeFilterCount = selectedCategories.length + selectedStates.length + (needsApprovalFilter ? 1 : 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading purchases...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={onRetry}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="md:p-4">
                <div className="max-w-7xl mx-auto md:pt-8">
                    {/* Header */}
                    <div className="bg-white md:rounded-2xl shadow-2xl overflow-hidden mb-4 md:mb-6">
                        <DashboardHeader
                            user={user}
                            onSignOut={onSignOut}
                            onRefresh={onRefresh}
                            onCreateRequest={() => setShowCreateForm(true)}
                            refreshing={refreshing}
                            selectionMode={selectionMode}
                            onToggleSelectionMode={handleToggleSelectionMode}
                            selectedCount={selectedPurchases.length}
                            viewMode={viewMode}
                            onToggleViewMode={onToggleViewMode}
                        />

                        {!selectionMode && (
                            <>
                                <SearchBar value={searchQuery} onChange={setSearchQuery} />
                                <FilterPanel
                                    selectedCategories={selectedCategories}
                                    selectedStates={selectedStates}
                                    needsApprovalFilter={needsApprovalFilter}
                                    sortOption={sortOption}
                                    activeFilterCount={activeFilterCount}
                                    onToggleCategory={(cat) => setSelectedCategories(prev =>
                                        prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
                                    )}
                                    onToggleState={(state) => setSelectedStates(prev =>
                                        prev.includes(state) ? prev.filter(s => s !== state) : [...prev, state]
                                    )}
                                    onToggleNeedsApproval={() => setNeedsApprovalFilter(!needsApprovalFilter)}
                                    onSortChange={setSortOption}
                                    onClearAll={clearAllFilters}
                                    canSeeNeedsApprovalFilter={validation['Mentors']?.includes(user.name) ||
                                        validation['Directors']?.includes(user.name) ||
                                        validation['Presidents']?.includes(user.name) ||
                                        validation['Leadership']?.includes(user.name)}
                                    approvalFilterLabel={validation['Mentors']?.includes(user.name) ||
                                    validation['Directors']?.includes(user.name) ?
                                        'Needs Mentor Approval' : 'Needs Student Approval'}
                                />
                            </>
                        )}
                    </div>

                    {/* Bulk Action Bar */}
                    {selectionMode && selectedPurchases.length > 0 && (
                        <BulkActionBar
                            selectedPurchases={selectedPurchases}
                            onBulkStateChange={handleBulkStateChange}
                        />
                    )}

                    {/* Groups List */}
                    <div className="bg-white md:rounded-2xl shadow-2xl overflow-hidden mb-4">
                        {/* Expand/Collapse All */}
                        {grouped.length > 0 && (
                            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                                <p className="text-sm font-semibold text-gray-700">
                                    {grouped.length} group{grouped.length !== 1 ? 's' : ''}
                                </p>
                                <button
                                    onClick={toggleAllGroups}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                                >
                                    {expandedGroups.size === grouped.length ? 'Collapse All' : 'Expand All'}
                                </button>
                            </div>
                        )}

                        {/* Grouped Items */}
                        {grouped.map(([groupName, groupPurchases]) => {
                            const filteredGroupPurchases = applyFilters(groupPurchases);
                            if (filteredGroupPurchases.length === 0) return null;

                            const isExpanded = expandedGroups.has(groupName);
                            const allSelected = filteredGroupPurchases.every(p =>
                                selectedPurchases.some(sp => sp['Request ID'] === p['Request ID'])
                            );
                            const someSelected = filteredGroupPurchases.some(p =>
                                selectedPurchases.some(sp => sp['Request ID'] === p['Request ID'])
                            );
                            const selectedState = selectedPurchases.length > 0 ? selectedPurchases[0]['State'] : null;
                            const canSelectGroup = !selectedState || filteredGroupPurchases.every(p => p['State'] === selectedState);

                            return (
                                <div key={groupName} className="border-b last:border-b-0">
                                    {/* Group Header */}
                                    <div className="p-4 bg-gray-50 hover:bg-gray-100 transition">
                                        <div className="flex items-center gap-3">
                                            {selectionMode && (
                                                <button
                                                    onClick={() => handleToggleSelectGroup(filteredGroupPurchases)}
                                                    disabled={!canSelectGroup}
                                                    className={`flex-shrink-0 ${!canSelectGroup ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition ${
                                                        allSelected
                                                            ? 'bg-blue-600 border-blue-600'
                                                            : someSelected
                                                                ? 'bg-blue-300 border-blue-600'
                                                                : 'bg-white border-gray-300'
                                                    }`}>
                                                        {(allSelected || someSelected) && <Check className="w-4 h-4 text-white" />}
                                                    </div>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => toggleGroup(groupName)}
                                                className="flex-1 flex items-center gap-2 text-left"
                                            >
                                                {isExpanded ? (
                                                    <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
                                                ) : (
                                                    <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-800 truncate">{groupName}</h3>
                                                    <p className="text-sm text-gray-600">
                                                        {filteredGroupPurchases.length} item{filteredGroupPurchases.length !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Group Items */}
                                    {isExpanded && (
                                        <div className="divide-y divide-gray-200">
                                            {filteredGroupPurchases.map((purchase, index) => {
                                                const isSelected = selectedPurchases.some(p => p['Request ID'] === purchase['Request ID']);
                                                const selectionDisabled = selectionMode && selectedState && purchase['State'] !== selectedState;

                                                return (
                                                    <GroupCard
                                                        key={purchase['Request ID'] || index}
                                                        purchase={purchase}
                                                        index={index}
                                                        isDirector={isDirector}
                                                        editingShipping={editingShipping}
                                                        shippingValue={shippingValue}
                                                        onShippingEdit={handleShippingEdit}
                                                        onShippingSave={handleShippingSave}
                                                        onShippingCancel={handleShippingCancel}
                                                        onShippingValueChange={setShippingValue}
                                                        onStateChange={handleStateChange}
                                                        onClick={setSelectedPurchase}
                                                        selectionMode={selectionMode}
                                                        isSelected={isSelected}
                                                        onToggleSelect={handleToggleSelect}
                                                        selectionDisabled={selectionDisabled}
                                                        showGroupTag={false}
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Ungrouped Items */}
                        {applyFilters(ungrouped).length > 0 && (
                            <div className="border-t">
                                <div className="p-4 bg-gray-100">
                                    <button
                                        onClick={() => setUngroupedExpanded(!ungroupedExpanded)}
                                        className="w-full flex items-center gap-2"
                                    >
                                        {ungroupedExpanded ? (
                                            <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
                                        ) : (
                                            <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0" />
                                        )}
                                        <Package className="w-5 h-5 text-gray-600" />
                                        <h3 className="font-semibold text-gray-800">Ungrouped Items</h3>
                                        <span className="text-sm text-gray-600">
                                            ({applyFilters(ungrouped).length})
                                        </span>
                                    </button>
                                </div>
                                {ungroupedExpanded && (
                                    <div className="divide-y divide-gray-200">
                                        {applyFilters(ungrouped).map((purchase, index) => {
                                            const isSelected = selectedPurchases.some(p => p['Request ID'] === purchase['Request ID']);
                                            const selectedState = selectedPurchases.length > 0 ? selectedPurchases[0]['State'] : null;
                                            const selectionDisabled = selectionMode && selectedState && purchase['State'] !== selectedState;

                                            return (
                                                <GroupCard
                                                    key={purchase['Request ID'] || index}
                                                    purchase={purchase}
                                                    index={index}
                                                    isDirector={isDirector}
                                                    editingShipping={editingShipping}
                                                    shippingValue={shippingValue}
                                                    onShippingEdit={handleShippingEdit}
                                                    onShippingSave={handleShippingSave}
                                                    onShippingCancel={handleShippingCancel}
                                                    onShippingValueChange={setShippingValue}
                                                    onStateChange={handleStateChange}
                                                    onClick={setSelectedPurchase}
                                                    selectionMode={selectionMode}
                                                    isSelected={isSelected}
                                                    onToggleSelect={handleToggleSelect}
                                                    selectionDisabled={selectionDisabled}
                                                    showGroupTag={false}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {grouped.length === 0 && ungrouped.length === 0 && (
                            <div className="p-12 text-center text-gray-500">
                                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-medium">No purchases found</p>
                                <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
                            </div>
                        )}
                    </div>

                    {/* Modals */}
                    {showCreateForm && (
                        <RequestForm
                            user={user}
                            onClose={() => setShowCreateForm(false)}
                            onCreated={onLoadPurchases}
                            presetFields={{ 'State': 'Pending Approval' }}
                            existingPurchases={purchases}
                        />
                    )}

                    {selectedPurchase && !selectionMode && (
                        <PurchaseDetailModal
                            purchase={selectedPurchase}
                            user={user}
                            validation={validation}
                            onClose={() => setSelectedPurchase(null)}
                            onUpdate={onLoadPurchases}
                            existingPurchases={purchases}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}