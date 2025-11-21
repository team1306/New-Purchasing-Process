import { useState } from 'react';
import { FileSpreadsheet, AlertCircle, LogOut, X } from 'lucide-react';
import { showDrivePicker } from '../utils/googleAuth';

export default function SpreadsheetSelector({ user, onSelected, onCancel, onSignOut }) {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const handleCancel = () => {
        setIsClosing(true);
        setTimeout(() => onCancel(), 300);
    };

    const handleSelectSpreadsheet = async () => {
        try {
            setLoading(true);
            setError(null);

            await showDrivePicker();

            setLoading(false);
            setValidating(true);

            onSelected();
        } catch (err) {
            console.error('Error selecting spreadsheet:', err);

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
            <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-md transition-all duration-300 ${
                isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100 animate-fadeIn'
            }`}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img
                            src={user.picture}
                            alt="Profile"
                            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-blue-600 flex-shrink-0"
                            referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                            <p className="text-sm text-gray-600 truncate">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={onSignOut}
                        className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
                        title="Sign out"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 md:p-8">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <FileSpreadsheet className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Select Purchase Sheet</h1>
                        <p className="text-sm md:text-base text-gray-600">
                            Please select the purchasing spreadsheet from your Google Drive to continue.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start animate-slideDown">
                            <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-red-800 text-sm">Error</p>
                                <p className="text-sm text-red-700 break-words">{error}</p>
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
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center shadow-lg transform active:scale-95"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Opening picker...
                            </>
                        ) : validating ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Validating...
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
                        onClick={handleCancel}
                        disabled={loading || validating}
                        className="w-full mt-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-semibold py-2 px-6 rounded-lg transition duration-200 flex items-center justify-center transform active:scale-95"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}