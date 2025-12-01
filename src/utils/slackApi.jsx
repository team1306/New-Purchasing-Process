// Frontend now ONLY talks to your Vercel backend.
// No Slack tokens — completely safe.

import { parseCurrency } from "./purchaseHelpers.js";
import { slackUserCache } from "./slackUserCache.js";
import { reportError } from "./errorReporter.js";

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
            const error = new Error(`Slack API error: ${data.error || 'Unknown error'}`);
            error.details = data.details;
            throw error;
        }

        return data.ts;
    } catch (error) {
        console.error('Error sending Slack message:', error);
        await reportError(error, {
            context: 'sendSlackMessage',
            threadTs,
            hasBlocks: !!blocks
        });
        throw error;
    }
};

/**
 * Update an existing Slack message
 */
export const updateSlackMessage = async (messageTs, blocks) => {
    try {
        const payload = {
            channel: SLACK_CHANNEL_ID,
            ts: messageTs,
            blocks,
            text: 'Purchase Request Update'
        };

        const response = await fetch(`${BACKEND_URL}/api/updateMessage`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!data.ok) {
            const error = new Error(`Slack API error: ${data.error || 'Unknown error'}`);
            error.details = data.details;
            throw error;
        }

        return data.ts;
    } catch (error) {
        console.error('Error updating Slack message:', error);
        await reportError(error, {
            context: 'updateSlackMessage',
            messageTs,
            hasBlocks: !!blocks
        });
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
            const error = new Error(`Slack API error: ${data.error || 'Unknown error'}`);
            error.details = data.details;
            throw error;
        }

        // Filter out bot messages and the parent message
        const replies = data.messages.filter((msg, index) => {
                return index > 0 && (!msg.user_profile.is_bot);
            }
        );

        return replies;
    } catch (error) {
        console.error('Error fetching thread replies:', error);
        await reportError(error, {
            context: 'getThreadReplies',
            threadTs
        });
        throw error;
    }
};

/**
 * Find Slack user ID for the currently logged-in user (using cache)
 */
export const getCurrentUserSlackId = async (displayName) => {
    try {
        // Ensure users are loaded
        await slackUserCache.loadUsers();

        // Find user in cache
        const user = slackUserCache.findUserByName(displayName);

        if (user) {
            return `<@${user.id}>`;
        }

        // No strong match
        return null;

    } catch (error) {
        console.error("Error finding Slack user:", error);
        await reportError(error, {
            context: 'getCurrentUserSlackId',
            displayName
        });
        throw error;
    }
};

/**
 * Format Slack text with proper links and mentions
 */
export const formatSlackText = (text) => {
    if (!text) return '';

    let formatted = text;

    // Convert user mentions: <@U12345> -> display name
    formatted = formatted.replace(/<@([A-Z0-9]+)>/g, (match, userId) => {
        const user = slackUserCache.getUserById(userId);
        if (user) {
            return `@${user.displayName || user.realName || user.name}`;
        }
        return match;
    });

    // Convert links: <http://example.com|Example> -> clickable link
    formatted = formatted.replace(/<(https?:\/\/[^|>]+)\|([^>]+)>/g, (match, url, text) => {
        return text; // In plain text, just show the link text
    });

    // Convert bare links: <http://example.com> -> clickable link
    formatted = formatted.replace(/<(https?:\/\/[^>]+)>/g, (match, url) => {
        return url; // Show the full URL
    });

    return formatted;
};

/**
 * Convert formatted text to clickable JSX elements
 */
export const renderSlackText = (text) => {
    if (!text) return null;

    const parts = [];
    let lastIndex = 0;

    // Match user mentions and links
    const regex = /<@([A-Z0-9]+)>|<(https?:\/\/[^|>]+)\|([^>]+)>|<(https?:\/\/[^>]+)>/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
        // Add text before match
        if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
        }

        if (match[1]) {
            // User mention
            const userId = match[1];
            const user = slackUserCache.getUserById(userId);
            parts.push(
                <span key={match.index} className="text-blue-600 font-semibold">
                    @{user ? (user.displayName || user.realName || user.name) : userId}
                </span>
            );
        } else if (match[2] && match[3]) {
            // Link with text
            parts.push(
                <a
                    key={match.index}
                    href={match[2]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                >
                    {match[3]}
                </a>
            );
        } else if (match[4]) {
            // Bare link
            parts.push(
                <a
                    key={match.index}
                    href={match[4]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                >
                    {match[4]}
                </a>
            );
        }

        lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
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
                text: `*🗑️ Purchase Deleted*\nBy: ${userName}\n\n_This request has been removed from the system._`
            }
        }
    ];
};