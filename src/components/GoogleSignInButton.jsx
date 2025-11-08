import { useAuth } from '../hooks/useAuth';

export default function GoogleSignInButton() {
    const { error } = useAuth();

    return (
        <>
            {error && !error.includes('Please add') ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            ) : null}

            {error && error.includes('Please add') ? (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                    <p className="font-medium mb-2">Setup Required</p>
                    <p className="text-sm">Add your Google OAuth 2.0 Client ID to enable Google Sign-In.</p>
                </div>
            ) : (
                <div id="google-signin-button" className="flex justify-center"></div>
            )}
        </>
    );
}