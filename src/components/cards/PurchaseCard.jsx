import PurchaseCardBase from './PurchaseCardBase.jsx';

/**
 * Consolidated PurchaseCard component
 * Usage:
 * - <PurchaseCard showGroupTag={true} /> for list view
 * - <PurchaseCard showGroupTag={false} /> for group view
 */
export default function PurchaseCard({ showGroupTag = true, ...props }) {
    return <PurchaseCardBase {...props} showGroupTag={showGroupTag} />;
}