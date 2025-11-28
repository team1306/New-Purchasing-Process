// Frontend now ONLY talks to your Vercel backend.
// No Slack tokens – completely safe.

import {parseCurrency} from "./purchaseHelpers.js";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const SLACK_CHANNEL_ID = import.meta.env.VITE_SLACK_CHANNEL_ID;

/**
 * Send a message to Slack through Vercel backend
 */
export const sendSlackMessage = async (blocks, threadTs = null) => {
    try {
        const payload = {
            channel: SLACK_CHANNEL_ID,
            blocks,
            text: 'Purchase Request Update'
        };

        if (threadTs) {
            payload.thread_ts = threadTs;
        }

        const response = await fetch(`${BACKEND_URL}/api/slack`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!data.ok) {
            throw new Error(`Slack API error: ${data.error}`);
        }

        return data.ts;
    } catch (error) {
        console.error('Error sending Slack message:', error);
        throw error;
    }
};

/**
 * Get thread replies through Vercel backend
 */
export const getThreadReplies = async (threadTs) => {
    try {
        const response = await fetch(
            `${BACKEND_URL}/api/threadReplies?channel=${SLACK_CHANNEL_ID}&ts=${threadTs}`
        );

        const data = await response.json();

        if (!data.ok) {
            throw new Error(`Slack API error: ${data.error}`);
        }

        // Filter out bot messages and the parent message
        const replies = data.messages.filter((msg, index) => {
                return index > 0 && (!msg.user_profile.is_bot);
            }
        );

        return replies;
    } catch (error) {
        console.error('Error fetching thread replies:', error);
        throw error;
    }
};

/**
 * Find Slack user ID for the currently logged-in user
 * Calls your Vercel backend /api/findUser?name=...
 */
export const getCurrentUserSlackId = async (displayName) => {
    try {
        const url = `${BACKEND_URL}/api/findUser?name=${encodeURIComponent(displayName)}`;
        const response = await fetch(url);

        const data = await response.json();

        if (!data.ok) {
            throw new Error(`Slack findUser error: ${data.error}`);
        }

        // Returned when score >= 90%
        if (data.userId) {
            return `<@${data.userId}>`;
        }

        // No strong match
        return null;

    } catch (error) {
        console.error("Error finding Slack user:", error);
        throw error;
    }
};

/**
 * Build blocks for a new purchase request
 */
export const buildPurchaseRequestBlocks = (purchase, userName) => {
    const blocks = [
        {
            type: 'header',
            text: {
                type: 'plain_text',
                text: purchase['Item Description'] || 'New Purchase Request',
                emoji: true
            }
        },
        {
            type: 'section',
            fields: [
                {
                    type: 'mrkdwn',
                    text: `*Request Date:*\n${purchase['Date Requested'] || 'N/A'}`
                },
                {
                    type: 'mrkdwn',
                    text: `*Requestor:*\n${userName || 'N/A'}`
                },
                {
                    type: 'mrkdwn',
                    text: `*Category:*\n${purchase['Category'] || 'N/A'}`
                },
                {
                    type: 'mrkdwn',
                    text: `*State:*\n${purchase['State'] || 'Pending Approval'}`
                }
            ]
        }
    ];

    if (purchase['Item Link'] && purchase['Item Link'].trim() !== '') {
        blocks.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*Item Link:*\n<${purchase['Item Link']}|View Item>`
            }
        });
    }

    const costFields = [
        {
            type: 'mrkdwn',
            text: `*Quantity:*\n${purchase['Quantity'] || 'N/A'}`
        },
        {
            type: 'mrkdwn',
            text: `*Unit Price:*\n$${parseCurrency(purchase['Unit Price'] || 0).toFixed(2)}`
        }
    ];

    if (purchase['Shipping'] && parseFloat(purchase['Shipping']) > 0) {
        costFields.push({
            type: 'mrkdwn',
            text: `*Shipping:*\n$${parseFloat(purchase['Shipping']).toFixed(2)}`
        });
    }

    const quantity = parseFloat(purchase['Quantity'] || 0);
    const unitPrice = parseCurrency(purchase['Unit Price'] || 0);
    const shipping = parseCurrency(purchase['Shipping'] || 0);
    const total = (quantity * unitPrice) + shipping;

    costFields.push({
        type: 'mrkdwn',
        text: `*Total Cost:*\n$${total.toFixed(2)}`
    });

    blocks.push({
        type: 'section',
        fields: costFields
    });

    if (purchase['Package Size'] && purchase['Package Size'].trim() !== '' && purchase['Package Size'] !== '1') {
        blocks.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*Package Size:*\n${purchase['Package Size']}`
            }
        });
    }

    if (purchase['Group Name'] && purchase['Group Name'].trim() !== '') {
        blocks.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*Group:*\n${purchase['Group Name']}`
            }
        });
    }

    if (purchase['Comments'] && purchase['Comments'].trim() !== '') {
        blocks.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*Comments:*\n${purchase['Comments']}`
            }
        });
    }

    blocks.push({ type: 'divider' });

    blocks.push({
        type: 'context',
        elements: [
            {
                type: 'mrkdwn',
                text: `Request ID: \`${purchase['Request ID'] || 'N/A'}\``
            }
        ]
    });

    return blocks;
};

/**
 * State change notification blocks
 */
export const buildStateChangeBlocks = (purchase, previousState, newState, userName) => {
    return [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*State Changed*\n${previousState} → ${newState}\nBy: ${userName}`
            }
        }
    ];
};

/**
 * Approval blocks
 */
export const buildApprovalBlocks = (purchase, approvalType, userName, withdrawn) => {
    const typeLabel = approvalType === 'student' ? 'Student' : 'Mentor';
    const withdrawnLabel = withdrawn ? 'Withdrawn' : 'Approval';
    return [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*${typeLabel} ${withdrawnLabel}*\nBy: ${userName}`
            }
        }
    ];
};

/**
 * Edit blocks
 */
export const buildEditBlocks = (purchase, changes, userName) => {
    const changesList = Object.entries(changes)
        .map(([field, value]) => `• ${field}: ${value}`)
        .join('\n');

    return [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*Purchase Edited*\nBy: ${userName}\n\n*Changes:*\n${changesList}`
            }
        }
    ];
};

/**
 * Deletion blocks
 */
export const buildDeleteBlocks = (purchase, userName) => {
    return [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*Purchase Deleted*\nBy: ${userName}`
            }
        }
    ];
};