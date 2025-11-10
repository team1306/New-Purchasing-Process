import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/DashboardPage';
import LoadingSpinner from './components/LoadingSpinner';
import { initializeGoogleSignIn, parseJwt, requestSheetsAccess, clearTokens } from './utils/googleAuth';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleCredentialResponse = async (response) => {
            const userObject = parseJwt(response.credential);
            setUser({
                name: userObject.name,
                email: userObject.email,
                picture: userObject.picture,
            });

            // Request Sheets API access after sign-in
            try {
                await requestSheetsAccess();
            } catch (err) {
                console.error('Failed to get Sheets access:', err);
            }
        };

        initializeGoogleSignIn(handleCredentialResponse, () => setLoading(false));
    }, []);

    const handleSignOut = () => {
        window.google.accounts.id.disableAutoSelect();
        clearTokens();
        setUser(null);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return <LoginPage />;
    }

    return <Dashboard user={user} onSignOut={handleSignOut} />;
}

export default App;