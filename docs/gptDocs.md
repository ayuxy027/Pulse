# 🤖 GPT OSS 20B Integration via Groq

## 🚀 Overview
This document details the implementation of GPT OSS 20B model using Groq's fast inference capabilities for AI-powered features in the Pulse.ai platform.

## 🛠️ Implementation

### Setup and Configuration

```typescript
import { Groq } from 'groq-sdk';

const groq = new Groq();
```

### API Call Structure

```typescript
const chatCompletion = await groq.chat.completions.create({
  "messages": [
    {
      "role": "user",
      "content": ""
    }
  ],
  "model": "openai/gpt-oss-20b",
  "temperature": 1,
  "max_completion_tokens": 8192,
  "top_p": 1,
  "stream": true,
  "reasoning_effort": "medium",
  "stop": null
});
```

### Response Handling

```typescript
for await (const chunk of chatCompletion) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

## 🔧 Configuration Parameters

| Parameter | Value | Description |
|-----------|--------|-------------|
| model | `openai/gpt-oss-20b` | Specifies the GPT OSS 20B model for processing |
| temperature | `1` | Controls randomness in output (higher = more creative) |
| max_completion_tokens | `8192` | Maximum tokens in the response |
| top_p | `1` | Controls diversity via nucleus sampling |
| stream | `true` | Enables real-time response streaming |
| reasoning_effort | `medium` | Balances quality and speed |

## 🔗 Integration Points

- **Health Analysis**: For processing user health data
- **Nutrition Recommendations**: For personalized dietary advice
- **Chat Interface**: For AI-powered conversations
- **Image Query**: For analyzing meal images

## 🚦 Best Practices

- Always implement proper error handling
- Monitor token usage to avoid rate limits
- Cache responses when appropriate for performance
- Implement proper user authentication before API calls