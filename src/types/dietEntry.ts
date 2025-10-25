/**
 * Diet Entry Database Types
 * Types for the diet_entries table that stores water intake and meals
 */

export type MealType = 'breakfast' | 'lunch' | 'snacks' | 'dinner';
export type EntryType = 'water' | 'meal';

/**
 * Nutritional information returned by AI analysis
 */
export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Database row structure for diet_entries table
 */
export interface DietEntry {
  id: string;
  user_id: string;
  entry_type: EntryType;
  created_at: string;
  
  // For water entries
  water_amount?: number; // in 100ml cups
  
  // For meal entries
  meal_type?: MealType;
  meal_description?: string;
  meal_date?: string;
  meal_time?: string;
  nutrition?: NutritionInfo;
}

/**
 * Input type for creating a new water entry
 */
export interface CreateWaterEntry {
  entry_type: 'water';
  water_amount: number; // in 100ml cups
}

/**
 * Input type for creating a new meal entry
 */
export interface CreateMealEntry {
  entry_type: 'meal';
  meal_type: MealType;
  meal_description: string;
  meal_date: string; // ISO date string
  meal_time: string; // HH:mm format
}

/**
 * Union type for creating any diet entry
 */
export type CreateDietEntry = CreateWaterEntry | CreateMealEntry;

/**
 * Response from AI nutrition analysis
 */
export interface NutritionAnalysisResponse {
  success: boolean;
  nutrition?: NutritionInfo;
  error?: string;
}
