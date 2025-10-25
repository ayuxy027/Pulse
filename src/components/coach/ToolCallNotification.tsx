import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Database, CheckCircle, Zap, Brain } from 'lucide-react';

interface ToolCallNotificationProps {
    toolCalls: Array<{
        id: string;
        tool: string;
        status: 'initiated' | 'fetching' | 'completed';
    }>;
    isAutoDetected?: boolean;
}

const ToolCallNotification: React.FC<ToolCallNotificationProps> = ({
    toolCalls,
    isAutoDetected = false
}) => {
    const getToolIcon = (tool: string) => {
        switch (tool) {
            case 'profile': return '👤';
            case 'health': return '📊';
            case 'today': return '📅';
            case 'meals': return '🍽️';
            case 'habits': return '💪';
            case 'reminders': return '⏰';
            default: return '🔧';
        }
    };

    const getToolName = (tool: string) => {
        switch (tool) {
            case 'profile': return 'Profile Data';
            case 'health': return 'Health Metrics';
            case 'today': return 'Today\'s Tracking';
            case 'meals': return 'Recent Meals';
            case 'habits': return 'Habits';
            case 'reminders': return 'Reminders';
            default: return tool;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`mt-4 p-4 rounded-2xl border-2 ${isAutoDetected
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                    : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
                }`}
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl ${isAutoDetected ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                    {isAutoDetected ? (
                        <Brain className="w-5 h-5 text-blue-600" />
                    ) : (
                        <Sparkles className="w-5 h-5 text-gray-600" />
                    )}
                </div>
                <div>
                    <h4 className={`font-semibold text-sm ${isAutoDetected ? 'text-blue-800' : 'text-gray-800'
                        }`}>
                        {isAutoDetected ? '🤖 Auto-detected your needs' : '✨ Fetching your data'}
                    </h4>
                    <p className={`text-xs ${isAutoDetected ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                        {isAutoDetected
                            ? 'I automatically detected what data you need for this question'
                            : 'Getting relevant information to help you better'
                        }
                    </p>
                </div>
            </div>

            {/* Tool Calls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {toolCalls.map((toolCall, index) => (
                    <motion.div
                        key={toolCall.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center gap-3 p-3 rounded-xl border ${isAutoDetected
                                ? 'bg-white/60 border-blue-200'
                                : 'bg-white/60 border-gray-200'
                            }`}
                    >
                        {/* Tool Icon */}
                        <div className="text-2xl">
                            {getToolIcon(toolCall.tool)}
                        </div>

                        {/* Tool Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className={`font-medium text-sm ${isAutoDetected ? 'text-blue-800' : 'text-gray-800'
                                    }`}>
                                    {getToolName(toolCall.tool)}
                                </span>

                                {/* Status Indicator */}
                                <div className="flex items-center gap-1">
                                    {toolCall.status === 'initiated' && (
                                        <>
                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                            <span className="text-xs text-gray-500">Starting...</span>
                                        </>
                                    )}
                                    {toolCall.status === 'fetching' && (
                                        <>
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                                            <span className="text-xs text-gray-500">Fetching...</span>
                                        </>
                                    )}
                                    {toolCall.status === 'completed' && (
                                        <>
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-xs text-green-600 font-medium">✓ Done</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Status Icon */}
                        <div className="flex-shrink-0">
                            {toolCall.status === 'initiated' && (
                                <Zap className="w-4 h-4 text-yellow-500" />
                            )}
                            {toolCall.status === 'fetching' && (
                                <Database className="w-4 h-4 text-blue-500 animate-pulse" />
                            )}
                            {toolCall.status === 'completed' && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Footer Message */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`mt-3 p-2 rounded-lg text-center ${isAutoDetected
                        ? 'bg-blue-100/50 text-blue-700'
                        : 'bg-gray-100/50 text-gray-700'
                    }`}
            >
                <span className="text-xs font-medium">
                    {isAutoDetected
                        ? '🎯 Using this data to give you the best personalized advice!'
                        : '📊 Analyzing your data to provide personalized insights...'
                    }
                </span>
            </motion.div>
        </motion.div>
    );
};

export default ToolCallNotification;
