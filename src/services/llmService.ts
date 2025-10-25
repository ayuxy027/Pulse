// LLM Service for Dual Agent System
// Analyzer Agent: Groq (gpt-oss-20b)
// Coach Agent: Groq (gpt-oss-20b)

import { sendDirectMessage, sendMessage } from './groqClient';

export async function getGroqResponse(prompt: string): Promise<string> {
  try {
    // Use existing groqClient for consistency
    const response = await sendDirectMessage(prompt);
    
    if (!response.success) {
      console.error('Groq API error:', response.error);
      return "I'm having trouble processing your request. Please try again later.";
    }
    
    return response.content;
  } catch (error) {
    console.error('Error with Groq API:', error);
    return "I'm having trouble processing your request. Please try again later.";
  }
}

export async function getDeepSeekResponse(prompt: string): Promise<string> {
  try {
    // Use existing groqClient for consistency
    const response = await sendDirectMessage(prompt);
    
    if (!response.success) {
      console.error('Groq API error:', response.error);
      return "I'm having trouble processing your request. Please try again later.";
    }
    
    return response.content;
  } catch (error) {
    console.error('Error with Groq API:', error);
    return "I'm having trouble providing a detailed response. Please try again later.";
  }
}