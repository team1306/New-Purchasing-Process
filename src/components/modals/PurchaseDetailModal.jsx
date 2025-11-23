import { useEffect, useRef, useState } from 'react';
import { useAlert } from '../AlertContext.jsx';
import { usePurchaseEdit } from '../../hooks/index.js';
import { usePurchaseApproval } from '../../hooks/index.js';
import { useApprovalLogic } from '../../hooks/index.js';
import { useModalDrag } from '../../hooks/index.js';
import ModalHeader from './ModalHeader.jsx';
import EditActionsFooter from './EditActionsFooter.jsx';
import PurchaseModalContent from './PurchaseModalContent.jsx';

export default function PurchaseDetailModal({
                                                purchase,
                                                user,
                                                validation,
                                                onClose,
                                                onUpdate,
                                                existingPurchases = []
                                            }) {
    const [isClosing, setIsClosing] = useState(false);
    const { showConfirm, showError } = useAlert();

    const sheetRef = useRef(null);
    const scrollRef = useRef(null);
    const headerRef = useRef(null);

    // Custom hooks
    const {
        isEditing,
        editedPurchase,
        savingLoading,
        originalTier,
        handleEditChange,
        handleToggleEdit,
        handleCancelEdit,
        handleDeletePurchase,
        handleSaveEdit,
    } = usePurchaseEdit(purchase, onUpdate, onClose, showConfirm, showError);

    const {
        approvalLoading,
        handleApprove,
        handleWithdrawApproval,
    } = usePurchaseApproval(user.name, onUpdate, showConfirm, showError);

    const {
        getUserApprovalPermissions,
        canApproveRequest,
        canOverwriteApproval,
        isApproverValid,
        inDisallowedState,
        canDeletePurchase,
        canEditPurchase
    } = useApprovalLogic(user, validation);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 1);
    };

    // Custom hooks for drag functionality
    const { translateY, onTouchStart, onTouchMove, onTouchEnd } = useModalDrag(
        sheetRef,
        scrollRef,
        headerRef,
        handleClose
    );

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

    return (
        <div
            className={`fixed inset-0 bg-black z-50 flex items-end md:items-center justify-center p-0 md:p-4 ${
                isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
            }`}
            style={{
                backgroundColor: isClosing ? 'transparent' : 'rgba(0, 0, 0, 0.5)',
                transition: 'background-color 300ms ease-out',
            }}
            onClick={handleClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                ref={sheetRef}
                onClick={(e) => e.stopPropagation()}
                style={{
                    transform: isClosing
                        ? (window.innerWidth < 768
                            ? "translateY(100%)"
                            : `scale(0.95) translateY(${translateY}px)`)
                        : `translateY(${translateY}px) scale(1)`,
                    opacity: isClosing ? 0 : 1,
                    transition: isClosing
                        ? "all 300ms cubic-bezier(.22,.9,.32,1)"
                        : translateY === 0
                            ? "transform 180ms cubic-bezier(.22,.9,.32,1), opacity 300ms ease-out"
                            : "none",
                    touchAction: "none",
                    paddingTop: window.innerWidth < 768 ? "env(safe-area-inset-top)" : "0",
                }}
                className="bg-white shadow-2xl w-full rounded-t-2xl md:rounded-2xl
               md:max-w-3xl md:h-auto md:max-h-[90vh]
               h-full overflow-hidden flex flex-col"
            >
                <ModalHeader
                    ref={headerRef}
                    purchase={purchase}
                    isEditing={isEditing}
                    savingLoading={savingLoading}
                    canDelete={canDeletePurchase(purchase)}
                    canEdit={canEditPurchase(purchase)}
                    onClose={handleClose}
                    onDelete={handleDeletePurchase}
                    onToggleEdit={handleToggleEdit}
                    onCancelEdit={handleCancelEdit}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                />

                <div
                    ref={scrollRef}
                    className="overflow-y-auto p-4 md:p-6 flex-1"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    <PurchaseModalContent
                        purchase={purchase}
                        user={user}
                        validation={validation}
                        isEditing={isEditing}
                        editedPurchase={editedPurchase}
                        originalTier={originalTier}
                        approvalLoading={approvalLoading}
                        existingPurchases={existingPurchases}
                        onEditChange={handleEditChange}
                        onApprove={handleApprove}
                        onWithdraw={handleWithdrawApproval}
                        canApproveRequest={canApproveRequest}
                        canOverwriteApproval={canOverwriteApproval}
                        isApproverValid={isApproverValid}
                        inDisallowedState={inDisallowedState}
                        userApprovalPermissions={getUserApprovalPermissions}
                    />
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