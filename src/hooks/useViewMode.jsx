import { useState, useEffect } from 'react';

/**
 * Hook for managing view mode (list vs groups)
 */
export const useViewMode = () => {
    const [viewMode, setViewMode] = useState(() => {
        const saved = localStorage.getItem('view_mode');
        return saved || 'list';
    });

    useEffect(() => {
        localStorage.setItem('view_mode', viewMode);
    }, [viewMode]);

    const handleToggleViewMode = () => {
        setViewMode(prev => prev === 'list' ? 'groups' : 'list');
    };

    return {
        viewMode,
        setViewMode,
        handleToggleViewMode,
    };
};