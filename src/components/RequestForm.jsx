import { useState, useEffect } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { createPurchase } from '../utils/googleSheets.js';
import { getRefreshedAccessToken } from '../utils/googleAuth.js';
import { useAlert } from './AlertContext';
import { Button, Alert } from './ui';
import { FormField, CurrencyInput, FormRow } from './forms';
import { PageHeader } from './layout';
import GroupNameAutocomplete from './groups/GroupNameAutoComplete.jsx';
import { CATEGORIES } from '../utils/purchaseHelpers';

export default function RequestForm({ user, onClose, onCreated, presetFields = {}, existingPurchases = [] }) {
    const { showError } = useAlert();

    // Get today's date in local timezone
    const getLocalDate = () => {
        const today = new Date();
        const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000))
            .toISOString()
            .split('T')[0];
        return localDate;
    };

    // Extract unique group names from existing purchases
    const existingGroups = [...new Set(
        existingPurchases
            .map(p => p['Group Name'])
            .filter(name => name && name.trim() !== '')
    )].sort();

    const [newRequest, setNewRequest] = useState({
        'Request ID': '',
        'Item Description': '',
        'Item Link': '',
        'Category': '',
        'Group Name': '',
        'Quantity': '',
        'Unit Price': '',
        'Shipping': '',
        'Package Size': '',
        'Comments': '',
        'Date Requested': getLocalDate(),
        'Requester': 'N/A',
        'State': 'Pending Approval',
        ...presetFields
    });

    const [savingLoading, setSavingLoading] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const requiredFields = ['Item Description', 'Category', 'Quantity', 'Unit Price'];
    const isFormValid = requiredFields.every(
        field => newRequest[field] && newRequest[field].toString().trim() !== ''
    );

    // Prevent background scroll when modals is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => onClose(), 300);
    };

    const handleChange = (field, value) => {
        setNewRequest(prev => ({ ...prev, [field]: value }));
    };

    const handleCreateRequest = async () => {
        try {
            setSavingLoading(true);
            newRequest['Requester'] = user.name;
            await createPurchase(newRequest, await getRefreshedAccessToken());

            if (onCreated) onCreated();
            onClose();
        } catch (err) {
            console.error('Error creating request:', err);
            showError(`Failed to create request: ${err.message}`);
        } finally {
            setSavingLoading(false);
        }
    };

    return (
        <div
            className={`fixed inset-0 bg-black z-50 flex items-center justify-center p-0 transition-opacity duration-300 ${
                isClosing ? 'bg-opacity-0' : 'bg-opacity-50 animate-fadeIn'
            }`}
            onClick={handleClose}
        >
            <div
                className={`
          bg-white shadow-2xl w-full h-full overflow-y-auto
          md:rounded-2xl md:max-w-2xl md:h-auto md:max-h-[90vh]
          transition-all duration-300 ease-out
          ${isClosing
                    ? 'md:opacity-0 md:scale-95 translate-y-full md:translate-y-0'
                    : 'md:opacity-100 md:scale-100 translate-y-0 md:animate-slideUp'
                }
        `}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Sticky */}
                <PageHeader className="sticky top-0 z-20 shadow-lg">
                    <div className="flex justify-between items-center p-4 md:p-6">
                        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                            <PlusCircle className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0" />
                            <div className="min-w-0">
                                <h2 className="text-lg md:text-2xl font-bold mb-0 md:mb-1 truncate">
                                    Create New Request
                                </h2>
                                <p className="text-green-100 text-xs md:text-sm hidden md:block">
                                    Fill out the form below to submit a purchase request
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={handleClose}
                            icon={X}
                            iconPosition="left"
                            className="flex-shrink-0 hover:bg-white/20"
                            title="Close"
                        />
                    </div>
                </PageHeader>

                {/* Form Content - Scrollable */}
                <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                    {/* Item Description */}
                    <FormField
                        label="Item Description"
                        required
                        value={newRequest['Item Description']}
                        onChange={(e) => handleChange('Item Description', e.target.value)}
                        placeholder="Enter item description"
                    />

                    {/* Item Link */}
                    <FormField
                        type="url"
                        label="Item Link"
                        value={newRequest['Item Link']}
                        onChange={(e) => handleChange('Item Link', e.target.value)}
                        placeholder="https://example.com/product"
                        helper="Optional"
                    />

                    {/* Category and Group Name */}
                    <FormRow columns={2}>
                        <FormField
                            type="select"
                            label="Category"
                            required
                            value={newRequest['Category']}
                            onChange={(e) => handleChange('Category', e.target.value)}
                            options={CATEGORIES}
                            placeholder="Select a category"
                        />

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Group Name <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                            </label>
                            <GroupNameAutocomplete
                                value={newRequest['Group Name']}
                                onChange={(value) => handleChange('Group Name', value)}
                                existingGroups={existingGroups}
                                placeholder="e.g., Robot Build 2025"
                            />
                        </div>
                    </FormRow>

                    {/* Quantity and Unit Price */}
                    <FormRow columns={2}>
                        <FormField
                            type="number"
                            label="Quantity"
                            required
                            min="1"
                            value={newRequest['Quantity']}
                            onChange={(e) => handleChange('Quantity', e.target.value)}
                            placeholder="1"
                        />

                        <CurrencyInput
                            label="Unit Price"
                            required
                            value={newRequest['Unit Price']}
                            onChange={(e) => handleChange('Unit Price', e.target.value)}
                            placeholder="0.00"
                        />
                    </FormRow>

                    {/* Shipping and Package Size */}
                    <FormRow columns={2}>
                        <CurrencyInput
                            label="Shipping Cost"
                            value={newRequest['Shipping']}
                            onChange={(e) => handleChange('Shipping', e.target.value)}
                            placeholder="0.00"
                            helper="Optional"
                        />

                        <FormField
                            label="Package Size"
                            value={newRequest['Package Size']}
                            onChange={(e) => handleChange('Package Size', e.target.value)}
                            placeholder="e.g., 100 parts per bag"
                            helper="Optional"
                        />
                    </FormRow>

                    {/* Comments */}
                    <FormField
                        type="textarea"
                        label="Comments"
                        value={newRequest['Comments']}
                        onChange={(e) => handleChange('Comments', e.target.value)}
                        placeholder="Add any additional notes or comments..."
                        rows={4}
                        helper="Optional"
                    />

                    {/* Validation Message */}
                    {!isFormValid && (
                        <Alert type="warning" title="Required fields missing" className="animate-slideDown">
                            Please fill out all required fields marked with <span className="text-red-500">*</span>
                        </Alert>
                    )}
                </div>

                {/* Action Buttons - Sticky on Mobile */}
                <div className="sticky bottom-0 bg-white border-t p-4 md:p-6 shadow-lg">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            variant="secondary"
                            onClick={handleClose}
                            disabled={savingLoading}
                            fullWidth
                            className="sm:w-auto order-2 sm:order-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="success"
                            onClick={handleCreateRequest}
                            disabled={!isFormValid || savingLoading}
                            loading={savingLoading}
                            icon={PlusCircle}
                            fullWidth
                            className="sm:flex-1 order-1 sm:order-2"
                        >
                            Create Request
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}