/**
 * Habits and Reminders Types
 * Types for the habits and reminders tables
 */

export type HabitType = 'daily' | 'weekly' | 'monthly';

/**
 * Database row structure for habits table
 */
export interface Habit {
  id: string;
  user_id: string;
  description: string;
  habit_type: HabitType;
  calories_burned?: number;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Input type for creating a new habit
 */
export interface CreateHabit {
  description: string;
  habit_type: HabitType;
}

/**
 * Database row structure for reminders table
 */
export interface Reminder {
  id: string;
  user_id: string;
  description: string;
  reminder_date: string; // ISO date string
  reminder_time: string; // HH:mm format
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Input type for creating a new reminder
 */
export interface CreateReminder {
  description: string;
  reminder_date: string;
  reminder_time: string;
}

/**
 * Response from AI calorie burn analysis
 */
export interface CalorieBurnAnalysisResponse {
  success: boolean;
  caloriesBurned?: number;
  error?: string;
}
