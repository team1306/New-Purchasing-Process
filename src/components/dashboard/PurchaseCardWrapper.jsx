import PurchaseCard from './PurchaseCard';
import { useAlert } from '../AlertContext';

export default function PurchaseCardWrapper(props) {
    const { showConfirm } = useAlert();

    const handleStateChange = async (purchase, newState) => {
        const confirmed = await showConfirm(
            `Change state to "${newState}"?`,
            { confirmText: 'Change State', cancelText: 'Cancel' }
        );

        if (confirmed) {
            props.onStateChange(purchase, newState);
        }
    };

    return (
        <PurchaseCard
            {...props}
            onStateChange={handleStateChange}
        />
    );
}