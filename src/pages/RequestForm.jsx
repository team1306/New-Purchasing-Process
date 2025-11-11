import { useState } from 'react';
import { X } from 'lucide-react';
import {createPurchase, updatePurchaseByRequestId} from '../utils/googleSheets';
import {getAccessToken, getRefreshedAccessToken, requestSheetsAccess} from '../utils/googleAuth';

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
            // Replace with your actual create function
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative border border-gray-200">
                {/* Close button */}
                <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                    onClick={onClose}
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Request</h2>
                <p className="text-sm text-gray-500 mb-6">Fill out the form below to submit a new purchase request.</p>

                {/* Form Fields */}
                <div className="space-y-4">
                    <label className="block text-gray-700 font-medium">
                        Item Description <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Item Description"
                        value={newRequest['Item Description']}
                        onChange={(e) =>
                            setNewRequest(prev => ({ ...prev, 'Item Description': e.target.value }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700"
                    />
                    <label className="block text-gray-700 font-medium">
                        Item Link <span className="text-gray-400 italic">(Optional)</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Item Link"
                        value={newRequest['Item Link']}
                        onChange={(e) =>
                            setNewRequest(prev => ({ ...prev, 'Item Link': e.target.value }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700"
                    />
                    <label className="block text-gray-700 font-medium">
                        Category <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={newRequest['Category']}
                        onChange={(e) =>
                            setNewRequest(prev => ({ ...prev, 'Category': e.target.value }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700"
                    >
                        <option value="">Select Category</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <label className="block text-gray-700 font-medium">
                        Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        placeholder="Quantity"
                        value={newRequest['Quantity']}
                        onChange={(e) =>
                            setNewRequest(prev => ({ ...prev, 'Quantity': e.target.value }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700"
                    />
                    <label className="block text-gray-700 font-medium">
                        Unit Price <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        placeholder="Unit Price"
                        value={newRequest['Unit Price']}
                        onChange={(e) =>
                            setNewRequest(prev => ({ ...prev, 'Unit Price': e.target.value }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700"
                    />
                    <label className="block text-gray-700 font-medium">
                        Comments <span className="text-gray-400 italic">(Optional)</span>
                    </label>
                    <textarea
                        placeholder="Comments"
                        value={newRequest['Comments']}
                        onChange={(e) =>
                            setNewRequest(prev => ({ ...prev, 'Comments': e.target.value }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700"
                        rows={3}
                    />
                </div>

                {!isFormValid && (
                    <p className="text-sm text-red-500 mt-2">
                        Please fill out all required fields (*).
                    </p>
                )}
                {/* Submit Button */}
                <button
                    className={`mt-6 w-full py-2 rounded-lg font-semibold text-white ${
                        isFormValid
                            ? 'bg-blue-500 hover:bg-blue-600'
                            : 'bg-gray-300 cursor-not-allowed'
                    }`}
                    onClick={handleCreateRequest}
                    disabled={!isFormValid || savingLoading}
                >
                    {savingLoading ? 'Saving...' : 'Create Request'}
                </button>
            </div>
        </div>
    );
}
