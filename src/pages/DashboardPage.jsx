import { useState, useEffect } from 'react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import SearchBar from '../components/dashboard/SearchBar';
import FilterPanel from '../components/dashboard/FilterPanel';
import PurchaseList from '../components/dashboard/PurchaseList';
import PurchaseDetailModal from '../components/PurchaseDetailModal';
import RequestForm from '../components/RequestForm';
import { usePurchases } from '../hooks/usePurchases';
import { useValidation } from '../hooks/useValidation';
import { useFilters } from '../hooks/useFilters';
import { useAlert } from '../components/AlertContext';
import { applyFiltersAndSort } from '../utils/filterHelpers';
import { parseCurrency, formatCurrency } from '../utils/purchaseHelpers';

export default function Dashboard({ user, onSignOut }) {
    const { purchases, loading, error, refreshing, loadPurchases, refreshPurchases, updatePurchase } = usePurchases();
    const { validation, canSeeNeedsApprovalFilter, getApprovalFilterLabel } = useValidation();
    const { showError, showConfirm } = useAlert();
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

    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingShipping, setEditingShipping] = useState(null);
    const [shippingValue, setShippingValue] = useState('');

    // Multi-select state
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedPurchases, setSelectedPurchases] = useState([]);

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
    }, [purchases, selectedPurchase]);

    // Clear selection when leaving selection mode
    useEffect(() => {
        if (!selectionMode) {
            setSelectedPurchases([]);
        }
    }, [selectionMode]);

    const handleStateChange = async (purchase, newState) => {
        try {
            const updates = { 'State': newState };

            // If changing to "Purchased", set the Date Purchased to today
            if (newState === 'Purchased') {
                const today = new Date().toISOString().split('T')[0];
                updates['Date Purchased'] = today;
            }

            await updatePurchase(purchase['Request ID'], updates);
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

            await updatePurchase(purchase['Request ID'], {
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
    };

    const handleToggleSelect = (purchase) => {
        setSelectedPurchases(prev => {
            const isSelected = prev.some(p => p['Request ID'] === purchase['Request ID']);

            if (isSelected) {
                // Deselect
                return prev.filter(p => p['Request ID'] !== purchase['Request ID']);
            } else {
                // Select - only allow if same state or first selection
                if (prev.length === 0 || prev[0]['State'] === purchase['State']) {
                    return [...prev, purchase];
                }
                return prev;
            }
        });
    };

    const handleBulkStateChange = async (newState) => {
        const confirmed = await showConfirm(
            `Change ${selectedPurchases.length} item${selectedPurchases.length !== 1 ? 's' : ''} to "${newState}"?`,
            { confirmText: 'Change All', cancelText: 'Cancel' }
        );

        if (!confirmed) return;

        try {
            const updates = { 'State': newState };

            // If changing to "Purchased", set the Date Purchased to today
            if (newState === 'Purchased') {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
                const day = String(now.getDate()).padStart(2, '0');
                updates['Date Purchased'] = `${year}-${month}-${day}`;
            }

            // Update all selected purchases
            await Promise.all(
                selectedPurchases.map(purchase =>
                    updatePurchase(purchase['Request ID'], updates)
                )
            );

            // Clear selection and exit selection mode
            setSelectedPurchases([]);
            setSelectionMode(false);
        } catch (err) {
            await showError('Failed to update some items. Please try again.');
        }
    };

    const isDirector = validation['Directors']?.includes(user.name);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Mobile: No padding, Desktop: Padding */}
            <div className="md:p-4">
                <div className="max-w-7xl mx-auto md:pt-8">
                    {/* Header Card */}
                    <div className="bg-white md:rounded-2xl shadow-2xl overflow-hidden mb-4 md:mb-6">
                        <DashboardHeader
                            user={user}
                            onSignOut={onSignOut}
                            onRefresh={refreshPurchases}
                            onCreateRequest={() => setShowCreateForm(true)}
                            refreshing={refreshing}
                            selectionMode={selectionMode}
                            onToggleSelectionMode={handleToggleSelectionMode}
                            selectedCount={selectedPurchases.length}
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
                    </div>

                    {/* Purchases List */}
                    <div className="md:px-0 px-0">
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
                        />
                    </div>

                    {/* Modals */}
                    {showCreateForm && (
                        <RequestForm
                            user={user}
                            onClose={() => setShowCreateForm(false)}
                            onCreated={loadPurchases}
                            presetFields={{ 'State': 'Pending Approval' }}
                        />
                    )}

                    {selectedPurchase && !selectionMode && (
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
        </div>
    );
}