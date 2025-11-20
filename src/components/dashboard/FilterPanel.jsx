import { Filter, X } from 'lucide-react';
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
    return (
        <div className="p-4 md:p-6 border-b bg-gray-50">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">

                {/* Left Section */}
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-800 text-sm md:text-base">Filters & Sorting</h3>

                    {activeFilterCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </div>

                {/* Right Section */}
                <div className="flex flex-wrap items-center gap-3 justify-between">
                    <select
                        value={sortOption}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 w-full sm:w-auto"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                    </select>

                    {activeFilterCount > 0 && (
                        <button
                            onClick={onClearAll}
                            className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                        >
                            <X className="w-4 h-4" />
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Category Filters */}
            <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Category</p>

                {/* Mobile → horizontal scroll; Desktop → wrap */}
                <div className="flex gap-2 overflow-x-auto md:flex-wrap pb-2">
                    {CATEGORIES.map(category => (
                        <button
                            key={category}
                            onClick={() => onToggleCategory(category)}
                            className={`whitespace-nowrap px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition duration-200 ${
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
            <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">State</p>

                <div className="flex gap-2 overflow-x-auto md:flex-wrap pb-2">
                    {STATES.map(state => (
                        <button
                            key={state}
                            onClick={() => onToggleState(state)}
                            className={`whitespace-nowrap px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition duration-200 ${
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
                        className={`px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition duration-200 ${
                            needsApprovalFilter
                                ? 'bg-orange-600 text-white shadow-md'
                                : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-400'
                        }`}
                    >
                        {approvalFilterLabel}
                    </button>
                </div>
            )}
        </div>
    );
}
