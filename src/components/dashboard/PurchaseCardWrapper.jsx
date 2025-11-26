import { PurchaseCard } from '../cards';

export default function PurchaseCardWrapper(props) {
    // Don't wrap with confirmation - let the parent (DashboardPage/GroupsPage) handle it
    return (
        <PurchaseCard
            {...props}
            showGroupTag={true}
        />
    );
}