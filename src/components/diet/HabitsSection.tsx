/**
 * HabitsSection - Manages user habits with AI-powered calorie tracking
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Check, X, Loader2, Flame, Trash2, AlertCircle, Target, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createHabit, getUserHabits, toggleHabitCompletion, deleteHabit, updateHabitCalories } from '../../services/habitsService';
import { analyzeCalorieBurn } from '../../services/calorieBurnService';
import { Habit, HabitType } from '../../types/habits';

export const HabitsSection: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [description, setDescription] = useState('');
  const [habitType, setHabitType] = useState<HabitType>('daily');

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await getUserHabits();
      if (result.success && result.data) {
        setHabits(result.data);
      } else {
        setError(result.error || 'Failed to load habits');
      }
    } catch (error) {
      console.error('Error fetching habits:', error);
      setError('An unexpected error occurred while loading habits');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetForm = () => {
    setDescription('');
    setHabitType('daily');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!description.trim()) {
        setError('Please enter a habit description');
        setIsSubmitting(false);
        return;
      }

      // Create the habit first
      const createResult = await createHabit({
        description,
        habit_type: habitType,
      });

      if (!createResult.success || !createResult.data) {
        setError(createResult.error || 'Failed to create habit');
        setIsSubmitting(false);
        return;
      }

      // Analyze calories burned with AI
      const analysisResult = await analyzeCalorieBurn(description);

      if (analysisResult.success && analysisResult.caloriesBurned) {
        await updateHabitCalories(createResult.data.id, analysisResult.caloriesBurned);
      }

      // Refresh the list
      await fetchHabits();
      resetForm();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error creating habit:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleCompletion = async (habitId: string, currentStatus: boolean) => {
    const result = await toggleHabitCompletion(habitId, !currentStatus);
    if (result.success) {
      await fetchHabits();
    }
  };

  const handleDelete = async (habitId: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      const result = await deleteHabit(habitId);
      if (result.success) {
        await fetchHabits();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-lg p-5"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-linear-to-br from-blue-100 to-blue-200">
            <Flame size={16} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Habits</h2>
            <p className="text-[10px] text-gray-500 mt-0.5">
              {habits.filter(h => h.is_completed).length} completed today
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsFormOpen(!isFormOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all shadow-sm text-sm ${isFormOpen
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            : 'bg-linear-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
            }`}
        >
          {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isFormOpen ? 'Cancel' : 'Add Habit'}
        </motion.button>
      </motion.div>

      {/* Error Display */}
      {error && !isFormOpen && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError('')}
            className="ml-auto text-red-400 hover:text-red-600 transition-colors"
            aria-label="Dismiss error"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Add Habit Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Habit Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., Morning run, Yoga session, Gym workout"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none transition-all text-sm"
              disabled={isSubmitting}
              required
            />
            <p className="text-xs text-gray-500 mt-1">AI will calculate calories burned for this activity</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Habit Type</label>
            <select
              value={habitType}
              onChange={(e) => setHabitType(e.target.value as HabitType)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none transition-all text-sm"
              disabled={isSubmitting}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2.5 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Create Habit'
            )}
          </button>
        </form>
      )}

      {/* Habits List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-12">
          <Flame size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No habits yet. Create your first habit!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className={`group p-3 rounded-xl border transition-all duration-200 ${habit.is_completed
                ? 'bg-green-50 border-green-200'
                : 'bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-200'
                }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleCompletion(habit.id, habit.is_completed)}
                  className={`shrink-0 w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${habit.is_completed
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300 hover:border-blue-500'
                    }`}
                >
                  {habit.is_completed && <Check className="w-4 h-4 text-white" />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${habit.is_completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {habit.description}
                  </p>

                  <div className="flex items-center gap-2 mt-1.5 text-xs">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${habit.habit_type === 'daily' ? 'bg-blue-100 text-blue-700' :
                      habit.habit_type === 'weekly' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                      {habit.habit_type}
                    </span>
                    {habit.calories_burned && (
                      <span className="flex items-center gap-1 text-orange-600 font-semibold">
                        <Flame className="w-3 h-3" />
                        {habit.calories_burned} cal
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(habit.id)}
                  className="shrink-0 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
