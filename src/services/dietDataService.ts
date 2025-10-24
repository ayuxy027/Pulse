/**
 * Diet Data Service
 * Mock data service for diet, nutrition, and meal tracking features
 * In production, this would integrate with Supabase or another backend
 */

import {
    NutritionData,
    DietTask,
    MealPlan,
    CalorieGoal,
    WeeklyStats,
    DietReminder,
    WaterIntake,
    DietSummary,
    DietPreferences
} from '../types/diet';

// Mock delay to simulate API calls
const mockDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// ============= Nutrition Data =============

export const fetchNutritionData = async (): Promise<NutritionData> => {
    await mockDelay();
    return {
        fiber: { current: 22, goal: 30, unit: 'g' },
        carbs: { current: 180, goal: 250, unit: 'g' },
        protein: { current: 95, goal: 120, unit: 'g' }
    };
};

// ============= Diet Tasks =============

let dietTasksStore: DietTask[] = [
    {
        id: '1',
        title: 'Drink 500ml water before lunch',
        time: '12:30 PM',
        date: new Date().toISOString().split('T')[0],
        priority: 'high',
        completed: false,
        category: 'hydration',
        createdAt: new Date()
    },
    {
        id: '2',
        title: 'Take vitamin supplements',
        time: '2:00 PM',
        date: new Date().toISOString().split('T')[0],
        priority: 'medium',
        completed: false,
        category: 'supplement',
        createdAt: new Date()
    },
    {
        id: '3',
        title: 'Prepare dinner ingredients',
        time: '5:30 PM',
        date: new Date().toISOString().split('T')[0],
        priority: 'low',
        completed: false,
        category: 'meal',
        createdAt: new Date()
    },
    {
        id: '4',
        title: 'Evening protein shake',
        time: '6:00 PM',
        date: new Date().toISOString().split('T')[0],
        priority: 'medium',
        completed: false,
        category: 'supplement',
        createdAt: new Date()
    }
];

export const fetchDietTasks = async (): Promise<DietTask[]> => {
    await mockDelay();
    return [...dietTasksStore];
};

export const addDietTask = async (task: Omit<DietTask, 'id' | 'createdAt'>): Promise<DietTask> => {
    await mockDelay();
    const newTask: DietTask = {
        ...task,
        id: `task-${Date.now()}`,
        createdAt: new Date()
    };
    dietTasksStore.push(newTask);
    return newTask;
};

export const updateDietTask = async (taskId: string, updates: Partial<DietTask>): Promise<DietTask> => {
    await mockDelay();
    const index = dietTasksStore.findIndex(t => t.id === taskId);
    if (index === -1) throw new Error('Task not found');
    
    dietTasksStore[index] = { ...dietTasksStore[index], ...updates };
    return dietTasksStore[index];
};

export const deleteDietTask = async (taskId: string): Promise<void> => {
    await mockDelay();
    dietTasksStore = dietTasksStore.filter(t => t.id !== taskId);
};

export const toggleTaskCompletion = async (taskId: string): Promise<DietTask> => {
    const task = dietTasksStore.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');
    
    return updateDietTask(taskId, { completed: !task.completed });
};

// ============= Meal Plans =============

const mealPlansStore: MealPlan[] = [
    {
        id: 'meal-1',
        name: 'Healthy Breakfast Bowl',
        mealType: 'Breakfast',
        calories: 450,
        time: '8:30 AM',
        items: [
            { id: '1', name: 'Oatmeal with berries', calories: 200, quantity: '1 cup' },
            { id: '2', name: 'Greek yogurt', calories: 150, quantity: '150g' },
            { id: '3', name: 'Orange juice', calories: 100, quantity: '250ml' }
        ],
        nutritionBreakdown: {
            protein: 25,
            carbs: 65,
            fat: 10,
            fiber: 12
        }
    },
    {
        id: 'meal-2',
        name: 'Grilled Chicken Salad',
        mealType: 'Lunch',
        calories: 680,
        time: '1:00 PM',
        items: [
            { id: '4', name: 'Grilled chicken breast', calories: 280, quantity: '200g' },
            { id: '5', name: 'Quinoa bowl', calories: 220, quantity: '1 cup' },
            { id: '6', name: 'Mixed greens salad', calories: 100, quantity: '2 cups' },
            { id: '7', name: 'Green tea', calories: 80, quantity: '1 cup' }
        ],
        nutritionBreakdown: {
            protein: 45,
            carbs: 55,
            fat: 18,
            fiber: 8
        }
    },
    {
        id: 'meal-3',
        name: 'Healthy Snack Mix',
        mealType: 'Snacks',
        calories: 220,
        time: '4:30 PM',
        items: [
            { id: '8', name: 'Mixed nuts', calories: 120, quantity: '30g' },
            { id: '9', name: 'Apple slices', calories: 60, quantity: '1 medium' },
            { id: '10', name: 'Protein bar', calories: 40, quantity: '1 bar' }
        ],
        nutritionBreakdown: {
            protein: 12,
            carbs: 28,
            fat: 8,
            fiber: 6
        }
    }
];

