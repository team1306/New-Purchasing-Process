import { X, Pencil, Trash2, XCircle } from 'lucide-react';
import { forwardRef } from 'react';
import { IconButton } from '../ui/index.js';
import { PageHeader } from '../layout/index.js';
import StateBadge from '../StateBadge.jsx';

const ModalHeader = forwardRef(({
                                    purchase,
                                    isEditing,
                                    savingLoading,
                                    canDelete,
                                    canEdit,
                                    onClose,
                                    onDelete,
                                    onToggleEdit,
                                    onCancelEdit,
                                    onTouchStart,
                                    onTouchMove,
                                    onTouchEnd
                                }, ref) => {
    const isFullyApproved = purchase['S Approver'] && purchase['M Approver'];

    return (
        <PageHeader
            ref={ref}
            className="sticky top-0 z-30 shadow-lg"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{ touchAction: 'none' }}
        >
            {/* Drag Handle (Mobile Only) */}
            <div className="md:hidden flex justify-center pt-3 pb-1">
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
                            <IconButton
                                icon={Trash2}
                                variant="danger"
                                onClick={onDelete}
                                loading={savingLoading}
                                disabled={savingLoading}
                                title="Delete purchase"
                            />
                        )}

                        {canEdit && (
                            <>
                                {!isEditing ? (
                                    <IconButton
                                        icon={Pencil}
                                        variant={isFullyApproved ? 'ghost' : 'warning'}
                                        onClick={onToggleEdit}
                                        disabled={isFullyApproved}
                                        className={isFullyApproved ? 'opacity-50 cursor-not-allowed' : ''}
                                        title={isFullyApproved ? 'Cannot edit after approval' : 'Edit item'}
                                    />
                                ) : (
                                    <IconButton
                                        icon={XCircle}
                                        variant="danger"
                                        onClick={onCancelEdit}
                                        title="Cancel edit mode"
                                    />
                                )}
                            </>
                        )}

                        <IconButton
                            icon={X}
                            variant="ghost"
                            onClick={onClose}
                            title="Close"
                            className="hover:bg-white/20"
                        />
                    </div>
                </div>
            </div>
        </PageHeader>
    );
});

ModalHeader.displayName = 'ModalHeader';

export default ModalHeader;