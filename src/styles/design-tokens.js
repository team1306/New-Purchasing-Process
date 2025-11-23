// Design Tokens - Central source of truth for all styling values

// Colors
export const colors = {
    // Primary palette
    primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
    },

    // Brand gradient colors
    brand: {
        red: '#b91c1c', // red-700
        orange: '#c2410c', // orange-700
    },

    // Semantic colors
    success: {
        light: '#dcfce7',
        DEFAULT: '#16a34a',
        dark: '#15803d',
    },
    error: {
        light: '#fee2e2',
        DEFAULT: '#dc2626',
        dark: '#b91c1c',
    },
    warning: {
        light: '#fef3c7',
        DEFAULT: '#f59e0b',
        dark: '#d97706',
    },
    info: {
        light: '#dbeafe',
        DEFAULT: '#3b82f6',
        dark: '#2563eb',
    },

    // Neutral grays
    gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
    },
};

// State-specific colors
export const stateColors = {
    'Pending Approval': {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
    },
    'Approved': {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200',
    },
    'Received': {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
    },
    'Purchased': {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        border: 'border-purple-200',
    },
    'On Hold': {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200',
    },
    'Completed': {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
    },
};

// Spacing
export const spacing = {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    '2xl': '2rem',    // 32px
    '3xl': '3rem',    // 48px
};

// Border radius
export const radius = {
    none: '0',
    sm: '0.25rem',
    DEFAULT: '0.5rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
};

// Shadows
export const shadows = {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    none: 'none',
};

// Transitions
export const transitions = {
    fast: '150ms',
    DEFAULT: '200ms',
    slow: '300ms',
    slowest: '500ms',
};

// Breakpoints (for reference, still use Tailwind's responsive utilities)
export const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
};

// Z-index layers
export const zIndex = {
    dropdown: 10,
    sticky: 20,
    overlay: 40,
    modal: 50,
    toast: 60,
};