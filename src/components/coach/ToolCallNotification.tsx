import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Target, CheckCircle, User, BarChart3, Calendar, Utensils, Dumbbell, Clock, Settings } from 'lucide-react';

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
            case 'profile': return <User className="w-5 h-5 text-gray-600" />;
            case 'health': return <BarChart3 className="w-5 h-5 text-gray-600" />;
            case 'today': return <Calendar className="w-5 h-5 text-gray-600" />;
            case 'meals': return <Utensils className="w-5 h-5 text-gray-600" />;
            case 'habits': return <Dumbbell className="w-5 h-5 text-gray-600" />;
            case 'reminders': return <Clock className="w-5 h-5 text-gray-600" />;
            default: return <Settings className="w-5 h-5 text-gray-600" />;
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
            initial={{ opacity: 0, y: 5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`p-3 rounded-lg border ${isAutoDetected
                ? 'bg-gray-50 border-gray-200'
                : 'bg-gray-50 border-gray-200'
                }`}
        >
            {/* Compact Header */}
            <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-gray-200 rounded-lg">
                    {isAutoDetected ? (
                        <Bot className="w-4 h-4 text-gray-600" />
                    ) : (
                        <Target className="w-4 h-4 text-gray-600" />
                    )}
                </div>
                <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700">
                        {isAutoDetected ? 'Auto-detected tools' : 'Fetching data'}
                    </span>
                </div>
            </div>

            {/* Compact Tool List */}
            <div className="flex flex-wrap gap-2">
                {toolCalls.map((toolCall, index) => (
                    <motion.div
                        key={toolCall.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200"
                    >
                        <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center">
                            {getToolIcon(toolCall.tool)}
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                            {getToolName(toolCall.tool)}
                        </span>
                        {toolCall.status === 'completed' && (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Compact Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-2 text-center"
            >
                <span className="text-xs text-gray-500">
                    {isAutoDetected ? 'Personalized advice ready' : 'Analyzing data...'}
                </span>
            </motion.div>
        </motion.div>
    );
};

export default ToolCallNotification;
