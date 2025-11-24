import { Package } from 'lucide-react';
import PurchaseCardWrapper from './PurchaseCardWrapper';
import BulkActionBar from './BulkActionBar';
import { Card, LoadingState, ErrorState, EmptyState } from '../ui';
import { animations } from '../../styles/design-tokens';

export default function PurchaseList({
                                         purchases,
                                         filteredPurchases,
                                         loading,
                                         error,
                                         isDirector,
                                         editingShipping,
                                         shippingValue,
                                         onShippingEdit,
                                         onShippingSave,
                                         onShippingCancel,
                                         onShippingValueChange,
                                         onStateChange,
                                         onPurchaseClick,
                                         onRetry,
                                         selectionMode,
                                         selectedPurchases,
                                         onToggleSelect,
                                         onBulkStateChange,
                                         onBulkShippingChange = null
                                     }) {
    if (loading) {
        return (
            <Card className={animations.fadeIn}>
                <LoadingState message="Loading purchases..." />
            </Card>
        );
    }

    if (error) {
        return (
            <Card className={animations.fadeIn}>
                <ErrorState message={error} onRetry={onRetry} />
            </Card>
        );
    }

    if (filteredPurchases.length === 0) {
        return (
            <>
                <Card className={animations.fadeIn}>
                    <EmptyState
                        icon={Package}
                        title="No purchases found"
                        description="Try adjusting your filters"
                    />
                </Card>
                <div className="mt-4 text-center text-sm text-gray-600 px-4">
                    Showing 0 of {purchases.length} purchase{purchases.length !== 1 ? 's' : ''}
                </div>
            </>
        );
    }

    // Determine which items can be selected (same state, and have available transitions)
    const firstSelectedPurchase = selectedPurchases.length > 0 ? selectedPurchases[0] : null;
    const selectedState = firstSelectedPurchase ? firstSelectedPurchase['State'] : null;

    return (
        <>
            {/* Bulk Action Bar */}
            {selectionMode && selectedPurchases.length > 0 && (
                <BulkActionBar
                    selectedPurchases={selectedPurchases}
                    onBulkStateChange={onBulkStateChange}
                    onBulkShippingChange={onBulkShippingChange}
                />
            )}
            <Card padding={false} className={animations.fadeIn}>
                <div className="divide-y divide-gray-200">
                    {filteredPurchases.map((purchase, index) => {
                        const isSelected = selectedPurchases.some(p => p['Request ID'] === purchase['Request ID']);
                        const selectionDisabled = selectionMode && selectedState && purchase['State'] !== selectedState;

                        return (
                            <PurchaseCardWrapper
                                key={purchase['Request ID'] || index}
                                purchase={purchase}
                                index={index}
                                isDirector={isDirector}
                                editingShipping={editingShipping}
                                shippingValue={shippingValue}
                                onShippingEdit={onShippingEdit}
                                onShippingSave={onShippingSave}
                                onShippingCancel={onShippingCancel}
                                onShippingValueChange={onShippingValueChange}
                                onStateChange={onStateChange}
                                onClick={onPurchaseClick}
                                selectionMode={selectionMode}
                                isSelected={isSelected}
                                onToggleSelect={onToggleSelect}
                                selectionDisabled={selectionDisabled}
                            />
                        );
                    })}
                </div>
            </Card>

            {/* Results Count */}
            <div className="mt-4 mb-6 text-center text-sm text-gray-600 px-4">
                Showing {filteredPurchases.length} of {purchases.length} purchase{purchases.length !== 1 ? 's' : ''}
            </div>
        </>
    );
}