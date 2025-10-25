/**
 * AddDietEntryForm - Modal form for adding water intake and meal entries
 */

import React, { useState } from 'react';
import { X, Droplet, Utensils, Loader2, Sun, Apple, Coffee, Moon } from 'lucide-react';
import { TbBottle as Beaker } from "react-icons/tb";
import { LuPillBottle as Bottle } from "react-icons/lu";
import { LuCupSoda as Glass } from "react-icons/lu";
import { motion, AnimatePresence } from 'framer-motion';
import { createDietEntry, updateMealNutrition } from '../../services/dietEntryService';
import { analyzeMealNutrition } from '../../services/nutritionAnalysisService';
import { MealType } from '../../types/dietEntry';
import Button from '../ui/Button';

interface AddDietEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (errorMessage: string) => void;
}

type EntryMode = 'water' | 'meal';

const waterContainers = [
  { id: 'glass', name: 'Glass', ml: 250, icon: Glass, cups: 1 },
  { id: 'half-liter', name: 'Half Liter', ml: 500, icon: Bottle, cups: 2 },
  { id: 'liter', name: '1 Liter', ml: 1000, icon: Beaker, cups: 4 },
];

const mealTypes = [
  { id: 'breakfast', name: 'Breakfast', icon: Sun },
  { id: 'lunch', name: 'Lunch', icon: Apple },
  { id: 'snacks', name: 'Snacks', icon: Coffee },
  { id: 'dinner', name: 'Dinner', icon: Moon },
];

export const AddDietEntryForm: React.FC<AddDietEntryFormProps> = ({ isOpen, onClose, onSuccess, onError }) => {
  const [mode, setMode] = useState<EntryMode>('water');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const [selectedContainer, setSelectedContainer] = useState(waterContainers[0]);
  const [waterQuantity, setWaterQuantity] = useState<string>('1');

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
    setSelectedContainer(waterContainers[0]);
    setWaterQuantity('1');
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
        // Calculate total water amount in cups (250ml each)
        const totalCups = (selectedContainer.ml * parseInt(waterQuantity || '0')) / 250;

        // Add water entry
        const result = await createDietEntry({
          entry_type: 'water',
          water_amount: totalCups,
        });

        if (!result.success) {
          const errorMessage = result.error || 'Failed to add water entry';
          setError(errorMessage);
          onError?.(errorMessage);
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
          const errorMessage = createResult.error || 'Failed to add meal entry';
          setError(errorMessage);
          onError?.(errorMessage);
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
      const errorMessage = 'An unexpected error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-linear-to-r from-blue-50 to-green-50"
            >
              <h2 className="text-xl font-bold text-gray-900">Add Diet Entry</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-white/50"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </motion.div>

            {/* Mode Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="px-6 pt-5 pb-4 bg-gray-50/50"
            >
              <div className="flex gap-2 p-1 bg-white rounded-xl shadow-sm border border-gray-200">
                <button
                  type="button"
                  onClick={() => setMode('water')}
                  disabled={isSubmitting}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all ${mode === 'water'
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
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all ${mode === 'meal'
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <Utensils className="w-4 h-4" />
                  <span className="text-sm">Meal</span>
                </button>
              </div>
            </motion.div>

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
                  {/* Container Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Select Container Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {waterContainers.map((container) => (
                        <button
                          key={container.id}
                          type="button"
                          onClick={() => setSelectedContainer(container)}
                          disabled={isSubmitting}
                          className={`relative p-4 rounded-xl border-2 transition-all ${selectedContainer.id === container.id
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                            }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <container.icon className="w-8 h-8 text-blue-500" />
                            <span className="text-sm font-semibold text-gray-900">{container.name}</span>
                            <span className="text-xs text-gray-500">{container.ml}ml</span>
                          </div>
                          {selectedContainer.id === container.id && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Quantity
                    </label>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={waterQuantity}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Only allow numbers and empty string
                          if (value === '' || /^\d+$/.test(value)) {
                            setWaterQuantity(value);
                          }
                        }}
                        onBlur={(e) => {
                          // Ensure we have a valid number, default to 1 if empty or invalid
                          const value = e.target.value;
                          if (value === '' || !/^\d+$/.test(value) || parseInt(value) < 1) {
                            setWaterQuantity('1');
                          }
                        }}
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 text-center text-2xl font-bold text-blue-600 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Enter quantity"
                      />
                      <div className="text-center">
                        <div className="text-sm text-gray-500">
                          {selectedContainer.name}{parseInt(waterQuantity) > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Total Water</span>
                      <Droplet className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedContainer.ml * parseInt(waterQuantity || '0')}ml
                      </div>
                      <div className="text-xs text-gray-600">
                        = {((selectedContainer.ml * parseInt(waterQuantity || '0')) / 250).toFixed(1)} cups (250ml each)
                      </div>
                      <div className="text-xs text-gray-500">
                        Daily goal: 12 cups (3L)
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Select Meal Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {mealTypes.map((meal) => (
                        <button
                          key={meal.id}
                          type="button"
                          onClick={() => setMealType(meal.id as MealType)}
                          disabled={isSubmitting}
                          className={`relative p-4 rounded-xl border-2 transition-all ${mealType === meal.id
                            ? 'border-green-500 bg-green-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50'
                            }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <meal.icon className="w-6 h-6 text-green-500" />
                            <span className="text-sm font-semibold text-gray-900">{meal.name}</span>
                          </div>
                          {mealType === meal.id && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
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
              <Button
                type="button"
                onClick={handleClose}
                variant="secondary"
                className="flex-1 w-auto h-auto px-6 py-2.5"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
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
                className={`flex-1 w-auto h-auto px-6 py-2.5 ${mode === 'water'
                  ? 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
                  : 'bg-green-500 hover:bg-green-600 active:bg-green-700'
                  }`}
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
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
