import axios from 'axios';
import { getFoodAnalysisPrompt, FoodAnalysisConfig } from '../prompt/foodPrompt';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${API_KEY}`;

export interface FoodAnalysisResult {
  foodName: string;
  calories: number;
  servingSize: string;
  nutrientBreakdown: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  micronutrients?: {
    vitamins: { [key: string]: number };
    minerals: { [key: string]: number };
    antioxidants: string[];
    keyNutrients: string[];
  };
  healthVerdict: {
    isHealthy: boolean;
    rating: number;
    reason: string;
    healthScore?: number;
  };
  immunityImpact: {
    boosting: string[];
    suppressing: string[];
    overall: 'positive' | 'negative' | 'neutral';
    immunityScore?: number;
    immuneProperties?: string[];
  };
  prosAndCons: {
    pros: string[];
    cons: string[];
  };
  allergenicProperties?: {
    commonAllergens: string[];
    glutenFree: boolean;
    dairyFree: boolean;
    nutFree: boolean;
    vegan: boolean;
    vegetarian: boolean;
  };
  dietaryTags?: string[];
  recommendations: string[];
  personalizedInsights?: {
    suitabilityForDiet: string;
    mealTiming: string;
    portionRecommendation: string;
    healthGoalsAlignment: string[];
  };
  confidenceLevel: number;
  analysisSummary: string;
}

export const analyzeFoodImage = async (
  imageData: string,
  config?: FoodAnalysisConfig
): Promise<FoodAnalysisResult> => {
  // Check if API key is available
  if (!API_KEY) {
    console.warn('VITE_GEMINI_API_KEY not found. Using mock data for demonstration.');
    return getMockAnalysisResult();
  }

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
        maxOutputTokens: 4096,
      }
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });

    const responseText = data.candidates[0]?.content?.parts[0]?.text;
    if (!responseText) {
      throw new Error('No response from AI');
    }

    // Clean the response text - remove markdown code blocks if present
    let cleanedText = responseText.trim();
    
    // Remove markdown code blocks (```json or ```)
    cleanedText = cleanedText.replace(/^```json\s*/i, '');
    cleanedText = cleanedText.replace(/^```\s*/i, '');
    cleanedText = cleanedText.replace(/\s*```$/i, '');
    
    // Find the JSON object - look for the first { and last }
    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
      throw new Error('No valid JSON structure found in response');
    }
    
    const jsonText = cleanedText.substring(firstBrace, lastBrace + 1);
    
    let result;
    try {
      result = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Attempted to parse:', jsonText.substring(0, 500));
      throw new Error('Invalid JSON format in AI response');
    }
    
    // Basic validation
    if (!result.foodName || typeof result.calories !== 'number') {
      console.error('Invalid result structure:', result);
      throw new Error('Invalid analysis result structure');
    }

    return result;
    
  } catch (error) {
    console.error('Analysis error:', error);
    
    // Return a simple fallback
    return {
      foodName: "Analysis Failed",
      calories: 0,
      servingSize: "100g",
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

// Mock analysis result for when API key is not available
const getMockAnalysisResult = (): FoodAnalysisResult => {
  return {
    foodName: "Grilled Chicken Salad",
    calories: 320,
    servingSize: "100g",
    nutrientBreakdown: {
      protein: 28,
      carbs: 12,
      fat: 18,
      fiber: 4,
      sugar: 6,
      sodium: 450
    },
    healthVerdict: {
      isHealthy: true,
      rating: 8,
      reason: "High protein, low carbs, good fiber content"
    },
    immunityImpact: {
      boosting: ["Vitamin C from vegetables", "Protein for immune function"],
      suppressing: [],
      overall: "positive"
    },
    prosAndCons: {
      pros: ["High protein", "Low calorie", "Rich in vitamins"],
      cons: ["Moderate sodium content"]
    },
    recommendations: [
      "Add more leafy greens for extra nutrients",
      "Consider reducing dressing for lower calories",
      "Include a variety of colorful vegetables"
    ],
    confidenceLevel: 85,
    analysisSummary: "Healthy grilled chicken salad with good nutritional balance (Mock data - API key not configured)"
  };
};