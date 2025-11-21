import { useEffect, useRef, useState } from 'react';
import { getRefreshedAccessToken } from '../utils/googleAuth.js';
import { updatePurchaseByRequestId, deletePurchaseByRequestId } from '../utils/googleSheets.js';
import { calculateTotalCost, getRequestTier } from '../utils/purchaseHelpers.js';
import ModalHeader from './ModalHeader';
import PurchaseInfoSection from './PurchaseInfoSection';
import ApprovalSection from './ApprovalSection';
import EditActionsFooter from './EditActionsFooter';
import { useModalDrag } from '../hooks/useModalDrag';
import { useApprovalLogic } from '../hooks/useApprovalLogic';

export default function PurchaseDetailModal({ purchase, user, validation, onClose, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedPurchase, setEditedPurchase] = useState({});
    const [approvalLoading, setApprovalLoading] = useState(false);
    const [savingLoading, setSavingLoading] = useState(false);
    const [originalTier, setOriginalTier] = useState(null);
    const [isClosing, setIsClosing] = useState(false);

    const sheetRef = useRef(null);
    const scrollRef = useRef(null);

    // Custom hooks for drag functionality
    const { translateY, onTouchStart, onTouchMove, onTouchEnd } = useModalDrag(sheetRef, scrollRef, onClose);

    // Custom hook for approval logic
    const {
        canApproveRequest,
        canOverwriteApproval,
        isApproverValid,
        inDisallowedState,
        canDeletePurchase,
        canEditPurchase
    } = useApprovalLogic(user, validation);

    useEffect(() => {
        if (purchase && isEditing) {
            setEditedPurchase({ ...purchase });
            const totalCost = parseFloat(calculateTotalCost(purchase).replace(/[^0-9.-]+/g, '')) || 0;
            setOriginalTier(getRequestTier(totalCost));
        }
    }, [purchase, isEditing]);

    // Prevent background scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    // Escape key handler
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300); // Match animation duration
    };

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
        if (!window.confirm(`Are you sure you want to delete request "${purchase['Item Description']}"?`)) return;

        try {
            setSavingLoading(true);
            await deletePurchaseByRequestId(purchase['Request ID'], await getRefreshedAccessToken());
            onUpdate();
            onClose();
        } catch (err) {
            console.error('Error deleting purchase:', err);
            alert(`Failed to delete purchase: ${err.message}`);
        } finally {
            setSavingLoading(false);
        }
    };

    const handleApprove = async (approvalType, isOverwrite = false) => {
        const confirmMessage = isOverwrite
            ? `Are you sure you want to overwrite the existing ${approvalType} approval? The current approver is no longer valid for this request amount.`
            : `Approve this request as ${approvalType}?`;

        if (isOverwrite && !window.confirm(confirmMessage)) return;

        try {
            setApprovalLoading(true);
            const updates = {};
            if (approvalType === 'student') {
                updates['S Approver'] = user.name;
            } else if (approvalType === 'mentor') {
                updates['M Approver'] = user.name;
            }
            await updatePurchaseByRequestId(purchase['Request ID'], updates, await getRefreshedAccessToken());
            onUpdate();
        } catch (err) {
            console.error('Error approving purchase:', err);
            alert(`Failed to approve: ${err.message}`);
        } finally {
            setApprovalLoading(false);
        }
    };

    const handleWithdrawApproval = async (approvalType) => {
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
        } catch (err) {
            console.error('Error withdrawing approval:', err);
            alert(`Failed to withdraw approval: ${err.message}`);
        } finally {
            setApprovalLoading(false);
        }
    };

    const handleSaveEdit = async () => {
        try {
            setSavingLoading(true);
            const newTotalCost = parseFloat(calculateTotalCost(editedPurchase).replace(/[^0-9.-]+/g, '')) || 0;
            const newTier = getRequestTier(newTotalCost);

            const updates = { ...editedPurchase };

            if (originalTier !== newTier) {
                if (window.confirm('The request tier has changed. All approvals will be removed. Continue?')) {
                    updates['S Approver'] = '';
                    updates['M Approver'] = '';
                } else {
                    setSavingLoading(false);
                    return;
                }
            }

            await updatePurchaseByRequestId(purchase['Request ID'], updates, await getRefreshedAccessToken());
            onUpdate();
            setIsEditing(false);
        } catch (err) {
            console.error('Error saving edits:', err);
            alert(`Failed to save changes: ${err.message}`);
        } finally {
            setSavingLoading(false);
        }
    };

    const sheetStyle = {
        transform: isClosing ? 'translateY(100%)' : `translateY(${translateY}px)`,
        transition: isClosing ? 'transform 300ms cubic-bezier(.22,.9,.32,1)' : 'transform 180ms cubic-bezier(.22,.9,.32,1)',
        touchAction: 'pan-y',
    };

    return (
        <div
            className={`fixed inset-0 bg-black z-50 flex items-end md:items-center justify-center p-0 md:p-4 transition-opacity duration-300 ${
                isClosing ? 'bg-opacity-0' : 'bg-opacity-50 animate-fadeIn'
            }`}
            onClick={handleClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                ref={sheetRef}
                style={sheetStyle}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                className={`bg-white shadow-2xl w-full rounded-t-2xl md:rounded-2xl md:max-w-3xl md:h-auto md:max-h-[90vh] max-h-[95vh] overflow-hidden flex flex-col transition-all duration-300 ${
                    isClosing
                        ? 'md:opacity-0 md:scale-95'
                        : 'md:opacity-100 md:scale-100 md:animate-slideUp animate-slideInFromBottom'
                }`}
            >
                <ModalHeader
                    purchase={purchase}
                    isEditing={isEditing}
                    savingLoading={savingLoading}
                    canDelete={canDeletePurchase(purchase)}
                    canEdit={canEditPurchase(purchase)}
                    onClose={handleClose}
                    onDelete={handleDeletePurchase}
                    onToggleEdit={handleToggleEdit}
                    onCancelEdit={handleCancelEdit}
                />

                <div
                    ref={scrollRef}
                    className="overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 flex-1"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    <PurchaseInfoSection
                        purchase={purchase}
                        isEditing={isEditing}
                        editedPurchase={editedPurchase}
                        originalTier={originalTier}
                        onEditChange={handleEditChange}
                    />

                    <ApprovalSection
                        purchase={purchase}
                        user={user}
                        validation={validation}
                        approvalLoading={approvalLoading}
                        onApprove={handleApprove}
                        onWithdraw={handleWithdrawApproval}
                        canApproveRequest={canApproveRequest}
                        canOverwriteApproval={canOverwriteApproval}
                        isApproverValid={isApproverValid}
                        inDisallowedState={inDisallowedState}
                    />

                    {/* Extra padding at bottom for mobile scroll */}
                    <div className="h-4 md:h-0"></div>
                </div>

                {isEditing && (
                    <EditActionsFooter
                        savingLoading={savingLoading}
                        onCancel={handleCancelEdit}
                        onSave={handleSaveEdit}
                    />
                )}
            </div>
        </div>
    );
}