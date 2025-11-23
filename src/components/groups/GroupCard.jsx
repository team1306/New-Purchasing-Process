import PurchaseCardBase from '../cards/PurchaseCardBase';

export default function GroupCard(props) {
    return <PurchaseCardBase {...props} showGroupTag={false} />;
}