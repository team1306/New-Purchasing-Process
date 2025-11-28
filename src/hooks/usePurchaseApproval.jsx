import { useState } from 'react';
import { getRefreshedAccessToken } from '../utils/googleAuth';
import { updatePurchaseByRequestId } from '../utils/googleSheets';

/**
 * Hook for managing purchase approval operations
 */
export const usePurchaseApproval = (userName, onUpdate, showConfirm, showError, slackController = null) => {
    const [approvalLoading, setApprovalLoading] = useState(false);

    const handleApprove = async (purchase, approvalType, isOverwrite = false) => {
        const confirmMessage = isOverwrite
            ? `Are you sure you want to overwrite the existing ${approvalType} approval?\n\nThe current approver is no longer valid for this request amount.`
            : `Approve this request as ${approvalType}?`;

        if (isOverwrite) {
            const confirmed = await showConfirm(confirmMessage, {
                confirmText: 'Overwrite',
                cancelText: 'Cancel'
            });
            if (!confirmed) return;
        }

        try {
            setApprovalLoading(true);
            const updates = {};
            if (approvalType === 'student') {
                updates['S Approver'] = userName;
            } else if (approvalType === 'mentor') {
                updates['M Approver'] = userName;
            }

            await updatePurchaseByRequestId(purchase['Request ID'], updates, await getRefreshedAccessToken());
            onUpdate();

            // Log to Slack
            if (slackController) {
                await slackController.logApproval(purchase, approvalType, userName, false);
            }
        } catch (err) {
            console.error('Error approving purchase:', err);
            await showError(`Failed to approve: ${err.message}`);
        } finally {
            setApprovalLoading(false);
        }
    };

    const handleWithdrawApproval = async (purchase, approvalType) => {
        try {
            setApprovalLoading(true);
            const updates = {};
            if (approvalType === 'student') {
                updates['S Approver'] = '';
            } else if (approvalType === 'mentor') {
                updates['M Approver'] = '';
            }
            await updatePurchaseByRequestId(purchase['Request ID'], updates, await getRefreshedAccessToken());
            onUpdate();

            // Log to Slack
            if (slackController) {
                await slackController.logApproval(purchase, approvalType, `${userName}`, true);
            }
        } catch (err) {
            console.error('Error withdrawing approval:', err);
            await showError(`Failed to withdraw approval: ${err.message}`);
        } finally {
            setApprovalLoading(false);
        }
    };

    return {
        approvalLoading,
        handleApprove,
        handleWithdrawApproval,
    };
};