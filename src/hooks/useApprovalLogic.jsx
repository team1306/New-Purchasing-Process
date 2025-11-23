import { calculateTotalCost } from '../utils/purchaseHelpers';

export const useApprovalLogic = (user, validation) => {
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

    return {
        getUserApprovalPermissions,
        canApproveRequest,
        canOverwriteApproval,
        isApproverValid,
        inDisallowedState,
        canDeletePurchase,
        canEditPurchase
    };
};