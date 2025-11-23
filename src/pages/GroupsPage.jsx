import { useState } from 'react';
import { ChevronDown, ChevronRight, Package } from 'lucide-react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import SearchBar from '../components/dashboard/SearchBar';
import FilterPanel from '../components/dashboard/FilterPanel';
import PurchaseDetailModal from '../components/modals/PurchaseDetailModal.jsx';
import RequestForm from '../components/RequestForm';
import BulkActionBar from '../components/dashboard/BulkActionBar';
import GroupCard from '../components/groups/GroupCard';
import { usePurchaseManagement } from '../hooks/usePurchaseManagement';
import { useFilters } from '../hooks/useFilters';
import { useAlert } from '../components/AlertContext';
import { applyFiltersAndSort } from '../utils/filterHelpers';
import { StateChangeController, ShippingController } from '../controllers';
import { PageContainer } from '../components/layout';
import { Card, LoadingState, ErrorState, Checkbox } from '../components/ui';

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
        const confirmed = await showConfirm(
            `Change state to \"${newState}\"`
        );

        if(!confirmed) return;

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
                <Card>
                    <LoadingState message="Loading purchases..." />
                </Card>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer>
                <Card>
                    <ErrorState message={error} onRetry={onRetry} />
                </Card>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            {/* Header */}
            <Card padding={false} className="mb-4 md:mb-6">
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
                />
            )}

            {/* Groups List */}
            <Card padding={false} className="mb-4">
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