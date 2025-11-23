import { Badge } from './ui';

export default function StateBadge({ state }) {
    if (!state) return null;

    return <Badge state={state}>{state}</Badge>;
}