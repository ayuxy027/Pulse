/**
 * Gemini API Service for document analysis and summarization
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_MODEL = "gemini-2.0-flash"
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

export interface GeminiResponse {
  content: string
  success: boolean
  error?: string
}

interface GeminiRequestBody {
  contents: Array<{
    parts: Array<{
      text?: string
      inline_data?: {
        mime_type: string
        data: string
      }
    }>
  }>
  generationConfig?: {
    temperature?: number
    maxOutputTokens?: number
    topP?: number
    topK?: number
  }
}

/**
 * Send a text prompt to Gemini API
 */
export async function sendTextPrompt(prompt: string): Promise<GeminiResponse> {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error(
        "Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env file"
      )
    }

    const requestBody: GeminiRequestBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(
        errorData.error?.message ||
          `HTTP ${response.status}: ${response.statusText}`
      )
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    return {
      content: content.trim(),
      success: true,
    }
  } catch (error) {
    console.error("❌ Gemini API error:", error)
    return {
      content: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Analyze a document with text and optional base64 file data
 */
export async function analyzeDocument(
  prompt: string,
  fileData?: { mimeType: string; base64Data: string }
): Promise<GeminiResponse> {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error(
        "Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env file"
      )
    }

    const parts: Array<{
      text?: string
      inline_data?: { mime_type: string; data: string }
    }> = []

    // Add file data if provided
    if (fileData) {
      parts.push({
        inline_data: {
          mime_type: fileData.mimeType,
          data: fileData.base64Data,
        },
      })
    }

    // Add text prompt
    parts.push({ text: prompt })

    const requestBody: GeminiRequestBody = {
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.2,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 4096,
      },
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(
        errorData.error?.message ||
          `HTTP ${response.status}: ${response.statusText}`
      )
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    return {
      content: content.trim(),
      success: true,
    }
  } catch (error) {
    console.error("❌ Gemini API error:", error)
    return {
      content: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Summarize a document (wrapper for analyzeDocument)
 */
export async function summarizeDocument(
  documentContent: string,
  prompt: string,
  fileData?: { mimeType: string; base64Data: string }
): Promise<GeminiResponse> {
  const fullPrompt = `${prompt}\n\nDocument Content:\n${documentContent}`
  return analyzeDocument(fullPrompt, fileData)
}

/**
 * Chat with context (for RAG functionality)
 */
export async function chatWithContext(
  userMessage: string,
  documentContext: string,
  chatHistory: Array<{ role: string; content: string }>
): Promise<GeminiResponse> {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API key not configured")
    }

    // Build conversation with context
    const contextPrompt = `You are a helpful assistant analyzing a document. Here is the document context:\n\n${documentContext}\n\nPlease answer the following question based on this context.`

    const contents = [
      {
        parts: [{ text: contextPrompt }],
      },
      ...chatHistory.map((msg) => ({
        parts: [{ text: msg.content }],
      })),
      {
        parts: [{ text: userMessage }],
      },
    ]

    const requestBody = {
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || `HTTP ${response.status}`)
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    return {
      content: content.trim(),
      success: true,
    }
  } catch (error) {
    console.error("❌ Gemini chat error:", error)
    return {
      content: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
