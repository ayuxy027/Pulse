// LLM Service for Dual Agent System
// Analyzer Agent: Groq (Llama 3.1 distill)
// Coach Agent: DeepSeek (Llama distill)

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
    // Using DeepSeek API for final response generation
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error with DeepSeek API:', error);
    // Fallback to simple response
    return "I'm having trouble providing a detailed response. Please try again later.";
  }
}