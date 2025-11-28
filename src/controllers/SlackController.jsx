import {
    sendSlackMessage,
    buildPurchaseRequestBlocks,
    buildStateChangeBlocks,
    buildApprovalBlocks,
    buildEditBlocks,
    buildDeleteBlocks, getCurrentUserSlackId
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
    async createSlackThread(purchase, skipSheets) {
        try {
            let slackName = await getCurrentUserSlackId(purchase['Requester']);
            if(!slackName) {
                slackName = purchase['Requester'];
            }

            const blocks = await buildPurchaseRequestBlocks(purchase, slackName);
            const messageId = await sendSlackMessage(blocks);

            // Update the purchase with the Slack Message ID
            if(!skipSheets) {
                await updatePurchaseByRequestId(
                    purchase['Request ID'],
                    {'Slack Message ID': messageId},
                    await getRefreshedAccessToken()
                );
            }

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
            const slackName = await getCurrentUserSlackId(userName);

            const blocks = await buildStateChangeBlocks(purchase, previousState, newState, slackName);
            await sendSlackMessage(blocks, purchase['Slack Message ID']);
        } catch (error) {
            console.error('Error logging state change to Slack:', error);
            // Don't throw - this is a non-critical operation
        }
    }

    /**
     * Log approval to Slack thread
     */
    async logApproval(purchase, approvalType, userName, withdrawn) {
        if (!purchase['Slack Message ID']) return;

        try {
            // Check if this is a withdrawal

            const slackName = await getCurrentUserSlackId(userName);

            const blocks = await buildApprovalBlocks(purchase, approvalType, slackName, withdrawn);


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
            const slackName = await getCurrentUserSlackId(userName);

            const blocks = await buildEditBlocks(purchase, changes, slackName);
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
            const slackName = await getCurrentUserSlackId(userName);

            const blocks = await buildDeleteBlocks(purchase, slackName);
            await sendSlackMessage(blocks, purchase['Slack Message ID']);
        } catch (error) {
            console.error('Error logging deletion to Slack:', error);
            // Don't throw - this is a non-critical operation
        }
    }
}