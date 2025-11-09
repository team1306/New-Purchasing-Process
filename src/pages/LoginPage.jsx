import { User } from 'lucide-react';
import { useEffect } from 'react';

export default function LoginPage() {
    useEffect(() => {
        // Render the sign-in button when component mounts
        if (window.google) {
            window.google.accounts.id.renderButton(
                document.getElementById('googleSignInButton'),
                {
                    theme: 'outline',
                    size: 'large',
                    width: 300,
                    text: 'continue_with',
                }
            );
        }
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
                    <p className="text-gray-600">Sign in to continue to your account</p>
                </div>

                <div className="flex justify-center mb-6">
                    <div id="googleSignInButton"></div>
                </div>
            </div>
        </div>
    );
}