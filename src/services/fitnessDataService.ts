// Fitness tracking mock data service

// Define types for fitness data
export interface BMIData {
  id: number
  value: number
  category: string
  date: string
  weight: number
  height: number
}

export interface WaterNutritionData {
  id: number
  waterIntake: number // in ml
  calories: number
  protein: number // in grams
  carbs: number // in grams
  fat: number // in grams
  date: string
}

export interface RecentIntakeData {
  id: number
  food: string
  calories: number
  time: string
  date: string
  category: string
}

export interface CalorieBalanceData {
  id: number
  caloriesConsumed: number
  caloriesBurned: number
  netBalance: number
  date: string
  goal: number
}

export interface FitnessGoal {
  id: number
  title: string
  description: string
  target: number
  current: number
  unit: string
  deadline: string
}

// Mock data
const mockBMIData: BMIData[] = [
  {
    id: 1,
    value: 22.5,
    category: "Normal",
    date: "2024-01-25",
    weight: 70,
    height: 175
  }
];

const mockWaterNutritionData: WaterNutritionData[] = [
  {
    id: 1,
    waterIntake: 2500,
    calories: 2200,
    protein: 120,
    carbs: 250,
    fat: 80,
    date: "2024-01-25"
  }
];

const mockRecentIntakeData: RecentIntakeData[] = [
  {
    id: 1,
    food: "Grilled Chicken Breast",
    calories: 165,
    time: "12:30 PM",
    date: "2024-01-25",
    category: "Lunch"
  },
  {
    id: 2,
    food: "Greek Yogurt with Berries",
    calories: 150,
    time: "10:00 AM",
    date: "2024-01-25",
    category: "Snack"
  },
  {
    id: 3,
    food: "Oatmeal with Banana",
    calories: 300,
    time: "8:00 AM",
    date: "2024-01-25",
    category: "Breakfast"
  }
];

const mockCalorieBalanceData: CalorieBalanceData[] = [
  {
    id: 1,
    caloriesConsumed: 2200,
    caloriesBurned: 1800,
    netBalance: 400,
    date: "2024-01-25",
    goal: 2000
  }
];

const mockFitnessGoals: FitnessGoal[] = [
  {
    id: 1,
    title: "Daily Water Intake",
    description: "Drink 2.5L of water daily",
    target: 2500,
    current: 1800,
    unit: "ml",
    deadline: "2024-02-25"
  },
  {
    id: 2,
    title: "Calorie Deficit",
    description: "Maintain 500 calorie deficit",
    target: 500,
    current: 400,
    unit: "calories",
    deadline: "2024-02-25"
  },
  {
    id: 3,
    title: "Protein Intake",
    description: "Consume 120g protein daily",
    target: 120,
    current: 95,
    unit: "grams",
    deadline: "2024-02-25"
  }
];

// Mock service functions
export const fetchBMIData = async (): Promise<BMIData[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockBMIData;
};

export const fetchWaterNutritionData = async (): Promise<WaterNutritionData[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockWaterNutritionData;
};

export const fetchRecentIntakeData = async (): Promise<RecentIntakeData[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockRecentIntakeData;
};

export const fetchCalorieBalanceData = async (): Promise<CalorieBalanceData[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockCalorieBalanceData;
};

export const fetchFitnessGoals = async (): Promise<FitnessGoal[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockFitnessGoals;
};
