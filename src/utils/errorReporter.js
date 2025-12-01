// src/utils/errorReporter.js
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Report errors to the backend
 */
export const reportError = async (error, context = {}) => {
    try {
        const errorReport = {
            error: {
                message: error.message || String(error),
                stack: error.stack,
                name: error.name,
            },
            context,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            url: window.location.href,
        };

        // Don't await - fire and forget
        fetch(`${BACKEND_URL}/api/errorReport`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(errorReport),
        }).catch(err => {
            console.error('Failed to report error to backend:', err);
        });
    } catch (reportErr) {
        console.error('Error in error reporter:', reportErr);
    }
};

/**
 * Wrap async functions with error reporting
 */
export const withErrorReporting = (fn, context = {}) => {
    return async (...args) => {
        try {
            return await fn(...args);
        } catch (error) {
            console.error('Error caught by withErrorReporting:', error);
            await reportError(error, {
                ...context,
                functionName: fn.name,
                arguments: args.map(arg => {
                    try {
                        return JSON.stringify(arg);
                    } catch {
                        return String(arg);
                    }
                }),
            });
            throw error;
        }
    };
};

/**
 * Setup global error handlers
 */
export const setupGlobalErrorHandlers = () => {
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        reportError(event.reason || new Error('Unhandled promise rejection'), {
            type: 'unhandledrejection',
            promise: event.promise,
        });
    });

    // Global errors
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        reportError(event.error || new Error(event.message), {
            type: 'error',
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
        });
    });
};