import { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Button, Spinner, Alert } from '../ui';
import { useSlack } from '../../hooks/useSlack';
import { animations } from '../../styles/design-tokens';

export default function SlackThreadSection({ purchase, onCreateThread, creatingThread }) {
    const [expanded, setExpanded] = useState(false);
    const { replies, loading, error } = useSlack(purchase['Slack Message ID']);

    const formatTimestamp = (ts) => {
        const date = new Date(parseFloat(ts) * 1000);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    // If no Slack message ID, show create button
    if (!purchase['Slack Message ID']) {
        return (
            <div className="border-t pt-4 md:pt-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                        <MessageSquare className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-800 mb-1">
                                Slack Thread
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                                This purchase doesn't have a Slack thread yet. Create one to enable team discussion and notifications.
                            </p>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={onCreateThread}
                                loading={creatingThread}
                                disabled={creatingThread}
                                icon={MessageSquare}
                            >
                                Create Slack Thread
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // If has Slack message ID, show expandable thread
    return (
        <div className="border-t pt-4 md:pt-6">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-3 md:p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
                <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <div className="text-left">
                        <h3 className="text-base font-semibold text-gray-800">
                            Slack Thread
                        </h3>
                        <p className="text-sm text-gray-600">
                            {loading ? 'Loading comments...' : `${replies.length} comment${replies.length !== 1 ? 's' : ''}`}
                        </p>
                    </div>
                </div>
                {expanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
                )}
            </button>

            {expanded && (
                <div className={`mt-3 space-y-3 ${animations.slideDown}`}>
                    {/* Link to open in Slack */}
                    <a
                        href={`slack://channel?team=YOUR_TEAM_ID&id=${import.meta.env.VITE_SLACK_CHANNEL_ID}&message=${purchase['Slack Message ID']}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200"
                    >
                        Open in Slack
                        <ExternalLink className="w-4 h-4" />
                    </a>

                    {/* Loading state */}
                    {loading && (
                        <div className="flex items-center justify-center p-4">
                            <Spinner size="sm" />
                            <span className="ml-2 text-sm text-gray-600">Loading comments...</span>
                        </div>
                    )}

                    {/* Error state */}
                    {error && (
                        <Alert type="error" className="text-sm">
                            {error}
                        </Alert>
                    )}

                    {/* Replies list */}
                    {!loading && !error && (
                        <>
                            {replies.length === 0 ? (
                                <div className="text-center p-6 bg-gray-50 rounded-lg">
                                    <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">No comments yet</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Comments from team members in Slack will appear here
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {replies.map((reply, index) => (
                                        <div
                                            key={reply.ts || index}
                                            className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 hover:shadow-sm transition-shadow duration-200"
                                        >
                                            <div className="flex items-start gap-3">
                                                {reply.user && (
                                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                                        {reply.user.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-baseline gap-2 mb-1">
                                                        <p className="font-semibold text-sm text-gray-800">
                                                            {reply.user || 'Unknown User'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {formatTimestamp(reply.ts)}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                                                        {reply.text}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}