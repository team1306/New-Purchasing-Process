import { X, Pencil, Trash2, Loader, XCircle } from 'lucide-react';
import StateBadge from './StateBadge';

export default function ModalHeader({
                                        purchase,
                                        isEditing,
                                        savingLoading,
                                        canDelete,
                                        canEdit,
                                        onClose,
                                        onDelete,
                                        onToggleEdit,
                                        onCancelEdit
                                    }) {
    return (
        <div className="sticky top-0 z-30 bg-gradient-to-r from-red-700 to-orange-800 text-white shadow-lg">
            {/* Drag Handle (Mobile Only) */}
            <div className="md:hidden flex justify-center pt-2 pb-1">
                <div className="w-12 h-1 bg-white/60 rounded-full"></div>
            </div>

            <div className="p-4 md:p-6">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg md:text-2xl font-bold mb-1 truncate">
                            {purchase['Item Description']}
                        </h2>
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-blue-100 text-xs md:text-sm">
                                ID: {purchase['Request ID']}
                            </p>
                            {purchase['State'] && <StateBadge state={purchase['State']} />}
                        </div>
                    </div>

                    <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                        {canDelete && (
                            <button
                                onClick={onDelete}
                                className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition disabled:opacity-50 transform active:scale-90"
                                disabled={savingLoading}
                                title="Delete purchase"
                            >
                                {savingLoading ? (
                                    <Loader className="animate-spin w-5 h-5" />
                                ) : (
                                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                )}
                            </button>
                        )}

                        {canEdit && (
                            <>
                                {!isEditing ? (
                                    <button
                                        onClick={onToggleEdit}
                                        disabled={purchase['S Approver'] && purchase['M Approver']}
                                        className={`p-2 rounded-full transition duration-200 transform active:scale-90 ${
                                            purchase['S Approver'] && purchase['M Approver']
                                                ? 'bg-white/10 text-white/50 cursor-not-allowed'
                                                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                        }`}
                                        title={
                                            purchase['S Approver'] && purchase['M Approver']
                                                ? 'Cannot edit after approval'
                                                : 'Edit item'
                                        }
                                    >
                                        <Pencil className="w-4 h-4 md:w-5 md:h-5" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={onCancelEdit}
                                        className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition duration-200 transform active:scale-90"
                                        title="Cancel edit mode"
                                    >
                                        <XCircle className="w-4 h-4 md:w-5 md:h-5" />
                                    </button>
                                )}
                            </>
                        )}

                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 rounded-lg p-2 transition transform active:scale-90"
                            title="Close"
                        >
                            <X className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}