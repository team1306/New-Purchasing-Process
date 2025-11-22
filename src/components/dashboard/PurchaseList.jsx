import { Package } from 'lucide-react';
import PurchaseCardWrapper from './PurchaseCardWrapper';
import BulkActionBar from './BulkActionBar';

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
                                         onBulkStateChange
                                     }) {
    if (loading) {
        return (
            <div className="bg-white md:rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
                <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading purchases...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white md:rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
                <div className="p-8 md:p-12 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <p className="text-red-600 mb-4 text-sm md:text-base">{error}</p>
                    <button
                        onClick={onRetry}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 transform active:scale-95"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (filteredPurchases.length === 0) {
        return (
            <>
                <div className="bg-white md:rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
                    <div className="p-8 md:p-12 text-center text-gray-500">
                        <Package className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-base md:text-lg font-medium">No purchases found</p>
                        <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
                    </div>
                </div>
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
                />
            )}
            <div className="bg-white md:rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
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
            </div>

            {/* Results Count */}
            <div className="mt-4 mb-6 text-center text-sm text-gray-600 px-4">
                Showing {filteredPurchases.length} of {purchases.length} purchase{purchases.length !== 1 ? 's' : ''}
            </div>
        </>
    );
}