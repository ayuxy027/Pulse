/**
 * Day Summary Service
 * Uses Gemini AI to generate insightful summaries of a day's nutrition and activities
 */

import { DietEntry } from '../types/dietEntry';
import { Habit } from '../types/habits';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

export interface DaySummaryData {
  date: string;
  entries: DietEntry[];
  habits: Habit[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  waterIntake: number;
  caloriesBurned: number;
}

export interface DaySummaryResponse {
  success: boolean;
  summary?: string;
  insights?: string[];
  error?: string;
}

/**
 * Generate an AI-powered summary of a day's nutrition and activities
 */
export async function generateDaySummary(data: DaySummaryData): Promise<DaySummaryResponse> {
  try {
    if (!GEMINI_API_KEY) {
      return {
        success: false,
        error: 'Gemini API key not configured',
      };
    }

    // Prepare meal descriptions
    const meals = data.entries
      .filter(e => e.entry_type === 'meal' && e.meal_description)
      .map(e => `${e.meal_type}: ${e.meal_description} (${e.nutrition?.calories || 0} cal)`);

    // Prepare habit descriptions
    const completedHabits = data.habits
      .filter(h => h.is_completed)
      .map(h => `${h.description} (${h.calories_burned || 0} cal burned)`);

    const prompt = `You are a nutrition and fitness expert. Analyze this day's nutrition and activity data and provide a helpful, encouraging summary.

**Date:** ${new Date(data.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}

**Nutrition Summary:**
- Total Calories Consumed: ${data.totalCalories} kcal
- Protein: ${data.totalProtein}g
- Carbs: ${data.totalCarbs}g
- Fat: ${data.totalFat}g
- Water Intake: ${data.waterIntake} cups (${data.waterIntake * 100}ml)

**Meals Eaten:**
${meals.length > 0 ? meals.map((m, i) => `${i + 1}. ${m}`).join('\n') : 'No meals logged'}

**Activities Completed:**
${completedHabits.length > 0 ? completedHabits.map((h, i) => `${i + 1}. ${h}`).join('\n') : 'No activities logged'}

**Calories Burned:** ${data.caloriesBurned} kcal

**Net Calories:** ${data.totalCalories - data.caloriesBurned} kcal

Provide:
1. A brief 2-3 sentence summary of the day's nutrition and activity
2. 2-3 key insights or recommendations (each as a short bullet point)

Format your response as JSON:
{
  "summary": "Your 2-3 sentence overview here",
  "insights": ["Insight 1", "Insight 2", "Insight 3"]
}

Be encouraging and practical. If data is missing, acknowledge it positively and encourage tracking.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt,
          }],
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No response from Gemini API');
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text;
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    } else {
      // Try to find JSON object in the text
      const objectMatch = text.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        jsonText = objectMatch[0];
      }
    }

    const parsed = JSON.parse(jsonText);

    return {
      success: true,
      summary: parsed.summary,
      insights: parsed.insights || [],
    };
  } catch (error) {
    console.error('Error generating day summary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate summary',
    };
  }
}

/**
 * Generate a quick fallback summary without AI
 */
export function generateFallbackSummary(data: DaySummaryData): DaySummaryResponse {
  const mealCount = data.entries.filter(e => e.entry_type === 'meal').length;
  const habitCount = data.habits.filter(h => h.is_completed).length;
  const netCalories = data.totalCalories - data.caloriesBurned;

  let summary = `You logged ${mealCount} meal${mealCount !== 1 ? 's' : ''} `;
  summary += `totaling ${data.totalCalories} calories and completed ${habitCount} habit${habitCount !== 1 ? 's' : ''} `;
  summary += `burning ${data.caloriesBurned} calories. `;
  
  if (netCalories > 0) {
    summary += `Your net intake was ${netCalories} calories.`;
  } else {
    summary += `You burned all calories consumed!`;
  }

  const insights = [];
  
  if (data.waterIntake < 8) {
    insights.push(`💧 Water intake: ${data.waterIntake}/8 cups. Stay hydrated!`);
  } else {
    insights.push(`💧 Great hydration! ${data.waterIntake} cups of water.`);
  }

  if (data.totalProtein > 50) {
    insights.push(`💪 Good protein intake: ${data.totalProtein}g`);
  } else {
    insights.push(`💪 Consider more protein-rich foods`);
  }

  if (habitCount > 0) {
    insights.push(`🔥 Active day! ${habitCount} activities completed`);
  }

  return {
    success: true,
    summary,
    insights,
  };
}
