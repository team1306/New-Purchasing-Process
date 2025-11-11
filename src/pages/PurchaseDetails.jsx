import {useEffect, useState} from 'react';
import { X, CheckCircle, AlertCircle, XCircle, Pencil, Trash2, Loader} from 'lucide-react';
import { getAccessToken, requestSheetsAccess } from '../utils/googleAuth';
import { updatePurchaseByRequestId, deletePurchaseByRequestId } from '../utils/googleSheets';
import {
    calculateTotalCost,
    CATEGORIES,
    formatCurrency,
    formatDate,
    parseCurrency,
    StateBadge
} from "./DashboardPage.jsx";

export default function PurchaseDetailModal({purchase, user, validation, onClose, onUpdate}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedPurchase, setEditedPurchase] = useState({});
    const [approvalLoading, setApprovalLoading] = useState(false);
    const [savingLoading, setSavingLoading] = useState(false);

    useEffect(() => {
        if (purchase && isEditing) {
            setEditedPurchase({ ...purchase });
        }
    }, [purchase, isEditing]);

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

        if (validation['Mentor']?.includes(userName)) {
            permissions.canMentorApprove = true;
            permissions.mentorApprovalLimit = 500;
        } else if (validation['Directors']?.includes(userName)) {
            permissions.canMentorApprove = true;
            permissions.mentorApprovalLimit = Infinity;
        }

        return permissions;
    };

    const inDisallowedState = (purchase) => {
        const disallowedStates = ['Purchased', 'Received', 'Completed'];
        return disallowedStates.includes(purchase['State']);
    };

    const canApproveRequest = (purchase, approvalType) => {
        const totalCost = parseFloat(purchase['Total Cost']) || 0;

        if (inDisallowedState(purchase)) {
            return { canApprove: false, reason: 'Already approved' };
        }

        if (totalCost > 2000) {
            return { canApprove: false, reason: 'Requests over $2,000 cannot be approved' };
        }

        if (user.name === purchase['Requestor']) {
            return { canApprove: false, reason: 'Requestor' };
        }

        const permissions = getUserApprovalPermissions();

        if (approvalType === 'student') {
            if (!permissions.canStudentApprove) {
                return { canApprove: false, reason: 'You do not have student approval permissions' };
            }
            if (totalCost > permissions.studentApprovalLimit) {
                return { canApprove: false, reason: `You can only student approve requests up to ${permissions.studentApprovalLimit}` };
            }
            return { canApprove: true };
        }

        if (approvalType === 'mentor') {
            if (!permissions.canMentorApprove) {
                return { canApprove: false, reason: 'You do not have mentor approval permissions' };
            }
            if (totalCost > permissions.mentorApprovalLimit) {
                return { canApprove: false, reason: `You can only mentor approve requests up to ${permissions.mentorApprovalLimit}` };
            }
            return { canApprove: true };
        }

        return { canApprove: false, reason: 'Unknown approval type' };
    };

    const canDeletePurchase = (purchase) => {
        const { canStudentApprove, canMentorApprove } = getUserApprovalPermissions();
        const disallowedStates = ['Purchased', 'Received', 'Completed'];
        return (canStudentApprove || canMentorApprove) && !disallowedStates.includes(purchase['State']);
    };

    const canEditPurchase = (purchase) => {
        const userName = user.name;
        if (purchase['Requester'] === userName) return true;
        const student = canApproveRequest(purchase, 'student').canApprove;
        const mentor = canApproveRequest(purchase, 'mentor').canApprove;
        return student || mentor;
    };

    const handleDeletePurchase = async () => {
        if (!window.confirm(`Are you sure you want to delete request "${purchase['Item Description']}"?`)) return;

        try {
            setSavingLoading(true);
            let token = getAccessToken();
            if (!token) token = await requestSheetsAccess();

            await deletePurchaseByRequestId(purchase['Request ID'], token);
            onUpdate();
            onClose();
        } catch (err) {
            console.error('Error deleting purchase:', err);
            alert(`Failed to delete purchase: ${err.message}`);
        } finally {
            setSavingLoading(false);
        }
    };

    const handleApprove = async (approvalType) => {
        try {
            setApprovalLoading(true);
            let token = getAccessToken();
            if (!token) {
                token = await requestSheetsAccess();
            }

            const updates = {};
            if (approvalType === 'student') {
                updates['S Approver'] = user.name;
            } else if (approvalType === 'mentor') {
                updates['M Approver'] = user.name;
            }

            await updatePurchaseByRequestId(purchase['Request ID'], updates, token);
            onUpdate();
        } catch (err) {
            console.error('Error approving purchase:', err);
            alert(`Failed to approve purchase: ${err.message}`);
        } finally {
            setApprovalLoading(false);
        }
    };

    const handleWithdrawApproval = async (approvalType) => {
        try {
            setApprovalLoading(true);
            let token = getAccessToken();
            if (!token) {
                token = await requestSheetsAccess();
            }

            const updates = {};
            if (approvalType === 'student') {
                updates['S Approver'] = '';
            } else if (approvalType === 'mentor') {
                updates['M Approver'] = '';
            }

            await updatePurchaseByRequestId(purchase['Request ID'], updates, token);
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
            let token = getAccessToken();
            if (!token) token = await requestSheetsAccess();

            await updatePurchaseByRequestId(purchase['Request ID'], editedPurchase, token);
            onUpdate();
            setIsEditing(false);
        } catch (err) {
            console.error('Error saving edits:', err);
            alert(`Failed to save changes: ${err.message}`);
        } finally {
            setSavingLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white sticky top-0 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">{purchase['Item Description']}</h2>
                            <p className="text-blue-100">Request ID: {purchase['Request ID']}</p>
                        </div>
                        {purchase['State'] && <StateBadge state={purchase['State']} />}
                    </div>

                    <div className="flex items-center gap-2">
                        {canDeletePurchase(purchase) && (
                            <button
                                onClick={handleDeletePurchase}
                                className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition disabled:opacity-50"
                                disabled={savingLoading}
                                title="Delete purchase"
                            >
                                {savingLoading ? <Loader className="animate-spin w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
                            </button>
                        )}

                        {canEditPurchase(purchase) && (
                            <>
                                {!isEditing ? (
                                    <button
                                        onClick={() => {
                                            setIsEditing(true);
                                            setEditedPurchase({ ...purchase });
                                        }}
                                        disabled={purchase['S Approver'] && purchase['M Approver']}
                                        className={`p-2 rounded-full transition duration-200 ${
                                            purchase['S Approver'] && purchase['M Approver']
                                                ? 'bg-white/10 text-white/50 cursor-not-allowed'
                                                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                        }`}
                                        title={
                                            purchase['S Approver'] && purchase['M Approver']
                                                ? 'Cannot edit after approval'
                                                : 'Edit item'
                                        }
                                    >
                                        <Pencil className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditedPurchase({});
                                        }}
                                        className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition duration-200"
                                        title="Cancel edit mode"
                                    >
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                )}
                            </>
                        )}

                        <button
                            onClick={() => {
                                onClose();
                                setIsEditing(false);
                            }}
                            className="text-white hover:bg-white/20 rounded-lg p-2 transition"
                            title="Close"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Basic Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Date Requested</p>
                            <p className="font-semibold text-gray-800">{formatDate(purchase['Date Requested'])}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Requester</p>
                            <p className="font-semibold text-gray-800">{purchase['Requester'] || 'N/A'}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Category</p>
                            {isEditing ? (
                                <select
                                    value={editedPurchase['Category'] || ''}
                                    onChange={(e) =>
                                        setEditedPurchase((prev) => ({ ...prev, 'Category': e.target.value }))
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                >
                                    {CATEGORIES.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <p className="font-semibold text-gray-800">{purchase['Category']}</p>
                            )}
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Quantity</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedPurchase['Quantity']}
                                    onChange={(e) =>
                                        setEditedPurchase((prev) => ({ ...prev, 'Quantity': e.target.value }))
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                />
                            ) : (
                                <p className="font-semibold text-gray-800">{purchase['Quantity']}</p>
                            )}
                        </div>
                    </div>

                    {/* Cost Info */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-blue-700 mb-1">Unit Price</p>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={parseCurrency(editedPurchase['Unit Price']) || '-1'}
                                        onChange={(e) =>
                                            setEditedPurchase((prev) => ({ ...prev, 'Unit Price': e.target.value }))
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="font-semibold text-gray-800">{formatCurrency(purchase['Unit Price'])}</p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-blue-700 mb-1">Shipping</p>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={parseCurrency(editedPurchase['Shipping']) || '0.00'}
                                        onChange={(e) =>
                                            setEditedPurchase((prev) => ({ ...prev, 'Shipping': e.target.value }))
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="font-semibold text-gray-800">{formatCurrency(purchase['Shipping'])}</p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-blue-700 mb-1">Total Cost</p>
                                <p className="font-medium">{calculateTotalCost(purchase)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Item Link */}
                    {purchase?.['Item Link'] && purchase['Item Link'].trim() !== '' && (
                        <div>
                            <p className="text-sm text-gray-500 mb-2">Item Link</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedPurchase['Item Link'] || ''}
                                    onChange={(e) =>
                                        setEditedPurchase((prev) => ({ ...prev, 'Item Link': e.target.value }))
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                />
                            ) : (
                                <a
                                    href={purchase['Item Link']}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 hover:underline break-all"
                                >
                                    {purchase['Item Link']}
                                </a>
                            )}
                        </div>
                    )}

                    {/* Comments */}
                    {purchase['Comments'] && (
                        <div>
                            <p className="text-sm text-gray-500 mb-2">Comments</p>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedPurchase['Comments'] || ''}
                                        onChange={(e) =>
                                            setEditedPurchase((prev) => ({ ...prev, 'Comments': e.target.value }))
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="font-semibold text-gray-800">{purchase['Comments']}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Purchase Info */}
                    {(purchase['Date Purchased'] || purchase['Order Number']) && (
                        <div className="grid grid-cols-2 gap-4">
                            {purchase['Date Purchased'] && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Date Purchased</p>
                                    <p className="font-semibold text-gray-800">{formatDate(purchase['Date Purchased'])}</p>
                                </div>
                            )}
                            {purchase['Order Number'] && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Order Number</p>
                                    <p className="font-semibold text-gray-800">{purchase['Order Number']}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Approvals Section */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Approvals</h3>

                        {/* Warning if over $2000 */}
                        {parseFloat(purchase['Total Cost']) > 2000 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start">
                                <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-red-800">Cannot Approve</p>
                                    <p className="text-sm text-red-700">Requests over $2,000 cannot be approved through this system.</p>
                                </div>
                            </div>
                        )}

                        {/* Warning if user cannot approve */}
                        {!getUserApprovalPermissions().canStudentApprove && !getUserApprovalPermissions().canMentorApprove && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 flex items-start">
                                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-yellow-800">No Approval Permissions</p>
                                    <p className="text-sm text-yellow-700">You are not authorized to approve purchase requests.</p>
                                </div>
                            </div>
                        )}

                        {/* Student Approver */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Student Approver</p>
                                    {purchase['S Approver'] ? (
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center">
                                                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                                <p className="font-semibold text-gray-800">{purchase['S Approver']}</p>
                                            </div>
                                            {purchase['S Approver'] === user.name && !inDisallowedState(purchase) && (
                                                <button
                                                    onClick={() => handleWithdrawApproval('student')}
                                                    disabled={approvalLoading}
                                                    className="ml-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                                                >
                                                    {approvalLoading ? 'Withdrawing...' : 'Withdraw Approval'}
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic">Not yet approved</p>
                                    )}
                                </div>
                                {!purchase['S Approver'] && (() => {
                                    const approval = canApproveRequest(purchase, 'student');
                                    return approval.canApprove ? (
                                        <button
                                            onClick={() => handleApprove('student')}
                                            disabled={approvalLoading}
                                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                                        >
                                            {approvalLoading ? 'Approving...' : 'Approve as Student'}
                                        </button>
                                    ) : null;
                                })()}
                            </div>
                        </div>

                        {/* Mentor Approver */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Mentor Approver</p>
                                    {purchase['M Approver'] ? (
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center">
                                                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                                <p className="font-semibold text-gray-800">{purchase['M Approver']}</p>
                                            </div>
                                            {purchase['M Approver'] === user.name && !inDisallowedState(purchase) && (
                                                <button
                                                    onClick={() => handleWithdrawApproval('mentor')}
                                                    disabled={approvalLoading}
                                                    className="ml-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                                                >
                                                    {approvalLoading ? 'Withdrawing...' : 'Withdraw Approval'}
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic">Not yet approved</p>
                                    )}
                                </div>
                                {!purchase['M Approver'] && (() => {
                                    const approval = canApproveRequest(purchase, 'mentor');
                                    return approval.canApprove ? (
                                        <button
                                            onClick={() => handleApprove('mentor')}
                                            disabled={approvalLoading}
                                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                                        >
                                            {approvalLoading ? 'Approving...' : 'Approve as Mentor'}
                                        </button>
                                    ) : null;
                                })()}
                            </div>
                            {isEditing && (
                                <div className="flex justify-end gap-3 border-t pt-4 mt-4">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={savingLoading}
                                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                                    >
                                        {savingLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}