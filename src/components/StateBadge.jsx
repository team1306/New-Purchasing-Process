import { STATE_COLORS } from '../utils/purchaseHelpers';

export default function StateBadge({ state }) {
    if (!state) return null;

    const colorClass = STATE_COLORS[state] || 'bg-gray-100 text-gray-800';

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
            {state}
        </span>
    );
}