/**
 * CalendarView Component
 * Interactive calendar showing diet tracking data by day
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Flame, Droplet, Apple, Loader2, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import { getDietEntriesByDate, getUserDietEntries } from '../../services/dietEntryService';
import { getUserHabits } from '../../services/habitsService';
import { generateDaySummary, generateFallbackSummary, DaySummaryData } from '../../services/aiSummaryService';
import { DailySummary } from '../../types/dailySummary';
import { DietEntry } from '../../types/dietEntry';
import { Habit } from '../../types/habits';

const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [datesWithData, setDatesWithData] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayDetails, setDayDetails] = useState<{
    summary: DailySummary;
    entries: DietEntry[];
    habits: Habit[];
    aiSummary?: string;
    insights?: string[];
  } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMonthData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const loadMonthData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      // Calculate first and last day of month
      const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
      const lastDay = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

      const datesSet = new Set<string>();

      // Get all entries for the month to check which dates have data
      const entriesResult = await getUserDietEntries(firstDay + 'T00:00:00', lastDay);
      if (entriesResult.success && entriesResult.data) {
        entriesResult.data.forEach(entry => {
          // For meals, use meal_date. For water, use created_at date
          let entryDate: string;
          if (entry.entry_type === 'meal' && entry.meal_date) {
            entryDate = entry.meal_date;
          } else {
            entryDate = entry.created_at.split('T')[0];
          }
          datesSet.add(entryDate);
        });
      } else {
        setError(entriesResult.error || 'Failed to load calendar data');
      }

      setDatesWithData(datesSet);
    } catch (error) {
      console.error('Error loading month data:', error);
      setError('An unexpected error occurred while loading calendar data');
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  const handleDayClick = useCallback(async (dateStr: string) => {
    // Check if this date has data
    if (!datesWithData.has(dateStr)) {
      return;
    }

    setSelectedDay(dateStr);
    setLoadingDetails(true);
    setDayDetails(null);
    setError(null);

    try {
      // Fetch full day details
      const [entriesResult, habitsResult] = await Promise.all([
        getDietEntriesByDate(dateStr),
        getUserHabits(),
      ]);

      const entries = entriesResult.success ? entriesResult.data || [] : [];
      const allHabits = habitsResult.success ? habitsResult.data || [] : [];

      // Filter habits completed on this day
      const habits = allHabits.filter(habit => {
        if (!habit.is_completed || !habit.completed_at) return false;
        const completedDate = new Date(habit.completed_at).toISOString().split('T')[0];
        return completedDate === dateStr;
      });

      // Calculate totals from entries
      let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0, waterIntake = 0, mealCount = 0;

      entries.forEach(entry => {
        if (entry.entry_type === 'water' && entry.water_amount) {
          waterIntake += entry.water_amount;
        } else if (entry.entry_type === 'meal' && entry.nutrition) {
          totalCalories += entry.nutrition.calories || 0;
          totalProtein += entry.nutrition.protein || 0;
          totalCarbs += entry.nutrition.carbs || 0;
          totalFat += entry.nutrition.fat || 0;
          mealCount++;
        }
      });

      // Calculate calories burned
      let caloriesBurned = 0, habitCount = 0;
      habits.forEach(habit => {
        caloriesBurned += habit.calories_burned || 0;
        habitCount++;
      });

      // Create summary object
      const summary: DailySummary = {
        id: '',
        user_id: '',
        date: dateStr,
        total_calories: totalCalories,
        total_protein: totalProtein,
        total_carbs: totalCarbs,
        total_fat: totalFat,
        water_intake: waterIntake,
        calories_burned: caloriesBurned,
        meal_count: mealCount,
        habit_count: habitCount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Double-check if there's any data
      if (mealCount === 0 && waterIntake === 0 && habitCount === 0) {
        setLoadingDetails(false);
        setSelectedDay(null);
        return;
      }

      // Generate AI summary
      const summaryData: DaySummaryData = {
        date: dateStr,
        entries,
        habits,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        waterIntake,
        caloriesBurned,
      };

      const aiResult = await generateDaySummary(summaryData);

      // Use fallback if AI fails
      if (!aiResult.success) {
        const fallback = generateFallbackSummary(summaryData);
        setDayDetails({
          summary,
          entries,
          habits,
          aiSummary: fallback.summary,
          insights: fallback.insights,
        });
      } else {
        setDayDetails({
          summary,
          entries,
          habits,
          aiSummary: aiResult.summary,
          insights: aiResult.insights,
        });
      }
    } catch (error) {
      console.error('Error loading day details:', error);
      setError('Failed to load day details');
    } finally {
      setLoadingDetails(false);
    }
  }, [datesWithData]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const previousMonth = useCallback(() => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  }, [currentDate]);

  const nextMonth = useCallback(() => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  }, [currentDate]);

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  const getDaysInMonth = () => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = () => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth();
    const firstDay = getFirstDayOfMonth();
    const days = [];

    // Empty cells before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-20"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const today = isToday(dateStr);
      const hasData = datesWithData.has(dateStr);

      days.push(
        <div
          key={day}
          onClick={() => hasData && handleDayClick(dateStr)}
          className="relative group h-20"
        >
          <div
            className={`
              relative w-full h-full flex flex-col items-center justify-center rounded-lg transition-all
              ${today
                ? 'border-2 border-blue-500 bg-blue-50 font-semibold cursor-pointer'
                : hasData
                  ? 'bg-green-50 hover:bg-green-100 border border-green-200 cursor-pointer hover:shadow-md'
                  : 'border border-gray-100 cursor-not-allowed opacity-40'
              }
            `}
          >
            <span className={`text-sm ${today ? 'text-blue-600 font-bold' : hasData ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {day}
            </span>

            {hasData && (
              <div className="mt-1 text-xs text-green-600">
                <span>•</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 shadow-sm"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600 transition-colors"
              aria-label="Dismiss error"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={previousMonth}
              variant="secondary"
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors w-auto h-auto"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </Button>
          </motion.div>

          <motion.h2
            key={`${currentDate.getMonth()}-${currentDate.getFullYear()}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-xl font-semibold text-gray-900"
          >
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </motion.h2>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={nextMonth}
              variant="secondary"
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors w-auto h-auto"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </Button>
          </motion.div>
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-500">Loading calendar data...</p>
          </div>
        ) : (
          <>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {renderCalendar()}
            </div>
          </>
        )}

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-50"></div>
            <span className="text-gray-600">Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-50 border border-green-200"></div>
            <span className="text-gray-600">Has Data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-gray-100 opacity-50"></div>
            <span className="text-gray-600">No Data</span>
          </div>
        </div>
      </motion.div>

      {/* Day Details Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">
                  {new Date(selectedDay).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h3>
                <p className="text-sm text-gray-500 mt-1">Detailed nutrition and activity summary</p>
              </div>
              <Button
                onClick={() => {
                  setSelectedDay(null);
                  setDayDetails(null);
                }}
                variant="secondary"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors w-auto h-auto"
              >
                <X className="w-5 h-5 text-gray-500" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <p className="text-sm text-gray-500 ml-3">Generating AI summary...</p>
                </div>
              ) : dayDetails ? (
                <>
                  {/* AI Summary */}
                  {dayDetails.aiSummary && (
                    <div className="bg-linear-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold text-gray-900">AI Summary</h4>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{dayDetails.aiSummary}</p>
                    </div>
                  )}

                  {/* Insights */}
                  {dayDetails.insights && dayDetails.insights.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Key Insights</h4>
                      <div className="space-y-2">
                        {dayDetails.insights.map((insight, index) => (
                          <div key={index} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                            <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                            <p className="text-sm text-gray-700">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats Overview */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Nutrition Overview</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-orange-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Flame className="w-4 h-4 text-orange-600" />
                          <span className="text-xs text-gray-600">Calories</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {dayDetails.summary.total_calories}
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Droplet className="w-4 h-4 text-blue-600" />
                          <span className="text-xs text-gray-600">Water</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {dayDetails.summary.water_intake} cups
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <span className="text-xs text-gray-600">Protein</span>
                        <p className="text-2xl font-bold text-gray-900">
                          {dayDetails.summary.total_protein}g
                        </p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Flame className="w-4 h-4 text-red-600" />
                          <span className="text-xs text-gray-600">Burned</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {dayDetails.summary.calories_burned}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Meals List */}
                  {dayDetails.entries.filter(e => e.entry_type === 'meal').length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Apple className="w-4 h-4" />
                        Meals ({dayDetails.entries.filter(e => e.entry_type === 'meal').length})
                      </h4>
                      <div className="space-y-2">
                        {dayDetails.entries
                          .filter(e => e.entry_type === 'meal')
                          .map((entry) => (
                            <div key={entry.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-gray-900 capitalize">
                                  {entry.meal_type}
                                </span>
                                {entry.nutrition && (
                                  <span className="text-sm text-orange-600 font-medium">
                                    {entry.nutrition.calories} cal
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{entry.meal_description}</p>
                              {entry.nutrition && (
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span>P: {entry.nutrition.protein}g</span>
                                  <span>C: {entry.nutrition.carbs}g</span>
                                  <span>F: {entry.nutrition.fat}g</span>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Habits List */}
                  {dayDetails.habits.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Completed Habits ({dayDetails.habits.length})
                      </h4>
                      <div className="space-y-2">
                        {dayDetails.habits.map((habit) => (
                          <div key={habit.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                            <span className="text-sm text-gray-700">{habit.description}</span>
                            {habit.calories_burned && (
                              <span className="text-sm text-red-600 font-medium flex items-center gap-1">
                                <Flame className="w-3 h-3" />
                                {habit.calories_burned} cal
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center text-gray-500 py-12">No data available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CalendarView;
