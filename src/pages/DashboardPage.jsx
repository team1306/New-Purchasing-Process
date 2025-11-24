import { useState, useEffect } from 'react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import SearchBar from '../components/dashboard/SearchBar';
import FilterPanel from '../components/dashboard/FilterPanel';
import PurchaseList from '../components/dashboard/PurchaseList';
import PurchaseDetailModal from '../components/modals/PurchaseDetailModal.jsx';
import RequestForm from '../components/RequestForm';
import GroupsPage from './GroupsPage';
import { usePurchases } from '../hooks/index.js';
import { useValidation } from '../hooks/index.js';
import { useFilters } from '../hooks/index.js';
import { usePurchaseManagement } from '../hooks/index.js';
import { useViewMode } from '../hooks/index.js';
import { useAlert } from '../components/AlertContext';
import { applyFiltersAndSort } from '../utils/filterHelpers';
import { StateChangeController, ShippingController } from '../controllers';
import { PageContainer } from '../components/layout';
import { Card } from '../components/ui';

export default function Dashboard({ user, onSignOut }) {
    const { purchases, loading, error, refreshing, loadPurchases, refreshPurchases } = usePurchases();
    const { validation, canSeeNeedsApprovalFilter, getApprovalFilterLabel } = useValidation();
    const { showError, showConfirm } = useAlert();
    const { viewMode, handleToggleViewMode } = useViewMode();

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
    } = usePurchaseManagement();

    // Initialize controllers
    const [stateController] = useState(() => new StateChangeController(refreshPurchases, showError));
    const [shippingController] = useState(() => new ShippingController(refreshPurchases, showError));

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

        const result = await stateController.changeBulkState(selectedPurchases, newState);
        if (result.success) {
            // Selection is automatically cleared by the hook
        }
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
            refreshPurchases();
        } catch (err) {
            console.error('Error updating bulk shipping:', err);
            await showError('Failed to update shipping for some items. Please try again.');
        }
    };

    // Apply filters and sorting
    const filteredPurchases = applyFiltersAndSort(purchases, {
        searchQuery,
        selectedCategories,
        selectedStates,
        needsApprovalFilter,
        sortOption,
        validation,
        userName: user.name
    });

    // Update selected purchase when purchases refresh
    useEffect(() => {
        if (selectedPurchase) {
            const updatedPurchase = purchases.find(
                p => p['Request ID'] === selectedPurchase['Request ID']
            );
            if (updatedPurchase) {
                setSelectedPurchase(updatedPurchase);
            }
        }
    }, [purchases, selectedPurchase, setSelectedPurchase]);

    const isDirector = validation['Directors']?.includes(user.name);

    // Render Groups View
    if (viewMode === 'groups') {
        return (
            <GroupsPage
                user={user}
                onSignOut={onSignOut}
                purchases={purchases}
                validation={validation}
                loading={loading}
                error={error}
                refreshing={refreshing}
                onRefresh={refreshPurchases}
                onRetry={loadPurchases}
                onLoadPurchases={loadPurchases}
                viewMode={viewMode}
                onToggleViewMode={handleToggleViewMode}
            />
        );
    }

    // Render List View
    return (
        <PageContainer>
            {/* Header Card */}
            <Card padding={false} className="mb-4 md:mb-6">
                <DashboardHeader
                    user={user}
                    onSignOut={onSignOut}
                    onRefresh={refreshPurchases}
                    onCreateRequest={() => setShowCreateForm(true)}
                    refreshing={refreshing}
                    selectionMode={selectionMode}
                    onToggleSelectionMode={handleToggleSelectionMode}
                    selectedCount={selectedPurchases.length}
                    viewMode={viewMode}
                    onToggleViewMode={handleToggleViewMode}
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
                            canSeeNeedsApprovalFilter={canSeeNeedsApprovalFilter(user.name)}
                            approvalFilterLabel={getApprovalFilterLabel(user.name)}
                        />
                    </>
                )}
            </Card>

            {/* Purchases List */}
            <PurchaseList
                purchases={purchases}
                filteredPurchases={filteredPurchases}
                loading={loading}
                error={error}
                isDirector={isDirector}
                editingShipping={editingShipping}
                shippingValue={shippingValue}
                onShippingEdit={handleShippingEdit}
                onShippingSave={handleShippingSave}
                onShippingCancel={handleShippingCancel}
                onShippingValueChange={setShippingValue}
                onStateChange={handleStateChange}
                onPurchaseClick={setSelectedPurchase}
                onRetry={loadPurchases}
                selectionMode={selectionMode}
                selectedPurchases={selectedPurchases}
                onToggleSelect={handleToggleSelect}
                onBulkStateChange={handleBulkStateChange}
                onBulkShippingChange={isDirector ? handleBulkShippingChange : null}
            />

            {/* Modals */}
            {showCreateForm && (
                <RequestForm
                    user={user}
                    onClose={() => setShowCreateForm(false)}
                    onCreated={loadPurchases}
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
                    onUpdate={loadPurchases}
                    existingPurchases={purchases}
                />
            )}
        </PageContainer>
    );
}