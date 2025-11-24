import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button, Select } from '../ui';
import { filterClasses } from '../../styles/common-classes';
import { CATEGORIES, STATES } from '../../utils/purchaseHelpers';

export default function FilterPanel({
                                        selectedCategories,
                                        selectedStates,
                                        needsApprovalFilter,
                                        sortOption,
                                        activeFilterCount,
                                        onToggleCategory,
                                        onToggleState,
                                        onToggleNeedsApproval,
                                        onSortChange,
                                        onClearAll,
                                        canSeeNeedsApprovalFilter,
                                        approvalFilterLabel
                                    }) {
    const [expanded, setExpanded] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (expanded) {
            setIsAnimating(true);
        }
    }, [expanded]);

    const handleToggle = () => {
        if (expanded) {
            setIsAnimating(false);
            setTimeout(() => setExpanded(false), 300);
        } else {
            setExpanded(true);
        }
    };

    const FilterButton = ({ active, onClick, children, type = 'category' }) => {
        const typeClasses = type === 'category' ? filterClasses.category : filterClasses.state;

        return (
            <button
                onClick={onClick}
                className={`${filterClasses.button.base} ${
                    active
                        ? `${typeClasses.active} ${filterClasses.button.active}`
                        : `${filterClasses.button.inactive} ${typeClasses.hover}`
                }`}
            >
                {children}
            </button>
        );
    };

    return (
        <div className="border-b bg-gray-50">
            {/* Collapsible Header */}
            <button
                onClick={handleToggle}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-100 transition-all duration-200 md:hidden"
            >
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-800">Filters & Sort</span>
                    {activeFilterCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </div>
                {expanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
            </button>

            {/* Desktop: Always visible */}
            <div className="hidden md:block p-4 md:p-6">
                <FilterContent
                    selectedCategories={selectedCategories}
                    selectedStates={selectedStates}
                    needsApprovalFilter={needsApprovalFilter}
                    sortOption={sortOption}
                    activeFilterCount={activeFilterCount}
                    onToggleCategory={onToggleCategory}
                    onToggleState={onToggleState}
                    onToggleNeedsApproval={onToggleNeedsApproval}
                    onSortChange={onSortChange}
                    onClearAll={onClearAll}
                    canSeeNeedsApprovalFilter={canSeeNeedsApprovalFilter}
                    approvalFilterLabel={approvalFilterLabel}
                    FilterButton={FilterButton}
                />
            </div>

            {/* Mobile: Expandable Content */}
            {expanded && (
                <div
                    className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
                        isAnimating ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                    <div className="px-4 pb-4 space-y-4">
                        <FilterContent
                            selectedCategories={selectedCategories}
                            selectedStates={selectedStates}
                            needsApprovalFilter={needsApprovalFilter}
                            sortOption={sortOption}
                            activeFilterCount={activeFilterCount}
                            onToggleCategory={onToggleCategory}
                            onToggleState={onToggleState}
                            onToggleNeedsApproval={onToggleNeedsApproval}
                            onSortChange={onSortChange}
                            onClearAll={onClearAll}
                            canSeeNeedsApprovalFilter={canSeeNeedsApprovalFilter}
                            approvalFilterLabel={approvalFilterLabel}
                            FilterButton={FilterButton}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

// Extracted filter content for reuse
function FilterContent({
                           selectedCategories,
                           selectedStates,
                           needsApprovalFilter,
                           sortOption,
                           activeFilterCount,
                           onToggleCategory,
                           onToggleState,
                           onToggleNeedsApproval,
                           onSortChange,
                           onClearAll,
                           canSeeNeedsApprovalFilter,
                           approvalFilterLabel,
                           FilterButton
                       }) {
    return (
        <div className="space-y-4">
            {/* Sort Dropdown */}
            <Select
                label="Sort By"
                value={sortOption}
                onChange={(e) => onSortChange(e.target.value)}
                options={[
                    { value: 'newest', label: 'Newest First' },
                    { value: 'oldest', label: 'Oldest First' },
                    { value: 'name-asc', label: 'Name (A-Z)' },
                    { value: 'name-desc', label: 'Name (Z-A)' },
                ]}
            />

            {/* Category Filters */}
            <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Category</p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 hide-scrollbar">
                    {CATEGORIES.map(category => (
                        <FilterButton
                            key={category}
                            active={selectedCategories.includes(category)}
                            onClick={() => onToggleCategory(category)}
                            type="category"
                        >
                            {category}
                        </FilterButton>
                    ))}
                </div>
            </div>

            {/* State Filters */}
            <div>
                <p className="text-sm font-medium text-gray-700 mb-2">State</p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 hide-scrollbar">
                    {STATES.map(state => (
                        <FilterButton
                            key={state}
                            active={selectedStates.includes(state)}
                            onClick={() => onToggleState(state)}
                            type="state"
                        >
                            {state}
                        </FilterButton>
                    ))}
                </div>
            </div>

            {/* Needs Approval Filter */}
            {canSeeNeedsApprovalFilter && (
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Approval Status</p>
                    <button
                        onClick={onToggleNeedsApproval}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            needsApprovalFilter
                                ? 'bg-orange-600 text-white shadow-md'
                                : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-400'
                        }`}
                    >
                        {approvalFilterLabel}
                    </button>
                </div>
            )}

            {/* Clear All Button */}
            {activeFilterCount > 0 && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    icon={X}
                    fullWidth
                    className="text-blue-600 hover:text-blue-700"
                >
                    Clear All Filters
                </Button>
            )}
        </div>
    );
}