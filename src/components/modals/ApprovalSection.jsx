import { CheckCircle, AlertCircle } from 'lucide-react';
import { Button, Alert } from '../ui/index.js';
import { calculateTotalCost } from '../../utils/purchaseHelpers.js';

export default function ApprovalSection({
                                            purchase,
                                            user,
                                            validation,
                                            approvalLoading,
                                            onApprove,
                                            onWithdraw,
                                            canApproveRequest,
                                            canOverwriteApproval,
                                            isApproverValid,
                                            inDisallowedState,
                                            userApprovalPermissions
                                        }) {
    const totalCost = parseFloat(calculateTotalCost(purchase).replace(/[^0-9.-]+/g, '')) || 0;

    const ApprovalBox = ({ type, approver, label }) => {
        const approval = canApproveRequest(purchase, type);
        const isValid = isApproverValid(approver, type, totalCost);

        return (
            <div className="bg-gray-50 p-3 md:p-4 rounded-lg mb-3">
                <p className="text-xs md:text-sm text-gray-500 mb-2 font-medium">{label}</p>
                {approver ? (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            {isValid ? (
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 text-sm md:text-base truncate">
                                    {approver}
                                </p>
                                {!isValid && (
                                    <p className="text-xs text-red-600">Invalid approver for this amount</p>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {approver === user.name && !inDisallowedState(purchase) && (
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => onWithdraw(purchase, type)}
                                    loading={approvalLoading}
                                    disabled={approvalLoading}
                                    fullWidth
                                    className="sm:flex-none"
                                >
                                    Withdraw
                                </Button>
                            )}
                            {canOverwriteApproval(purchase, type) && (
                                <Button
                                    variant="warning"
                                    size="sm"
                                    onClick={() => onApprove(purchase, type, true)}
                                    loading={approvalLoading}
                                    disabled={approvalLoading}
                                    fullWidth
                                    className="sm:flex-none"
                                >
                                    Overwrite
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-gray-500 italic text-sm">Not yet approved</p>
                        {approval.canApprove && (
                            <Button
                                variant={type === 'student' ? 'success' : 'primary'}
                                size="sm"
                                onClick={() => onApprove(purchase, type, false)}
                                loading={approvalLoading}
                                disabled={approvalLoading}
                                className="whitespace-nowrap"
                            >
                                Approve
                            </Button>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="border-t pt-4 md:pt-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">
                Approvals
            </h3>

            {/* Warning if over $2000 */}
            {totalCost > 2000 && (
                <Alert type="error" title="Cannot Approve" className="mb-3 md:mb-4 animate-slideDown">
                    Requests over $2,000 cannot be approved through this system.
                </Alert>
            )}

            {/* No Permissions */}
            {!userApprovalPermissions().canStudentApprove &&
                !userApprovalPermissions().canMentorApprove && (
                    <Alert type="warning" title="No Approval Permissions" className="mb-3 md:mb-4">
                        You are not authorized to approve purchase requests.
                    </Alert>
                )}

            {/* Student Approver */}
            <ApprovalBox
                type="student"
                approver={purchase['S Approver']}
                label="Student Approver"
            />

            {/* Mentor Approver */}
            <ApprovalBox
                type="mentor"
                approver={purchase['M Approver']}
                label="Mentor Approver"
            />
        </div>
    );
}