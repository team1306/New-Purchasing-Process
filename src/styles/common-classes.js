// Common reusable class combinations

export const cardClasses = {
    base: 'bg-white rounded-lg shadow-md overflow-hidden',
    hover: 'hover:bg-gray-50 transition-all duration-200',
    bordered: 'border border-gray-200',
};

export const inputClasses = {
    base: 'w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200',
    error: 'border-red-500 focus:ring-red-500',
    disabled: 'bg-gray-100 cursor-not-allowed opacity-60',
};

export const buttonClasses = {
    base: 'font-semibold rounded-lg transition-all duration-200 transform active:scale-95 flex items-center justify-center',
    sizes: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    },
    variants: {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
        success: 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl',
        danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl',
        warning: 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl',
        ghost: 'bg-white/20 hover:bg-white/30 text-white',
        // New official variants
        purple: 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl',
        indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl',
    },
    disabled: 'bg-gray-400 cursor-not-allowed opacity-60 hover:shadow-none active:scale-100',
};

export const badgeClasses = {
    base: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
};

export const iconClasses = {
    sizes: {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-8 h-8',
    },
};

export const containerClasses = {
    page: 'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100',
    content: 'max-w-7xl mx-auto',
    card: 'bg-white md:rounded-2xl shadow-2xl overflow-hidden',
};

export const headerClasses = {
    // Brand gradient theme (red-to-orange)
    gradient: 'bg-gradient-to-r from-red-700 to-orange-800 text-white',
    section: 'text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4',
};

export const textClasses = {
    label: 'block text-sm font-semibold text-gray-700 mb-2',
    helper: 'text-xs text-gray-500 mt-1',
    error: 'text-xs text-red-600 mt-1',
    muted: 'text-gray-500',
};

// Mobile menu classes for consistency
export const mobileMenuClasses = {
    container: 'absolute right-0 top-full mt-2 overflow-hidden transition-all duration-300 ease-in-out bg-white rounded-lg shadow-lg border border-white/20 z-50 min-w-[200px]',
    content: 'px-4 py-4 space-y-2',
    expanded: 'max-h-[600px] opacity-100',
    collapsed: 'max-h-0 opacity-0',
};

// Filter panel classes
export const filterClasses = {
    button: {
        base: 'whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
        active: 'shadow-md',
        inactive: 'bg-white text-gray-700 border border-gray-300',
    },
    category: {
        active: 'bg-blue-600 text-white',
        hover: 'hover:border-blue-400',
    },
    state: {
        active: 'bg-indigo-600 text-white',
        hover: 'hover:border-indigo-400',
    },
};

// Info box variants
export const infoBoxClasses = {
    variants: {
        default: 'bg-gray-50',
        primary: 'bg-blue-50 border border-blue-200',
        success: 'bg-green-50 border border-green-200',
        warning: 'bg-orange-50 border border-orange-200',
        info: 'bg-indigo-50 border border-indigo-200',
    },
};