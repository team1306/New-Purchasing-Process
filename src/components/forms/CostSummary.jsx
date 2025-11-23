import { DollarSign } from 'lucide-react';
import { formatCurrency, parseCurrency } from '../../utils/purchaseHelpers';

export default function CostSummary({
                                        unitPrice,
                                        quantity,
                                        shipping,
                                        total,
                                        editable = false,
                                        onUnitPriceChange,
                                        onShippingChange
                                    }) {
    return (
        <div className="bg-blue-50 p-3 md:p-4 rounded-lg border border-blue-200">
            <div className="grid grid-cols-3 gap-3 md:gap-4">
                <div>
                    <p className="text-xs md:text-sm text-blue-700 mb-1 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Unit Price
                    </p>
                    {editable ? (
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={parseCurrency(unitPrice) || '0'}
                            onChange={onUnitPriceChange}
                            className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        />
                    ) : (
                        <p className="font-semibold text-sm md:text-base text-gray-800">
                            {formatCurrency(unitPrice)}
                        </p>
                    )}
                </div>
                <div>
                    <p className="text-xs md:text-sm text-blue-700 mb-1 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Shipping
                    </p>
                    {editable ? (
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={parseCurrency(shipping) || '0'}
                            onChange={onShippingChange}
                            className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        />
                    ) : (
                        <p className="font-semibold text-sm md:text-base text-gray-800">
                            {formatCurrency(shipping)}
                        </p>
                    )}
                </div>
                <div>
                    <p className="text-xs md:text-sm text-blue-700 mb-1 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Total
                    </p>
                    <p className="font-semibold text-sm md:text-base text-gray-800">
                        {total}
                    </p>
                </div>
            </div>
        </div>
    );
}