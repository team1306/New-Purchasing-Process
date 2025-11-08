import { useState, useEffect } from 'react';

const GOOGLE_CLIENT_ID = '';

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = () => {
        // Check for saved session
        const savedUser = window.localStorage?.getItem('user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error('Failed to restore session:', e);
            }
        }

        // Load Google Sign-In script
        if (!GOOGLE_CLIENT_ID) {
            setError('Please add your Google Client ID to the code');
            setLoading(false);
            return;
        }

        loadGoogleScript();
    };

    const loadGoogleScript = () => {
        if (window.google) {
            initializeGoogle();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogle;
        script.onerror = () => {
            setError('Failed to load Google Sign-In library');
            setLoading(false);
        };
        document.head.appendChild(script);
    };

    const initializeGoogle = () => {
        if (!window.google) {
            setError('Google library failed to load');
            setLoading(false);
            return;
        }

        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
        });

        setLoading(false);
    };

    const handleCredentialResponse = (response) => {
        try {
            const base64Url = response.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );

            const userData = JSON.parse(jsonPayload);
            const user = {
                name: userData.name,
                email: userData.email,
                picture: userData.picture,
                token: response.credential,
            };

            setUser(user);
            setError('');
            try {
                window.localStorage?.setItem('user', JSON.stringify(user));
            } catch (e) {
                console.error('Failed to save session:', e);
            }
        } catch (err) {
            console.error('Failed to process token:', err);
            setError('Authentication failed');
        }
    };

    const handleLogout = () => {
        setUser(null);
        setError('');
        try {
            window.localStorage?.removeItem('user');
        } catch (e) {
            console.error('Failed to clear session:', e);
        }

        if (window.google) {
            window.google.accounts.id.revoke('', () => {
                console.log('Signed out from Google');
            });
        }
    };

    return { user, loading, error, handleLogout };
}