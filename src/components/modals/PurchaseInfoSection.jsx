import {ExternalLink} from 'lucide-react';
import {formatDate, calculateTotalCost, getRequestTier, CATEGORIES} from '../../utils/purchaseHelpers.js';
import {FormRow, InfoBox, InfoSection, CostSummary} from '../forms/index.js';
import {FormField} from '../forms/index.js';
import {Alert} from '../ui/index.js';
import GroupNameAutocomplete from '../groups/GroupNameAutoComplete.jsx';

export default function PurchaseInfoSection({
                                                purchase,
                                                isEditing,
                                                editedPurchase,
                                                originalTier,
                                                onEditChange,
                                                existingPurchases = []
                                            }) {
    // Extract unique group names from existing purchases
    const existingGroups = [...new Set(
        existingPurchases
            .map(p => p['Group Name'])
            .filter(name => name && name.trim() !== '')
    )].sort();

    return (
        <>
            {/* Category and Group Name */}
            <FormRow columns={2}>
                {isEditing ? (
                    <FormField
                        type="select"
                        label="Category"
                        value={editedPurchase['Category'] || ''}
                        onChange={(e) => onEditChange('Category', e.target.value)}
                        options={CATEGORIES}
                    />
                ) : (
                    <InfoBox label="Category" value={purchase['Category']}/>
                )}

                {isEditing ? (
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Group Name
                        </label>
                        <GroupNameAutocomplete
                            value={editedPurchase['Group Name'] || ''}
                            onChange={(value) => onEditChange('Group Name', value)}
                            existingGroups={existingGroups}
                            placeholder="Optional"
                        />
                    </div>
                ) : (
                    <InfoBox label="Group Name" value={purchase['Group Name'] || 'None'}/>
                )}
            </FormRow>

            {/* Date Requested and Requester */}
            <FormRow columns={2}>
                <InfoBox label="Date Requested" value={formatDate(purchase['Date Requested'])}/>
                <InfoBox label="Requester" value={purchase['Requester']}/>
            </FormRow>

            {/* Quantity */}
            <FormRow columns={2}>
                {isEditing ? (
                    <FormField
                        type="number"
                        label="Quantity"
                        value={editedPurchase['Quantity']}
                        onChange={(e) => onEditChange('Quantity', e.target.value)}
                        min="1"
                    />
                ) : (
                    <InfoBox label="Quantity" value={purchase['Quantity']}/>
                )}
            </FormRow>

            {/* Package Size */}
            {(purchase['Package Size']?.trim() || isEditing) && (
                <InfoBox
                    label="Package Size"
                    value={isEditing ? (
                        <input
                            type="text"
                            value={editedPurchase['Package Size'] || ''}
                            onChange={(e) => onEditChange('Package Size', e.target.value)}
                            placeholder="Leave blank if only 1 item"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-blue-500"
                        />
                    ) : purchase['Package Size']}
                    variant="info"
                />
            )}

            {/* Cost Info */}
            <CostSummary
                unitPrice={isEditing ? editedPurchase['Unit Price'] : purchase['Unit Price']}
                shipping={isEditing ? editedPurchase['Shipping'] : purchase['Shipping']}
                quantity={isEditing ? editedPurchase['Quantity'] : purchase['Quantity']}
                total={isEditing ? calculateTotalCost(editedPurchase) : calculateTotalCost(purchase)}
                editable={isEditing}
                onUnitPriceChange={(e) => onEditChange('Unit Price', e.target.value)}
                onShippingChange={(e) => onEditChange('Shipping', e.target.value)}
            />

            {/* Tier Change Warning */}
            {isEditing && originalTier !== getRequestTier(parseFloat(calculateTotalCost(editedPurchase).replace(/[^0-9.-]+/g, '')) || 0) && (
                <Alert type="warning" title="Request Tier Changed" className="animate-slideDown">
                    The total cost has changed enough to affect the approval tier. All approvals will be cleared when
                    you save.
                </Alert>
            )}

            {/* Item Link */}
            {(purchase?.['Item Link'] || isEditing) && (
                <InfoSection title="Item Link">
                    {isEditing ? (
                        <FormField
                            type="url"
                            value={editedPurchase['Item Link'] || ''}
                            onChange={(e) => onEditChange('Item Link', e.target.value)}
                            placeholder="https://example.com/product"
                        />
                    ) : purchase['Item Link']?.trim() !== '' ? (
                        <a
                            href={purchase['Item Link']}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 hover:underline break-all text-sm md:text-base
                            flex items-center gap-1 group"
                            >
                            <span className="line-clamp-2">{purchase['Item Link']}</span>
                            <ExternalLink
                                className="w-4 h-4 flex-shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"/>
                        </a>
                    ) : null}
                </InfoSection>
            )}

            {/* Comments */}
            {(purchase['Comments'] || isEditing) && (
                <InfoSection title="Comments">
                    <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                        {isEditing ? (
                            <FormField
                                type="textarea"
                                value={editedPurchase['Comments'] || ''}
                                onChange={(e) => onEditChange('Comments', e.target.value)}
                                rows={3}
                            />
                        ) : (
                            <p className="text-gray-800 break-words text-sm md:text-base">
                                {purchase['Comments']}
                            </p>
                        )}
                    </div>
                </InfoSection>
            )}

            {/* Purchase Info */}
            {(purchase['Date Purchased'] || purchase['Order Number']) && (
                <FormRow columns={2}>
                    {purchase['Date Purchased'] && (
                        <InfoBox label="Date Purchased" value={formatDate(purchase['Date Purchased'])}/>
                    )}
                    {purchase['Order Number'] && (
                        <InfoBox label="Order Number" value={purchase['Order Number']}/>
                    )}
                </FormRow>
            )}
        </>
    );
}