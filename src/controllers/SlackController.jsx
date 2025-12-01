import {
    sendSlackMessage,
    updateSlackMessage,
    buildPurchaseRequestBlocks,
    buildStateChangeBlocks,
    buildApprovalBlocks,
    buildEditBlocks,
    buildDeleteBlocks,
    getCurrentUserSlackId
} from '../utils/slackApi';
import { getRefreshedAccessToken } from '../utils/googleAuth';
import { updatePurchaseByRequestId } from '../utils/googleSheets';
import { reportError } from '../utils/errorReporter';

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
            if (!slackName) {
                slackName = purchase['Requester'];
            }

            const blocks = buildPurchaseRequestBlocks(purchase, slackName);
            const messageId = await sendSlackMessage(blocks);

            // Update the purchase with the Slack Message ID
            if (!skipSheets) {
                await updatePurchaseByRequestId(
                    purchase['Request ID'],
                    { 'Slack Message ID': messageId },
                    await getRefreshedAccessToken()
                );
            }

            if (this.onUpdate) {
                this.onUpdate();
            }

            return messageId;
        } catch (error) {
            console.error('Error creating Slack thread:', error);
            await reportError(error, {
                context: 'SlackController.createSlackThread',
                purchaseId: purchase['Request ID']
            });

            if (this.showError) {
                await this.showError(
                    `Failed to create Slack thread: ${error.message}\n\nThe purchase was saved but the Slack notification failed.`
                );
            }
            throw error;
        }
    }

    /**
     * Update the parent message with current purchase info
     */
    async updateParentMessage(purchase) {
        if (!purchase['Slack Message ID']) return;

        try {
            let slackName = await getCurrentUserSlackId(purchase['Requester']);
            if (!slackName) {
                slackName = purchase['Requester'];
            }

            const blocks = buildPurchaseRequestBlocks(purchase, slackName);
            await updateSlackMessage(purchase['Slack Message ID'], blocks);
        } catch (error) {
            console.error('Error updating parent message:', error);
            await reportError(error, {
                context: 'SlackController.updateParentMessage',
                purchaseId: purchase['Request ID'],
                messageId: purchase['Slack Message ID']
            });

            if (this.showError) {
                await this.showError(
                    `Failed to update Slack message: ${error.message}\n\nThe change was saved but the Slack update failed.`
                );
            }
            // Don't throw - this is a non-critical operation
        }
    }

    /**
     * Update parent message to show deletion
     */
    async updateParentMessageForDeletion(purchase, userName) {
        if (!purchase['Slack Message ID']) return;

        try {
            let slackName = await getCurrentUserSlackId(userName);
            if (!slackName) {
                slackName = userName;
            }

            // Build blocks showing the item as deleted but keeping info
            const blocks = [
                {
                    type: 'header',
                    text: {
                        type: 'plain_text',
                        text: '🗑️ DELETED: ' + (purchase['Item Description'] || 'Purchase Request'),
                        emoji: true
                    }
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*This request has been deleted*\nDeleted by: ${slackName}\nDeleted on: ${new Date().toLocaleString()}`
                    }
                },
                {
                    type: 'divider'
                },
                {
                    type: 'context',
                    elements: [
                        {
                            type: 'mrkdwn',
                            text: '_Original request details below for reference_'
                        }
                    ]
                },
                ...buildPurchaseRequestBlocks(purchase, purchase['Requester'])
            ];

            await updateSlackMessage(purchase['Slack Message ID'], blocks);
        } catch (error) {
            console.error('Error updating parent message for deletion:', error);
            await reportError(error, {
                context: 'SlackController.updateParentMessageForDeletion',
                purchaseId: purchase['Request ID'],
                messageId: purchase['Slack Message ID']
            });
            // Don't throw or show error - deletion already succeeded
        }
    }

    /**
     * Log state change to Slack thread
     */
    async logStateChange(purchase, previousState, newState, userName) {
        if (!purchase['Slack Message ID']) return;

        try {
            const slackName = await getCurrentUserSlackId(userName);
            const blocks = buildStateChangeBlocks(purchase, previousState, newState, slackName || userName);
            await sendSlackMessage(blocks, purchase['Slack Message ID']);

            // Also update the parent message
            await this.updateParentMessage(purchase);
        } catch (error) {
            console.error('Error logging state change to Slack:', error);
            await reportError(error, {
                context: 'SlackController.logStateChange',
                purchaseId: purchase['Request ID'],
                previousState,
                newState
            });

            if (this.showError) {
                await this.showError(
                    `Failed to log state change to Slack: ${error.message}\n\nThe state was changed but the Slack notification failed.`
                );
            }
            // Don't throw - this is a non-critical operation
        }
    }

    /**
     * Log approval to Slack thread
     */
    async logApproval(purchase, approvalType, userName, withdrawn) {
        if (!purchase['Slack Message ID']) return;

        try {
            const slackName = await getCurrentUserSlackId(userName);
            const blocks = buildApprovalBlocks(purchase, approvalType, slackName || userName, withdrawn);
            await sendSlackMessage(blocks, purchase['Slack Message ID']);

            // Also update the parent message
            await this.updateParentMessage(purchase);
        } catch (error) {
            console.error('Error logging approval to Slack:', error);
            await reportError(error, {
                context: 'SlackController.logApproval',
                purchaseId: purchase['Request ID'],
                approvalType,
                withdrawn
            });

            if (this.showError) {
                await this.showError(
                    `Failed to log approval to Slack: ${error.message}\n\nThe approval was saved but the Slack notification failed.`
                );
            }
            // Don't throw - this is a non-critical operation
        }
    }

    /**
     * Log edit to Slack thread
     */
    async logEdit(purchase, changes, editedPurchase, userName) {
        if (!purchase['Slack Message ID']) return;

        try {
            const slackName = await getCurrentUserSlackId(userName);
            const blocks = buildEditBlocks(purchase, changes, slackName || userName);
            await sendSlackMessage(blocks, purchase['Slack Message ID']);

            // Also update the parent message
            await this.updateParentMessage(editedPurchase);
        } catch (error) {
            console.error('Error logging edit to Slack:', error);
            await reportError(error, {
                context: 'SlackController.logEdit',
                purchaseId: purchase['Request ID'],
                changes
            });

            if (this.showError) {
                await this.showError(
                    `Failed to log edit to Slack: ${error.message}\n\nThe changes were saved but the Slack notification failed.`
                );
            }
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

            // Post deletion notice as a reply
            const blocks = buildDeleteBlocks(purchase, slackName || userName);
            await sendSlackMessage(blocks, purchase['Slack Message ID']);

            // Update parent message to show deletion
            await this.updateParentMessageForDeletion(purchase, userName);
        } catch (error) {
            console.error('Error logging deletion to Slack:', error);
            await reportError(error, {
                context: 'SlackController.logDeletion',
                purchaseId: purchase['Request ID']
            });
            // Don't throw or show error - deletion already succeeded
        }
    }
}