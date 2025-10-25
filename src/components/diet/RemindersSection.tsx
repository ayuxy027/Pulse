/**
 * RemindersSection Component
 * Manages one-time reminders that auto-delete when checked
 */

import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Loader2, Clock, Calendar, Trash2, Bell } from 'lucide-react';
import { createReminder, getUserReminders, completeReminder, deleteReminder } from '../../services/remindersService';
import { Reminder } from '../../types/habits';

export const RemindersSection: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [description, setDescription] = useState('');
  const [reminderDate, setReminderDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [reminderTime, setReminderTime] = useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    setIsLoading(true);
    const result = await getUserReminders();
    if (result.success && result.data) {
      setReminders(result.data);
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setDescription('');
    const now = new Date();
    setReminderDate(now.toISOString().split('T')[0]);
    setReminderTime(now.toTimeString().slice(0, 5));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!description.trim()) {
        setError('Please enter a reminder description');
        setIsSubmitting(false);
        return;
      }

      const result = await createReminder({
        description,
        reminder_date: reminderDate,
        reminder_time: reminderTime,
      });

      if (!result.success) {
        setError(result.error || 'Failed to create reminder');
        setIsSubmitting(false);
        return;
      }

      await fetchReminders();
      resetForm();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error creating reminder:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async (reminderId: string) => {
    const result = await completeReminder(reminderId);
    if (result.success) {
      await fetchReminders();
    }
  };

  const handleDelete = async (reminderId: string) => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      const result = await deleteReminder(reminderId);
      if (result.success) {
        await fetchReminders();
      }
    }
  };

  const isOverdue = (date: string, time: string) => {
    const reminderDateTime = new Date(`${date}T${time}`);
    return reminderDateTime < new Date();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reminders</h2>
          <p className="text-sm text-gray-500 mt-1">Set one-time reminders for your tasks</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-all shadow-sm"
        >
          {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isFormOpen ? 'Cancel' : 'Add Reminder'}
        </button>
      </div>

      {/* Add Reminder Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-xl space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reminder Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., Take medication, Call doctor, Drink water"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Reminder'
            )}
          </button>
        </form>
      )}

      {/* Reminders List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : reminders.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No reminders yet. Create your first reminder!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder) => {
            const overdue = isOverdue(reminder.reminder_date, reminder.reminder_time);
            
            return (
              <div
                key={reminder.id}
                className={`p-4 border rounded-xl transition-all ${
                  overdue
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-gray-300 hover:border-purple-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleComplete(reminder.id)}
                    className="flex-shrink-0 w-6 h-6 rounded-lg border-2 border-gray-300 hover:border-purple-500 transition-all flex items-center justify-center hover:bg-purple-50"
                  >
                    <Check className="w-4 h-4 text-transparent hover:text-purple-500" />
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{reminder.description}</p>
                    
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className={`flex items-center gap-1 ${overdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                        <Calendar className="w-3 h-3" />
                        {formatDate(reminder.reminder_date)}
                      </span>
                      <span className={`flex items-center gap-1 ${overdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                        <Clock className="w-3 h-3" />
                        {reminder.reminder_time}
                      </span>
                      {overdue && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(reminder.id)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
