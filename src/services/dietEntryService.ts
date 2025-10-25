/**
 * Diet Entry Service
 * Handles all database operations for diet entries (water and meals)
 */

import { supabase } from './supabase';
import { DietEntry, CreateDietEntry, CreateWaterEntry, CreateMealEntry } from '../types/dietEntry';

/**
 * Create a new diet entry (water or meal)
 */
export async function createDietEntry(entry: CreateDietEntry): Promise<{ success: boolean; data?: DietEntry; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const entryData: Partial<DietEntry> = {
      user_id: user.id,
      entry_type: entry.entry_type,
    };

    if (entry.entry_type === 'water') {
      const waterEntry = entry as CreateWaterEntry;
      entryData.water_amount = waterEntry.water_amount;
    } else if (entry.entry_type === 'meal') {
      const mealEntry = entry as CreateMealEntry;
      entryData.meal_type = mealEntry.meal_type;
      entryData.meal_description = mealEntry.meal_description;
      entryData.meal_date = mealEntry.meal_date;
      entryData.meal_time = mealEntry.meal_time;
      // nutrition will be added separately after AI analysis
    }

    const { data, error } = await supabase
      .from('diet_entries')
      .insert(entryData)
      .select()
      .single();

    if (error) {
      console.error('Error creating diet entry:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error creating diet entry:', error);
    return { success: false, error: 'Failed to create diet entry' };
  }
}

/**
 * Update a meal entry with nutrition information from AI analysis
 */
export async function updateMealNutrition(
  entryId: string,
  nutrition: DietEntry['nutrition']
): Promise<{ success: boolean; data?: DietEntry; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('diet_entries')
      .update({ nutrition })
      .eq('id', entryId)
      .select()
      .single();

    if (error) {
      console.error('Error updating meal nutrition:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error updating meal nutrition:', error);
    return { success: false, error: 'Failed to update meal nutrition' };
  }
}

/**
 * Get all diet entries for the current user
 */
export async function getUserDietEntries(
  startDate?: string,
  endDate?: string
): Promise<{ success: boolean; data?: DietEntry[]; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    let query = supabase
      .from('diet_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching diet entries:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Unexpected error fetching diet entries:', error);
    return { success: false, error: 'Failed to fetch diet entries' };
  }
}

/**
 * Get diet entries for a specific date
 */
export async function getDietEntriesByDate(
  date: string
): Promise<{ success: boolean; data?: DietEntry[]; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get entries where:
    // - meal_date matches the date (for meals)
    // - OR created_at is on that date (for water entries)
    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59`;

    const { data: entries, error } = await supabase
      .from('diet_entries')
      .select('*')
      .eq('user_id', user.id)
      .or(`meal_date.eq.${date},and(created_at.gte.${startOfDay},created_at.lte.${endOfDay})`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching diet entries by date:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: entries || [] };
  } catch (error) {
    console.error('Unexpected error fetching diet entries by date:', error);
    return { success: false, error: 'Failed to fetch diet entries' };
  }
}

/**
 * Delete a diet entry
 */
export async function deleteDietEntry(
  entryId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('diet_entries')
      .delete()
      .eq('id', entryId);

    if (error) {
      console.error('Error deleting diet entry:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting diet entry:', error);
    return { success: false, error: 'Failed to delete diet entry' };
  }
}

/**
 * Get nutrition summary for a date range
 */
export async function getNutritionSummary(
  startDate: string,
  endDate: string
): Promise<{ 
  success: boolean; 
  data?: {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    waterIntake: number; // in 100ml cups
    mealCount: number;
  }; 
  error?: string;
}> {
  try {
    const result = await getUserDietEntries(startDate, endDate);
    
    if (!result.success || !result.data) {
      return { success: false, error: result.error };
    }

    const summary = {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      waterIntake: 0,
      mealCount: 0,
    };

    result.data.forEach(entry => {
      if (entry.entry_type === 'water' && entry.water_amount) {
        summary.waterIntake += entry.water_amount;
      } else if (entry.entry_type === 'meal' && entry.nutrition) {
        summary.totalCalories += entry.nutrition.calories || 0;
        summary.totalProtein += entry.nutrition.protein || 0;
        summary.totalCarbs += entry.nutrition.carbs || 0;
        summary.totalFat += entry.nutrition.fat || 0;
        summary.mealCount++;
      }
    });

    return { success: true, data: summary };
  } catch (error) {
    console.error('Unexpected error calculating nutrition summary:', error);
    return { success: false, error: 'Failed to calculate nutrition summary' };
  }
}
