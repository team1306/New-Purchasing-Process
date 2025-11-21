import { CheckCircle, AlertCircle } from 'lucide-react';
import { calculateTotalCost } from '../utils/purchaseHelpers';

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
                                            inDisallowedState
                                        }) {
    const totalCost = parseFloat(calculateTotalCost(purchase).replace(/[^0-9.-]+/g, '')) || 0;

    const getUserApprovalPermissions = () => {
        const userName = user.name;
        const permissions = {
            canStudentApprove: false,
            studentApprovalLimit: 0,
            canMentorApprove: false,
            mentorApprovalLimit: 0
        };

        if (validation['Presidents']?.includes(userName)) {
            permissions.canStudentApprove = true;
            permissions.studentApprovalLimit = Infinity;
        } else if (validation['Leadership']?.includes(userName)) {
            permissions.canStudentApprove = true;
            permissions.studentApprovalLimit = 500;
        }

        if (validation['Mentors']?.includes(userName)) {
            permissions.canMentorApprove = true;
            permissions.mentorApprovalLimit = 500;
        } else if (validation['Directors']?.includes(userName)) {
            permissions.canMentorApprove = true;
            permissions.mentorApprovalLimit = Infinity;
        }

        return permissions;
    };

    return (
        <div className="border-t pt-4 md:pt-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Approvals</h3>

            {/* Warning if over $2000 */}
            {totalCost > 2000 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 mb-3 md:mb-4 flex items-start animate-slideDown">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-semibold text-red-800 text-sm md:text-base">Cannot Approve</p>
                        <p className="text-xs md:text-sm text-red-700">
                            Requests over $2,000 cannot be approved through this system.
                        </p>
                    </div>
                </div>
            )}

            {/* No Permissions */}
            {!getUserApprovalPermissions().canStudentApprove && !getUserApprovalPermissions().canMentorApprove && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4 mb-3 md:mb-4 flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-semibold text-yellow-800 text-sm md:text-base">No Approval Permissions</p>
                        <p className="text-xs md:text-sm text-yellow-700">
                            You are not authorized to approve purchase requests.
                        </p>
                    </div>
                </div>
            )}

            {/* Student Approver */}
            <div className="bg-gray-50 p-3 md:p-4 rounded-lg mb-3">
                <p className="text-xs md:text-sm text-gray-500 mb-2 font-medium">Student Approver</p>
                {purchase['S Approver'] ? (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            {isApproverValid(purchase['S Approver'], 'student', totalCost) ? (
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 text-sm md:text-base truncate">
                                    {purchase['S Approver']}
                                </p>
                                {!isApproverValid(purchase['S Approver'], 'student', totalCost) && (
                                    <p className="text-xs text-red-600">Invalid approver for this amount</p>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {purchase['S Approver'] === user.name && !inDisallowedState(purchase) && (
                                <button
                                    onClick={() => onWithdraw('student')}
                                    disabled={approvalLoading}
                                    className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 text-sm transform active:scale-95"
                                >
                                    {approvalLoading ? 'Withdrawing...' : 'Withdraw'}
                                </button>
                            )}
                            {canOverwriteApproval(purchase, 'student') && (
                                <button
                                    onClick={() => onApprove('student', true)}
                                    disabled={approvalLoading}
                                    className="flex-1 sm:flex-none bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 text-sm transform active:scale-95"
                                >
                                    {approvalLoading ? 'Overwriting...' : 'Overwrite'}
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-gray-500 italic text-sm">Not yet approved</p>
                        {(() => {
                            const approval = canApproveRequest(purchase, 'student');
                            return approval.canApprove ? (
                                <button
                                    onClick={() => onApprove('student', false)}
                                    disabled={approvalLoading}
                                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 text-sm whitespace-nowrap transform active:scale-95"
                                >
                                    {approvalLoading ? 'Approving...' : 'Approve'}
                                </button>
                            ) : null;
                        })()}
                    </div>
                )}
            </div>

            {/* Mentor Approver */}
            <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                <p className="text-xs md:text-sm text-gray-500 mb-2 font-medium">Mentor Approver</p>
                {purchase['M Approver'] ? (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            {isApproverValid(purchase['M Approver'], 'mentor', totalCost) ? (
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 text-sm md:text-base truncate">
                                    {purchase['M Approver']}
                                </p>
                                {!isApproverValid(purchase['M Approver'], 'mentor', totalCost) && (
                                    <p className="text-xs text-red-600">Invalid approver for this amount</p>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {purchase['M Approver'] === user.name && !inDisallowedState(purchase) && (
                                <button
                                    onClick={() => onWithdraw('mentor')}
                                    disabled={approvalLoading}
                                    className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 text-sm transform active:scale-95"
                                >
                                    {approvalLoading ? 'Withdrawing...' : 'Withdraw'}
                                </button>
                            )}
                            {canOverwriteApproval(purchase, 'mentor') && (
                                <button
                                    onClick={() => onApprove('mentor', true)}
                                    disabled={approvalLoading}
                                    className="flex-1 sm:flex-none bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 text-sm transform active:scale-95"
                                >
                                    {approvalLoading ? 'Overwriting...' : 'Overwrite'}
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-gray-500 italic text-sm">Not yet approved</p>
                        {(() => {
                            const approval = canApproveRequest(purchase, 'mentor');
                            return approval.canApprove ? (
                                <button
                                    onClick={() => onApprove('mentor', false)}
                                    disabled={approvalLoading}
                                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 text-sm whitespace-nowrap transform active:scale-95"
                                >
                                    {approvalLoading ? 'Approving...' : 'Approve'}
                                </button>
                            ) : null;
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
}