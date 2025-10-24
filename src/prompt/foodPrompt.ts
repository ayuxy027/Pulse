export interface FoodAnalysisConfig {
  userProfile?: {
    age?: number;
    weight?: number;
    height?: number;
    gender?: string;
    activityLevel?: string;
  };
}

export const getFoodAnalysisPrompt = (config?: FoodAnalysisConfig): string => {
  return `
    Analyze the food image and return ONLY valid JSON. Provide comprehensive nutrition analysis.
    
    **For invalid images, return:**
    {
      "foodName": "Not Applicable",
      "confidenceLevel": 0,
      "analysisSummary": "Non-food image detected"
    }
    
    **For valid food images, return:**
    {
      "foodName": "string",
      "calories": number,
      "nutrientBreakdown": {
        "protein": number,
        "carbs": number,
        "fat": number,
        "fiber": number,
        "sugar": number,
        "sodium": number
      },
      "healthVerdict": {
        "isHealthy": boolean,
        "rating": number,
        "reason": "string"
      },
      "immunityImpact": {
        "boosting": ["string"],
        "suppressing": ["string"],
        "overall": "positive|negative|neutral"
      },
      "prosAndCons": {
        "pros": ["string"],
        "cons": ["string"]
      },
      "recommendations": ["string"],
      "confidenceLevel": number,
      "analysisSummary": "string"
    }
    
    **Analysis Requirements:**
    - Identify the food/dish accurately
    - Provide realistic calorie estimates
    - Give detailed nutrient breakdown
    - Assess health impact (1-10 scale)
    - Identify immunity-boosting or suppressing effects
    - List pros and cons
    - Provide 3 practical recommendations
    - Maintain confidence level 80-100% for valid food images
    
    **CRITICAL JSON FORMATTING REQUIREMENTS:**
    - Response must be ONLY pure JSON - no markdown, no explanations
    - Use double quotes for ALL strings and keys
    - NO trailing commas anywhere
    - NO single quotes - only double quotes
    - NO explanatory text outside the JSON object
    - NO code blocks or markdown formatting
    - Start response with { and end with }
    - All numeric values must be actual numbers (not strings)
    - All arrays must contain valid elements
    
    **EXAMPLE OF CORRECT FORMAT:**
    {
      "foodName": "Grilled Chicken Salad",
      "calories": 320,
      "nutrientBreakdown": {
        "protein": 28,
        "carbs": 12,
        "fat": 18,
        "fiber": 4,
        "sugar": 6,
        "sodium": 450
      },
      "healthVerdict": {
        "isHealthy": true,
        "rating": 8,
        "reason": "High protein, low carbs, good fiber content"
      },
      "immunityImpact": {
        "boosting": ["Vitamin C from vegetables", "Protein for immune function"],
        "suppressing": [],
        "overall": "positive"
      },
      "prosAndCons": {
        "pros": ["High protein", "Low calorie", "Rich in vitamins"],
        "cons": ["Moderate sodium content"]
      },
      "recommendations": [
        "Add more leafy greens for extra nutrients",
        "Consider reducing dressing for lower calories",
        "Include a variety of colorful vegetables"
      ],
      "confidenceLevel": 92,
      "analysisSummary": "Healthy grilled chicken salad with good nutritional balance"
    }
    
    **NEVER INCLUDE:**
    - \`\`\`json or \`\`\` markers
    - Explanatory text like "Here's the analysis:"
    - Comments or notes
    - Incomplete JSON objects
    
    ${config?.userProfile ? `User Profile: ${JSON.stringify(config.userProfile)}` : ''}
  `.replace(/\s+/g, ' ').trim();
};
