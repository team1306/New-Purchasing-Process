import { getRefreshedAccessToken } from '../utils/googleAuth';
import { updatePurchaseByRequestId } from '../utils/googleSheets';

/**
 * Controller for handling state changes on purchases
 * Centralizes the logic for state transitions and associated date updates
 */
export class StateChangeController {
    constructor(onUpdate, showError) {
        this.onUpdate = onUpdate;
        this.showError = showError;
    }

    /**
     * Get today's date in local timezone format (YYYY-MM-DD)
     */
    static getLocalDate() {
        const today = new Date();
        return new Date(today.getTime() - (today.getTimezoneOffset() * 60000))
            .toISOString()
            .split('T')[0];
    }

    /**
     * Prepare updates object based on the new state
     */
    prepareStateUpdates(newState) {
        const updates = { 'State': newState };

        if (newState === 'Purchased') {
            updates['Date Purchased'] = StateChangeController.getLocalDate();
        }

        if (newState === 'Received') {
            updates['Date Received'] = StateChangeController.getLocalDate();
        }

        return updates;
    }

    /**
     * Change state for a single purchase
     */
    async changeState(purchase, newState) {
        try {
            const updates = this.prepareStateUpdates(newState);
            await updatePurchaseByRequestId(
                purchase['Request ID'],
                updates,
                await getRefreshedAccessToken()
            );
            this.onUpdate();
            return { success: true };
        } catch (err) {
            console.error('Error changing state:', err);
            await this.showError('Failed to update state. Please try again.');
            return { success: false, error: err };
        }
    }

    /**
     * Change state for multiple purchases
     */
    async changeBulkState(purchases, newState) {
        try {
            const updates = this.prepareStateUpdates(newState);

            await Promise.all(
                purchases.map(async purchase =>
                    updatePurchaseByRequestId(
                        purchase['Request ID'],
                        updates,
                        await getRefreshedAccessToken()
                    )
                )
            );

            this.onUpdate();
            return { success: true };
        } catch (err) {
            console.error('Error changing bulk state:', err);
            await this.showError('Failed to update some items. Please try again.');
            return { success: false, error: err };
        }
    }
}