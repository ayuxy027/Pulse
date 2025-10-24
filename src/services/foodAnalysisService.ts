import axios from 'axios';
import { getFoodAnalysisPrompt, FoodAnalysisConfig } from '../prompt/foodPrompt';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${API_KEY}`;

export interface FoodAnalysisResult {
  foodName: string;
  calories: number;
  nutrientBreakdown: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  healthVerdict: {
    isHealthy: boolean;
    rating: number;
    reason: string;
  };
  immunityImpact: {
    boosting: string[];
    suppressing: string[];
    overall: 'positive' | 'negative' | 'neutral';
  };
  prosAndCons: {
    pros: string[];
    cons: string[];
  };
  recommendations: string[];
  confidenceLevel: number;
  analysisSummary: string;
}

export const analyzeFoodImage = async (
  imageData: string,
  config?: FoodAnalysisConfig
): Promise<FoodAnalysisResult> => {
  try {
    const { data } = await axios.post(API_URL, {
      contents: [{
        parts: [
          { text: getFoodAnalysisPrompt(config) },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: imageData.split(',')[1]
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      }
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });

    const responseText = data.candidates[0]?.content?.parts[0]?.text;
    if (!responseText) {
      throw new Error('No response from AI');
    }

    // Simple JSON extraction
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const result = JSON.parse(jsonMatch[0]);
    
    // Basic validation
    if (!result.foodName || !result.calories) {
      throw new Error('Invalid analysis result');
    }

    return result;
    
  } catch (error) {
    console.error('Analysis error:', error);
    
    // Return a simple fallback
    return {
      foodName: "Analysis Failed",
      calories: 0,
      nutrientBreakdown: {
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0
      },
      healthVerdict: {
        isHealthy: false,
        rating: 1,
        reason: "Unable to analyze food"
      },
      immunityImpact: {
        boosting: [],
        suppressing: [],
        overall: "neutral"
      },
      prosAndCons: {
        pros: [],
        cons: []
      },
      recommendations: ["Try uploading a clearer image"],
      confidenceLevel: 0,
      analysisSummary: "Analysis could not be completed"
    };
  }
};