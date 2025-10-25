/**
 * Profile Type Definitions
 * Type definitions for user profile, health metrics, and daily tracking
 */

// ============================================
// 1️⃣ STATIC INFORMATION (One-time setup)
// ============================================
export interface StaticProfile {
  id: string;
  user_id: string;
  full_name: string;
  date_of_birth: string; // ISO date format (YYYY-MM-DD)
  gender: 'Male' | 'Female' | 'Prefer not to say' | 'Other';
  diet_type: 'Vegetarian' | 'Non-Vegetarian' | 'Vegan' | 'Jain' | 'Eggetarian';
  has_food_allergies: boolean;
  food_allergies_details?: string; // If has_food_allergies is true
  medical_conditions: string[]; // Multi-select: 'Diabetes', 'Thyroid', 'PCOS', 'Asthma', 'None', 'Other'
  medical_conditions_other?: string; // If 'Other' is selected
  on_regular_medication: boolean;
  medication_details?: string; // If on_regular_medication is true
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// ============================================
// 2️⃣ HEALTH METRICS (Long-term dynamic info)
// ============================================
export interface HealthMetrics {
  id: string;
  user_id: string;
  height_cm: number; // Height in centimeters
  current_weight_kg: number; // Current weight in kilograms
  goal: 'Weight Loss' | 'Weight Gain' | 'Maintain' | 'Boost Immunity';
  physical_activity_level: 'Sedentary' | 'Light' | 'Moderate' | 'High';
  smoking_habits: 'Yes' | 'No' | 'Sometimes';
  alcohol_consumption: 'Never' | 'Occasionally' | 'Often';
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  recorded_date: string; // Date when metrics were recorded (for tracking history)
}

// ============================================
// 3️⃣ DAILY TRACKING (Real-time updates)
// ============================================
export interface DailyTracking {
  id: string;
  user_id: string;
  tracked_date: string; // ISO date format (YYYY-MM-DD)
  
  // Meals
  breakfast_logged: boolean;
  breakfast_time?: string;
  breakfast_image_url?: string;
  breakfast_notes?: string;
  
  lunch_logged: boolean;
  lunch_time?: string;
  lunch_image_url?: string;
  lunch_notes?: string;
  
  dinner_logged: boolean;
  dinner_time?: string;
  dinner_image_url?: string;
  dinner_notes?: string;
  
  // Hydration
  water_glasses: number; // Number of glasses consumed
  water_bottles?: number; // Alternative tracking (number of bottles)
  
  // Sleep
  sleep_hours: number; // Hours slept last night
  sleep_quality?: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  
  // Exercise
  exercise_logged: boolean;
  exercise_type?: 'Running' | 'Walking' | 'Yoga' | 'Strength Training' | 'Cycling' | 'Sports' | 'Other';
  exercise_duration_minutes?: number;
  exercise_notes?: string;
  
  // Symptoms
  symptoms: string[]; // Multi-select: 'Cold', 'Cough', 'Headache', 'Fatigue', 'None'
  symptoms_notes?: string;
  
  // Mood/Stress
  stress_mood_level: 1 | 2 | 3 | 4 | 5; // 1=Very Low, 2=Low, 3=Normal, 4=High, 5=Very High
  
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// ============================================
// FORM STATE & UI TYPES
// ============================================
export interface ProfileFormState {
  staticProfile?: Partial<StaticProfile>;
  healthMetrics?: Partial<HealthMetrics>;
  dailyTracking?: Partial<DailyTracking>;
  isLoading: boolean;
  error?: string;
}

export interface SectionEditState {
  isEditing: boolean;
  isSaving: boolean;
  error?: string;
}

// ============================================
// COMPONENT PROPS
// ============================================
export interface StaticInfoSectionProps {
  data?: StaticProfile;
  isLoading?: boolean;
  onSave?: (data: Partial<StaticProfile>) => Promise<void>;
}

export interface HealthMetricsSectionProps {
  data?: HealthMetrics;
  isLoading?: boolean;
  onSave?: (data: Partial<HealthMetrics>) => Promise<void>;
}

export interface DailyTrackingSectionProps {
  data?: DailyTracking;
  isLoading?: boolean;
  onSave?: (data: Partial<DailyTracking>) => Promise<void>;
}

// ============================================
// RESPONSE TYPES
// ============================================
export interface ProfileResponse {
  success: boolean;
  data?: StaticProfile | HealthMetrics | DailyTracking;
  error?: string;
}

export interface ProfileListResponse {
  success: boolean;
  data?: (StaticProfile | HealthMetrics | DailyTracking)[];
  error?: string;
}
