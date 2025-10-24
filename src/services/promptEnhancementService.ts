import { sendDirectMessage } from './groqClient';

export interface EnhancementResponse {
  success: boolean;
  enhancedPrompt: string;
  error?: string;
}

/**
 * Simple prompt enhancement service
 * Enhances user prompts by splitting them into 3 clear sections
 */
export async function enhancePrompt(userInput: string): Promise<EnhancementResponse> {
  // Add delay for better UX
  await new Promise(resolve => setTimeout(resolve, 800));

  if (!userInput?.trim()) {
    return {
      success: false,
      enhancedPrompt: '',
      error: 'Input cannot be empty',
    };
  }

  // Don't enhance if already in the expected format
  if (userInput.includes('CONTEXT:') && userInput.includes('REQUIREMENTS:') && userInput.includes('EXPECTED OUTPUT:')) {
    return {
      success: false,
      enhancedPrompt: '',
      error: 'Prompt is already enhanced',
    };
  }

  // Don't enhance very short inputs
  if (userInput.trim().length < 10) {
    return {
      success: false,
      enhancedPrompt: '',
      error: 'Input is too short',
    };
  }

  const enhancementPrompt = `
You are a prompt enhancement expert. Your task is to enhance user prompts by structuring them into 3 clear sections.

ENHANCEMENT RULES:
1. CONTEXT section: Provide background information, situation description, and relevant context
2. REQUIREMENTS section: Specify what needs to be done, constraints, and specific tasks
3. EXPECTED OUTPUT section: Describe the desired result format, key deliverables, and success criteria

CRITICAL: You must format your response EXACTLY as follows, with no additional text before or after:

CONTEXT:
[Write the context section here]

REQUIREMENTS:
[Write the requirements section here]

EXPECTED OUTPUT:
[Write the expected output section here]

USER INPUT TO ENHANCE: "${userInput}"

Remember: Return ONLY the enhanced prompt in the exact format specified above. Do not add any explanations, introductions, or additional text.
  `.trim();

  try {
    const result = await sendDirectMessage(enhancementPrompt);

    if (result.success && result.content) {
      const enhancedPrompt = result.content.trim();
      
      // Basic validation that we got a properly formatted response
      if (enhancedPrompt.includes('CONTEXT:') && enhancedPrompt.includes('REQUIREMENTS:') && enhancedPrompt.includes('EXPECTED OUTPUT:')) {
        return {
          success: true,
          enhancedPrompt,
        };
      } else {
        console.error('Invalid enhancement format received:', enhancedPrompt);
        
        // Fallback: try to create a basic enhancement if the AI response is usable
        if (enhancedPrompt.trim().length > 20) {
          const fallbackEnhancement = `CONTEXT:
This involves creating a document or agreement between two parties.

REQUIREMENTS:
${userInput}

EXPECTED OUTPUT:
A comprehensive, well-structured document that meets the specified requirements.`;
          
          return {
            success: true,
            enhancedPrompt: fallbackEnhancement,
          };
        }
        
        return {
          success: false,
          enhancedPrompt: '',
          error: `Enhancement returned invalid format. Expected CONTEXT:, REQUIREMENTS:, and EXPECTED OUTPUT: sections. Received: ${enhancedPrompt.substring(0, 100)}...`,
        };
      }
    } else {
      return {
        success: false,
        enhancedPrompt: '',
        error: 'Enhancement failed',
      };
    }
  } catch (error) {
    console.error('Prompt enhancement error:', error);
    return {
      success: false,
      enhancedPrompt: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
