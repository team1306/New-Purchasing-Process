import { ExternalLink, AlertTriangle } from 'lucide-react';
import { formatDate, formatCurrency, parseCurrency, calculateTotalCost, getRequestTier } from '../utils/purchaseHelpers';
import { CATEGORIES } from '../utils/purchaseHelpers';

export default function PurchaseInfoSection({
                                                purchase,
                                                isEditing,
                                                editedPurchase,
                                                originalTier,
                                                onEditChange
                                            }) {
    return (
        <>
            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                    <p className="text-xs md:text-sm text-gray-500 mb-1">Date Requested</p>
                    <p className="font-semibold text-sm md:text-base text-gray-800">
                        {formatDate(purchase['Date Requested'])}
                    </p>
                </div>
                <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                    <p className="text-xs md:text-sm text-gray-500 mb-1">Requester</p>
                    <p className="font-semibold text-sm md:text-base text-gray-800 truncate">
                        {purchase['Requester'] || 'N/A'}
                    </p>
                </div>
                <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                    <p className="text-xs md:text-sm text-gray-500 mb-1">Category</p>
                    {isEditing ? (
                        <select
                            value={editedPurchase['Category'] || ''}
                            onChange={(e) => onEditChange('Category', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-blue-500"
                        >
                            {CATEGORIES.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <p className="font-semibold text-sm md:text-base text-gray-800">
                            {purchase['Category']}
                        </p>
                    )}
                </div>
                <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                    <p className="text-xs md:text-sm text-gray-500 mb-1">Quantity</p>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editedPurchase['Quantity']}
                            onChange={(e) => onEditChange('Quantity', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-blue-500"
                        />
                    ) : (
                        <p className="font-semibold text-sm md:text-base text-gray-800">
                            {purchase['Quantity']}
                        </p>
                    )}
                </div>
            </div>

            {/* Package Size */}
            {(purchase['Package Size']?.trim() || isEditing) && (
                <div className="bg-indigo-50 p-3 md:p-4 rounded-lg border border-indigo-200">
                    <p className="text-xs md:text-sm text-indigo-700 mb-1">Package Size</p>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editedPurchase['Package Size'] || ''}
                            onChange={(e) => onEditChange('Package Size', e.target.value)}
                            placeholder="Leave blank if only 1 item"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-blue-500"
                        />
                    ) : (
                        <p className="font-semibold text-sm md:text-base text-gray-800">
                            {purchase['Package Size']}
                        </p>
                    )}
                </div>
            )}

            {/* Cost Info */}
            <div className="bg-blue-50 p-3 md:p-4 rounded-lg border border-blue-200">
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                    <div>
                        <p className="text-xs md:text-sm text-blue-700 mb-1">Unit Price</p>
                        {isEditing ? (
                            <input
                                type="number"
                                value={parseCurrency(editedPurchase['Unit Price']) || '0'}
                                onChange={(e) => onEditChange('Unit Price', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <p className="font-semibold text-sm md:text-base text-gray-800">
                                {formatCurrency(purchase['Unit Price'])}
                            </p>
                        )}
                    </div>
                    <div>
                        <p className="text-xs md:text-sm text-blue-700 mb-1">Shipping</p>
                        {isEditing ? (
                            <input
                                type="number"
                                value={parseCurrency(editedPurchase['Shipping']) || '0'}
                                onChange={(e) => onEditChange('Shipping', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <p className="font-semibold text-sm md:text-base text-gray-800">
                                {formatCurrency(purchase['Shipping'])}
                            </p>
                        )}
                    </div>
                    <div>
                        <p className="text-xs md:text-sm text-blue-700 mb-1">Total</p>
                        <p className="font-semibold text-sm md:text-base text-gray-800">
                            {isEditing ? calculateTotalCost(editedPurchase) : calculateTotalCost(purchase)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tier Change Warning */}
            {isEditing && originalTier !== getRequestTier(parseFloat(calculateTotalCost(editedPurchase).replace(/[^0-9.-]+/g, '')) || 0) && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 md:p-4 flex items-start animate-slideDown">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-semibold text-orange-800 text-sm md:text-base">Request Tier Changed</p>
                        <p className="text-xs md:text-sm text-orange-700">
                            The total cost has changed enough to affect the approval tier. All approvals will be cleared when you save.
                        </p>
                    </div>
                </div>
            )}

            {/* Item Link */}
            {(purchase?.['Item Link'] || isEditing) && (
                <div>
                    <p className="text-xs md:text-sm text-gray-500 mb-2">Item Link</p>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editedPurchase['Item Link'] || ''}
                            onChange={(e) => onEditChange('Item Link', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-blue-500"
                        />
                    ) : purchase['Item Link']?.trim() !== '' ? (
                        <a
                            href={purchase['Item Link']}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 hover:underline break-all text-sm md:text-base flex items-center gap-1 group"
                        >
                            <span className="line-clamp-2">{purchase['Item Link']}</span>
                            <ExternalLink className="w-4 h-4 flex-shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </a>
                    ) : null}
                </div>
            )}

            {/* Comments */}
            {(purchase['Comments'] || isEditing) && (
                <div>
                    <p className="text-xs md:text-sm text-gray-500 mb-2">Comments</p>
                    <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                        {isEditing ? (
                            <textarea
                                value={editedPurchase['Comments'] || ''}
                                onChange={(e) => onEditChange('Comments', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-blue-500"
                                rows={3}
                            />
                        ) : (
                            <p className="text-gray-800 break-words text-sm md:text-base">
                                {purchase['Comments']}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Purchase Info */}
            {(purchase['Date Purchased'] || purchase['Order Number']) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    {purchase['Date Purchased'] && (
                        <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                            <p className="text-xs md:text-sm text-gray-500 mb-1">Date Purchased</p>
                            <p className="font-semibold text-sm md:text-base text-gray-800">
                                {formatDate(purchase['Date Purchased'])}
                            </p>
                        </div>
                    )}
                    {purchase['Order Number'] && (
                        <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                            <p className="text-xs md:text-sm text-gray-500 mb-1">Order Number</p>
                            <p className="font-semibold text-sm md:text-base text-gray-800 break-all">
                                {purchase['Order Number']}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}