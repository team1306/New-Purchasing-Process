import { Loader } from 'lucide-react';

export default function EditActionsFooter({ savingLoading, onCancel, onSave }) {
    return (
        <div className="sticky bottom-0 border-t bg-white p-4 md:p-6 shadow-lg z-20">
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                    onClick={onCancel}
                    className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition duration-200 transform active:scale-95"
                >
                    Cancel
                </button>
                <button
                    onClick={onSave}
                    disabled={savingLoading}
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform active:scale-95 flex items-center justify-center"
                >
                    {savingLoading ? (
                        <>
                            <Loader className="animate-spin w-5 h-5 mr-2" />
                            Saving...
                        </>
                    ) : (
                        'Save Changes'
                    )}
                </button>
            </div>
        </div>
    );
}