import { useState, useEffect } from 'react';
import { parseCurrency } from '../utils/purchaseHelpers';

/**
 * Unified hook for managing purchase-related state and operations
 * Used by both DashboardPage and GroupsPage
 *
 * Note: Business logic (state changes, shipping updates) is handled by controllers.
 * This hook only manages UI state (what's selected, what's being edited, etc.)
 */
export const usePurchaseManagement = () => {
    const [editingShipping, setEditingShipping] = useState(null);
    const [shippingValue, setShippingValue] = useState('');
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Multi-select state
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedPurchases, setSelectedPurchases] = useState([]);

    // Clear selection when leaving selection mode
    useEffect(() => {
        if (!selectionMode) {
            setSelectedPurchases([]);
        }
    }, [selectionMode]);

    /**
     * Start editing shipping for a purchase
     */
    const handleShippingEdit = (purchase)=> {
        setEditingShipping(purchase['Request ID']);
        const currentShipping = purchase['Shipping'] ? parseCurrency(purchase['Shipping']).toString() : '0';
        setShippingValue(currentShipping);
    };

    /**
     * Cancel shipping edit
     */
    const handleShippingCancel = () => {
        setEditingShipping(null);
        setShippingValue('');
    };

    /**
     * Toggle selection mode
     */
    const handleToggleSelectionMode = () => {
        setSelectionMode(!selectionMode);
    };

    /**
     * Toggle selection of a single purchase
     */
    const handleToggleSelect = (purchase) => {
        setSelectedPurchases(prev => {
            const isSelected = prev.some(p => p['Request ID'] === purchase['Request ID']);

            if (isSelected) {
                return prev.filter(p => p['Request ID'] !== purchase['Request ID']);
            } else {
                // Only allow if same state or first selection
                if (prev.length === 0 || prev[0]['State'] === purchase['State']) {
                    return [...prev, purchase];
                }
                return prev;
            }
        });
    };

    return {
        // State
        editingShipping,
        shippingValue,
        selectedPurchase,
        showCreateForm,
        selectionMode,
        selectedPurchases,

        // Setters
        setSelectedPurchase,
        setShowCreateForm,
        setShippingValue,

        // Handlers
        handleShippingEdit,
        handleShippingCancel,
        handleToggleSelectionMode,
        handleToggleSelect,
    };
};