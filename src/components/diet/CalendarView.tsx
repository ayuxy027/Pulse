/**
 * Optimized CalendarView Component
 * Fast calendar using pre-calculated daily_summaries table
 * Loads entire month with single query
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Flame, Droplet, Apple, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { getDailySummaries } from '../../services/daySummaryService';
import { getDietEntriesByDate, getUserDietEntries } from '../../services/dietEntryService';
import { getUserHabits } from '../../services/habitsService';
import { generateDaySummary, generateFallbackSummary, DaySummaryData } from '../../services/aiSummaryService';
import { DailySummary } from '../../types/dailySummary';
import { DietEntry } from '../../types/dietEntry';
import { Habit } from '../../types/habits';

const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthSummaries, setMonthSummaries] = useState<Map<string, DailySummary>>(new Map());
  const [datesWithData, setDatesWithData] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayDetails, setDayDetails] = useState<{
    summary: DailySummary;
    entries: DietEntry[];
    habits: Habit[];
    aiSummary?: string;
    insights?: string[];
  } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadMonthData();
  }, [currentDate]);

  const loadMonthData = async () => {
    setLoading(true);
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Calculate first and last day of month
    const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
    const lastDay = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
    
    // Try to get summaries from database first
    const result = await getDailySummaries(firstDay, lastDay);
    
    const summariesMap = new Map<string, DailySummary>();
    const datesSet = new Set<string>();
    
    if (result.success && result.data && result.data.length > 0) {
      console.log('Found summaries in database:', result.data.length);
      result.data.forEach(summary => {
        summariesMap.set(summary.date, summary);
        datesSet.add(summary.date);
      });
    }
    
    // Get all entries for the month to check which dates have data
    const entriesResult = await getUserDietEntries(firstDay + 'T00:00:00', lastDay);
    if (entriesResult.success && entriesResult.data) {
      entriesResult.data.forEach(entry => {
        // Extract just the date part from created_at timestamp
        const entryDate = entry.created_at.split('T')[0];
        datesSet.add(entryDate);
      });
    }
    
    console.log('Dates with data:', Array.from(datesSet).sort());
    setMonthSummaries(summariesMap);
    setDatesWithData(datesSet);
    setLoading(false);
  };

  const handleDayClick = async (dateStr: string) => {
    console.log('Day clicked:', dateStr);
    
    // Check if this date has data
    if (!datesWithData.has(dateStr) && !monthSummaries.has(dateStr)) {
      console.log('No data for this date');
      return;
    }
    
    setSelectedDay(dateStr);
    setLoadingDetails(true);
    setDayDetails(null);

    console.log('Fetching day details...');
    // Fetch full day details
    const [entriesResult, habitsResult] = await Promise.all([
      getDietEntriesByDate(dateStr),
      getUserHabits(),
    ]);

    const entries = entriesResult.success ? entriesResult.data || [] : [];
    const allHabits = habitsResult.success ? habitsResult.data || [] : [];
    
    console.log('Entries:', entries.length, 'All habits:', allHabits.length);
    
    // Filter habits completed on this day
    const habits = allHabits.filter(habit => {
      if (!habit.is_completed || !habit.completed_at) return false;
      const completedDate = new Date(habit.completed_at).toISOString().split('T')[0];
      return completedDate === dateStr;
    });

    console.log('Habits completed on this day:', habits.length);

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

    // Create summary object (from database or calculated)
    const summary: DailySummary = monthSummaries.get(dateStr) || {
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
      console.log('No data found after fetching');
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

    console.log('Generating AI summary with data:', summaryData);
    const aiResult = await generateDaySummary(summaryData);
    console.log('AI Result:', aiResult);
    
    // Use fallback if AI fails
    if (!aiResult.success) {
      console.log('AI failed, using fallback');
      const fallback = generateFallbackSummary(summaryData);
      console.log('Fallback result:', fallback);
      setDayDetails({
        summary,
        entries,
        habits,
        aiSummary: fallback.summary,
        insights: fallback.insights,
      });
    } else {
      console.log('AI success, setting details');
      setDayDetails({
        summary,
        entries,
        habits,
        aiSummary: aiResult.summary,
        insights: aiResult.insights,
      });
    }

    setLoadingDetails(false);
    console.log('Done loading details');
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

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
      const summary = monthSummaries.get(dateStr);
      const today = isToday(dateStr);
      const hasData = datesWithData.has(dateStr) || summary !== undefined;

      days.push(
        <div
          key={day}
          onMouseEnter={() => hasData && setHoveredDay(dateStr)}
          onMouseLeave={() => setHoveredDay(null)}
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
            <span className={`text-sm mb-1 ${today ? 'text-blue-600 font-bold' : hasData ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {day}
            </span>
            
            {hasData && summary && (
              <div className="flex items-center gap-1 text-xs">
                <span className="text-orange-600 font-medium">{summary.total_calories}</span>
                <Flame className="w-3 h-3 text-orange-500" />
              </div>
            )}
          </div>

          {/* Hover Tooltip */}
          {hoveredDay === dateStr && hasData && summary && (
            <div className="absolute z-20 top-full left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-gray-900 text-white rounded-lg shadow-xl p-3 pointer-events-none">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-900 rotate-45"></div>
              
              <div className="relative">
                <p className="text-xs font-semibold mb-2 text-gray-200">
                  {new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Calories</span>
                    <span className="font-medium">{summary.total_calories} kcal</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Protein</span>
                    <span className="font-medium">{summary.total_protein}g</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Water</span>
                    <span className="font-medium">{summary.water_intake} cups</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Burned</span>
                    <span className="font-medium text-orange-400">{summary.calories_burned} kcal</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-700">
                  <p className="text-xs text-gray-400">
                    {summary.meal_count} meal{summary.meal_count !== 1 ? 's' : ''} • {summary.habit_count} habit{summary.habit_count !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-blue-400 mt-1">Click for AI summary →</p>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="space-y-6">
      {/* Calendar Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <h2 className="text-xl font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>

          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
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
      </div>

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
              <button
                onClick={() => {
                  setSelectedDay(null);
                  setDayDetails(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
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
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
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
                            <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
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
    </div>
  );
};

export default CalendarView;
