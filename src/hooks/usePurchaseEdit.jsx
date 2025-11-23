import { useState, useEffect } from 'react';
import { calculateTotalCost, getRequestTier } from '../utils/purchaseHelpers';
import { getRefreshedAccessToken } from '../utils/googleAuth';
import { updatePurchaseByRequestId, deletePurchaseByRequestId } from '../utils/googleSheets';

/**
 * Hook for managing purchase editing state and operations
 */
export const usePurchaseEdit = (purchase, onUpdate, onClose, showConfirm, showError) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedPurchase, setEditedPurchase] = useState({});
    const [savingLoading, setSavingLoading] = useState(false);
    const [originalTier, setOriginalTier] = useState(null);

    useEffect(() => {
        if (purchase && isEditing) {
            setEditedPurchase({ ...purchase });
            const totalCost = parseFloat(calculateTotalCost(purchase).replace(/[^0-9.-]+/g, '')) || 0;
            setOriginalTier(getRequestTier(totalCost));
        }
    }, [purchase, isEditing]);

    const handleEditChange = (field, value) => {
        setEditedPurchase(prev => ({ ...prev, [field]: value }));
    };

    const handleToggleEdit = () => {
        setIsEditing(true);
        setEditedPurchase({ ...purchase });
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedPurchase({});
    };

    const handleDeletePurchase = async () => {
        const confirmed = await showConfirm(
            `Are you sure you want to delete request "${purchase['Item Description']}"?\n\nThis action cannot be undone.`,
            { confirmText: 'Delete', cancelText: 'Cancel' }
        );

        if (!confirmed) return;

        try {
            setSavingLoading(true);
            await deletePurchaseByRequestId(purchase['Request ID'], await getRefreshedAccessToken());
            onUpdate();
            onClose();
        } catch (err) {
            console.error('Error deleting purchase:', err);
            await showError(`Failed to delete purchase: ${err.message}`);
        } finally {
            setSavingLoading(false);
        }
    };

    const handleSaveEdit = async () => {
        try {
            setSavingLoading(true);
            const newTotalCost = parseFloat(calculateTotalCost(editedPurchase).replace(/[^0-9.-]+/g, '')) || 0;
            const newTier = getRequestTier(newTotalCost);

            const updates = { ...editedPurchase };

            if (originalTier !== newTier) {
                const confirmed = await showConfirm(
                    'The request tier has changed. All approvals will be removed. Continue?',
                    { confirmText: 'Continue', cancelText: 'Cancel' }
                );

                if (!confirmed) {
                    setSavingLoading(false);
                    return;
                }

                updates['S Approver'] = '';
                updates['M Approver'] = '';
            }

            await updatePurchaseByRequestId(purchase['Request ID'], updates, await getRefreshedAccessToken());
            onUpdate();
            setIsEditing(false);
        } catch (err) {
            console.error('Error saving edits:', err);
            await showError(`Failed to save changes: ${err.message}`);
        } finally {
            setSavingLoading(false);
        }
    };

    return {
        isEditing,
        editedPurchase,
        savingLoading,
        originalTier,
        handleEditChange,
        handleToggleEdit,
        handleCancelEdit,
        handleDeletePurchase,
        handleSaveEdit,
    };
};