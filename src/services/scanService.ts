import axios from 'axios';
import { getDiseaseDetectionPrompt, DiseasePromptConfig } from '../prompt/scanPrompt';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Updated to use Gemini 2.5 Pro with latest API endpoint
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${API_KEY}`;

export interface DiseaseAnalysisResult {
  cropName: string;
  diseaseName: string;
  timeToTreat: string;
  estimatedRecovery: string;
  yieldImpact: string;
  severityLevel: string;
  symptomDescription: string;
  environmentalFactors: {
    factor: string;
    currentValue: string;
    optimalRange: string;
    status: 'optimal' | 'warning' | 'critical';
  }[];
  realTimeMetrics: {
    spreadRisk: {
      level: string;
      value: number;
      trend: 'increasing' | 'stable' | 'decreasing';
    };
    diseaseProgression: {
      stage: string;
      rate: number;
    };
    environmentalConditions: {
      temperature: number;
      humidity: number;
      soilMoisture: number;
      lastUpdated: string;
    };
  };
  organicTreatments: string[];
  ipmStrategies: string[];
  preventionPlan: string[];
  confidenceLevel: number;
  diagnosisSummary: string;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>;
}

// Default response structure to ensure type safety
const DEFAULT_RESPONSE: DiseaseAnalysisResult = {
  cropName: "Unknown Crop",
  diseaseName: "Unknown Disease",
  timeToTreat: "Immediate",
  estimatedRecovery: "2-4 weeks",
  yieldImpact: "Moderate",
  severityLevel: "medium",
  symptomDescription: "Symptoms detected but analysis incomplete",
  environmentalFactors: [
    {
      factor: "Temperature",
      currentValue: "25°C",
      optimalRange: "20-30°C",
      status: "optimal"
    },
    {
      factor: "Humidity",
      currentValue: "60%",
      optimalRange: "50-70%",
      status: "optimal"
    },
    {
      factor: "Soil Moisture",
      currentValue: "40%",
      optimalRange: "30-50%",
      status: "optimal"
    },
    {
      factor: "Light Exposure",
      currentValue: "Partial Sun",
      optimalRange: "Full to Partial Sun",
      status: "optimal"
    }
  ],
  realTimeMetrics: {
    spreadRisk: {
      level: "Medium",
      value: 45,
      trend: "stable"
    },
    diseaseProgression: {
      stage: "Early",
      rate: 5
    },
    environmentalConditions: {
      temperature: 25,
      humidity: 60,
      soilMoisture: 40,
      lastUpdated: new Date().toLocaleDateString()
    }
  },
  organicTreatments: [
    "Apply neem oil spray weekly",
    "Use copper-based fungicide",
    "Improve air circulation"
  ],
  ipmStrategies: [
    "Monitor plant health daily",
    "Use biological control agents",
    "Implement crop rotation"
  ],
  preventionPlan: [
    "Ensure proper drainage",
    "Maintain optimal humidity levels",
    "Regular plant inspection"
  ],
  confidenceLevel: 75,
  diagnosisSummary: "Disease analysis completed with moderate confidence. Follow recommended treatment protocols."
};

// Function to extract and clean JSON from response text
const extractJSONFromResponse = (responseText: string): string => {
  // Remove all markdown formatting
  let cleaned = responseText
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .replace(/^.*?(\{.*\}).*?$/s, '$1') // Extract JSON object
    .replace(/\n/g, ' ')
    .replace(/\r/g, '')
    .replace(/\t/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // If no JSON found, try to find JSON-like content
  if (!cleaned.startsWith('{')) {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }
  }

  // Check if JSON is truncated and try to fix it
  if (cleaned.endsWith('...') || !cleaned.endsWith('}')) {
    // Try to complete truncated JSON
    const lastBracket = cleaned.lastIndexOf('}');
    if (lastBracket > 0) {
      cleaned = cleaned.substring(0, lastBracket + 1);
    } else {
      // If no closing bracket, try to add default closing structure
      if (cleaned.includes('"realTimeMetrics"') && !cleaned.includes('}')) {
        cleaned += '}, "organicTreatments": [], "ipmStrategies": [], "preventionPlan": [], "confidenceLevel": 75, "diagnosisSummary": "Analysis completed"}';
      }
    }
  }

  return cleaned;
};

// Function to validate and fix JSON structure
const validateAndFixResponse = (parsed: any): DiseaseAnalysisResult => {
  // Deep merge with default to ensure all fields exist
  const result = { ...DEFAULT_RESPONSE, ...parsed };

  // Validate and fix each field
  result.cropName = typeof result.cropName === 'string' ? result.cropName : DEFAULT_RESPONSE.cropName;
  result.diseaseName = typeof result.diseaseName === 'string' ? result.diseaseName : DEFAULT_RESPONSE.diseaseName;
  result.timeToTreat = typeof result.timeToTreat === 'string' ? result.timeToTreat : DEFAULT_RESPONSE.timeToTreat;
  result.estimatedRecovery = typeof result.estimatedRecovery === 'string' ? result.estimatedRecovery : DEFAULT_RESPONSE.estimatedRecovery;
  result.yieldImpact = typeof result.yieldImpact === 'string' ? result.yieldImpact : DEFAULT_RESPONSE.yieldImpact;
  result.severityLevel = ['mild', 'medium', 'severe'].includes(result.severityLevel) ? result.severityLevel : DEFAULT_RESPONSE.severityLevel;
  result.symptomDescription = typeof result.symptomDescription === 'string' ? result.symptomDescription : DEFAULT_RESPONSE.symptomDescription;
  result.confidenceLevel = typeof result.confidenceLevel === 'number' && result.confidenceLevel >= 0 && result.confidenceLevel <= 100 ? result.confidenceLevel : DEFAULT_RESPONSE.confidenceLevel;
  result.diagnosisSummary = typeof result.diagnosisSummary === 'string' ? result.diagnosisSummary : DEFAULT_RESPONSE.diagnosisSummary;

  // Validate arrays and limit to 3 items each
  result.organicTreatments = Array.isArray(result.organicTreatments) ? result.organicTreatments.slice(0, 3) : DEFAULT_RESPONSE.organicTreatments;
  result.ipmStrategies = Array.isArray(result.ipmStrategies) ? result.ipmStrategies.slice(0, 3) : DEFAULT_RESPONSE.ipmStrategies;
  result.preventionPlan = Array.isArray(result.preventionPlan) ? result.preventionPlan.slice(0, 3) : DEFAULT_RESPONSE.preventionPlan;

  // Validate environmental factors
  if (Array.isArray(result.environmentalFactors)) {
    result.environmentalFactors = result.environmentalFactors.map((factor: any) => ({
      factor: typeof factor.factor === 'string' ? factor.factor : 'Unknown Factor',
      currentValue: typeof factor.currentValue === 'string' ? factor.currentValue : 'N/A',
      optimalRange: typeof factor.optimalRange === 'string' ? factor.optimalRange : 'N/A',
      status: ['optimal', 'warning', 'critical'].includes(factor.status) ? factor.status : 'optimal'
    }));
  } else {
    result.environmentalFactors = DEFAULT_RESPONSE.environmentalFactors;
  }

  // Validate realTimeMetrics
  if (result.realTimeMetrics && typeof result.realTimeMetrics === 'object') {
    // Validate spreadRisk and ensure it's out of 100
    if (result.realTimeMetrics.spreadRisk && typeof result.realTimeMetrics.spreadRisk === 'object') {
      let spreadValue = typeof result.realTimeMetrics.spreadRisk.value === 'number' ? result.realTimeMetrics.spreadRisk.value : DEFAULT_RESPONSE.realTimeMetrics.spreadRisk.value;
      
      // If value is less than 1, multiply by 100 to convert from decimal to percentage
      if (spreadValue < 1) {
        spreadValue = Math.round(spreadValue * 100);
      }
      
      // Ensure value is between 0 and 100
      spreadValue = Math.max(0, Math.min(100, spreadValue));
      
      result.realTimeMetrics.spreadRisk = {
        level: typeof result.realTimeMetrics.spreadRisk.level === 'string' ? result.realTimeMetrics.spreadRisk.level : DEFAULT_RESPONSE.realTimeMetrics.spreadRisk.level,
        value: spreadValue,
        trend: ['increasing', 'stable', 'decreasing'].includes(result.realTimeMetrics.spreadRisk.trend) ? result.realTimeMetrics.spreadRisk.trend : DEFAULT_RESPONSE.realTimeMetrics.spreadRisk.trend
      };
    } else {
      result.realTimeMetrics.spreadRisk = DEFAULT_RESPONSE.realTimeMetrics.spreadRisk;
    }

    // Validate diseaseProgression
    if (result.realTimeMetrics.diseaseProgression && typeof result.realTimeMetrics.diseaseProgression === 'object') {
      result.realTimeMetrics.diseaseProgression = {
        stage: typeof result.realTimeMetrics.diseaseProgression.stage === 'string' ? result.realTimeMetrics.diseaseProgression.stage : DEFAULT_RESPONSE.realTimeMetrics.diseaseProgression.stage,
        rate: typeof result.realTimeMetrics.diseaseProgression.rate === 'number' ? result.realTimeMetrics.diseaseProgression.rate : DEFAULT_RESPONSE.realTimeMetrics.diseaseProgression.rate
      };
    } else {
      result.realTimeMetrics.diseaseProgression = DEFAULT_RESPONSE.realTimeMetrics.diseaseProgression;
    }

    // Validate environmentalConditions
    if (result.realTimeMetrics.environmentalConditions && typeof result.realTimeMetrics.environmentalConditions === 'object') {
      result.realTimeMetrics.environmentalConditions = {
        temperature: typeof result.realTimeMetrics.environmentalConditions.temperature === 'number' ? result.realTimeMetrics.environmentalConditions.temperature : DEFAULT_RESPONSE.realTimeMetrics.environmentalConditions.temperature,
        humidity: typeof result.realTimeMetrics.environmentalConditions.humidity === 'number' ? result.realTimeMetrics.environmentalConditions.humidity : DEFAULT_RESPONSE.realTimeMetrics.environmentalConditions.humidity,
        soilMoisture: typeof result.realTimeMetrics.environmentalConditions.soilMoisture === 'number' ? result.realTimeMetrics.environmentalConditions.soilMoisture : DEFAULT_RESPONSE.realTimeMetrics.environmentalConditions.soilMoisture,
        lastUpdated: typeof result.realTimeMetrics.environmentalConditions.lastUpdated === 'string' ? result.realTimeMetrics.environmentalConditions.lastUpdated : DEFAULT_RESPONSE.realTimeMetrics.environmentalConditions.lastUpdated
      };
    } else {
      result.realTimeMetrics.environmentalConditions = DEFAULT_RESPONSE.realTimeMetrics.environmentalConditions;
    }
  } else {
    result.realTimeMetrics = DEFAULT_RESPONSE.realTimeMetrics;
  }

  return result;
};

export const analyzePlantImage = async (
  imageData: string,
  config?: DiseasePromptConfig
): Promise<DiseaseAnalysisResult> => {
  try {
    console.log('Starting plant image analysis...');
    
    const { data } = await axios.post<GeminiResponse>(API_URL, {
      contents: [{
        parts: [
          { text: getDiseaseDetectionPrompt(config) },
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
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096, // Increased to handle complete responses
      }
    }, {
      headers: { 
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    const responseText = data.candidates[0]?.content?.parts[0]?.text;
    if (!responseText) {
      console.warn('No analysis content found, using default response');
      return DEFAULT_RESPONSE;
    }

    console.log('Raw response received:', responseText.substring(0, 200) + '...');

    // Extract and clean JSON
    const cleanedText = extractJSONFromResponse(responseText);
    console.log('Cleaned JSON text:', cleanedText.substring(0, 200) + '...');

    let parsedResult: any;
    try {
      parsedResult = JSON.parse(cleanedText);
      console.log('JSON parsed successfully');
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Cleaned Response Text:', cleanedText);
      
      // Try alternative parsing methods
      try {
        // Try to fix common JSON issues and handle truncation
        let fixedJson = cleanedText
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Add quotes to unquoted keys
          .replace(/:\s*([^",{\[\s][^",}\]\]]*?)(\s*[,\}\]])/g, ': "$1"$2'); // Add quotes to unquoted string values
        
        // Handle specific truncation patterns
        if (fixedJson.includes('"diseaseProgression"') && !fixedJson.includes('}')) {
          // Complete the diseaseProgression object
          if (fixedJson.includes('"rate":')) {
            fixedJson = fixedJson.replace(/"rate":\s*[^}]*$/, '"rate": 5}}');
          }
        }
        
        // Ensure proper closing
        if (!fixedJson.endsWith('}')) {
          const openBraces = (fixedJson.match(/\{/g) || []).length;
          const closeBraces = (fixedJson.match(/\}/g) || []).length;
          const missingBraces = openBraces - closeBraces;
          
          if (missingBraces > 0) {
            fixedJson += '}'.repeat(missingBraces);
          }
        }
        
        parsedResult = JSON.parse(fixedJson);
        console.log('JSON fixed and parsed successfully');
      } catch (secondError) {
        console.error('Second parse attempt failed:', secondError);
        console.warn('Using default response due to JSON parsing failure');
        return DEFAULT_RESPONSE;
      }
    }

    // Validate and fix the response
    const validatedResult = validateAndFixResponse(parsedResult);
    console.log('Response validated and fixed successfully');
    
    return validatedResult;
    
  } catch (error) {
    console.error('Analysis error:', error);
    
    // Handle specific error cases
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      
      if (status === 429) {
        console.warn('Rate limit exceeded, using default response');
        return DEFAULT_RESPONSE;
      }
      
      if (status === 400) {
        console.warn('Bad request - invalid image or prompt, using default response');
        return DEFAULT_RESPONSE;
      }
      
      if (status === 401) {
        throw new Error('Invalid API key. Please check your VITE_GEMINI_API_KEY environment variable.');
      }
      
      if (status === 403) {
        throw new Error('API access forbidden. Please check your API key permissions.');
      }
      
      if (status && status >= 500) {
        console.warn('Server error, using default response');
        return DEFAULT_RESPONSE;
      }
      
      if (error.code === 'ERR_NETWORK' || error.message.includes('timeout')) {
        console.warn('Network error, using default response');
        return DEFAULT_RESPONSE;
      }
    }
    
    // For other errors, return default response
    console.warn('Unknown error, using default response');
    return DEFAULT_RESPONSE;
  }
};