import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/DashboardPage';
import SpreadsheetSelector from './components/SpreadsheetSelector';
import LoadingSpinner from './components/LoadingSpinner';
import { AlertProvider } from './components/AlertContext';
import {
    initializeGoogleAuth,
    clearTokens,
    hasValidSpreadsheet,
    hasValidSession,
    getSavedSession
} from './utils/googleAuth';

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [needsSpreadsheetSelection, setNeedsSpreadsheetSelection] = useState(false);
    const [cancelled, setCancelled] = useState(false);

    useEffect(() => {
        const initializeApp = async () => {
            // Initialize Google Auth
            await new Promise(resolve => {
                initializeGoogleAuth(() => resolve());
            });

            // Check if we have a valid saved session
            if (hasValidSession()) {
                try {
                    const session = await getSavedSession();
                    if (session && session.user) {
                        setUser(session.user);

                        // Check if spreadsheet is selected
                        if (!hasValidSpreadsheet()) {
                            setNeedsSpreadsheetSelection(true);
                        }
                    }
                } catch (err) {
                    console.error('Failed to restore session:', err);
                    // Clear invalid session
                    clearTokens();
                }
            }

            setLoading(false);
        };

        initializeApp();
    }, []);

    const handleSignIn = (userData) => {
        setUser(userData);

        // Check if spreadsheet is already selected
        if (!hasValidSpreadsheet()) {
            setNeedsSpreadsheetSelection(true);
        }
    };

    const handleSpreadsheetSelected = () => {
        setNeedsSpreadsheetSelection(false);
        setCancelled(false);
    };

    const handleSpreadsheetCancelled = () => {
        setCancelled(true);
        setNeedsSpreadsheetSelection(false);
    };

    const handleSignOut = () => {
        clearTokens();
        setUser(null);
        setNeedsSpreadsheetSelection(false);
        setCancelled(false);
    };

    const handleRetrySelection = () => {
        setCancelled(false);
        setNeedsSpreadsheetSelection(true);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <AlertProvider>
            {!user ? (
                <LoginPage onSignIn={handleSignIn} />
            ) : needsSpreadsheetSelection ? (
                <SpreadsheetSelector
                    user={user}
                    onSelected={handleSpreadsheetSelected}
                    onCancel={handleSpreadsheetCancelled}
                    onSignOut={handleSignOut}
                />
            ) : cancelled ? (
                <CancelledScreen
                    user={user}
                    onRetry={handleRetrySelection}
                    onSignOut={handleSignOut}
                />
            ) : (
                <Dashboard user={user} onSignOut={handleSignOut} />
            )}
        </AlertProvider>
    );
}