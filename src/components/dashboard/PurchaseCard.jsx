
import { Calendar, User, Package, DollarSign, Truck } from 'lucide-react';
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
        <div className="p-6 hover:bg-gray-50 transition duration-150">
            <div className="flex justify-between items-start">
                <div
                    className="flex-1 cursor-pointer"
                    onClick={() => onClick(purchase)}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                            {purchase['Item Description'] || 'No description'}
                        </h3>
                        {purchase['State'] && <StateBadge state={purchase['State']} />}
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
                                <p className="font-medium">{calculateTotalCost(purchase)}</p>
                            </div>
                        </div>
                    </div>

                    {purchase['Comments'] && (
                        <p className="mt-3 text-sm text-gray-600 italic">
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

                <div className="ml-4 text-right flex flex-col items-end gap-3">
                    <div>
                        <p className="text-sm text-gray-500">Request ID</p>
                        <p className="font-mono text-sm font-semibold text-gray-700">
                            {purchase['Request ID'] || `REQ-${index + 1}`}
                        </p>
                    </div>

                    {/* Shipping Edit Section - Only for Directors */}
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
                                            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onShippingSave(purchase);
                                            }}
                                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded transition duration-200"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onShippingCancel();
                                            }}
                                            className="px-3 py-1.5 bg-gray-300 hover:bg-gray-400 text-gray-800 text-xs font-semibold rounded transition duration-200"
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
                                        className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-semibold rounded transition duration-200 flex items-center justify-center gap-1"
                                    >
                                        <Truck className="w-3 h-3" />
                                        Edit Shipping
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* State Change Buttons */}
                    {availableStates.length > 0 && (
                        <div className="flex flex-col gap-2 border-t pt-3">
                            <p className="text-xs text-gray-500 font-medium">Change State:</p>
                            {availableStates.map(state => (
                                <button
                                    key={state}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm(`Change state to "${state}"?`)) {
                                            onStateChange(purchase, state);
                                        }
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition duration-200 whitespace-nowrap ${STATE_COLORS[state]} hover:opacity-80 hover:shadow-md`}
                                >
                                    → {state}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}