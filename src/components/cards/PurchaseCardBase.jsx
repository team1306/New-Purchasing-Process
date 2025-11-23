import {Calendar, User, Package, DollarSign, Box, ChevronRight, Tag} from 'lucide-react';
import {Badge, Checkbox} from '../ui';
import {
    formatDate,
    calculateTotalCost,
    getAvailableStateTransitions,
    STATE_COLORS
} from '../../utils/purchaseHelpers';
import {ShippingEditControl, StateChangeControl} from "./index.js";

export default function PurchaseCardBase({
                                             purchase,
                                             index,
                                             isDirector,
                                             editingShipping,
                                             shippingValue,
                                             onShippingEdit,
                                             onShippingSave,
                                             onShippingCancel,
                                             onShippingValueChange,
                                             onStateChange,
                                             onClick,
                                             selectionMode,
                                             isSelected,
                                             onToggleSelect,
                                             selectionDisabled,
                                             showGroupTag = true,
                                             variant = 'default', // 'default' or 'grouped'
                                         }) {
    const availableStates = getAvailableStateTransitions(purchase['State']);

    const handleClick = () => {
        if (selectionMode) {
            if (!selectionDisabled) {
                onToggleSelect(purchase);
            }
        } else {
            onClick(purchase);
        }
    };

    const InfoItem = ({icon: Icon, label, value}) => (
        <div className="flex items-center text-gray-600">
            <Icon className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0"/>
            <div className="min-w-0">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="font-medium text-sm truncate">{value}</p>
            </div>
        </div>
    );

    return (
        <div className={`hover:bg-gray-50 transition duration-150 ${
            selectionMode && selectionDisabled ? 'opacity-50' : ''
        }`}>
            {/* Mobile Layout */}
            <div className="md:hidden">
                <div
                    className={`p-4 cursor-pointer active:bg-gray-100 ${isSelected ? 'bg-blue-50' : ''}`}
                    onClick={handleClick}
                >
                    <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            {selectionMode && (
                                <div className="flex-shrink-0 mt-1">
                                    <Checkbox
                                        checked={isSelected}
                                        disabled={selectionDisabled}
                                        onChange={() => {
                                        }}
                                    />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-gray-800 mb-1 line-clamp-2">
                                    {purchase['Item Description'] || 'No description'}
                                </h3>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {purchase['State'] && <Badge state={purchase['State']}>{purchase['State']}</Badge>}
                                    {showGroupTag && purchase['Group Name'] && (
                                        <Badge variant="purple" className="inline-flex items-center gap-1">
                                            <Tag className="w-3 h-3"/>
                                            {purchase['Group Name']}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        {!selectionMode && <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1"/>}
                    </div>

                    <div className={`grid grid-cols-2 gap-3 mb-3 ${selectionMode ? 'ml-9' : ''}`}>
                        <InfoItem icon={Calendar} label="Requested" value={formatDate(purchase['Date Requested'])}/>
                        <InfoItem icon={DollarSign} label="Total" value={calculateTotalCost(purchase)}/>
                        <InfoItem icon={Package} label="Category" value={purchase['Category'] || 'N/A'}/>
                        <InfoItem icon={User} label="Requester" value={purchase['Requester'] || 'N/A'}/>
                    </div>

                    <div className={`text-xs text-gray-500 ${selectionMode ? 'ml-9' : ''}`}>
                        ID: <span
                        className="font-mono font-semibold">{purchase['Request ID'] || `REQ-${index + 1}`}</span>
                    </div>
                </div>

                {!selectionMode && (isDirector || availableStates.length > 0) && (
                    <div className="px-4 pb-4 space-y-2">
                        {isDirector &&
                            <ShippingEditControl
                                purchase={purchase}
                                isEditing={editingShipping === purchase['Request ID']}
                                shippingValue={shippingValue}
                                onEdit={onShippingEdit}
                                onSave={onShippingSave}
                                onCancel={onShippingCancel}
                                onValueChange={onShippingValueChange}
                            />}
                        {availableStates.length > 0 && <StateChangeControl purchase={purchase} onStateChange={onStateChange} />}
                    </div>
                )}
            </div>

            {/* Desktop Layout */}
            <div className={`hidden md:block p-6 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                 onClick={handleClick}>
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 flex gap-4">
                        {selectionMode && (
                            <div className="flex-shrink-0 mt-1">
                                <Checkbox
                                    checked={isSelected}
                                    disabled={selectionDisabled}
                                    onChange={() => {
                                    }}
                                />
                            </div>
                        )}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {purchase['Item Description'] || 'No description'}
                                </h3>
                                {purchase['State'] && <Badge state={purchase['State']}>{purchase['State']}</Badge>}
                                {showGroupTag && purchase['Group Name'] && (
                                    <Badge variant="purple" className="inline-flex items-center gap-1">
                                        <Tag className="w-3 h-3"/>
                                        {purchase['Group Name']}
                                    </Badge>
                                )}
                            </div>

                            <div className="grid grid-cols-4 gap-3 mt-3 text-sm">
                                <InfoItem icon={Calendar} label="Requested"
                                          value={formatDate(purchase['Date Requested'])}/>
                                <InfoItem icon={User} label="Requester" value={purchase['Requester'] || 'N/A'}/>
                                <InfoItem icon={Package} label="Category" value={purchase['Category'] || 'N/A'}/>
                                <InfoItem icon={DollarSign} label="Total Cost" value={calculateTotalCost(purchase)}/>
                            </div>

                            {purchase['Package Size'] && (
                                <div className="flex items-center text-sm text-gray-600 mt-3">
                                    <Box className="w-4 h-4 mr-2 text-gray-400"/>
                                    <div>
                                        <p className="text-xs text-gray-500">Package Size</p>
                                        <p className="font-medium">{purchase['Package Size']}</p>
                                    </div>
                                </div>
                            )}

                            {purchase['Comments'] && (
                                <p className="mt-3 text-sm text-gray-600 italic break-words line-clamp-2">
                                    {purchase['Comments']}
                                </p>
                            )}

                            {purchase['Item Link'] && (
                                <a
                                    href={purchase['Item Link']}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-700
                                    hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                    >
                                    View Item Link →
                                </a>
                            )}
                        </div>
                    </div>

                    {!selectionMode && (
                        <div className="flex flex-col items-end gap-3" onClick={(e) => e.stopPropagation()}>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">Request ID</p>
                                <p className="font-mono text-sm font-semibold text-gray-700">
                                    {purchase['Request ID'] || `REQ-${index + 1}`}
                                </p>
                            </div>

                            {isDirector && (
                                <div className="border-t pt-3">
                                    <ShippingEditControl
                                        purchase={purchase}
                                        isEditing={editingShipping === purchase['Request ID']}
                                        shippingValue={shippingValue}
                                        onEdit={onShippingEdit}
                                        onSave={onShippingSave}
                                        onCancel={onShippingCancel}
                                        onValueChange={onShippingValueChange}
                                    />
                                </div>
                            )}

                            {availableStates.length > 0 && (
                                <div className="flex flex-col gap-2 border-t pt-3">
                                    <p className="text-xs text-gray-500 font-medium">Change State:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {availableStates.map(state => (
                                            <button
                                                key={state}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onStateChange(purchase, state);
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${STATE_COLORS[state]} hover:opacity-80 hover:shadow-md`}
                                            >
                                                → {state}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}