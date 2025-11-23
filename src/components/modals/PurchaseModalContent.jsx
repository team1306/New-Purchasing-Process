import PurchaseInfoSection from './PurchaseInfoSection.jsx';
import ApprovalSection from './ApprovalSection.jsx';

export default function PurchaseModalContent({
                                                 purchase,
                                                 user,
                                                 validation,
                                                 isEditing,
                                                 editedPurchase,
                                                 originalTier,
                                                 approvalLoading,
                                                 existingPurchases,
                                                 onEditChange,
                                                 onApprove,
                                                 onWithdraw,
                                                 canApproveRequest,
                                                 canOverwriteApproval,
                                                 isApproverValid,
                                                 inDisallowedState,
                                                 userApprovalPermissions
                                             }) {
    return (
        <div className="space-y-4 md:space-y-6">
            <PurchaseInfoSection
                purchase={purchase}
                isEditing={isEditing}
                editedPurchase={editedPurchase}
                originalTier={originalTier}
                onEditChange={onEditChange}
                existingPurchases={existingPurchases}
            />

            <ApprovalSection
                purchase={purchase}
                user={user}
                validation={validation}
                approvalLoading={approvalLoading}
                onApprove={onApprove}
                onWithdraw={onWithdraw}
                canApproveRequest={canApproveRequest}
                canOverwriteApproval={canOverwriteApproval}
                isApproverValid={isApproverValid}
                inDisallowedState={inDisallowedState}
                userApprovalPermissions={userApprovalPermissions}
            />

            {/* Extra padding at bottom for mobile scroll */}
            <div className="h-4 md:h-0"></div>
        </div>
    );
}