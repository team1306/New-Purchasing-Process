// Common reusable class combinations

export const cardClasses = {
    base: 'bg-white rounded-lg shadow-md overflow-hidden',
    hover: 'hover:bg-gray-50 transition duration-150',
    bordered: 'border border-gray-200',
};

export const inputClasses = {
    base: 'w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition',
    error: 'border-red-500 focus:ring-red-500',
    disabled: 'bg-gray-100 cursor-not-allowed opacity-60',
};

export const buttonClasses = {
    base: 'font-semibold rounded-lg transition duration-200 transform active:scale-95 flex items-center justify-center',
    sizes: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    },
    variants: {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
        success: 'bg-green-600 hover:bg-green-700 text-white shadow-lg',
        danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg',
        warning: 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg',
        ghost: 'bg-white/20 hover:bg-white/30 text-white',
    },
    disabled: 'bg-gray-400 cursor-not-allowed opacity-60',
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
    gradient: 'bg-gradient-to-r from-red-700 to-orange-800 text-white',
    section: 'text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4',
};

export const textClasses = {
    label: 'block text-sm font-semibold text-gray-700 mb-2',
    helper: 'text-xs text-gray-500 mt-1',
    error: 'text-xs text-red-600 mt-1',
    muted: 'text-gray-500',
};