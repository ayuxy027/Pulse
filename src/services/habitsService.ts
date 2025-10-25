/**
 * Habits Service
 * Handles all database operations for habits
 */

import { supabase } from './supabase';
import { Habit, CreateHabit } from '../types/habits';

/**
 * Create a new habit
 */
export async function createHabit(habit: CreateHabit): Promise<{ success: boolean; data?: Habit; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const habitData = {
      user_id: user.id,
      description: habit.description,
      habit_type: habit.habit_type,
    };

    const { data, error } = await supabase
      .from('habits')
      .insert(habitData)
      .select()
      .single();

    if (error) {
      console.error('Error creating habit:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error creating habit:', error);
    return { success: false, error: 'Failed to create habit' };
  }
}

/**
 * Update habit with AI-calculated calorie burn
 */
export async function updateHabitCalories(
  habitId: string,
  caloriesBurned: number
): Promise<{ success: boolean; data?: Habit; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('habits')
      .update({ calories_burned: caloriesBurned })
      .eq('id', habitId)
      .select()
      .single();

    if (error) {
      console.error('Error updating habit calories:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error updating habit calories:', error);
    return { success: false, error: 'Failed to update habit calories' };
  }
}

/**
 * Get all habits for the current user
 */
export async function getUserHabits(): Promise<{ success: boolean; data?: Habit[]; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching habits:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Unexpected error fetching habits:', error);
    return { success: false, error: 'Failed to fetch habits' };
  }
}

/**
 * Toggle habit completion status
 */
export async function toggleHabitCompletion(
  habitId: string,
  isCompleted: boolean
): Promise<{ success: boolean; data?: Habit; error?: string }> {
  try {
    const updateData: { is_completed: boolean; completed_at: string | null; updated_at: string } = {
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('habits')
      .update(updateData)
      .eq('id', habitId)
      .select()
      .single();

    if (error) {
      console.error('Error toggling habit completion:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error toggling habit completion:', error);
    return { success: false, error: 'Failed to toggle habit completion' };
  }
}

/**
 * Delete a habit
 */
export async function deleteHabit(habitId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId);

    if (error) {
      console.error('Error deleting habit:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting habit:', error);
    return { success: false, error: 'Failed to delete habit' };
  }
}

/**
 * Get habits by type
 */
export async function getHabitsByType(
  habitType: 'daily' | 'weekly' | 'monthly'
): Promise<{ success: boolean; data?: Habit[]; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('habit_type', habitType)
      .order('scheduled_time', { ascending: true });

    if (error) {
      console.error('Error fetching habits by type:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Unexpected error fetching habits by type:', error);
    return { success: false, error: 'Failed to fetch habits' };
  }
}
