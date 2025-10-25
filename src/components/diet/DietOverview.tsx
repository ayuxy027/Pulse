/**
 * DietOverview Component
 * Real-time display of today's nutrition data with earned macros, burned calories, and entry history
 */

import React, { useState, useEffect } from 'react';
import { Flame, TrendingUp, Droplet, Apple, Clock, Trash2, Loader2 } from 'lucide-react';
import { getDietEntriesByDate, deleteDietEntry } from '../../services/dietEntryService';
import { getUserHabits } from '../../services/habitsService';
import { DietEntry, MealType } from '../../types/dietEntry';
import { Habit } from '../../types/habits';

interface TodayStats {
  // Earned (consumed)
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number; // in cups
  
  // Burned
  caloriesBurned: number;
  
  // Goals (hardcoded for now, can be made dynamic later)
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  waterGoal: number;
}

interface DietOverviewProps {
  refreshTrigger?: number;
}

export const DietOverview: React.FC<DietOverviewProps> = ({ refreshTrigger = 0 }) => {
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
  
  const [todayEntries, setTodayEntries] = useState<DietEntry[]>([]);
  const [todayHabits, setTodayHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTodayData();
  }, [refreshTrigger]);

  const fetchTodayData = async () => {
    setIsLoading(true);
    const today = new Date().toISOString().split('T')[0];

    // Fetch diet entries
    const entriesResult = await getDietEntriesByDate(today);
    
    // Fetch habits
    const habitsResult = await getUserHabits();

    if (entriesResult.success && entriesResult.data) {
      setTodayEntries(entriesResult.data);
      
      // Calculate totals
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

      // Calculate calories burned from completed habits today
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
    }

    setIsLoading(false);
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      const result = await deleteDietEntry(entryId);
      if (result.success) {
        await fetchTodayData();
      }
    }
  };

  const calculatePercentage = (value: number, goal: number) => {
    return Math.min((value / goal) * 100, 100);
  };

  const getMealTypeIcon = (_mealType?: MealType) => {
    return <Apple className="w-4 h-4" />;
  };

  const getMealTypeColor = (mealType?: MealType) => {
    switch (mealType) {
      case 'breakfast': return 'bg-yellow-100 text-yellow-700';
      case 'lunch': return 'bg-blue-100 text-blue-700';
      case 'snacks': return 'bg-purple-100 text-purple-700';
      case 'dinner': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Dashboard */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Today's Overview</h2>
            <p className="text-sm text-gray-500 mt-1">Real-time nutrition tracking</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Net Calories</p>
            <p className="text-2xl font-bold text-gray-900">
              {todayStats.calories - todayStats.caloriesBurned}
              <span className="text-sm text-gray-500 font-normal"> kcal</span>
            </p>
            <p className="text-xs text-gray-500">
              {todayStats.calories} eaten - {todayStats.caloriesBurned} burned
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Macros Earned */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Macros Earned (Consumed)
            </h3>
            <div className="space-y-4">
              {/* Calories */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">Calories</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {todayStats.calories} / {todayStats.calorieGoal} kcal
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${calculatePercentage(todayStats.calories, todayStats.calorieGoal)}%` }}
                  />
                </div>
              </div>

              {/* Protein */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Protein</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {todayStats.protein}g / {todayStats.proteinGoal}g
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${calculatePercentage(todayStats.protein, todayStats.proteinGoal)}%` }}
                  />
                </div>
              </div>

              {/* Carbs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Carbs</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {todayStats.carbs}g / {todayStats.carbsGoal}g
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${calculatePercentage(todayStats.carbs, todayStats.carbsGoal)}%` }}
                  />
                </div>
              </div>

              {/* Fat */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Fat</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {todayStats.fat}g / {todayStats.fatGoal}g
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all"
                    style={{ width: `${calculatePercentage(todayStats.fat, todayStats.fatGoal)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Water & Calories Burned */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-600" />
              Activity & Hydration
            </h3>
            <div className="space-y-4">
              {/* Water Intake */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Water</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {todayStats.water} / {todayStats.waterGoal} cups
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${calculatePercentage(todayStats.water, todayStats.waterGoal)}%` }}
                  />
                </div>
              </div>

              {/* Calories Burned */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 p-4 rounded-xl border border-red-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-red-500 p-2 rounded-lg">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Calories Burned</p>
                    <p className="text-2xl font-bold text-gray-900">{todayStats.caloriesBurned}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  From {todayHabits.length} completed habit{todayHabits.length !== 1 ? 's' : ''} today
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's History */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Today's History</h3>
          <span className="text-sm text-gray-500">{todayEntries.length} entries</span>
        </div>

        {todayEntries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No entries yet today. Add your first entry!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-all"
              >
                {/* Icon & Type */}
                <div className={`flex-shrink-0 p-2 rounded-lg ${
                  entry.entry_type === 'water' 
                    ? 'bg-blue-100' 
                    : getMealTypeColor(entry.meal_type)
                }`}>
                  {entry.entry_type === 'water' ? (
                    <Droplet className="w-5 h-5 text-blue-600" />
                  ) : (
                    getMealTypeIcon(entry.meal_type)
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {entry.entry_type === 'water' ? (
                    <div>
                      <p className="font-medium text-gray-900">Water Intake</p>
                      <p className="text-sm text-gray-600">
                        {entry.water_amount} cups ({entry.water_amount! * 100}ml)
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900 capitalize">{entry.meal_type}</p>
                        {entry.meal_type && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getMealTypeColor(entry.meal_type)}`}>
                            {entry.meal_type}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{entry.meal_description}</p>
                      {entry.nutrition && (
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3 text-orange-500" />
                            {entry.nutrition.calories} cal
                          </span>
                          <span>P: {entry.nutrition.protein}g</span>
                          <span>C: {entry.nutrition.carbs}g</span>
                          <span>F: {entry.nutrition.fat}g</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Time & Delete */}
                <div className="flex-shrink-0 flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(entry.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
