import { getGroqResponse, getDeepSeekResponse } from './llmService';

interface StreamingResponse {
  content: string;
  isComplete: boolean;
  thinking?: string;
}

/**
 * Simulates streaming response by chunking the AI response
 * In a real implementation, this would use WebSocket or Server-Sent Events
 */
export class StreamingService {
  private static chunkText(text: string, chunkSize: number = 3): string[] {
    const words = text.split(' ');
    const chunks: string[] = [];
    
    for (let i = 0; i < words.length; i += chunkSize) {
      chunks.push(words.slice(i, i + chunkSize).join(' '));
    }
    
    return chunks;
  }

  static async *streamResponse(
    userQuery: string,
    context: string,
    thinking: string
  ): AsyncGenerator<StreamingResponse, void, unknown> {
    // First, yield the thinking process
    if (thinking) {
      const thinkingChunks = this.chunkText(thinking, 2);
      for (const chunk of thinkingChunks) {
        yield {
          content: chunk,
          isComplete: false,
          thinking: chunk
        };
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Then yield the main response
    const response = await getDeepSeekResponse(`
You are a professional health coach. Provide structured, actionable health and nutrition advice.

CONTEXT ANALYSIS:
${thinking}

USER QUESTION: ${userQuery}

USER HEALTH DATA:
${context}

CRITICAL INSTRUCTIONS:
- Be direct, professional, and actionable
- Use the health data to provide SPECIFIC, personalized recommendations
- Structure responses with clear sections and bullet points
- Make responses scannable and easy to read
- Focus on actionable advice, not generic information
- Use data-driven insights from their health profile
- Be concise but comprehensive

REQUIRED FORMAT:
## 🎯 **Key Insights**
- 2-3 bullet points of main findings from their data
- Be specific about what their data shows
- Highlight any concerns or positive patterns

## 📋 **Action Items**
- 3-4 specific, actionable steps they can take TODAY
- Include specific foods, portions, or activities
- Make it clear what they should do next

## 💡 **Pro Tips**
- 2-3 additional helpful tips based on their profile
- Include specific recommendations for their situation
- Reference their dietary restrictions or goals if applicable

RESPONSE STYLE:
- Use bullet points for easy scanning
- Bold important information
- Be specific with numbers, portions, and timelines
- Reference their actual data (meals, habits, etc.)
- If protein deficiency is detected, suggest specific protein sources or supplements

Respond as a professional health coach with structured, actionable advice:`);

    const responseChunks = this.chunkText(response, 4);
    
    for (let i = 0; i < responseChunks.length; i++) {
      const isLastChunk = i === responseChunks.length - 1;
      yield {
        content: responseChunks.slice(0, i + 1).join(' '),
        isComplete: isLastChunk,
        thinking: thinking
      };
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
}
