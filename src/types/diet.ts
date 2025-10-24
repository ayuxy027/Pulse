/**
 * Diet Type Definitions
 * Type definitions for diet, nutrition, and meal tracking features
 */

// Nutrition Data Types
export interface NutritionData {
    fiber: NutrientInfo;
    carbs: NutrientInfo;
    protein: NutrientInfo;
}

export interface NutrientInfo {
    current: number;
    goal: number;
    unit: string;
}

// Diet Task Types
export interface DietTask {
    id: string;
    title: string;
    time: string;
    date: string;
    priority: 'high' | 'medium' | 'low';
    completed: boolean;
    category?: 'meal' | 'hydration' | 'supplement' | 'exercise' | 'other';
    createdAt: Date;
}

// Meal Plan Types
export interface MealPlan {
    id: string;
    name: string;
    mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
    calories: number;
    time: string;
    items: MealItem[];
    nutritionBreakdown: {
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
    };
    imageUrl?: string;
}

export interface MealItem {
    id: string;
    name: string;
    calories: number;
    quantity: string;
    category?: string;
}

// Calorie Goal Types
export interface CalorieGoal {
    daily: number;
    consumed: number;
    remaining: number;
    burned?: number;
}

// Weekly Stats Types
export interface WeeklyStats {
    calories: number[];
    protein: number[];
    carbs: number[];
    fiber: number[];
    days: string[];
}

// Calendar Event Types
export interface DietCalendarEvent {
    id: string;
    date: Date;
    meal?: MealPlan;
    task?: DietTask;
    type: 'meal' | 'task' | 'reminder';
}

// Reminder Types
export interface DietReminder {
    id: string;
    title: string;
    time: string;
    frequency: 'once' | 'daily' | 'weekly' | 'custom';
    enabled: boolean;
    daysOfWeek?: number[]; // 0-6 for Sunday-Saturday
    lastTriggered?: Date;
}

// Water Intake Types
export interface WaterIntake {
    date: string;
    amount: number; // in ml
    goal: number; // in ml
    logs: WaterLog[];
}

export interface WaterLog {
    id: string;
    time: string;
    amount: number;
}

// Food Item Types (for food scanner integration)
export interface FoodItem {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    servingSize: string;
    barcode?: string;
}

// Diet Summary Types
export interface DietSummary {
    date: string;
    totalCalories: number;
    calorieGoal: number;
    nutrition: NutritionData;
    meals: MealPlan[];
    tasksCompleted: number;
    totalTasks: number;
    waterIntake: WaterIntake;
}

// User Preferences Types
export interface DietPreferences {
    calorieGoal: number;
    proteinGoal: number;
    carbsGoal: number;
    fiberGoal: number;
    waterGoal: number;
    mealTimes: {
        breakfast: string;
        lunch: string;
        dinner: string;
        snacks: string;
    };
    dietaryRestrictions: string[];
    allergens: string[];
}
