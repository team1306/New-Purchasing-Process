
import { useState, useEffect } from 'react';

export const useFilters = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState(() => {
        const saved = localStorage.getItem('filter_categories');
        try {
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [selectedStates, setSelectedStates] = useState(() => {
        const saved = localStorage.getItem('filter_states');
        try {
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [needsApprovalFilter, setNeedsApprovalFilter] = useState(() => {
        const saved = localStorage.getItem('filter_needs_approval');
        return saved === 'true';
    });
    const [sortOption, setSortOption] = useState(() => {
        const saved = localStorage.getItem('sort_option');
        return saved || 'newest';
    });

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('filter_categories', JSON.stringify(selectedCategories));
    }, [selectedCategories]);

    useEffect(() => {
        localStorage.setItem('filter_states', JSON.stringify(selectedStates));
    }, [selectedStates]);

    useEffect(() => {
        localStorage.setItem('filter_needs_approval', needsApprovalFilter.toString());
    }, [needsApprovalFilter]);

    useEffect(() => {
        localStorage.setItem('sort_option', sortOption);
    }, [sortOption]);

    const toggleCategory = (category) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const toggleState = (state) => {
        setSelectedStates(prev =>
            prev.includes(state)
                ? prev.filter(s => s !== state)
                : [...prev, state]
        );
    };

    const clearAllFilters = () => {
        setSelectedCategories([]);
        setSelectedStates([]);
        setSearchQuery('');
        setNeedsApprovalFilter(false);
        setSortOption('newest');
    };

    const activeFilterCount = selectedCategories.length +
        selectedStates.length +
        (needsApprovalFilter ? 1 : 0);

    return {
        searchQuery,
        setSearchQuery,
        selectedCategories,
        selectedStates,
        needsApprovalFilter,
        setNeedsApprovalFilter,
        sortOption,
        setSortOption,
        toggleCategory,
        toggleState,
        clearAllFilters,
        activeFilterCount
    };
};