
import { useState, useEffect } from 'react';
import { fetchValidation } from '../utils/googleSheets';
import { getRefreshedAccessToken } from '../utils/googleAuth';

export const useValidation = () => {
    const [validation, setValidation] = useState({});
    const [loading, setLoading] = useState(true);

    const loadValidation = async () => {
        try {
            setLoading(true);
            const token = await getRefreshedAccessToken();
            const data = await fetchValidation(token);
            setValidation(data);
        } catch (err) {
            console.error('Error loading validation:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadValidation();
    }, []);

    const canSeeNeedsApprovalFilter = (userName) => {
        return validation['Mentors']?.includes(userName) ||
            validation['Directors']?.includes(userName) ||
            validation['Presidents']?.includes(userName) ||
            validation['Leadership']?.includes(userName);
    };

    const getApprovalFilterLabel = (userName) => {
        const isMentorOrDirector = validation['Mentors']?.includes(userName) ||
            validation['Directors']?.includes(userName);
        return isMentorOrDirector ? 'Needs Mentor Approval' : 'Needs Student Approval';
    };

    return {
        validation,
        loading,
        loadValidation,
        canSeeNeedsApprovalFilter,
        getApprovalFilterLabel
    };
};
