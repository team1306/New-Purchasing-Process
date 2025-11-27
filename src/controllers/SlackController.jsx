import {
    sendSlackMessage,
    buildPurchaseRequestBlocks,
    buildStateChangeBlocks,
    buildApprovalBlocks,
    buildEditBlocks,
    buildDeleteBlocks
} from '../utils/slackApi';
import { getRefreshedAccessToken } from '../utils/googleAuth';
import { updatePurchaseByRequestId } from '../utils/googleSheets';

/**
 * Controller for handling Slack integration
 */
export class SlackController {
    constructor(onUpdate, showError) {
        this.onUpdate = onUpdate;
        this.showError = showError;
    }

    /**
     * Create initial Slack thread for a purchase
     */
    async createSlackThread(purchase) {
        try {
            const blocks = buildPurchaseRequestBlocks(purchase);
            const messageId = await sendSlackMessage(blocks);

            // Update the purchase with the Slack Message ID
            await updatePurchaseByRequestId(
                purchase['Request ID'],
                { 'Slack Message ID': messageId },
                await getRefreshedAccessToken()
            );

            if (this.onUpdate) {
                this.onUpdate();
            }

            return messageId;
        } catch (error) {
            console.error('Error creating Slack thread:', error);
            if (this.showError) {
                await this.showError('Failed to create Slack thread. The purchase was saved but Slack notification failed.');
            }
            throw error;
        }
    }

    /**
     * Log state change to Slack thread
     */
    async logStateChange(purchase, previousState, newState, userName) {
        if (!purchase['Slack Message ID']) return;

        try {
            const blocks = buildStateChangeBlocks(purchase, previousState, newState, userName);
            await sendSlackMessage(blocks, purchase['Slack Message ID']);
        } catch (error) {
            console.error('Error logging state change to Slack:', error);
            // Don't throw - this is a non-critical operation
        }
    }

    /**
     * Log approval to Slack thread
     */
    async logApproval(purchase, approvalType, userName) {
        if (!purchase['Slack Message ID']) return;

        try {
            const blocks = buildApprovalBlocks(purchase, approvalType, userName);
            await sendSlackMessage(blocks, purchase['Slack Message ID']);
        } catch (error) {
            console.error('Error logging approval to Slack:', error);
            // Don't throw - this is a non-critical operation
        }
    }

    /**
     * Log edit to Slack thread
     */
    async logEdit(purchase, changes, userName) {
        if (!purchase['Slack Message ID']) return;

        try {
            const blocks = buildEditBlocks(purchase, changes, userName);
            await sendSlackMessage(blocks, purchase['Slack Message ID']);
        } catch (error) {
            console.error('Error logging edit to Slack:', error);
            // Don't throw - this is a non-critical operation
        }
    }

    /**
     * Log deletion to Slack thread
     */
    async logDeletion(purchase, userName) {
        if (!purchase['Slack Message ID']) return;

        try {
            const blocks = buildDeleteBlocks(purchase, userName);
            await sendSlackMessage(blocks, purchase['Slack Message ID']);
        } catch (error) {
            console.error('Error logging deletion to Slack:', error);
            // Don't throw - this is a non-critical operation
        }
    }
}