export const fetchMealPlans = async (): Promise<MealPlan[]> => {
    await mockDelay();
    return [...mealPlansStore];
};

export const fetchMealPlanById = async (id: string): Promise<MealPlan | null> => {
    await mockDelay();
    return mealPlansStore.find(m => m.id === id) || null;
};

// ============= Calorie Goals =============

export const fetchCalorieGoal = async (): Promise<CalorieGoal> => {
    await mockDelay();
    return {
        daily: 2200,
        consumed: 1850,
        remaining: 350,
        burned: 420
    };
};

// ============= Weekly Stats =============

export const fetchWeeklyStats = async (): Promise<WeeklyStats> => {
    await mockDelay();
    return {
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        calories: [2100, 2200, 1900, 2300, 2000, 2400, 1800],
        protein: [110, 120, 95, 125, 105, 130, 90],
        carbs: [230, 250, 210, 260, 220, 270, 200],
        fiber: [28, 30, 25, 32, 27, 35, 24]
    };
};

// ============= Diet Reminders =============

const remindersStore: DietReminder[] = [
    {
        id: 'reminder-1',
        title: 'Drink water',
        time: '10:00 AM',
        frequency: 'daily',
        enabled: true
    },
    {
        id: 'reminder-2',
        title: 'Lunch time',
        time: '1:00 PM',
        frequency: 'daily',
        enabled: true
    },
    {
        id: 'reminder-3',
        title: 'Take vitamins',
        time: '9:00 AM',
        frequency: 'daily',
        enabled: true
    }
];

export const fetchReminders = async (): Promise<DietReminder[]> => {
    await mockDelay();
    return [...remindersStore];
};

export const addReminder = async (reminder: Omit<DietReminder, 'id'>): Promise<DietReminder> => {
    await mockDelay();
    const newReminder: DietReminder = {
        ...reminder,
        id: `reminder-${Date.now()}`
    };
    remindersStore.push(newReminder);
    return newReminder;
};

export const toggleReminder = async (reminderId: string): Promise<DietReminder> => {
    await mockDelay();
    const reminder = remindersStore.find(r => r.id === reminderId);
    if (!reminder) throw new Error('Reminder not found');
    
    reminder.enabled = !reminder.enabled;
    return reminder;
};

// ============= Water Intake =============

export const fetchWaterIntake = async (): Promise<WaterIntake> => {
    await mockDelay();
    return {
        date: new Date().toISOString().split('T')[0],
        amount: 2500,
        goal: 3000,
        logs: [
            { id: 'log-1', time: '8:00 AM', amount: 500 },
            { id: 'log-2', time: '10:30 AM', amount: 500 },
            { id: 'log-3', time: '12:00 PM', amount: 500 },
            { id: 'log-4', time: '2:30 PM', amount: 500 },
            { id: 'log-5', time: '4:00 PM', amount: 500 }
        ]
    };
};

// ============= Diet Summary =============

export const fetchDietSummary = async (date?: string): Promise<DietSummary> => {
    await mockDelay();
    const [nutrition, meals, tasks, calories, water] = await Promise.all([
        fetchNutritionData(),
        fetchMealPlans(),
        fetchDietTasks(),
        fetchCalorieGoal(),
        fetchWaterIntake()
    ]);

    return {
        date: date || new Date().toISOString().split('T')[0],
        totalCalories: calories.consumed,
        calorieGoal: calories.daily,
        nutrition,
        meals,
        tasksCompleted: tasks.filter(t => t.completed).length,
        totalTasks: tasks.length,
        waterIntake: water
    };
};

// ============= User Preferences =============

let userPreferences: DietPreferences = {
    calorieGoal: 2200,
    proteinGoal: 120,
    carbsGoal: 250,
    fiberGoal: 30,
    waterGoal: 3000,
    mealTimes: {
        breakfast: '8:00 AM',
        lunch: '1:00 PM',
        dinner: '7:00 PM',
        snacks: '4:00 PM'
    },
    dietaryRestrictions: [],
    allergens: []
};

export const fetchDietPreferences = async (): Promise<DietPreferences> => {
    await mockDelay();
    return { ...userPreferences };
};

export const updateDietPreferences = async (updates: Partial<DietPreferences>): Promise<DietPreferences> => {
    await mockDelay();
    userPreferences = { ...userPreferences, ...updates };
    return { ...userPreferences };
};
