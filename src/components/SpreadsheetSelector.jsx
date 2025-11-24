import { useState } from 'react';
import { FileSpreadsheet, LogOut, X } from 'lucide-react';
import { Button, IconButton, Alert, Card } from './ui';
import { containerClasses } from '../styles/common-classes';
import { animations } from '../styles/design-tokens';
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
        <div className={`${containerClasses.page} flex items-center justify-center p-4`}>
            <Card className={`max-w-md w-full transition-all duration-300 ${
                isClosing ? 'opacity-0 scale-95' : `opacity-100 scale-100 ${animations.fadeIn}`
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
                    <IconButton
                        icon={LogOut}
                        variant="ghost"
                        onClick={onSignOut}
                        title="Sign out"
                        className="text-gray-400 hover:text-gray-600"
                    />
                </div>

                <div className="p-6 md:p-8">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <FileSpreadsheet className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                            Select Purchase Sheet
                        </h1>
                        <p className="text-sm md:text-base text-gray-600">
                            Please select the purchasing spreadsheet from your Google Drive to continue.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <Alert type="error" title="Error" className={`mb-6 ${animations.slideDown}`}>
                            {error}
                        </Alert>
                    )}

                    {/* Instructions */}
                    <Alert type="info" className="mb-6">
                        <p className="font-medium mb-2">Instructions:</p>
                        <ol className="space-y-1 list-decimal list-inside text-sm">
                            <li>Click the button below to open the file picker</li>
                            <li>Select the correct purchasing spreadsheet</li>
                            <li>The system will verify the spreadsheet is valid</li>
                        </ol>
                    </Alert>

                    {/* Select Button */}
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleSelectSpreadsheet}
                        loading={loading || validating}
                        disabled={loading || validating}
                        fullWidth
                        icon={FileSpreadsheet}
                    >
                        {loading ? 'Opening picker...' : validating ? 'Validating...' : 'Select Spreadsheet'}
                    </Button>

                    {/* Cancel Button */}
                    <Button
                        variant="secondary"
                        onClick={handleCancel}
                        disabled={loading || validating}
                        fullWidth
                        className="mt-3"
                        icon={X}
                    >
                        Cancel
                    </Button>
                </div>
            </Card>
        </div>
    );
}