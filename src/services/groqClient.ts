// Simple Groq API client
import { SYSTEM_PROMPT, createUserPrompt } from '../prompt/queryPrompt';
import { Groq } from 'groq-sdk';

// Keep simple constants (no extra env variables as requested)
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL = 'openai/gpt-oss-20b';

const groq = new Groq({
  apiKey: GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface GroqResponse {
  content: string;
  success: boolean;
  error?: string;
}


/**
 * Simple function to send a message to Groq API with streaming
 */
export async function sendMessage(message: string, onChunk?: (chunk: string) => void): Promise<GroqResponse> {
  try {
    const userPrompt = createUserPrompt(message);

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      model: GROQ_MODEL,
      temperature: 1,
      max_completion_tokens: 8192,
      top_p: 1,
      stream: true,
      reasoning_effort: 'medium',
    });

    let fullContent = '';
    for await (const chunk of chatCompletion) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullContent += content;
      onChunk?.(content);
    }

    return { content: fullContent, success: true };
  } catch (error) {
    console.error('❌ Groq API error:', error);
    return {
      content: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Function to send a direct message to Groq API
 * Used for prompt enhancement and other operations
 */
export async function sendDirectMessage(message: string, model: string = GROQ_MODEL): Promise<GroqResponse> {
  try {
    const chatCompletion = await groq.chat.completions.create({
      model: model,
      messages: [ { role: 'user', content: message } ],
      max_tokens: 800,
      temperature: 0.7,
      stream: false,
    });

    const content = chatCompletion.choices?.[0]?.message?.content || '';
    return { content: content.trim(), success: true };

  } catch (error) {
    console.error('❌ Groq API error:', error);
    return {
      content: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test function to verify API connection
 */
export async function testConnection(): Promise<GroqResponse> {
  return sendMessage('Hello! Please respond with "API connection successful" if you can see this message.');
}
