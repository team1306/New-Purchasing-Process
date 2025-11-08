import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import GoogleSignInButton from '../components/GoogleSignInButton';

export default function LoginPage() {
    const { error } = useAuth();

    useEffect(() => {
        // Trigger Google button render when component mounts
        const timer = setTimeout(() => {
            if (window.google?.accounts?.id) {
                window.google.accounts.id.renderButton(
                    document.getElementById('google-signin-button'),
                    {
                        theme: 'outline',
                        size: 'large',
                        width: '100%',
                    }
                );
            }
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome</h1>
                <p className="text-gray-600 mb-8">Sign in with your Google account</p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <GoogleSignInButton />
            </div>
        </div>
    );
}