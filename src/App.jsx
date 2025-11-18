import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/DashboardPage';
import SpreadsheetSelector from './components/SpreadsheetSelector';
import LoadingSpinner from './components/LoadingSpinner';
import {
    initializeGoogleAuth,
    clearTokens,
    hasValidSpreadsheet,
    hasValidSession,
    getSavedSession
} from './utils/googleAuth';

function App() {
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

    if (!user) {
        return <LoginPage onSignIn={handleSignIn} />;
    }

    if (needsSpreadsheetSelection) {
        return (
            <SpreadsheetSelector
                user={user}
                onSelected={handleSpreadsheetSelected}
                onCancel={handleSpreadsheetCancelled}
                onSignOut={handleSignOut}
            />
        );
    }

    if (cancelled) {
        return (
            <CancelledScreen
                user={user}
                onRetry={handleRetrySelection}
                onSignOut={handleSignOut}
            />
        );
    }

    return <Dashboard user={user} onSignOut={handleSignOut} />;
}

function CancelledScreen({ user, onRetry, onSignOut }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <img
                            src={user.picture}
                            alt="Profile"
                            className="w-12 h-12 rounded-full border-2 border-blue-600"
                            referrerPolicy="no-referrer"
                        />
                        <div>
                            <p className="font-semibold text-gray-800">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Selection Cancelled</h1>
                    <p className="text-gray-600">
                        You need to select the purchasing spreadsheet to continue using the application.
                    </p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={onRetry}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                    >
                        Select Spreadsheet
                    </button>
                    <button
                        onClick={onSignOut}
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-lg transition duration-200"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;