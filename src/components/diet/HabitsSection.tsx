/**
 * HabitsSection Component
 * Manages user habits with AI-powered calorie tracking
 */

import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Loader2, Flame, Trash2 } from 'lucide-react';
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

  const fetchHabits = async () => {
    setIsLoading(true);
    const result = await getUserHabits();
    if (result.success && result.data) {
      setHabits(result.data);
    }
    setIsLoading(false);
  };

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

  const getHabitTypeColor = (type: HabitType) => {
    switch (type) {
      case 'daily': return 'bg-blue-100 text-blue-700';
      case 'weekly': return 'bg-green-100 text-green-700';
      case 'monthly': return 'bg-purple-100 text-purple-700';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Habits</h2>
          <p className="text-sm text-gray-500 mt-1">Track your daily, weekly, and monthly habits</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all shadow-sm"
        >
          {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isFormOpen ? 'Cancel' : 'Add Habit'}
        </button>
      </div>

      {/* Add Habit Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-xl space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Habit Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., Morning run, Yoga session, Gym workout"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={isSubmitting}
              required
            />
            <p className="text-xs text-gray-500 mt-1">AI will calculate calories burned for this activity</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Habit Type</label>
            <select
              value={habitType}
              onChange={(e) => setHabitType(e.target.value as HabitType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
          <p className="text-gray-500">No habits yet. Create your first habit!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className={`p-4 border rounded-xl transition-all ${
                habit.is_completed
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-white border-gray-300 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleCompletion(habit.id, habit.is_completed)}
                  className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${
                    habit.is_completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 hover:border-blue-500'
                  }`}
                >
                  {habit.is_completed && <Check className="w-4 h-4 text-white" />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${habit.is_completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {habit.description}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                    <span className={`px-2 py-1 rounded-full ${getHabitTypeColor(habit.habit_type)}`}>
                      {habit.habit_type}
                    </span>
                    {habit.calories_burned && (
                      <span className="flex items-center gap-1 text-orange-600 font-medium">
                        <Flame className="w-3 h-3" />
                        {habit.calories_burned} cal
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(habit.id)}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
