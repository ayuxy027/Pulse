/**
 * Daily Summary Types
 * Types for the daily_summaries table
 */

export interface DailySummary {
  id: string;
  user_id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  water_intake: number; // in 100ml cups
  calories_burned: number;
  meal_count: number;
  habit_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDailySummary {
  date: string;
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fat?: number;
  water_intake?: number;
  calories_burned?: number;
  meal_count?: number;
  habit_count?: number;
}
