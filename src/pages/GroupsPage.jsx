import { useState } from 'react';
import { ChevronDown, ChevronRight, Package } from 'lucide-react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import SearchBar from '../components/dashboard/SearchBar';
import FilterPanel from '../components/dashboard/FilterPanel';
import PurchaseDetailModal from '../components/modals/PurchaseDetailModal.jsx';
import RequestForm from '../components/RequestForm';
import BulkActionBar from '../components/dashboard/BulkActionBar';
import { PurchaseCard } from '../components/cards';
import { usePurchaseManagement } from '../hooks/usePurchaseManagement';
import { useFilters } from '../hooks/useFilters';
import { useAlert } from '../components/AlertContext';
import { applyFiltersAndSort } from '../utils/filterHelpers';
import { StateChangeController, ShippingController } from '../controllers';
import { PageContainer } from '../components/layout';
import { Card, LoadingState, ErrorState, Checkbox, EmptyState } from '../components/ui';
import { animations } from '../styles/design-tokens';

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
                                       onLoadPurchases,
                                       viewMode,
                                       onToggleViewMode
                                   }) {
    const { showError, showConfirm } = useAlert();
    const [expandedGroups, setExpandedGroups] = useState(new Set());
    const [ungroupedExpanded, setUngroupedExpanded] = useState(true);

    // Use the same filters hook as DashboardPage
    const {
        searchQuery,
        setSearchQuery,
        selectedCategories,
        selectedStates,
        needsApprovalFilter,
        setNeedsApprovalFilter,
        sortOption,
        setSortOption,
        toggleCategory,
        toggleState,
        clearAllFilters,
        activeFilterCount
    } = useFilters();

    const {
        editingShipping,
        shippingValue,
        selectedPurchase,
        showCreateForm,
        selectionMode,
        selectedPurchases,
        setSelectedPurchase,
        setShowCreateForm,
        setShippingValue,
        handleShippingEdit,
        handleShippingCancel,
        handleToggleSelectionMode,
        handleToggleSelect,
    } = usePurchaseManagement(onRefresh, showError, showConfirm);

    // Initialize controllers
    const [stateController] = useState(() => new StateChangeController(onRefresh, showError));
    const [shippingController] = useState(() => new ShippingController(onRefresh, showError));

    // Wrapper functions that use controllers
    const handleStateChange = async (purchase, newState) => {
        const confirmed = await showConfirm(`Change state to "${newState}"`);
        if (!confirmed) return;
        await stateController.changeState(purchase, newState);
    };

    const handleShippingSave = async (purchase) => {
        const result = await shippingController.updateShipping(purchase, shippingValue);
        if (result.success) {
            handleShippingCancel();
        }
    };

    const handleBulkStateChange = async (newState) => {
        const confirmed = await showConfirm(
            `Change ${selectedPurchases.length} item${selectedPurchases.length !== 1 ? 's' : ''} to "${newState}"?`,
            { confirmText: 'Change All', cancelText: 'Cancel' }
        );
        if (!confirmed) return;
        await stateController.changeBulkState(selectedPurchases, newState);
    };

    const handleBulkShippingChange = async (newShippingValue) => {
        const confirmed = await showConfirm(
            `Set shipping to $${parseFloat(newShippingValue).toFixed(2)} for ${selectedPurchases.length} item${selectedPurchases.length !== 1 ? 's' : ''}?`,
            { confirmText: 'Update All', cancelText: 'Cancel' }
        );
        if (!confirmed) return;

        try {
            const validation = shippingController.validateShipping(newShippingValue);
            if (!validation.valid) {
                await showError(validation.error);
                return;
            }

            // Update all selected purchases
            const updatePromises = selectedPurchases.map(purchase =>
                shippingController.updateShipping(purchase, newShippingValue)
            );

            await Promise.all(updatePromises);
            onRefresh();
        } catch (err) {
            console.error('Error updating bulk shipping:', err);
            await showError('Failed to update shipping for some items. Please try again.');
        }
    };

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
            filterGroups:true,
            validation,
            userName: user.name
        });
    };

    // Filter groups by search query (search both group names and item descriptions)
    const filterGroupsBySearch = (groupEntries) => {
        if (!searchQuery.trim()) return groupEntries;

        return groupEntries.filter(([groupName, groupPurchases]) => {
            // Check if group name matches
            const groupNameMatches = groupName.toLowerCase().includes(searchQuery.toLowerCase());

            // If group name matches, keep all items in the group
            if (groupNameMatches) return true;

            // Otherwise, check if any item in group matches
            const itemMatches = groupPurchases.some(purchase =>
                purchase['Item Description']?.toLowerCase().includes(searchQuery.toLowerCase())
            );

            return itemMatches;
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
        const filteredGrouped = filterGroupsBySearch(grouped);
        if (expandedGroups.size === filteredGrouped.length) {
            setExpandedGroups(new Set());
        } else {
            setExpandedGroups(new Set(filteredGrouped.map(([name]) => name)));
        }
    };

    const handleToggleSelectGroup = (groupPurchases) => {
        const allSelected = groupPurchases.every(p =>
            selectedPurchases.some(sp => sp['Request ID'] === p['Request ID'])
        );

        if (allSelected) {
            // Deselect all in group
            groupPurchases.forEach(p => {
                if (selectedPurchases.some(sp => sp['Request ID'] === p['Request ID'])) {
                    handleToggleSelect(p);
                }
            });
        } else {
            // Select all in group (if they have the same state as already selected)
            const firstState = selectedPurchases.length > 0
                ? selectedPurchases[0]['State']
                : groupPurchases[0]['State'];
            const selectablePurchases = groupPurchases.filter(p => p['State'] === firstState);

            selectablePurchases.forEach(p => {
                if (!selectedPurchases.some(sp => sp['Request ID'] === p['Request ID'])) {
                    handleToggleSelect(p);
                }
            });
        }
    };

    if (loading) {
        return (
            <PageContainer>
                <Card className={animations.fadeIn}>
                    <LoadingState message="Loading purchases..." />
                </Card>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer>
                <Card className={animations.fadeIn}>
                    <ErrorState message={error} onRetry={onRetry} />
                </Card>
            </PageContainer>
        );
    }

    // Filter groups by search
    const filteredGrouped = filterGroupsBySearch(grouped);

    return (
        <PageContainer>
            {/* Header */}
            <Card padding={false} className={`mb-4 md:mb-6 ${animations.fadeIn}`}>
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
                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                        />
                        <FilterPanel
                            selectedCategories={selectedCategories}
                            selectedStates={selectedStates}
                            needsApprovalFilter={needsApprovalFilter}
                            sortOption={sortOption}
                            activeFilterCount={activeFilterCount}
                            onToggleCategory={toggleCategory}
                            onToggleState={toggleState}
                            onToggleNeedsApproval={() => setNeedsApprovalFilter(!needsApprovalFilter)}
                            onSortChange={setSortOption}
                            onClearAll={clearAllFilters}
                            canSeeNeedsApprovalFilter={
                                validation['Mentors']?.includes(user.name) ||
                                validation['Directors']?.includes(user.name) ||
                                validation['Presidents']?.includes(user.name) ||
                                validation['Leadership']?.includes(user.name)
                            }
                            approvalFilterLabel={
                                validation['Mentors']?.includes(user.name) ||
                                validation['Directors']?.includes(user.name)
                                    ? 'Needs Mentor Approval'
                                    : 'Needs Student Approval'
                            }
                        />
                    </>
                )}
            </Card>

            {/* Bulk Action Bar */}
            {selectionMode && selectedPurchases.length > 0 && (
                <BulkActionBar
                    selectedPurchases={selectedPurchases}
                    onBulkStateChange={handleBulkStateChange}
                    onBulkShippingChange={isDirector ? handleBulkShippingChange : null}
                />
            )}

            {/* Groups List */}
            <Card padding={false} className={`mb-4 ${animations.fadeIn}`}>
                {/* Expand/Collapse All */}
                {filteredGrouped.length > 0 && (
                    <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-700">
                            {filteredGrouped.length} group{filteredGrouped.length !== 1 ? 's' : ''}
                            {searchQuery && ` matching "${searchQuery}"`}
                        </p>
                        <button
                            onClick={toggleAllGroups}
                            className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
                        >
                            {expandedGroups.size === filteredGrouped.length ? 'Collapse All' : 'Expand All'}
                        </button>
                    </div>
                )}

                {/* Grouped Items */}
                {filteredGrouped.map(([groupName, groupPurchases]) => {
                    // If group name matches search, show all items, otherwise filter items
                    const groupNameMatches = searchQuery.trim() &&
                        groupName.toLowerCase().includes(searchQuery.toLowerCase());

                    const filteredGroupPurchases = groupNameMatches
                        ? applyFilters(groupPurchases)  // Show all items if group name matches
                        : applyFilters(groupPurchases.filter(p =>
                            !searchQuery.trim() ||
                            p['Item Description']?.toLowerCase().includes(searchQuery.toLowerCase())
                        ));

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

                    // Highlight group name if it matches search
                    const highlightGroupName = () => {
                        if (!searchQuery.trim()) return groupName;
                        const lowerGroupName = groupName.toLowerCase();
                        const lowerQuery = searchQuery.toLowerCase();
                        const index = lowerGroupName.indexOf(lowerQuery);

                        if (index === -1) return groupName;

                        return (
                            <>
                                {groupName.substring(0, index)}
                                <span className="bg-yellow-200">{groupName.substring(index, index + searchQuery.length)}</span>
                                {groupName.substring(index + searchQuery.length)}
                            </>
                        );
                    };

                    return (
                        <div key={groupName} className="border-b last:border-b-0">
                            {/* Group Header */}
                            <div className="p-4 bg-gray-50 hover:bg-gray-100 transition-all duration-200">
                                <div className="flex items-center gap-3">
                                    {selectionMode && (
                                        <button
                                            onClick={() => handleToggleSelectGroup(filteredGroupPurchases)}
                                            disabled={!canSelectGroup}
                                            className={`flex-shrink-0 ${!canSelectGroup ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <Checkbox
                                                checked={allSelected}
                                                indeterminate={someSelected && !allSelected}
                                                disabled={!canSelectGroup}
                                            />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => toggleGroup(groupName)}
                                        className="flex-1 flex items-center gap-2 text-left"
                                    >
                                        {isExpanded ? (
                                            <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0 transition-transform duration-200" />
                                        ) : (
                                            <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0 transition-transform duration-200" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-800 truncate">
                                                {highlightGroupName()}
                                            </h3>
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
                                            <PurchaseCard
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
                        <div className="p-4 bg-gray-100 hover:bg-gray-200 transition-all duration-200">
                            <button
                                onClick={() => setUngroupedExpanded(!ungroupedExpanded)}
                                className="w-full flex items-center gap-2"
                            >
                                {ungroupedExpanded ? (
                                    <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0 transition-transform duration-200" />
                                ) : (
                                    <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0 transition-transform duration-200" />
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
                                        <PurchaseCard
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

                {/* Empty State */}
                {filteredGrouped.length === 0 && ungrouped.length === 0 && (
                    <EmptyState
                        icon={Package}
                        title="No purchases found"
                        description={searchQuery ? `No groups or items match "${searchQuery}"` : "Try adjusting your filters"}
                    />
                )}
            </Card>

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
        </PageContainer>
    );
}