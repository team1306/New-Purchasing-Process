const GOOGLE_CLIENT_ID = '162846716753-jk3v37co0poisgp6okpufqe12r1c56c5.apps.googleusercontent.com';

export const initializeGoogleSignIn = (callback, onComplete) => {
    // Wait for Google script to load
    const checkGoogleLoaded = setInterval(() => {
        if (window.google) {
            clearInterval(checkGoogleLoaded);

            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: callback,
                auto_select: true,
            });

            // Try to prompt automatic sign-in
            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    console.log('Auto sign-in not available');
                }
                if (onComplete) onComplete();
            });
        }
    }, 100);
};

export const parseJwt = (token) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );
    return JSON.parse(jsonPayload);
};