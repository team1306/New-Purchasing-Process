import { getRefreshedAccessToken } from '../utils/googleAuth';
import { updatePurchaseByRequestId } from '../utils/googleSheets';
import { parseCurrency, formatCurrency } from '../utils/purchaseHelpers';

/**
 * Controller for handling shipping cost updates
 */
export class ShippingController {
    constructor(onUpdate, showError) {
        this.onUpdate = onUpdate;
        this.showError = showError;
    }

    /**
     * Validate shipping value
     */
    validateShipping(value) {
        const numericValue = parseFloat(value);

        if (isNaN(numericValue)) {
            return { valid: false, error: 'Please enter a valid number' };
        }

        if (numericValue < 0) {
            return { valid: false, error: 'Shipping cost cannot be negative' };
        }

        return { valid: true, value: numericValue };
    }

    /**
     * Update shipping cost for a purchase
     */
    async updateShipping(purchase, newValue) {
        try {
            const validation = this.validateShipping(newValue);

            if (!validation.valid) {
                await this.showError(validation.error);
                return { success: false, error: validation.error };
            }

            await updatePurchaseByRequestId(
                purchase['Request ID'],
                { 'Shipping': formatCurrency(validation.value) },
                await getRefreshedAccessToken()
            );

            this.onUpdate();
            return { success: true };
        } catch (err) {
            console.error('Error updating shipping:', err);
            await this.showError('Failed to update shipping. Please try again.');
            return { success: false, error: err };
        }
    }

    /**
     * Get current shipping value for editing
     */
    getCurrentShipping(purchase) {
        return purchase['Shipping']
            ? parseCurrency(purchase['Shipping']).toString()
            : '0';
    }
}