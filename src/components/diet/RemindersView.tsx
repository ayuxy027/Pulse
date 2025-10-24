import React, { useState, useEffect } from 'react';
import { Bell, Clock, Calendar, Trash2, Volume2, VolumeX } from 'lucide-react';
import { fetchReminders, toggleReminder } from '../../services/dietDataService';
import { DietReminder } from '../../types/diet';

/**
 * RemindersView - Manage diet-related reminders and notifications
 * Displays all reminders with enable/disable toggle
 */
const RemindersView: React.FC = () => {
    const [reminders, setReminders] = useState<DietReminder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReminders();
    }, []);

    const loadReminders = async () => {
        try {
            setLoading(true);
            const fetchedReminders = await fetchReminders();
            setReminders(fetchedReminders);
        } catch (error) {
            console.error('Error loading reminders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (reminderId: string) => {
        try {
            const updatedReminder = await toggleReminder(reminderId);
            setReminders(prev =>
                prev.map(r => r.id === reminderId ? updatedReminder : r)
            );
        } catch (error) {
            console.error('Error toggling reminder:', error);
        }
    };

    const getFrequencyBadgeColor = (frequency: string) => {
        switch (frequency) {
            case 'daily':
                return 'bg-orange-100 text-orange-700';
            case 'weekly':
                return 'bg-blue-100 text-blue-700';
            case 'once':
                return 'bg-gray-100 text-gray-700';
            default:
                return 'bg-green-100 text-green-700';
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-orange-100">
                        <Bell size={16} className="text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Reminders</h2>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                            {reminders.filter(r => r.enabled).length} active
                        </p>
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Column - Add Reminder Form */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Add New Reminder</h3>
                    <form className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Title
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Drink water"
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-100 outline-none transition-all text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                                    <Clock size={12} />
                                    Time
                                </label>
                                <input
                                    type="time"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-100 outline-none transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                                    <Calendar size={12} />
                                    Frequency
                                </label>
                                <select className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-100 outline-none transition-all text-sm">
                                    <option>Daily</option>
                                    <option>Weekly</option>
                                    <option>Once</option>
                                    <option>Custom</option>
                                </select>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold text-sm"
                        >
                            Create Reminder
                        </button>
                    </form>

                    {/* Quick Tips */}
                    <div className="mt-6 bg-orange-50 rounded-xl border border-orange-100 p-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Quick Tips</h4>
                        <div className="space-y-1.5">
                            <div className="flex items-start gap-1.5">
                                <div className="w-1 h-1 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></div>
                                <p className="text-xs text-gray-700">
                                    Set reminders for regular hydration
                                </p>
                            </div>
                            <div className="flex items-start gap-1.5">
                                <div className="w-1 h-1 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></div>
                                <p className="text-xs text-gray-700">
                                    Never miss your meal times
                                </p>
                            </div>
                            <div className="flex items-start gap-1.5">
                                <div className="w-1 h-1 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></div>
                                <p className="text-xs text-gray-700">
                                    Customize based on your schedule
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - All Reminders List */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">All Reminders</h3>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block w-6 h-6 border-3 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                        </div>
                    ) : reminders.length === 0 ? (
                        <div className="text-center py-8">
                            <Bell size={32} className="text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">No reminders yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                            {reminders.map((reminder) => (
                                <div
                                    key={reminder.id}
                                    className={`group p-3 rounded-xl border transition-all duration-200 ${
                                        reminder.enabled
                                            ? 'border-gray-200 bg-white hover:bg-orange-50'
                                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Enable/Disable Toggle */}
                                        <button
                                            onClick={() => handleToggle(reminder.id)}
                                            className={`w-10 h-6 rounded-full transition-all duration-200 relative flex-shrink-0 ${
                                                reminder.enabled ? 'bg-orange-500' : 'bg-gray-300'
                                            }`}
                                        >
                                            <div
                                                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                                                    reminder.enabled ? 'translate-x-4' : 'translate-x-0.5'
                                                }`}
                                            ></div>
                                        </button>

                                        {/* Reminder Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h4 className={`text-sm font-semibold truncate ${
                                                    reminder.enabled ? 'text-gray-900' : 'text-gray-500'
                                                }`}>
                                                    {reminder.title}
                                                </h4>
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${
                                                    getFrequencyBadgeColor(reminder.frequency)
                                                }`}>
                                                    {reminder.frequency}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    <span>{reminder.time}</span>
                                                </div>
                                                {reminder.enabled ? (
                                                    <div className="flex items-center gap-1 text-orange-600">
                                                        <Volume2 size={12} />
                                                        <span className="text-[10px] font-medium">Active</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-gray-400">
                                                        <VolumeX size={12} />
                                                        <span className="text-[10px] font-medium">Muted</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RemindersView;
