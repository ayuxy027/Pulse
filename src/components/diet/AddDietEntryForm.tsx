/**
 * AddDietEntryForm Component
 * Modal form for adding water intake or meals to the diet tracker
 */

import React, { useState } from 'react';
import { X, Droplet, Utensils, Loader2 } from 'lucide-react';
import { createDietEntry, updateMealNutrition } from '../../services/dietEntryService';
import { analyzeMealNutrition } from '../../services/nutritionAnalysisService';
import { MealType } from '../../types/dietEntry';

interface AddDietEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type EntryMode = 'water' | 'meal';

export const AddDietEntryForm: React.FC<AddDietEntryFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<EntryMode>('water');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  // Water form state
  const [waterAmount, setWaterAmount] = useState<number>(1);

  // Meal form state
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [mealDescription, setMealDescription] = useState('');
  const [mealDate, setMealDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [mealTime, setMealTime] = useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  });

  const resetForm = () => {
    setWaterAmount(1);
    setMealType('breakfast');
    setMealDescription('');
    const now = new Date();
    setMealDate(now.toISOString().split('T')[0]);
    setMealTime(now.toTimeString().slice(0, 5));
    setError('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'water') {
        // Add water entry
        const result = await createDietEntry({
          entry_type: 'water',
          water_amount: waterAmount,
        });

        if (!result.success) {
          setError(result.error || 'Failed to add water entry');
          setIsSubmitting(false);
          return;
        }
      } else {
        // Add meal entry
        if (!mealDescription.trim()) {
          setError('Please enter a meal description');
          setIsSubmitting(false);
          return;
        }

        // First, create the meal entry without nutrition
        const createResult = await createDietEntry({
          entry_type: 'meal',
          meal_type: mealType,
          meal_description: mealDescription,
          meal_date: mealDate,
          meal_time: mealTime,
        });

        if (!createResult.success || !createResult.data) {
          setError(createResult.error || 'Failed to add meal entry');
          setIsSubmitting(false);
          return;
        }

        // Then, analyze the meal and update with nutrition info
        const analysisResult = await analyzeMealNutrition(mealDescription);

        if (analysisResult.success && analysisResult.nutrition) {
          // Update the entry with nutrition data
          await updateMealNutrition(createResult.data.id, analysisResult.nutrition);
        } else {
          console.warn('Failed to analyze nutrition:', analysisResult.error);
          // Entry is still saved, just without nutrition data
        }
      }

      // Success!
      resetForm();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error submitting diet entry:', error);
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-green-50">
          <h2 className="text-xl font-bold text-gray-900">Add Diet Entry</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-white/50"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="px-6 pt-5 pb-4 bg-gray-50/50">
          <div className="flex gap-2 p-1 bg-white rounded-xl shadow-sm border border-gray-200">
            <button
              type="button"
              onClick={() => setMode('water')}
              disabled={isSubmitting}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all ${
                mode === 'water'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Droplet className="w-4 h-4" />
              <span className="text-sm">Water</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('meal')}
              disabled={isSubmitting}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all ${
                mode === 'meal'
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span className="text-sm">Meal</span>
            </button>
          </div>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <span className="text-red-500 font-semibold">!</span>
              <span>{error}</span>
            </div>
          )}

          {mode === 'water' ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                  Amount (100ml cups)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={waterAmount}
                  onChange={(e) => setWaterAmount(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                  disabled={isSubmitting}
                  required
                />
                <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <Droplet className="w-3 h-3" />
                  {waterAmount} cup(s) = {waterAmount * 100}ml
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                  Meal Type
                </label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as MealType)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white"
                  disabled={isSubmitting}
                  required
                >
                  <option value="breakfast">🌅 Breakfast</option>
                  <option value="lunch">☀️ Lunch</option>
                  <option value="snacks">🍪 Snacks</option>
                  <option value="dinner">🌙 Dinner</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={mealDate}
                    onChange={(e) => setMealDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                    Time
                  </label>
                  <input
                    type="time"
                    value={mealTime}
                    onChange={(e) => setMealTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                  Meal Description
                </label>
                <textarea
                  value={mealDescription}
                  onChange={(e) => setMealDescription(e.target.value)}
                  placeholder="E.g., 2 chapati with dal, rice, and vegetables"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all resize-none bg-white"
                  disabled={isSubmitting}
                  required
                />
                <p className="mt-2 text-xs text-gray-500 flex items-start gap-1">
                  <span className="text-green-500">✨</span>
                  <span>Describe your meal in detail. AI will calculate nutrition automatically.</span>
                </p>
              </div>
            </>
          )}
        </form>

        {/* Action Buttons - Fixed at bottom */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="diet-entry-form"
            onClick={(e) => {
              e.preventDefault();
              const form = document.querySelector('form');
              if (form) {
                const event = new Event('submit', { bubbles: true, cancelable: true });
                form.dispatchEvent(event);
              }
            }}
            disabled={isSubmitting}
            className={`flex-1 px-6 py-2.5 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2 shadow-sm ${
              mode === 'water'
                ? 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
                : 'bg-green-500 hover:bg-green-600 active:bg-green-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {mode === 'meal' ? 'Analyzing...' : 'Adding...'}
              </>
            ) : (
              <>
                {mode === 'water' ? <Droplet className="w-4 h-4" /> : <Utensils className="w-4 h-4" />}
                Add Entry
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
