import { Calendar, User, Package, DollarSign, Truck, Box, ChevronRight } from 'lucide-react';
import StateBadge from '../StateBadge';
import { formatDate, formatCurrency, calculateTotalCost, getAvailableStateTransitions, STATE_COLORS } from '../../utils/purchaseHelpers';

export default function PurchaseCard({
                                         purchase,
                                         index,
                                         isDirector,
                                         editingShipping,
                                         shippingValue,
                                         onShippingEdit,
                                         onShippingSave,
                                         onShippingCancel,
                                         onShippingValueChange,
                                         onStateChange,
                                         onClick
                                     }) {
    const availableStates = getAvailableStateTransitions(purchase['State']);

    return (
        <div className="hover:bg-gray-50 transition duration-150 border-b last:border-b-0">
            {/* Mobile Layout */}
            <div className="md:hidden">
                {/* Main touchable area */}
                <div
                    className="p-4 cursor-pointer active:bg-gray-100"
                    onClick={() => onClick(purchase)}
                >
                    {/* Title Row */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-800 mb-1 line-clamp-2">
                                {purchase['Item Description'] || 'No description'}
                            </h3>
                            {purchase['State'] && <StateBadge state={purchase['State']} />}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                    </div>

                    {/* Key Info Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-xs text-gray-500">Requested</p>
                                <p className="font-medium text-sm truncate">{formatDate(purchase['Date Requested'])}</p>
                            </div>
                        </div>

                        <div className="flex items-center text-gray-600">
                            <DollarSign className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-xs text-gray-500">Total</p>
                                <p className="font-medium text-sm truncate">{calculateTotalCost(purchase)}</p>
                            </div>
                        </div>

                        <div className="flex items-center text-gray-600">
                            <Package className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-xs text-gray-500">Category</p>
                                <p className="font-medium text-sm truncate">{purchase['Category'] || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-center text-gray-600">
                            <User className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-xs text-gray-500">Requester</p>
                                <p className="font-medium text-sm truncate">{purchase['Requester'] || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Request ID */}
                    <div className="text-xs text-gray-500">
                        ID: <span className="font-mono font-semibold">{purchase['Request ID'] || `REQ-${index + 1}`}</span>
                    </div>
                </div>

                {/* Actions Section (Not clickable for modal) */}
                {(isDirector || availableStates.length > 0) && (
                    <div className="px-4 pb-4 space-y-2" onClick={(e) => e.stopPropagation()}>
                        {/* Director Shipping Edit */}
                        {isDirector && (
                            <div className="bg-gray-50 rounded-lg p-3">
                                {editingShipping === purchase['Request ID'] ? (
                                    <div className="space-y-2">
                                        <p className="text-xs text-gray-600 font-medium">Edit Shipping:</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={shippingValue}
                                                onChange={(e) => onShippingValueChange(e.target.value)}
                                                className="flex-1 px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onShippingSave(purchase)}
                                                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition active:scale-95"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={onShippingCancel}
                                                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-semibold rounded-lg transition active:scale-95"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500">Shipping</p>
                                            <p className="text-sm font-medium text-gray-700">
                                                {formatCurrency(purchase['Shipping'])}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => onShippingEdit(purchase)}
                                            className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm font-semibold rounded-lg transition active:scale-95 flex items-center gap-1"
                                        >
                                            <Truck className="w-4 h-4" />
                                            Edit
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* State Change Buttons */}
                        {availableStates.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-600 font-medium mb-2">Change State:</p>
                                <div className="flex flex-wrap gap-2">
                                    {availableStates.map(state => (
                                        <button
                                            key={state}
                                            onClick={() => {
                                                if (window.confirm(`Change state to "${state}"?`)) {
                                                    onStateChange(purchase, state);
                                                }
                                            }}
                                            className={`px-3 py-2 rounded-lg text-sm font-semibold transition active:scale-95 whitespace-nowrap ${STATE_COLORS[state]} hover:opacity-80`}
                                        >
                                            → {state}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Desktop Layout (Original) */}
            <div className="hidden md:block p-6">
                <div className="flex justify-between items-start gap-4">
                    {/* LEFT SECTION */}
                    <div className="flex-1 cursor-pointer" onClick={() => onClick(purchase)}>
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {purchase['Item Description'] || 'No description'}
                            </h3>
                            {purchase['State'] && <StateBadge state={purchase['State']} />}
                        </div>

                        <div className="grid grid-cols-4 gap-3 mt-3 text-sm">
                            <div className="flex items-center text-gray-600">
                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Requested</p>
                                    <p className="font-medium">{formatDate(purchase['Date Requested'])}</p>
                                </div>
                            </div>

                            <div className="flex items-center text-gray-600">
                                <User className="w-4 h-4 mr-2 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Requester</p>
                                    <p className="font-medium truncate">{purchase['Requester'] || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-center text-gray-600">
                                <Package className="w-4 h-4 mr-2 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Category</p>
                                    <p className="font-medium">{purchase['Category'] || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-center text-gray-600">
                                <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Total Cost</p>
                                    <p className="font-medium">{calculateTotalCost(purchase)}</p>
                                </div>
                            </div>
                        </div>

                        {purchase['Package Size'] && (
                            <div className="flex items-center text-sm text-gray-600 mt-3">
                                <Box className="w-4 h-4 mr-2 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Package Size</p>
                                    <p className="font-medium">{purchase['Package Size']}</p>
                                </div>
                            </div>
                        )}

                        {purchase['Comments'] && (
                            <p className="mt-3 text-sm text-gray-600 italic break-words line-clamp-2">
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

                    {/* RIGHT SECTION */}
                    <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Request ID</p>
                            <p className="font-mono text-sm font-semibold text-gray-700">
                                {purchase['Request ID'] || `REQ-${index + 1}`}
                            </p>
                        </div>

                        {isDirector && (
                            <div className="border-t pt-3">
                                {editingShipping === purchase['Request ID'] ? (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-xs text-gray-500 font-medium">Edit Shipping:</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={shippingValue}
                                                onChange={(e) => onShippingValueChange(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onShippingSave(purchase);
                                                }}
                                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded transition"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onShippingCancel();
                                                }}
                                                className="px-3 py-1.5 bg-gray-300 hover:bg-gray-400 text-gray-800 text-xs font-semibold rounded transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <div>
                                            <p className="text-xs text-gray-500">Shipping</p>
                                            <p className="text-sm font-medium text-gray-700">
                                                {formatCurrency(purchase['Shipping'])}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onShippingEdit(purchase);
                                            }}
                                            className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-semibold rounded transition flex items-center justify-center gap-1"
                                        >
                                            <Truck className="w-3 h-3" />
                                            Edit Shipping
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {availableStates.length > 0 && (
                            <div className="flex flex-col gap-2 border-t pt-3">
                                <p className="text-xs text-gray-500 font-medium">Change State:</p>
                                <div className="flex flex-wrap gap-2">
                                    {availableStates.map(state => (
                                        <button
                                            key={state}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm(`Change state to "${state}"?`)) {
                                                    onStateChange(purchase, state);
                                                }
                                            }}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${STATE_COLORS[state]} hover:opacity-80 hover:shadow-md`}
                                        >
                                            → {state}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}