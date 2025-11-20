import { useEffect, useRef, useState } from 'react';
import {
    X,
    CheckCircle,
    AlertCircle,
    XCircle,
    Pencil,
    Trash2,
    Loader,
    AlertTriangle
} from 'lucide-react';
import { getRefreshedAccessToken } from '../utils/googleAuth.js';
import { updatePurchaseByRequestId, deletePurchaseByRequestId } from '../utils/googleSheets.js';
import {
    calculateTotalCost,
    formatCurrency,
    formatDate,
    parseCurrency,
    getRequestTier,
} from '../utils/purchaseHelpers.js';
import { CATEGORIES } from '../utils/purchaseHelpers.js';
import StateBadge from './StateBadge';

export default function PurchaseDetailModal({ purchase, user, validation, onClose, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedPurchase, setEditedPurchase] = useState({});
    const [approvalLoading, setApprovalLoading] = useState(false);
    const [savingLoading, setSavingLoading] = useState(false);
    const [originalTier, setOriginalTier] = useState(null);

    // Bottom-sheet / drag state
    const sheetRef = useRef(null);
    const scrollRef = useRef(null);
    const startYRef = useRef(0);
    const lastYRef = useRef(0);
    const [translateY, setTranslateY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (purchase && isEditing) {
            setEditedPurchase({ ...purchase });
            const totalCost = parseFloat(calculateTotalCost(purchase).replace(/[^0-9.-]+/g, '')) || 0;
            setOriginalTier(getRequestTier(totalCost));
        }
    }, [purchase, isEditing]);

    // prevent background scroll while modal open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    // Escape key handler
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const handleClose = () => {
        // animate sheet down slightly before close for better UX
        if (sheetRef.current && window.innerWidth < 768) {
            setTranslateY(window.innerHeight * 0.05);
            setTimeout(() => onClose(), 120);
        } else {
            onClose();
        }
    };

    // Touch / drag handlers (mobile bottom sheet behavior)
    const onTouchStart = (e) => {
        if (!sheetRef.current) return;
        const touch = e.touches ? e.touches[0] : e;
        startYRef.current = touch.clientY;
        lastYRef.current = touch.clientY;
        setIsDragging(true);
    };

    const onTouchMove = (e) => {
        if (!isDragging || !sheetRef.current) return;
        const touch = e.touches ? e.touches[0] : e;
        const deltaY = touch.clientY - startYRef.current;
        lastYRef.current = touch.clientY;

        // If the inner scroll is not at top, don't drag the sheet (allow scroll)
        const scrollEl = scrollRef.current;
        const scrollAtTop = !scrollEl || scrollEl.scrollTop <= 0;

        if (deltaY > 0 && scrollAtTop) {
            // translate only downward
            setTranslateY(deltaY);
            // prevent page scroll while dragging
            if (e.cancelable) e.preventDefault();
        } else if (deltaY < 0 && translateY > 0) {
            // dragging up to cancel previous translate
            setTranslateY(Math.max(0, deltaY));
            if (e.cancelable) e.preventDefault();
        }
    };

    const onTouchEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);
        const delta = lastYRef.current - startYRef.current;
        const threshold = Math.min(140, window.innerHeight * 0.18); // threshold to dismiss
        if (delta > threshold) {
            // close
            onClose();
        } else {
            // animate back to 0
            setTranslateY(0);
        }
    };

    // For pointer devices (drag with mouse), support pointer events
    useEffect(() => {
        const el = sheetRef.current;
        if (!el) return;

        const onPointerDown = (e) => {
            if (window.innerWidth >= 768) return; // only mobile sheet
            el.setPointerCapture?.(e.pointerId);
            onTouchStart(e);
        };
        const onPointerMove = (e) => {
            if (!isDragging) return;
            onTouchMove(e);
        };
        const onPointerUp = (e) => {
            if (!isDragging) return;
            onTouchEnd(e);
            el.releasePointerCapture?.(e.pointerId);
        };

        el.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);

        return () => {
            el.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };
    }, [isDragging]);

    // Approval and edit helper functions (unchanged logic)
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

    const isApproverValid = (approverName, approvalType, totalCost) => {
        if (!approverName || approverName.trim() === '') return true;

        if (approvalType === 'student') {
            const isPresident = validation['Presidents']?.includes(approverName);
            const isLeadership = validation['Leadership']?.includes(approverName);

            if (isPresident) return true;
            if (isLeadership && totalCost <= 500) return true;
            return false;
        }

        if (approvalType === 'mentor') {
            const isMentor = validation['Mentors']?.includes(approverName);
            const isDirector = validation['Directors']?.includes(approverName);

            if (isDirector) return true;
            if (isMentor && totalCost <= 500) return true;
            return false;
        }

        return false;
    };

    const inDisallowedState = (purchase) => {
        const disallowedStates = ['Purchased', 'Received', 'Completed'];
        return disallowedStates.includes(purchase['State']);
    };

    const canApproveRequest = (purchase, approvalType) => {
        const totalCost = parseFloat(calculateTotalCost(purchase).replace(/[^0-9.-]+/g, '')) || 0;

        if (inDisallowedState(purchase)) {
            return { canApprove: false, reason: 'Already approved' };
        }

        if (totalCost > 2000) {
            return { canApprove: false, reason: 'Requests over $2,000 cannot be approved' };
        }

        if (user.name === purchase['Requester']) {
            return { canApprove: false, reason: 'Requestor' };
        }

        const permissions = getUserApprovalPermissions();

        if (approvalType === 'student') {
            if (!permissions.canStudentApprove) {
                return { canApprove: false, reason: 'You do not have student approval permissions' };
            }
            if (totalCost > permissions.studentApprovalLimit) {
                return { canApprove: false, reason: `You can only student approve requests up to $${permissions.studentApprovalLimit}` };
            }
            return { canApprove: true };
        }

        if (approvalType === 'mentor') {
            if (!permissions.canMentorApprove) {
                return { canApprove: false, reason: 'You do not have mentor approval permissions' };
            }
            if (totalCost > permissions.mentorApprovalLimit) {
                return { canApprove: false, reason: `You can only mentor approve requests up to $${permissions.mentorApprovalLimit}` };
            }
            return { canApprove: true };
        }

        return { canApprove: false, reason: 'Unknown approval type' };
    };

    const canOverwriteApproval = (purchase, approvalType) => {
        const totalCost = parseFloat(calculateTotalCost(purchase).replace(/[^0-9.-]+/g, '')) || 0;
        const approverName = approvalType === 'student' ? purchase['S Approver'] : purchase['M Approver'];

        const isCurrentApproverInvalid = !isApproverValid(approverName, approvalType, totalCost);
        const userCanApprove = canApproveRequest(purchase, approvalType).canApprove;
        return isCurrentApproverInvalid && userCanApprove;
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
        const action = isOverwrite ? 'overwrite' : 'add';
        const confirmMessage = isOverwrite
            ? `Are you sure you want to overwrite the existing ${approvalType} approval? The current approver is no longer valid for this request amount.`
            : `Approve this request as ${approvalType}?`;

        if (isOverwrite && !window.confirm(confirmMessage)) {
            return;
        }

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
            alert(`Failed to ${action} approval: ${err.message}`);
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

    const totalCost = parseFloat(calculateTotalCost(purchase).replace(/[^0-9.-]+/g, '')) || 0;

    // dynamic inline style for translate during drag
    const sheetStyle = {
        transform: `translateY(${translateY}px)`,
        transition: isDragging ? 'none' : 'transform 180ms cubic-bezier(.22,.9,.32,1)',
        touchAction: 'pan-y',
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
            onClick={handleClose}
            aria-modal="true"
            role="dialog"
        >
            {/* Modal container: bottom-sheet on mobile, centered on md+ */}
            <div
                ref={sheetRef}
                style={sheetStyle}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                className={`
                    bg-white shadow-2xl w-full
                    md:rounded-2xl md:max-w-3xl md:h-auto md:max-h-[90vh]
                    ${/* mobile bottom sheet sizing */''}
                    rounded-t-2xl md:rounded-2xl
                    md:translate-y-0
                    max-h-[95vh] overflow-hidden
                    flex flex-col
                `}
            >
                {/* Header (drag handle + title).  Sticky effect handled by making header separate */}
                <div className="sticky top-0 z-30 bg-gradient-to-r from-red-700 to-orange-800 p-4 md:p-6 text-white flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Drag handle (visible on mobile) */}
                        <div className="hidden md:block" />
                        <div className="md:hidden flex items-center mr-2">
                            <div className="w-10 -mt-2 flex items-center justify-center">
                                <div className="w-10 h-0.5 bg-white/60 rounded-full" />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg md:text-2xl font-bold mb-0">{purchase['Item Description']}</h2>
                            <p className="text-blue-100 text-sm md:text-base">Request ID: {purchase['Request ID']}</p>
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
                            onClick={handleClose}
                            className="text-white hover:bg-white/20 rounded-lg p-2 transition"
                            title="Close"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content scroll area: this should be the element that scrolls so we can detect scrollTop */}
                <div
                    ref={scrollRef}
                    className="overflow-y-auto p-4 md:p-6 space-y-6"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    {/* Basic Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                    {/* Package Size */}
                    {(purchase['Package Size']?.trim() || isEditing) && (
                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                            <p className="text-sm text-indigo-700 mb-1">Package Size</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedPurchase['Package Size'] || ''}
                                    onChange={(e) =>
                                        setEditedPurchase((prev) => ({ ...prev, 'Package Size': e.target.value }))
                                    }
                                    placeholder="Leave blank if only 1 item"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                />
                            ) : (
                                <p className="font-semibold text-gray-800">{purchase['Package Size']}</p>
                            )}
                        </div>
                    )}

                    {/* Cost Info */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-blue-700 mb-1">Unit Price</p>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={parseCurrency(editedPurchase['Unit Price']) || '0'}
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
                                        value={parseCurrency(editedPurchase['Shipping']) || '0'}
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
                                <p className="font-semibold text-gray-800">
                                    {isEditing ? calculateTotalCost(editedPurchase) : calculateTotalCost(purchase)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tier Change Warning */}
                    {isEditing && originalTier !== getRequestTier(parseFloat(calculateTotalCost(editedPurchase).replace(/[^0-9.-]+/g, '')) || 0) && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start">
                            <AlertTriangle className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-orange-800">Request Tier Changed</p>
                                <p className="text-sm text-orange-700">
                                    The total cost has changed enough to affect the approval tier. All approvals will be cleared when you save.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Item Link */}
                    {(purchase?.['Item Link'] || isEditing) && (
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
                            ) : purchase['Item Link']?.trim() !== '' ? (
                                <a
                                    href={purchase['Item Link']}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 hover:underline break-all"
                                >
                                    {purchase['Item Link']}
                                </a>
                            ) : null}
                        </div>
                    )}

                    {/* Comments */}
                    {(purchase['Comments'] || isEditing) && (
                        <div>
                            <p className="text-sm text-gray-500 mb-2">Comments</p>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                {isEditing ? (
                                    <textarea
                                        value={editedPurchase['Comments'] || ''}
                                        onChange={(e) =>
                                            setEditedPurchase((prev) => ({ ...prev, 'Comments': e.target.value }))
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                    />
                                ) : (
                                    <p className="text-gray-800 break-words">{purchase['Comments']}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Purchase Info */}
                    {(purchase['Date Purchased'] || purchase['Order Number']) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        {totalCost > 2000 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start">
                                <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-red-800">Cannot Approve</p>
                                    <p className="text-sm text-red-700">Requests over $2,000 cannot be approved through this system.</p>
                                </div>
                            </div>
                        )}

                        {/* No Permissions */}
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
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 mb-1">Student Approver</p>
                                    {purchase['S Approver'] ? (
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center">
                                                {isApproverValid(purchase['S Approver'], 'student', totalCost) ? (
                                                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                                ) : (
                                                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                                                )}
                                                <div>
                                                    <p className="font-semibold text-gray-800">{purchase['S Approver']}</p>
                                                    {!isApproverValid(purchase['S Approver'], 'student', totalCost) && (
                                                        <p className="text-xs text-red-600">Invalid approver for this amount</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {purchase['S Approver'] === user.name && !inDisallowedState(purchase) && (
                                                    <button
                                                        onClick={() => handleWithdrawApproval('student')}
                                                        disabled={approvalLoading}
                                                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                                                    >
                                                        {approvalLoading ? 'Withdrawing...' : 'Withdraw'}
                                                    </button>
                                                )}
                                                {canOverwriteApproval(purchase, 'student') && (
                                                    <button
                                                        onClick={() => handleApprove('student', true)}
                                                        disabled={approvalLoading}
                                                        className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                                                    >
                                                        {approvalLoading ? 'Overwriting...' : 'Overwrite'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic">Not yet approved</p>
                                    )}
                                </div>
                                {!purchase['S Approver'] && (() => {
                                    const approval = canApproveRequest(purchase, 'student');
                                    return approval.canApprove ? (
                                        <button
                                            onClick={() => handleApprove('student', false)}
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
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 mb-1">Mentor Approver</p>
                                    {purchase['M Approver'] ? (
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center">
                                                {isApproverValid(purchase['M Approver'], 'mentor', totalCost) ? (
                                                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                                ) : (
                                                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                                                )}
                                                <div>
                                                    <p className="font-semibold text-gray-800">{purchase['M Approver']}</p>
                                                    {!isApproverValid(purchase['M Approver'], 'mentor', totalCost) && (
                                                        <p className="text-xs text-red-600">Invalid approver for this amount</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {purchase['M Approver'] === user.name && !inDisallowedState(purchase) && (
                                                    <button
                                                        onClick={() => handleWithdrawApproval('mentor')}
                                                        disabled={approvalLoading}
                                                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                                                    >
                                                        {approvalLoading ? 'Withdrawing...' : 'Withdraw'}
                                                    </button>
                                                )}
                                                {canOverwriteApproval(purchase, 'mentor') && (
                                                    <button
                                                        onClick={() => handleApprove('mentor', true)}
                                                        disabled={approvalLoading}
                                                        className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                                                    >
                                                        {approvalLoading ? 'Overwriting...' : 'Overwrite'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic">Not yet approved</p>
                                    )}
                                </div>
                                {!purchase['M Approver'] && (() => {
                                    const approval = canApproveRequest(purchase, 'mentor');
                                    return approval.canApprove ? (
                                        <button
                                            onClick={() => handleApprove('mentor', false)}
                                            disabled={approvalLoading}
                                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                                        >
                                            {approvalLoading ? 'Approving...' : 'Approve as Mentor'}
                                        </button>
                                    ) : null;
                                })()}
                            </div>
                        </div>

                        {/* Edit Mode Buttons */}
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
    );
}
