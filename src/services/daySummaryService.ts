/**
 * Daily Summary Service
 * Handles operations for the daily_summaries table for optimized calendar performance
 */

import { supabase } from './supabase';
import { DailySummary } from '../types/dailySummary';
import { getDietEntriesByDate } from './dietEntryService';
import { getUserHabits } from './habitsService';

/**
 * Get daily summaries for a date range (optimized for calendar month view)
 * This is MUCH faster than querying each day individually
 */
export async function getDailySummaries(
  startDate: string,
  endDate: string
): Promise<{ success: boolean; data?: DailySummary[]; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('daily_summaries')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching daily summaries:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Unexpected error fetching daily summaries:', error);
    return { success: false, error: 'Failed to fetch daily summaries' };
  }
}

/**
 * Get a single daily summary for a specific date
 */
export async function getDailySummary(
  date: string
): Promise<{ success: boolean; data?: DailySummary; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('daily_summaries')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .maybeSingle();

    if (error) {
      console.error('Error fetching daily summary:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      // If no summary exists, calculate and create it
      return await calculateAndSaveDailySummary(date);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error fetching daily summary:', error);
    return { success: false, error: 'Failed to fetch daily summary' };
  }
}

/**
 * Calculate summary from raw data and save it to database
 */
export async function calculateAndSaveDailySummary(
  date: string
): Promise<{ success: boolean; data?: DailySummary; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Fetch entries and habits for this day
    const [entriesResult, habitsResult] = await Promise.all([
      getDietEntriesByDate(date),
      getUserHabits(),
    ]);

    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0, waterIntake = 0, mealCount = 0;
    
    if (entriesResult.success && entriesResult.data) {
      entriesResult.data.forEach(entry => {
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
    }

    // Calculate calories burned from habits completed on this day
    let caloriesBurned = 0, habitCount = 0;
    if (habitsResult.success && habitsResult.data) {
      const completedOnDay = habitsResult.data.filter(habit => {
        if (!habit.is_completed || !habit.completed_at) return false;
        const completedDate = new Date(habit.completed_at).toISOString().split('T')[0];
        return completedDate === date && habit.calories_burned;
      });
      
      completedOnDay.forEach(habit => {
        caloriesBurned += habit.calories_burned || 0;
        habitCount++;
      });
    }

    // Only create summary if there's any data
    if (mealCount === 0 && waterIntake === 0 && habitCount === 0) {
      return { success: true, data: undefined };
    }

    // Insert or update the summary
    const summaryData = {
      user_id: user.id,
      date,
      total_calories: totalCalories,
      total_protein: totalProtein,
      total_carbs: totalCarbs,
      total_fat: totalFat,
      water_intake: waterIntake,
      calories_burned: caloriesBurned,
      meal_count: mealCount,
      habit_count: habitCount,
    };

    const { data, error } = await supabase
      .from('daily_summaries')
      .upsert(summaryData, { onConflict: 'user_id,date' })
      .select()
      .single();

    if (error) {
      console.error('Error saving daily summary:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error calculating daily summary:', error);
    return { success: false, error: 'Failed to calculate daily summary' };
  }
}

/**
 * Update today's summary (call this after adding/deleting entries)
 */
export async function updateTodaySummary(): Promise<{ success: boolean; error?: string }> {
  try {
    const today = new Date().toISOString().split('T')[0];
    await calculateAndSaveDailySummary(today);
    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating today summary:', error);
    return { success: false, error: 'Failed to update today summary' };
  }
}
