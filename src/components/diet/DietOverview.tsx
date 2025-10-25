/**
 * DietOverview Component
 * Real-time nutrition tracking with visual stats and activity summary
 */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from 'react';
import { Flame, Droplet, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDietEntriesByDate } from '../../services/dietEntryService';
import { getUserHabits } from '../../services/habitsService';
import { updateTodaySummary } from '../../services/daySummaryService';
import { Habit } from '../../types/habits';

type MealType = 'breakfast' | 'lunch' | 'snacks' | 'dinner';

interface TodayStats {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  caloriesBurned: number;
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  waterGoal: number;
}

interface DietEntry {
  id: string;
  entry_type: 'meal' | 'water';
  meal_type?: MealType;
  water_amount?: number;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  created_at: string;
}

interface DietOverviewProps {
  refreshTrigger?: number;
  onError?: (errorMessage: string) => void;
}

export const DietOverview: React.FC<DietOverviewProps> = ({ refreshTrigger = 0, onError }) => {
  const [todayStats, setTodayStats] = useState<TodayStats>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    water: 0,
    caloriesBurned: 0,
    calorieGoal: 2000,
    proteinGoal: 100,
    carbsGoal: 250,
    fatGoal: 65,
    waterGoal: 8,
  });

  const [, setTodayEntries] = useState<DietEntry[]>([]);
  const [todayHabits, setTodayHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTodayData();
    updateTodaySummary();
  }, [refreshTrigger]);

  const fetchTodayData = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      const entriesResult = await getDietEntriesByDate(today);
      const habitsResult = await getUserHabits();

      if (entriesResult.success && entriesResult.data) {
        setTodayEntries(entriesResult.data);

        // Calculate nutrition totals
        let calories = 0, protein = 0, carbs = 0, fat = 0, water = 0;

        entriesResult.data.forEach(entry => {
          if (entry.entry_type === 'water' && entry.water_amount) {
            water += entry.water_amount;
          } else if (entry.entry_type === 'meal' && entry.nutrition) {
            calories += entry.nutrition.calories || 0;
            protein += entry.nutrition.protein || 0;
            carbs += entry.nutrition.carbs || 0;
            fat += entry.nutrition.fat || 0;
          }
        });

        // Calculate calories burned from habits
        let caloriesBurned = 0;
        if (habitsResult.success && habitsResult.data) {
          const completedToday = habitsResult.data.filter(habit => {
            if (!habit.is_completed || !habit.completed_at) return false;
            const completedDate = new Date(habit.completed_at).toISOString().split('T')[0];
            return completedDate === today && habit.calories_burned;
          });

          completedToday.forEach(habit => {
            caloriesBurned += habit.calories_burned || 0;
          });

          setTodayHabits(completedToday);
        }

        setTodayStats(prev => ({
          ...prev,
          calories,
          protein,
          carbs,
          fat,
          water,
          caloriesBurned,
        }));
      } else {
        onError?.(entriesResult.error || 'Failed to fetch diet entries');
      }
    } catch (error) {
      console.error('Error fetching today data:', error);
      onError?.('An unexpected error occurred while loading data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePercentage = (value: number, goal: number) => {
    return Math.min((value / goal) * 100, 100);
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Nutrition & Tasks */}
        <div className="lg:col-span-7 space-y-6">
          {/* Streak Cards Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4"
          >
            {/* Water Intake Streak Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="group relative bg-white rounded-2xl border border-blue-200 shadow-lg p-5 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-linear-to-br from-blue-50 to-blue-100">
                  <Droplet size={20} className="text-blue-500" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">Water Intake</h4>
                  <p className="text-[10px] text-gray-500">{todayStats.waterGoal} glasses</p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-blue-500">{todayStats.water}</span>
                  <span className="text-sm font-medium text-gray-500">/ {todayStats.waterGoal}</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">Glasses today</p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-semibold text-blue-500">{Math.round(calculatePercentage(todayStats.water, todayStats.waterGoal))}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${calculatePercentage(todayStats.water, todayStats.waterGoal)}%` }}
                  ></div>
                </div>
              </div>

              <div className="absolute inset-0 bg-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="h-full flex flex-col justify-center items-center p-5 text-center">
                  <Droplet size={32} className="text-blue-500 mb-2" />
                  <p className="text-xs font-semibold text-gray-900 mb-1">Keep Hydrated!</p>
                  <p className="text-[10px] text-gray-500">
                    {todayStats.water >= todayStats.waterGoal
                      ? 'Goal achieved today!'
                      : `${todayStats.waterGoal - todayStats.water} more to go`}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Calories Progress Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="group relative bg-white rounded-2xl border border-purple-200 shadow-lg p-5 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-purple-50">
                  <Flame size={20} className="text-purple-500" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">Calories</h4>
                  <p className="text-[10px] text-gray-500">Daily intake</p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-purple-500">{todayStats.calories}</span>
                  <span className="text-sm font-medium text-gray-500">/ {todayStats.calorieGoal}</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">Calories consumed</p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-semibold text-purple-500">{Math.round(calculatePercentage(todayStats.calories, todayStats.calorieGoal))}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${calculatePercentage(todayStats.calories, todayStats.calorieGoal)}%` }}
                  ></div>
                </div>
              </div>

              <div className="absolute inset-0 bg-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="h-full flex flex-col justify-center items-center p-5 text-center">
                  <Flame size={32} className="text-purple-500 mb-2" />
                  <p className="text-xs font-semibold text-gray-900 mb-1">Keep it up!</p>
                  <p className="text-[10px] text-gray-500">
                    {todayStats.calories < todayStats.calorieGoal
                      ? `${todayStats.calorieGoal - todayStats.calories} kcal remaining`
                      : 'Daily goal reached!'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Net Calories Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="group relative bg-white rounded-2xl border border-orange-200 shadow-lg p-5 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-orange-50">
                  <Flame size={20} className="text-orange-500" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">Net Calories</h4>
                  <p className="text-[10px] text-gray-500">After exercise</p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-orange-500">{todayStats.calories - todayStats.caloriesBurned}</span>
                  <span className="text-sm font-medium text-gray-500">kcal</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">Total net intake</p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-600">Burned</span>
                  <span className="font-semibold text-orange-500">{todayStats.caloriesBurned} kcal</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${Math.min((todayStats.caloriesBurned / 500) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="absolute inset-0 bg-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="h-full flex flex-col justify-center items-center p-5 text-center">
                  <Flame size={32} className="text-orange-500 mb-2" />
                  <p className="text-xs font-semibold text-gray-900 mb-1">Great Work!</p>
                  <p className="text-[10px] text-gray-500">
                    {todayStats.caloriesBurned > 0
                      ? `${todayStats.caloriesBurned} kcal from ${todayHabits.length} activities`
                      : 'No activities tracked yet'}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Nutrition Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Nutrition Summary</h3>
              <span className="text-sm font-medium text-gray-500">Daily Stats</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <svg width={180} height={180} className="transform -rotate-90">
                    <circle cx={90} cy={90} r={74} fill="none" stroke="#f3f4f6" strokeWidth={16} />
                    <circle
                      cx={90}
                      cy={90}
                      r={74}
                      fill="none"
                      stroke="#f97316"
                      strokeWidth={16}
                      strokeDasharray={465}
                      strokeDashoffset={465 - (465 * calculatePercentage(todayStats.calories, todayStats.calorieGoal)) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-4xl font-bold text-gray-900">
                      {Math.round(calculatePercentage(todayStats.calories, todayStats.calorieGoal))}%
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Daily Goal</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-6">
                {/* Carbs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-semibold text-gray-900">Carbs</span>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      {todayStats.carbs}g / {todayStats.carbsGoal}g
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${calculatePercentage(todayStats.carbs, todayStats.carbsGoal)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Protein */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-sm font-semibold text-gray-900">Protein</span>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      {todayStats.protein}g / {todayStats.proteinGoal}g
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${calculatePercentage(todayStats.protein, todayStats.proteinGoal)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Fat */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm font-semibold text-gray-900">Fat</span>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      {todayStats.fat}g / {todayStats.fatGoal}g
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${calculatePercentage(todayStats.fat, todayStats.fatGoal)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Total Calories</p>
                  <p className="text-lg font-bold text-gray-900">{todayStats.calories}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Goal</p>
                  <p className="text-lg font-bold text-gray-900">{todayStats.calorieGoal}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Remaining</p>
                  <p className="text-lg font-bold text-green-600">{Math.max(0, todayStats.calorieGoal - todayStats.calories)}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Activity Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-5"
        >
          <div className="bg-linear-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200 shadow-lg p-6 sticky top-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Activity Summary</h3>
              <div className="p-2 rounded-lg bg-white shadow-sm">
                <Flame size={18} className="text-orange-600" />
              </div>
            </div>

            {/* Net Calories */}
            <div className="bg-white rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">Net Calories</p>
              <p className="text-3xl font-bold text-gray-900">
                {todayStats.calories - todayStats.caloriesBurned}
                <span className="text-lg text-gray-600 font-normal ml-2">kcal</span>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {todayStats.calories} eaten - {todayStats.caloriesBurned} burned
              </p>
            </div>

            {/* Calories Burned */}
            <div className="bg-white rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-red-500 p-2 rounded-lg">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Calories Burned</p>
                  <p className="text-2xl font-bold text-gray-900">{todayStats.caloriesBurned}</p>
                </div>
              </div>
              <p className="text-xs text-gray-600">
                From {todayHabits.length} completed habit{todayHabits.length !== 1 ? 's' : ''} today
              </p>
            </div>

            {/* Completed Habits List */}
            {todayHabits.length > 0 && (
              <div className="bg-white rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Completed Activities</h4>
                <div className="space-y-2">
                  {todayHabits.map((habit) => (
                    <div key={habit.id} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-100">
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                        <Flame className="w-3 h-3 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{habit.description}</p>
                      </div>
                      <span className="text-xs font-semibold text-orange-600 shrink-0">
                        {habit.calories_burned} cal
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats Footer */}
            <div className="mt-4 pt-4 border-t border-orange-200">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Water Intake</p>
                  <p className="text-lg font-bold text-blue-600">{todayStats.water}/{todayStats.waterGoal}</p>
                  <p className="text-xs text-gray-500">cups</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Progress</p>
                  <p className="text-lg font-bold text-green-600">{Math.round(calculatePercentage(todayStats.calories, todayStats.calorieGoal))}%</p>
                  <p className="text-xs text-gray-500">of goal</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};