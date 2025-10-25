/**
 * Nutrition Analysis Service
 * Uses Gemini AI to analyze meal descriptions and extract nutritional information
 */

import { NutritionInfo, NutritionAnalysisResponse } from '../types/dietEntry';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

/**
 * System prompt for nutrition analysis
 */
const NUTRITION_ANALYSIS_PROMPT = `You are a nutrition expert AI. Your task is to analyze meal descriptions and provide accurate nutritional information.

When given a meal description, you must:
1. Estimate the nutritional content based on typical serving sizes
2. Return ONLY a valid JSON object with the following structure:
{
  "calories": number,
  "protein": number (in grams),
  "carbs": number (in grams),
  "fat": number (in grams)
}

Rules:
- Be reasonable with portion size estimates
- If the description is vague, assume standard serving sizes
- Return ONLY the JSON object, no additional text
- All values must be numbers (no strings or null)
- If you cannot determine a value, use 0

Example:
Input: "2 chapati with dal and rice"
Output: {"calories": 450, "protein": 15, "carbs": 75, "fat": 8}`;

/**
 * Analyze a meal description and extract nutritional information using Gemini AI
 */
export async function analyzeMealNutrition(mealDescription: string): Promise<NutritionAnalysisResponse> {
  try {
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return {
        success: false,
        error: 'API configuration error',
      };
    }

    if (!mealDescription || mealDescription.trim().length === 0) {
      return {
        success: false,
        error: 'Meal description is required',
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { 
                text: `${NUTRITION_ANALYSIS_PROMPT}\n\nAnalyze this meal and provide nutritional information: ${mealDescription}`
              }
            ]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500,
          }
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', response.status, errorText);
        return {
          success: false,
          error: `API request failed: ${response.status}`,
        };
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        console.error('No content in Gemini response:', data);
        return {
          success: false,
          error: 'No response from AI',
        };
      }

      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in response:', content);
        return {
          success: false,
          error: 'Invalid response format from AI',
        };
      }

      const nutrition: NutritionInfo = JSON.parse(jsonMatch[0]);

      // Validate the nutrition data
      if (
        typeof nutrition.calories !== 'number' ||
        typeof nutrition.protein !== 'number' ||
        typeof nutrition.carbs !== 'number' ||
        typeof nutrition.fat !== 'number'
      ) {
        console.error('Invalid nutrition data:', nutrition);
        return {
          success: false,
          error: 'Invalid nutrition data from AI',
        };
      }

      return {
        success: true,
        nutrition,
      };
    } catch (fetchError) {
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout - please try again',
        };
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Unexpected error analyzing meal nutrition:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze meal',
    };
  }
}

/**
 * Provide a fallback nutrition estimate when AI analysis fails
 */
export function getFallbackNutrition(mealDescription: string): NutritionInfo {
  // Very basic fallback - just rough estimates
  const wordCount = mealDescription.trim().split(/\s+/).length;
  const estimatedCalories = Math.min(wordCount * 50, 800);

  return {
    calories: estimatedCalories,
    protein: Math.round(estimatedCalories * 0.15 / 4), // 15% of calories from protein
    carbs: Math.round(estimatedCalories * 0.55 / 4), // 55% from carbs
    fat: Math.round(estimatedCalories * 0.30 / 9), // 30% from fat
  };
}
