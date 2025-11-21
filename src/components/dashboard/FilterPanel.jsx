import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';
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
            setTimeout(() => setExpanded(false), 300); // Match animation duration
        } else {
            setExpanded(true);
        }
    };

    return (
        <div className="border-b bg-gray-50">
            {/* Mobile: Collapsible Header */}
            <button
                onClick={handleToggle}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-100 transition"
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

            {/* Mobile: Expandable Content */}
            {expanded && (
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isAnimating ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                    <div className="px-4 pb-4 space-y-4">
                        {/* Sort Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sort By
                            </label>
                            <select
                                value={sortOption}
                                onChange={(e) => onSortChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="name-asc">Name (A-Z)</option>
                                <option value="name-desc">Name (Z-A)</option>
                            </select>
                        </div>

                        {/* Category Filters */}
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Category</p>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                                {CATEGORIES.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => onToggleCategory(category)}
                                        className={`whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                                            selectedCategories.includes(category)
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400'
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* State Filters */}
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">State</p>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                                {STATES.map(state => (
                                    <button
                                        key={state}
                                        onClick={() => onToggleState(state)}
                                        className={`whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                                            selectedStates.includes(state)
                                                ? 'bg-indigo-600 text-white shadow-md'
                                                : 'bg-white text-gray-700 border border-gray-300 hover:border-indigo-400'
                                        }`}
                                    >
                                        {state}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Needs Approval Filter */}
                        {canSeeNeedsApprovalFilter && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Approval Status</p>
                                <button
                                    onClick={onToggleNeedsApproval}
                                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition duration-200 ${
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
                            <button
                                onClick={onClearAll}
                                className="w-full text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center justify-center gap-1 py-2"
                            >
                                <X className="w-4 h-4" />
                                Clear All Filters
                            </button>
                        )}
                    </div>
                </div>)}
        </div>
    );
}