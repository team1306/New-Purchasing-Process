import { useState, useEffect } from 'react';
import { getThreadReplies } from '../utils/slackApi';

/**
 * Hook for managing Slack thread replies with async loading
 */
export const useSlack = (slackMessageId) => {
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadReplies = async () => {
        if (!slackMessageId) return;

        try {
            setLoading(true);
            setError(null);
            const threadReplies = await getThreadReplies(slackMessageId);
            setReplies(threadReplies);
        } catch (err) {
            console.error('Error loading Slack replies:', err);
            setError('Failed to load Slack comments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Load replies asynchronously when slackMessageId changes
        if (slackMessageId) {
            // Delay loading slightly to not block initial render
            const timer = setTimeout(() => {
                loadReplies();
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [slackMessageId]);

    return {
        replies,
        loading,
        error,
        refresh: loadReplies
    };
};