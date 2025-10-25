/**
 * DietDashboard Component
 * Displays hardcoded daily nutrition dashboard
 */

import React from 'react';
import { TrendingUp, Target, Flame, Droplet } from 'lucide-react';

export const DietDashboard: React.FC = () => {
  // Hardcoded data for now
  const todayStats = {
    calories: { consumed: 1450, target: 2000 },
    protein: { consumed: 65, target: 100 },
    carbs: { consumed: 180, target: 250 },
    fat: { consumed: 45, target: 65 },
    water: { consumed: 6, target: 8 },
  };

  const calculatePercentage = (consumed: number, target: number) => {
    return Math.min((consumed / target) * 100, 100);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Today's Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Your daily nutrition tracking</p>
        </div>
        <div className="bg-green-50 p-3 rounded-xl">
          <Target className="w-6 h-6 text-green-600" />
        </div>
      </div>

      <div className="space-y-5">
        {/* Calories */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">Calories</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {todayStats.calories.consumed} / {todayStats.calories.target} kcal
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-linear-to-r from-orange-400 to-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${calculatePercentage(todayStats.calories.consumed, todayStats.calories.target)}%` }}
            />
          </div>
        </div>

        {/* Protein */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500" />
              <span className="text-sm font-medium text-gray-700">Protein</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {todayStats.protein.consumed} / {todayStats.protein.target} g
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-linear-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${calculatePercentage(todayStats.protein.consumed, todayStats.protein.target)}%` }}
            />
          </div>
        </div>

        {/* Carbs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Carbs</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {todayStats.carbs.consumed} / {todayStats.carbs.target} g
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-linear-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${calculatePercentage(todayStats.carbs.consumed, todayStats.carbs.target)}%` }}
            />
          </div>
        </div>

        {/* Fat */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-purple-500" />
              <span className="text-sm font-medium text-gray-700">Fat</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {todayStats.fat.consumed} / {todayStats.fat.target} g
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-linear-to-r from-purple-400 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${calculatePercentage(todayStats.fat.consumed, todayStats.fat.target)}%` }}
            />
          </div>
        </div>

        {/* Water */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-cyan-500" />
              <span className="text-sm font-medium text-gray-700">Water</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {todayStats.water.consumed} / {todayStats.water.target} cups
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-linear-to-r from-cyan-400 to-cyan-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${calculatePercentage(todayStats.water.consumed, todayStats.water.target)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mt-6 pt-5 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          </div>
          <span className="text-lg font-bold text-green-600">73%</span>
        </div>
      </div>
    </div>
  );
};
