// Design Tokens - Central source of truth for all styling values

// Colors
export const colors = {
    // Brand colors (red-to-orange theme)
    brand: {
        red: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#ef4444',
            600: '#dc2626',
            700: '#b91c1c',
            800: '#991b1b',
            900: '#7f1d1d',
        },
        orange: {
            50: '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#f97316',
            600: '#ea580c',
            700: '#c2410c',
            800: '#9a3412',
            900: '#7c2d12',
        },
    },

    // Primary palette (blue for interactive elements)
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

    // Semantic colors
    success: {
        50: '#dcfce7',
        100: '#bbf7d0',
        200: '#86efac',
        300: '#4ade80',
        400: '#22c55e',
        500: '#16a34a',
        600: '#15803d',
        700: '#166534',
        800: '#14532d',
        900: '#052e16',
    },
    error: {
        50: '#fee2e2',
        100: '#fecaca',
        200: '#fca5a5',
        300: '#f87171',
        400: '#ef4444',
        500: '#dc2626',
        600: '#b91c1c',
        700: '#991b1b',
        800: '#7f1d1d',
        900: '#450a0a',
    },
    warning: {
        50: '#fef3c7',
        100: '#fef08a',
        200: '#fde047',
        300: '#facc15',
        400: '#eab308',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#713f12',
    },
    info: {
        50: '#dbeafe',
        100: '#bfdbfe',
        200: '#93c5fd',
        300: '#60a5fa',
        400: '#3b82f6',
        500: '#2563eb',
        600: '#1d4ed8',
        700: '#1e40af',
        800: '#1e3a8a',
        900: '#1e3a8a',
    },
    purple: {
        50: '#faf5ff',
        100: '#f3e8ff',
        200: '#e9d5ff',
        300: '#d8b4fe',
        400: '#c084fc',
        500: '#a855f7',
        600: '#9333ea',
        700: '#7e22ce',
        800: '#6b21a8',
        900: '#581c87',
    },
    indigo: {
        50: '#eef2ff',
        100: '#e0e7ff',
        200: '#c7d2fe',
        300: '#a5b4fc',
        400: '#818cf8',
        500: '#6366f1',
        600: '#4f46e5',
        700: '#4338ca',
        800: '#3730a3',
        900: '#312e81',
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

// State-specific colors (consolidated - single source of truth)
export const stateColors = {
    'Pending Approval': {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        hover: 'hover:bg-yellow-200',
    },
    'Approved': {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200',
        hover: 'hover:bg-blue-200',
    },
    'Received': {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        hover: 'hover:bg-green-200',
    },
    'Purchased': {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        border: 'border-purple-200',
        hover: 'hover:bg-purple-200',
    },
    'On Hold': {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200',
        hover: 'hover:bg-gray-200',
    },
    'Completed': {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        hover: 'hover:bg-green-200',
    },
};

// Spacing (using Tailwind scale)
export const spacing = {
    xs: '0.25rem',    // 4px - space-1
    sm: '0.5rem',     // 8px - space-2
    md: '0.75rem',    // 12px - space-3
    lg: '1rem',       // 16px - space-4
    xl: '1.5rem',     // 24px - space-6
    '2xl': '2rem',    // 32px - space-8
    '3xl': '3rem',    // 48px - space-12
};

// Border radius
export const radius = {
    none: '0',
    sm: '0.25rem',      // rounded-sm
    DEFAULT: '0.5rem',  // rounded-md
    md: '0.5rem',       // rounded-md
    lg: '0.75rem',      // rounded-lg
    xl: '1rem',         // rounded-xl
    '2xl': '1.5rem',    // rounded-2xl
    full: '9999px',     // rounded-full
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
    base: 0,
    dropdown: 10,
    sticky: 20,
    overlay: 40,
    modal: 50,
    toast: 60,
};

// Animation classes (matching index.css)
export const animations = {
    fadeIn: 'animate-fadeIn',
    fadeOut: 'animate-fadeOut',
    slideUp: 'animate-slideUp',
    slideDown: 'animate-slideDown',
    slideInFromBottom: 'animate-slideInFromBottom',
    scaleIn: 'animate-scaleIn',
};