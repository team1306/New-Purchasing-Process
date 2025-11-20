import { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { createPurchase } from '../utils/googleSheets.js';
import { getRefreshedAccessToken } from '../utils/googleAuth.js';

const CATEGORIES = [
    'Robot',
    'Inventory',
    'Outreach',
    'Field',
    'Competition',
    'Tools',
    'Consumables',
    'Other'
];

export default function RequestForm({ user, onClose, onCreated, presetFields = {} }) {
    const [newRequest, setNewRequest] = useState({
        'Request ID': '',
        'Item Description': '',
        'Item Link': '',
        'Category': '',
        'Quantity': '',
        'Unit Price': '',
        'Shipping': '',
        'Package Size': '',
        'Comments': '',
        'Date Requested': new Date().toISOString().split('T')[0],
        'Requester': 'N/A',
        'State': 'Pending Approval',
        ...presetFields
    });

    const [savingLoading, setSavingLoading] = useState(false);
    const requiredFields = ['Item Description', 'Category', 'Quantity', 'Unit Price'];
    const isFormValid = requiredFields.every(
        field => newRequest[field] && newRequest[field].toString().trim() !== ''
    );

    const handleCreateRequest = async () => {
        try {
            setSavingLoading(true);
            newRequest['Requester'] = user.name;
            await createPurchase(newRequest, await getRefreshedAccessToken())

            if (onCreated) onCreated();
            onClose();
        } catch (err) {
            console.error('Error creating request:', err);
            alert(`Failed to create request: ${err.message}`);
        } finally {
            setSavingLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-0 md:p-4 z-50"
            onClick={onClose}
        >
            <div
                className="
                    bg-white shadow-2xl w-full h-full overflow-y-auto
                    md:rounded-2xl md:max-w-2xl md:h-auto md:max-h-[90vh]
                "
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-yellow-700 p-6 text-white sticky top-0 z-20 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <PlusCircle className="w-8 h-8" />
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Create New Request</h2>
                            <p className="text-green-100 text-sm">Fill out the form below to submit a purchase request</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 rounded-lg p-2 transition"
                        title="Close"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-6 space-y-6">
                    {/* Item Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Item Description <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter item description"
                            value={newRequest['Item Description']}
                            onChange={(e) =>
                                setNewRequest(prev => ({ ...prev, 'Item Description': e.target.value }))
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700 transition"
                        />
                    </div>

                    {/* Item Link */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Item Link <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                        </label>
                        <input
                            type="url"
                            placeholder="https://example.com/product"
                            value={newRequest['Item Link']}
                            onChange={(e) =>
                                setNewRequest(prev => ({ ...prev, 'Item Link': e.target.value }))
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700 transition"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={newRequest['Category']}
                            onChange={(e) =>
                                setNewRequest(prev => ({ ...prev, 'Category': e.target.value }))
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700 transition"
                        >
                            <option value="">Select a category</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Quantity and Unit Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                placeholder="1"
                                value={newRequest['Quantity']}
                                onChange={(e) =>
                                    setNewRequest(prev => ({ ...prev, 'Quantity': e.target.value }))
                                }
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Unit Price <span className="text-red-500">*</span>
                            </label>
                            <div className="relative overflow-hidden">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={newRequest['Unit Price']}
                                    onChange={(e) =>
                                        setNewRequest(prev => ({ ...prev, 'Unit Price': e.target.value }))
                                    }
                                    className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700 transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Shipping and Package Size */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Shipping Cost <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                            </label>
                            <div className="relative overflow-hidden">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={newRequest['Shipping']}
                                    onChange={(e) =>
                                        setNewRequest(prev => ({ ...prev, 'Shipping': e.target.value }))
                                    }
                                    className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700 transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Package Size <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., 100 parts per bag"
                                value={newRequest['Package Size']}
                                onChange={(e) =>
                                    setNewRequest(prev => ({ ...prev, 'Package Size': e.target.value }))
                                }
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700 transition"
                            />
                        </div>
                    </div>

                    {/* Comments */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Comments <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                        </label>
                        <textarea
                            placeholder="Add any additional notes or comments..."
                            value={newRequest['Comments']}
                            onChange={(e) =>
                                setNewRequest(prev => ({ ...prev, 'Comments': e.target.value }))
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700 transition resize-none"
                            rows={4}
                        />
                    </div>

                    {/* Validation Message */}
                    {!isFormValid && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-yellow-800">Required fields missing</p>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Please fill out all required fields marked with <span className="text-red-500">*</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col-reverse md:flex-row gap-3 pt-4 border-t">
                        <button
                            onClick={onClose}
                            disabled={savingLoading}
                            className="w-full md:w-auto px-6 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 font-semibold rounded-lg transition duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateRequest}
                            disabled={!isFormValid || savingLoading}
                            className={`w-full md:flex-1 py-3 px-6 rounded-lg font-semibold text-white transition duration-200 ${
                                isFormValid && !savingLoading
                                    ? 'bg-green-600 hover:bg-green-700 shadow-lg'
                                    : 'bg-gray-300 cursor-not-allowed'
                            }`}
                        >
                            {savingLoading ? (
                                <span className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Creating Request...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center">
                                    <PlusCircle className="w-5 h-5 mr-2" />
                                    Create Request
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
