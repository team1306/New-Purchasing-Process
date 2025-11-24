import { useState } from 'react';
import { getAvailableStateTransitions, STATE_COLORS } from '../../utils/purchaseHelpers';
import { animations } from '../../styles/design-tokens';
import { Button, Input } from '../ui';

export default function BulkActionBar({ selectedPurchases, onBulkStateChange, onBulkShippingChange = null }) {
    const [shippingInput, setShippingInput] = useState('');
    const [showShippingInput, setShowShippingInput] = useState(false);

    if (selectedPurchases.length === 0) return null;

    // Get available state transitions for the selected items (they all have the same state)
    const currentState = selectedPurchases[0]['State'];
    const availableStates = getAvailableStateTransitions(currentState);

    const handleShippingSubmit = () => {
        if (shippingInput && parseFloat(shippingInput) >= 0) {
            onBulkShippingChange(shippingInput);
            setShippingInput('');
            setShowShippingInput(false);
        }
    };

    return (
        <div className={`fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-40 md:relative md:mt-4 md:rounded-2xl md:shadow-2xl ${animations.slideUp}`}>
            <div className="p-4 md:p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="text-center sm:text-left">
                                <p className="text-sm font-semibold text-gray-800">
                                    {selectedPurchases.length} item{selectedPurchases.length !== 1 ? 's' : ''} selected
                                </p>
                                <p className="text-xs text-gray-500">
                                    Current state: <span className="font-medium">{currentState}</span>
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2 justify-center">
                                {availableStates.length > 0 && (
                                    <>
                                        <p className="w-full sm:w-auto text-xs text-gray-600 font-medium flex items-center justify-center sm:justify-start mb-1 sm:mb-0">
                                            Change all to:
                                        </p>
                                        {availableStates.map(state => {
                                            const stateColor = STATE_COLORS[state];
                                            return (
                                                <button
                                                    key={state}
                                                    onClick={() => onBulkStateChange(state)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform active:scale-95 whitespace-nowrap ${stateColor.bg} ${stateColor.text} ${stateColor.hover} hover:shadow-md`}
                                                >
                                                    → {state}
                                                </button>
                                            );
                                        })}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Bulk Shipping Change (Directors only) */}
                        {onBulkShippingChange && (
                            <div className="border-t pt-3">
                                {!showShippingInput ? (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => setShowShippingInput(true)}
                                        className="w-full sm:w-auto"
                                    >
                                        Change Shipping for All
                                    </Button>
                                ) : (
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="text-sm text-gray-600">$</span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={shippingInput}
                                                onChange={(e) => setShippingInput(e.target.value)}
                                                placeholder="0.00"
                                                className="flex-1"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={handleShippingSubmit}
                                                disabled={!shippingInput || parseFloat(shippingInput) < 0}
                                                className="flex-1 sm:flex-none"
                                            >
                                                Update All
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => {
                                                    setShowShippingInput(false);
                                                    setShippingInput('');
                                                }}
                                                className="flex-1 sm:flex-none"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}