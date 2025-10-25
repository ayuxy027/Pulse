/**
 * Daily Summary Service
 * Manages pre-calculated daily nutrition summaries for fast calendar loading
 */

import { supabase } from './supabase';
import { DailySummary, CreateDailySummary } from '../types/dailySummary';
import { getDietEntriesByDate } from './dietEntryService';
import { getUserHabits } from './habitsService';

/**
 * Get daily summaries for a date range (for calendar view)
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
 * Get or create a daily summary for a specific date
 */
export async function getDailySummaryByDate(
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
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching daily summary:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      // Summary doesn't exist, calculate and create it
      return await recalculateDailySummary(date);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error fetching daily summary:', error);
    return { success: false, error: 'Failed to fetch daily summary' };
  }
}

/**
 * Recalculate and update/create a daily summary for a specific date
 * Call this whenever diet entries or habits are added/updated/deleted
 */
export async function recalculateDailySummary(
  date: string
): Promise<{ success: boolean; data?: DailySummary; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Fetch all entries for this date
    const entriesResult = await getDietEntriesByDate(date);
    const habitsResult = await getUserHabits();

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let waterIntake = 0;
    let mealCount = 0;

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

    // Calculate calories burned from habits completed on this date
    let caloriesBurned = 0;
    let habitCount = 0;
    if (habitsResult.success && habitsResult.data) {
      const completedOnDate = habitsResult.data.filter(habit => {
        if (!habit.is_completed || !habit.completed_at) return false;
        const completedDate = new Date(habit.completed_at).toISOString().split('T')[0];
        return completedDate === date && habit.calories_burned;
      });
      
      completedOnDate.forEach(habit => {
        caloriesBurned += habit.calories_burned || 0;
        habitCount++;
      });
    }

    const summaryData: CreateDailySummary = {
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

    // Upsert (insert or update)
    const { data, error } = await supabase
      .from('daily_summaries')
      .upsert(
        {
          user_id: user.id,
          ...summaryData,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,date',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error upserting daily summary:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error recalculating daily summary:', error);
    return { success: false, error: 'Failed to recalculate daily summary' };
  }
}

/**
 * Delete a daily summary (useful when all entries for a day are deleted)
 */
export async function deleteDailySummary(
  date: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('daily_summaries')
      .delete()
      .eq('user_id', user.id)
      .eq('date', date);

    if (error) {
      console.error('Error deleting daily summary:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting daily summary:', error);
    return { success: false, error: 'Failed to delete daily summary' };
  }
}

/**
 * Helper function to get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Helper function to get month range (first and last day)
 */
export function getMonthRange(year: number, month: number): { startDate: string; endDate: string } {
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  
  return { startDate, endDate };
}
