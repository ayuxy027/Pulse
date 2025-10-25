import React, { useState } from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';

/**
 * UpcomingTasks - Displays a list of diet-related tasks with completion tracking
 * Features task items with checkboxes, time, and priority indicators
 */
interface DietTask {
    id: string;
    title: string;
    time: string;
    priority: 'high' | 'medium' | 'low';
    completed: boolean;
}

interface UpcomingTasksProps {
    tasks?: DietTask[];
    onTaskToggle?: (taskId: string) => void;
}

const UpcomingTasks: React.FC<UpcomingTasksProps> = ({
    tasks: propTasks,
    onTaskToggle
}) => {
    // Default tasks if none provided
    const defaultTasks: DietTask[] = [
        {
            id: '1',
            title: 'Drink 500ml water before lunch',
            time: '12:30 PM',
            priority: 'high',
            completed: false
        },
        {
            id: '2',
            title: 'Take vitamin supplements',
            time: '2:00 PM',
            priority: 'medium',
            completed: false
        },
        {
            id: '3',
            title: 'Prepare dinner ingredients',
            time: '5:30 PM',
            priority: 'low',
            completed: false
        },
        {
            id: '4',
            title: 'Evening protein shake',
            time: '6:00 PM',
            priority: 'medium',
            completed: false
        }
    ];

    const [tasks, setTasks] = useState<DietTask[]>(propTasks || defaultTasks);

    const handleToggle = (taskId: string) => {
        setTasks(prev =>
            prev.map(task =>
                task.id === taskId
                    ? { ...task, completed: !task.completed }
                    : task
            )
        );
        onTaskToggle?.(taskId);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'text-red-600 bg-red-50';
            case 'medium':
                return 'text-yellow-600 bg-yellow-50';
            case 'low':
                return 'text-green-600 bg-green-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const incompleteTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                    Upcoming Tasks
                </h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">
                        {incompleteTasks.length} pending
                    </span>
                    {incompleteTasks.length > 0 && (
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                    )}
                </div>
            </div>

            {/* Tasks Container with Dashed Border */}
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 space-y-3">
                {tasks.length === 0 ? (
                    <div className="text-center py-8">
                        <AlertCircle size={40} className="text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">No tasks scheduled</p>
                    </div>
                ) : (
                    <>
                        {/* Incomplete Tasks */}
                        {incompleteTasks.map((task) => (
                            <div
                                key={task.id}
                                className="group flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                                onClick={() => handleToggle(task.id)}
                            >
                                {/* Custom Checkbox */}
                                <div className="flex-shrink-0">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${task.completed
                                            ? 'bg-green-500 border-green-500'
                                            : 'border-gray-300 group-hover:border-green-500'
                                        }`}>
                                        {task.completed && (
                                            <Check size={14} className="text-white" />
                                        )}
                                    </div>
                                </div>

                                {/* Task Content */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium transition-all duration-200 ${task.completed
                                            ? 'text-gray-400 line-through'
                                            : 'text-gray-900'
                                        }`}>
                                        {task.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <Clock size={12} />
                                            <span>{task.time}</span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                </div>

                                {/* Hover Indicator */}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <div className="w-1 h-8 rounded-full bg-gradient-to-b from-green-400 to-green-600"></div>
                                </div>
                            </div>
                        ))}

                        {/* Completed Tasks - Collapsed Section */}
                        {completedTasks.length > 0 && (
                            <>
                                <div className="border-t border-gray-100 my-3"></div>
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
                                        Completed ({completedTasks.length})
                                    </p>
                                    {completedTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="group flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer opacity-60"
                                            onClick={() => handleToggle(task.id)}
                                        >
                                            <div className="flex-shrink-0">
                                                <div className="w-5 h-5 rounded border-2 bg-green-500 border-green-500 flex items-center justify-center">
                                                    <Check size={14} className="text-white" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-400 line-through">
                                                    {task.title}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Task Summary */}
            {tasks.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-semibold text-gray-900">
                            {completedTasks.length}/{tasks.length} completed
                        </span>
                    </div>
                    <div className="mt-2 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                            className="h-full bg-linear-to-r from-green-400 to-green-600 rounded-full transition-all duration-500 ease-out"
                            style={{
                                width: `${tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0}%`
                            }}
                        ></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpcomingTasks;
