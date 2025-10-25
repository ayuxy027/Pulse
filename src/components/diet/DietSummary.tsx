/**
 * DietSummary Component
 * Displays hardcoded weekly nutrition summary
 */

import React from 'react';
import { Calendar, TrendingUp, Award, Activity } from 'lucide-react';

export const DietSummary: React.FC = () => {
  // Hardcoded data for now
  const weeklyStats = {
    avgCalories: 1850,
    totalMeals: 18,
    waterGoalsDays: 5,
    streak: 7,
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Weekly Summary</h2>
          <p className="text-sm text-gray-500 mt-1">Last 7 days overview</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-xl">
          <Calendar className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Average Calories */}
        <div className="bg-linear-to-br from-orange-50 to-orange-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-orange-600" />
            <span className="text-xs font-medium text-orange-700">Avg Calories</span>
          </div>
          <p className="text-2xl font-bold text-orange-900">{weeklyStats.avgCalories}</p>
          <p className="text-xs text-orange-600 mt-1">kcal/day</p>
        </div>

        {/* Total Meals */}
        <div className="bg-linear-to-br from-green-50 to-green-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-xs font-medium text-green-700">Total Meals</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{weeklyStats.totalMeals}</p>
          <p className="text-xs text-green-600 mt-1">meals logged</p>
        </div>

        {/* Water Goals Met */}
        <div className="bg-linear-to-br from-cyan-50 to-cyan-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-cyan-600" />
            <span className="text-xs font-medium text-cyan-700">Water Goals</span>
          </div>
          <p className="text-2xl font-bold text-cyan-900">{weeklyStats.waterGoalsDays}/7</p>
          <p className="text-xs text-cyan-600 mt-1">days met</p>
        </div>

        {/* Streak */}
        <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-purple-600" />
            <span className="text-xs font-medium text-purple-700">Current Streak</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">{weeklyStats.streak}</p>
          <p className="text-xs text-purple-600 mt-1">days 🔥</p>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-5 pt-5 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Insights</h3>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
            <p className="text-xs text-gray-600">You're maintaining a great streak! Keep it up!</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
            <p className="text-xs text-gray-600">Average calorie intake is within healthy range</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5" />
            <p className="text-xs text-gray-600">Try to hit water goals on remaining 2 days</p>
          </div>
        </div>
      </div>
    </div>
  );
};
