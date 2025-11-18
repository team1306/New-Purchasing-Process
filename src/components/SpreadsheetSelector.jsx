import { useState } from 'react';
import { FileSpreadsheet, AlertCircle, LogOut, X } from 'lucide-react';
import { showDrivePicker } from '../utils/googleAuth';

export default function SpreadsheetSelector({ user, onSelected, onCancel, onSignOut }) {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(false);

    const handleSelectSpreadsheet = async () => {
        try {
            setLoading(true);
            setError(null);

            await showDrivePicker();

            // Show validating state
            setLoading(false);
            setValidating(true);

            // Validation happens inside showDrivePicker, but we show the state here
            // If we get here, the spreadsheet was successfully selected and validated
            onSelected();
        } catch (err) {
            console.error('Error selecting spreadsheet:', err);

            // Check if user cancelled the picker
            if (err.message === 'Picker cancelled') {
                onCancel();
            } else {
                setError(err.message || 'Failed to select spreadsheet. Please try again.');
            }
        } finally {
            setLoading(false);
            setValidating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                {/* Header */}
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
                    <button
                        onClick={onSignOut}
                        className="text-gray-400 hover:text-gray-600 transition"
                        title="Sign out"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileSpreadsheet className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Select Purchase Sheet</h1>
                    <p className="text-gray-600">
                        Please select the purchasing spreadsheet from your Google Drive to continue.
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-red-800">Error</p>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {/* Instructions */}
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 font-medium mb-2">Instructions:</p>
                    <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                        <li>Click the button below to open the file picker</li>
                        <li>Select the correct purchasing spreadsheet</li>
                        <li>The system will verify the spreadsheet is valid</li>
                    </ol>
                </div>

                {/* Select Button */}
                <button
                    onClick={handleSelectSpreadsheet}
                    disabled={loading || validating}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Opening picker...
                        </>
                    ) : validating ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Validating spreadsheet...
                        </>
                    ) : (
                        <>
                            <FileSpreadsheet className="w-5 h-5 mr-2" />
                            Select Spreadsheet
                        </>
                    )}
                </button>

                {/* Cancel Button */}
                <button
                    onClick={onCancel}
                    disabled={loading || validating}
                    className="w-full mt-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-semibold py-2 px-6 rounded-lg transition duration-200 flex items-center justify-center"
                >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                </button>
            </div>
        </div>
    );
}