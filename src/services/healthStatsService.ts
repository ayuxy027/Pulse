/**
 * Health Stats Service
 * Fetches real-time health statistics for dashboard display
 */

import { supabase } from './supabase';

export interface HealthStats {
  bmi: {
    value: number;
    category: string;
  } | null;
  waterIntake: {
    current: number; // in liters
    goal: number;
  } | null;
  calories: {
    current: number;
    goal: number;
  } | null;
}

/**
 * Calculate BMI from height and weight
 */
function calculateBMI(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

/**
 * Get BMI category based on value
 */
function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

/**
 * Calculate recommended daily calories based on user metrics and goal
 */
function calculateCalorieGoal(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: string,
  activityLevel: string,
  goal: string
): number {
  // Basic BMR calculation using Mifflin-St Jeor Equation
  let bmr: number;
  if (gender === 'Male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  // Activity multiplier
  const activityMultipliers: Record<string, number> = {
    'Sedentary': 1.2,
    'Light': 1.375,
    'Moderate': 1.55,
    'High': 1.725
  };

  const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);

  // Adjust based on goal
  if (goal === 'Weight Loss') {
    return Math.round(tdee - 500); // 500 calorie deficit
  } else if (goal === 'Weight Gain') {
    return Math.round(tdee + 500); // 500 calorie surplus
  }
  
  return Math.round(tdee); // Maintain
}

/**
 * Get today's health statistics for the current user
 */
export async function getTodayHealthStats(): Promise<{ 
  success: boolean; 
  data?: HealthStats; 
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get user's latest health metrics for BMI and calorie goal calculation
    const { data: healthMetrics, error: healthError } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('recorded_date', { ascending: false })
      .limit(1)
      .single();

    if (healthError && healthError.code !== 'PGRST116') {
      console.error('Error fetching health metrics:', healthError);
    }

    // Get user profile for age and gender (needed for calorie calculation)
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('date_of_birth, gender')
      .eq('user_id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', profileError);
    }

    // Calculate BMI
    let bmi = null;
    if (healthMetrics?.height_cm && healthMetrics?.current_weight_kg) {
      const bmiValue = calculateBMI(
        healthMetrics.height_cm, 
        healthMetrics.current_weight_kg
      );
      bmi = {
        value: bmiValue,
        category: getBMICategory(bmiValue)
      };
    }

    // Calculate calorie goal
    let calorieGoal = 2000; // default
    if (healthMetrics && userProfile) {
      const age = new Date().getFullYear() - new Date(userProfile.date_of_birth).getFullYear();
      calorieGoal = calculateCalorieGoal(
        healthMetrics.current_weight_kg,
        healthMetrics.height_cm,
        age,
        userProfile.gender,
        healthMetrics.physical_activity_level,
        healthMetrics.goal
      );
    }

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Get today's water intake from diet_entries
    const { data: waterEntries, error: waterError } = await supabase
      .from('diet_entries')
      .select('water_amount')
      .eq('user_id', user.id)
      .eq('entry_type', 'water')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);

    if (waterError) {
      console.error('Error fetching water intake:', waterError);
    }

    // Calculate total water intake (water_amount is in 100ml cups, convert to liters)
    const totalWaterCups = waterEntries?.reduce((sum, entry) => sum + (entry.water_amount || 0), 0) || 0;
    const totalWaterLiters = Number((totalWaterCups * 0.1).toFixed(1)); // 100ml = 0.1L

    // Get today's calorie intake from diet_entries
    const { data: mealEntries, error: mealError } = await supabase
      .from('diet_entries')
      .select('nutrition')
      .eq('user_id', user.id)
      .eq('entry_type', 'meal')
      .eq('meal_date', today);

    if (mealError) {
      console.error('Error fetching meal entries:', mealError);
    }

    // Calculate total calories
    const totalCalories = mealEntries?.reduce((sum, entry) => {
      return sum + (entry.nutrition?.calories || 0);
    }, 0) || 0;

    const stats: HealthStats = {
      bmi,
      waterIntake: {
        current: totalWaterLiters,
        goal: 2.5 // default 2.5L per day
      },
      calories: {
        current: Math.round(totalCalories),
        goal: calorieGoal
      }
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error('Unexpected error fetching health stats:', error);
    return { success: false, error: 'Failed to fetch health statistics' };
  }
}
