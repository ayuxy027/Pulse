import React, { useState } from 'react';
import { Plus, Calendar, Clock, Flag, Sparkles } from 'lucide-react';

/**
 * AddTasksForm - Form component for adding new diet-related tasks
 * Features input fields for task details with validation and submission
 */
interface TaskFormData {
    title: string;
    time: string;
    priority: 'high' | 'medium' | 'low';
    date: string;
}

interface AddTasksFormProps {
    onTaskAdd?: (task: TaskFormData) => void;
}

const AddTasksForm: React.FC<AddTasksFormProps> = ({ onTaskAdd }) => {
    const [formData, setFormData] = useState<TaskFormData>({
        title: '',
        time: '',
        priority: 'medium',
        date: new Date().toISOString().split('T')[0]
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.title.trim() || !formData.time) {
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            onTaskAdd?.(formData);
            
            // Reset form
            setFormData({
                title: '',
                time: '',
                priority: 'medium',
                date: new Date().toISOString().split('T')[0]
            });
            
            setIsSubmitting(false);
            setSuccessMessage(true);
            
            // Hide success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage(false);
            }, 3000);
        }, 500);
    };

    const handleChange = (field: keyof TaskFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sticky top-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                    Add Tasks
                </h3>
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
                    <Sparkles size={18} className="text-purple-600" />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Task Title Input */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                        Task Title
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="e.g., Drink water, Take vitamins..."
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-200 text-sm placeholder:text-gray-400"
                        required
                    />
                </div>

                {/* Date Input */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Calendar size={14} />
                        Date
                    </label>
                    <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleChange('date', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-200 text-sm"
                        required
                    />
                </div>

                {/* Time Input */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Clock size={14} />
                        Time
                    </label>
                    <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => handleChange('time', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-200 text-sm"
                        required
                    />
                </div>

                {/* Priority Selection */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Flag size={14} />
                        Priority
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            onClick={() => handleChange('priority', 'high')}
                            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                formData.priority === 'high'
                                    ? 'bg-red-500 text-white shadow-md shadow-red-200'
                                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                            }`}
                        >
                            High
                        </button>
                        <button
                            type="button"
                            onClick={() => handleChange('priority', 'medium')}
                            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                formData.priority === 'medium'
                                    ? 'bg-yellow-500 text-white shadow-md shadow-yellow-200'
                                    : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                            }`}
                        >
                            Medium
                        </button>
                        <button
                            type="button"
                            onClick={() => handleChange('priority', 'low')}
                            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                formData.priority === 'low'
                                    ? 'bg-green-500 text-white shadow-md shadow-green-200'
                                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                        >
                            Low
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting || !formData.title.trim() || !formData.time}
                    className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                        isSubmitting || !formData.title.trim() || !formData.time
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-200 hover:shadow-xl'
                    }`}
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Adding...</span>
                        </>
                    ) : (
                        <>
                            <Plus size={18} />
                            <span>Add Task</span>
                        </>
                    )}
                </button>

                {/* Success Message */}
                {successMessage && (
                    <div className="p-3 rounded-lg bg-green-50 border border-green-200 animate-fade-in">
                        <p className="text-sm text-green-800 font-medium text-center">
                            ✓ Task added successfully!
                        </p>
                    </div>
                )}
            </form>

            {/* Quick Tips Section */}
            <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Quick Tips
                </h4>
                <div className="space-y-2">
                    <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0"></div>
                        <p className="text-xs text-gray-600">
                            Set reminders for hydration every 2 hours
                        </p>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-1.5 flex-shrink-0"></div>
                        <p className="text-xs text-gray-600">
                            Plan meals ahead for better tracking
                        </p>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0"></div>
                        <p className="text-xs text-gray-600">
                            High priority tasks appear first
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddTasksForm;
