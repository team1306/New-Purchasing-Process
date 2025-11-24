
export const applyFiltersAndSort = (
    purchases,
    {
        searchQuery,
        selectedCategories,
        selectedStates,
        needsApprovalFilter,
        sortOption,
        filterGroups,
        validation,
        userName
    }
) => {
    let filtered = [...purchases];

    // Filter by search query
    if (searchQuery.trim() !== '' && !filterGroups) {
        filtered = filtered.filter(purchase =>
            purchase['Item Description']?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    else if (searchQuery.trim() !== '' && filterGroups) {
        filtered = filtered.filter(purchase =>
            purchase['Item Description']?.toLowerCase().includes(searchQuery.toLowerCase()) || purchase['Group Name'].toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
        filtered = filtered.filter(purchase =>
            selectedCategories.includes(purchase['Category'])
        );
    }

    // Filter by states
    if (selectedStates.length > 0) {
        filtered = filtered.filter(purchase =>
            selectedStates.includes(purchase['State'])
        );
    }

    // Filter by needs approval
    if (needsApprovalFilter) {
        const isMentorOrDirector = validation['Mentors']?.includes(userName) ||
            validation['Directors']?.includes(userName);
        const isPresidentOrLeadership = validation['Presidents']?.includes(userName) ||
            validation['Leadership']?.includes(userName);

        if (isMentorOrDirector) {
            filtered = filtered.filter(purchase =>
                !purchase['M Approver'] || purchase['M Approver'].trim() === ''
            );
        } else if (isPresidentOrLeadership) {
            filtered = filtered.filter(purchase =>
                !purchase['S Approver'] || purchase['S Approver'].trim() === ''
            );
        }
    }

    // Apply sorting
    filtered.sort((a, b) => {
        switch (sortOption) {
            case 'newest':
                return new Date(b['Date Requested']) - new Date(a['Date Requested']);
            case 'oldest':
                return new Date(a['Date Requested']) - new Date(b['Date Requested']);
            case 'name-asc':
                return (a['Item Description'] || '').localeCompare(b['Item Description'] || '');
            case 'name-desc':
                return (b['Item Description'] || '').localeCompare(a['Item Description'] || '');
            default:
                return new Date(b['Date Requested']) - new Date(a['Date Requested']);
        }
    });

    return filtered;
};