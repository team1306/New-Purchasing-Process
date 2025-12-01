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
    getSavedSession,
    setTokenRefreshCallback
} from './utils/googleAuth';
import { setupGlobalErrorHandlers } from './utils/errorReporter';
import { slackUserCache } from './utils/slackUserCache';
import { Alert, Button } from './components/ui';

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [needsSpreadsheetSelection, setNeedsSpreadsheetSelection] = useState(false);
    const [tokenExpired, setTokenExpired] = useState(false);
    const [ignoreTokenExpiry, setIgnoreTokenExpiry] = useState(false);

    useEffect(() => {
        // Setup global error handlers
        setupGlobalErrorHandlers();

        const initializeApp = async () => {
            // Initialize Google Auth
            await new Promise(resolve => {
                initializeGoogleAuth(() => resolve());
            });

            // Set token refresh callback
            setTokenRefreshCallback((error) => {
                console.error('Token refresh failed:', error);
                setTokenExpired(true);
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

                        // Load Slack users in background
                        slackUserCache.loadUsers().catch(err => {
                            console.error('Failed to load Slack users:', err);
                        });
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
        setTokenExpired(false);
        setIgnoreTokenExpiry(false);

        // Check if spreadsheet is already selected
        if (!hasValidSpreadsheet()) {
            setNeedsSpreadsheetSelection(true);
        }

        // Load Slack users in background
        slackUserCache.loadUsers().catch(err => {
            console.error('Failed to load Slack users:', err);
        });
    };

    const handleSpreadsheetSelected = () => {
        setNeedsSpreadsheetSelection(false);
    };

    const handleSpreadsheetCancelled = () => {
        handleSignOut();
        setNeedsSpreadsheetSelection(false);
    };

    const handleSignOut = () => {
        clearTokens();
        slackUserCache.clearCache();
        setUser(null);
        setNeedsSpreadsheetSelection(false);
        setTokenExpired(false);
        setIgnoreTokenExpiry(false);
    };

    const handleRelogin = () => {
        handleSignOut();
    };

    const handleIgnoreExpiry = () => {
        setIgnoreTokenExpiry(true);
        setTokenExpired(false);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <AlertProvider>
            {/* Token Expiry Warning */}
            {tokenExpired && !ignoreTokenExpiry && user && (
                <div className="fixed top-0 left-0 right-0 z-[100] p-4 bg-red-600">
                    <div className="max-w-4xl mx-auto">
                        <Alert type="error" className="mb-0">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="flex-1">
                                    <p className="font-semibold text-white mb-1">Authentication Expired</p>
                                    <p className="text-sm text-red-100">
                                        Your session has expired. Please sign in again to continue making changes.
                                        You can still view data, but operations may fail.
                                    </p>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={handleIgnoreExpiry}
                                    >
                                        Ignore (risky)
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={handleRelogin}
                                    >
                                        Sign In Again
                                    </Button>
                                </div>
                            </div>
                        </Alert>
                    </div>
                </div>
            )}

            {!user ? (
                <LoginPage onSignIn={handleSignIn} />
            ) : needsSpreadsheetSelection ? (
                <SpreadsheetSelector
                    user={user}
                    onSelected={handleSpreadsheetSelected}
                    onCancel={handleSpreadsheetCancelled}
                    onSignOut={handleSignOut}
                />
            ) : (
                <Dashboard user={user} onSignOut={handleSignOut} />
            )}
        </AlertProvider>
    );
}