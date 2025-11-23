import { Button } from '../ui/index.js';

export default function EditActionsFooter({ savingLoading, onCancel, onSave }) {
    return (
        <div className="sticky bottom-0 border-t bg-white p-4 md:p-6 shadow-lg z-20">
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button
                    variant="secondary"
                    onClick={onCancel}
                    fullWidth
                    className="sm:w-auto"
                >
                    Cancel
                </Button>
                <Button
                    variant="success"
                    onClick={onSave}
                    loading={savingLoading}
                    disabled={savingLoading}
                    fullWidth
                    className="sm:w-auto"
                >
                    Save Changes
                </Button>
            </div>
        </div>
    );
}