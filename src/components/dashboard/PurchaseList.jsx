
import { Package } from 'lucide-react';
import PurchaseCard from './PurchaseCard';

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
                                         onRetry
                                     }) {
    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading purchases...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-12 text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={onRetry}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
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
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="p-12 text-center text-gray-500">
                        <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg">No purchases found</p>
                    </div>
                </div>
                <div className="mt-4 text-center text-sm text-gray-600">
                    Showing 0 of {purchases.length} purchase{purchases.length !== 1 ? 's' : ''}
                </div>
            </>
        );
    }

    return (
        <>
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="divide-y divide-gray-200">
                    {filteredPurchases.map((purchase, index) => (
                        <PurchaseCard
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
                        />
                    ))}
                </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-center text-sm text-gray-600">
                Showing {filteredPurchases.length} of {purchases.length} purchase{purchases.length !== 1 ? 's' : ''}
            </div>
        </>
    );
}