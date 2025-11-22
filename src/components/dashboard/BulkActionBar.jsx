import { getAvailableStateTransitions, STATE_COLORS } from '../../utils/purchaseHelpers';

export default function BulkActionBar({ selectedPurchases, onBulkStateChange }) {
    if (selectedPurchases.length === 0) return null;

    // Get available state transitions for the selected items (they all have the same state)
    const currentState = selectedPurchases[0]['State'];
    const availableStates = getAvailableStateTransitions(currentState);

    if (availableStates.length === 0) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-40 animate-slideUp md:relative md:mt-4 md:rounded-2xl md:shadow-2xl">
            <div className="p-4 md:p-6">
                <div className="max-w-7xl mx-auto">
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
                            <p className="w-full sm:w-auto text-xs text-gray-600 font-medium flex items-center justify-center sm:justify-start mb-1 sm:mb-0">
                                Change all to:
                            </p>
                            {availableStates.map(state => (
                                <button
                                    key={state}
                                    onClick={() => onBulkStateChange(state)}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition transform active:scale-95 whitespace-nowrap ${STATE_COLORS[state]} hover:opacity-80 hover:shadow-md`}
                                >
                                    → {state}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}