import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Database, Utensils, Clock, User, BarChart3, Calendar, Dumbbell, Settings } from 'lucide-react';

interface ToolUsageNotificationProps {
    toolsUsed: string[];
    isFromAI?: boolean;
}

const ToolUsageNotification: React.FC<ToolUsageNotificationProps> = ({
    toolsUsed,
    isFromAI = true
}) => {
    const getToolIcon = (tool: string) => {
        switch (tool) {
            case 'profile': return <User className="w-4 h-4" />;
            case 'health': return <BarChart3 className="w-4 h-4" />;
            case 'today': return <Calendar className="w-4 h-4" />;
            case 'meals': return <Utensils className="w-4 h-4" />;
            case 'habits': return <Dumbbell className="w-4 h-4" />;
            case 'reminders': return <Clock className="w-4 h-4" />;
            default: return <Settings className="w-4 h-4" />;
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

    const getTableName = (tool: string) => {
        switch (tool) {
            case 'profile': return 'user_profiles';
            case 'health': return 'health_metrics';
            case 'today': return 'daily_tracking';
            case 'meals': return 'diet_entries';
            case 'habits': return 'habits';
            case 'reminders': return 'reminders';
            default: return tool;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`flex ${isFromAI ? 'justify-start' : 'justify-end'} mb-2`}
        >
            <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm border ${isFromAI
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 text-blue-800'
                    : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 text-gray-700'
                }`}>
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg ${isFromAI ? 'bg-blue-100' : 'bg-gray-200'
                        }`}>
                        <Bot className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-medium">
                        Previous query leveraged {toolsUsed.length} tool call{toolsUsed.length > 1 ? 's' : ''}
                    </span>
                </div>

                {/* Tool Icons and Names */}
                <div className="flex flex-wrap gap-2">
                    {toolsUsed.map((tool, index) => (
                        <motion.div
                            key={tool}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${isFromAI
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-200 text-gray-600'
                                }`}
                        >
                            <div className={`p-0.5 rounded ${isFromAI ? 'bg-blue-200' : 'bg-gray-300'
                                }`}>
                                {getToolIcon(tool)}
                            </div>
                            <span>{getToolName(tool)}</span>
                        </motion.div>
                    ))}
                </div>

                {/* Footer with table names */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-2 text-xs text-gray-500"
                >
                    from {toolsUsed.map(tool => getTableName(tool)).join(' and ')} table{toolsUsed.length > 1 ? 's' : ''}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ToolUsageNotification;
