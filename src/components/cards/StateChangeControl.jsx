import { getAvailableStateTransitions, STATE_COLORS } from '../../utils/purchaseHelpers';

export default function StateChangeControl({ purchase, onStateChange }) {
    const availableStates = getAvailableStateTransitions(purchase['State']);

    if (availableStates.length === 0) return null;

    return (
        <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 font-medium mb-2">Change State:</p>
            <div className="flex flex-wrap gap-2">
                {availableStates.map(state => {
                    const stateColor = STATE_COLORS[state];
                    return (
                        <button
                            key={state}
                            onClick={(e) => {
                                e.stopPropagation();
                                onStateChange(purchase, state);
                            }}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-95 whitespace-nowrap ${stateColor.bg} ${stateColor.text} ${stateColor.hover}`}
                        >
                            → {state}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}