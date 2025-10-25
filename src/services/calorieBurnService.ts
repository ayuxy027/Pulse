/**
 * Calorie Burn Analysis Service
 * Uses Gemini AI to analyze activity descriptions and estimate calories burned
 */

import { CalorieBurnAnalysisResponse } from '../types/habits';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

/**
 * System prompt for calorie burn analysis
 */
const CALORIE_BURN_PROMPT = `You are a fitness and health expert AI. Your task is to analyze activity descriptions and estimate calories burned.

When given an activity description, you must:
1. Estimate calories burned for a typical person doing this activity
2. Assume moderate intensity and standard duration (30-60 minutes) unless specified
3. Return ONLY a valid JSON object with the following structure:
{
  "caloriesBurned": number
}

Rules:
- Return realistic calorie estimates
- If duration is mentioned, adjust accordingly
- For vague descriptions, assume 30 minutes of moderate activity
- Return ONLY the JSON object, no additional text
- Value must be a positive number

Examples:
Input: "Morning run"
Output: {"caloriesBurned": 300}

Input: "Yoga session"
Output: {"caloriesBurned": 150}

Input: "Gym workout 1 hour"
Output: {"caloriesBurned": 400}

Input: "Walking"
Output: {"caloriesBurned": 120}`;

/**
 * Analyze an activity description and estimate calories burned using Gemini AI
 */
export async function analyzeCalorieBurn(activityDescription: string): Promise<CalorieBurnAnalysisResponse> {
  try {
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return {
        success: false,
        error: 'API configuration error',
      };
    }

    if (!activityDescription || activityDescription.trim().length === 0) {
      return {
        success: false,
        error: 'Activity description is required',
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
                text: `${CALORIE_BURN_PROMPT}\n\nAnalyze this activity and estimate calories burned: ${activityDescription}`
              }
            ]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 200,
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

      const result: { caloriesBurned: number } = JSON.parse(jsonMatch[0]);

      // Validate the data
      if (typeof result.caloriesBurned !== 'number' || result.caloriesBurned <= 0) {
        console.error('Invalid calorie burn data:', result);
        return {
          success: false,
          error: 'Invalid calorie data from AI',
        };
      }

      return {
        success: true,
        caloriesBurned: Math.round(result.caloriesBurned),
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
    console.error('Unexpected error analyzing calorie burn:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze activity',
    };
  }
}

/**
 * Provide a fallback calorie estimate based on activity keywords
 */
export function getFallbackCalorieBurn(activityDescription: string): number {
  const desc = activityDescription.toLowerCase();
  
  // High intensity activities
  if (desc.includes('run') || desc.includes('sprint') || desc.includes('hiit')) {
    return 400;
  }
  
  // Moderate intensity
  if (desc.includes('gym') || desc.includes('workout') || desc.includes('exercise') || desc.includes('swim')) {
    return 300;
  }
  
  // Low to moderate
  if (desc.includes('walk') || desc.includes('yoga') || desc.includes('stretch')) {
    return 150;
  }
  
  // Very light
  if (desc.includes('meditation') || desc.includes('breathing')) {
    return 50;
  }
  
  // Default estimate
  return 200;
}
