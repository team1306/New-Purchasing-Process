import { Truck } from 'lucide-react';
import { Button, Input } from '../ui';
import { formatCurrency } from '../../utils/purchaseHelpers';

export default function ShippingEditControl({
                                                purchase,
                                                isEditing,
                                                shippingValue,
                                                onEdit,
                                                onSave,
                                                onCancel,
                                                onValueChange,
                                            }) {
    if (isEditing) {
        return (
            <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 font-medium mb-2">Edit Shipping:</p>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-600">$</span>
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={shippingValue}
                        onChange={(e) => onValueChange(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1"
                        autoFocus
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="success"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSave(purchase);
                        }}
                        fullWidth
                    >
                        Save
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onCancel();
                        }}
                        fullWidth
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-gray-500">Shipping</p>
                    <p className="text-sm font-medium text-gray-700">
                        {formatCurrency(purchase['Shipping'])}
                    </p>
                </div>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(purchase);
                    }}
                    icon={Truck}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800"
                >
                    Edit
                </Button>
            </div>
        </div>
    );
}