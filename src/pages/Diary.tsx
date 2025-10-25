import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import {
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  FileText,
  Send,
  MessageSquare,
} from "lucide-react"
import { summarizeDocument } from "../services/geminiService"
import { getEpigeneticReportSummaryPrompt } from "../prompt/summarization"
import { readFileAsBase64 } from "../utils/fileUtils"

interface Message {
  id: string
  type: "user" | "bot" | "system"
  content: string
  timestamp: number
}

const DocumentSummarizer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [summary, setSummary] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Chat functionality state
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState<string>("")
  const [isProcessingMessage, setIsProcessingMessage] = useState<boolean>(false)
  const [documentContext, setDocumentContext] = useState<string>("")
  const [chatHistory, setChatHistory] = useState<
    Array<{ role: string; content: string }>
  >([])
  const [showChat, setShowChat] = useState<boolean>(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const MAX_FILE_SIZE_MB = 10
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

  const generateId = (): string => Math.random().toString(36).substr(2, 9)

  const scrollToBottom = (): void => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
        setError(
          `File size exceeds ${MAX_FILE_SIZE_MB} MB. Please upload a smaller file.`
        )
        return
      }
      setFile(selectedFile)
      setError(null)
      await processDocument(selectedFile)
    }
  }

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const droppedFile = event.dataTransfer.files?.[0]
    if (droppedFile) {
      if (droppedFile.size > MAX_FILE_SIZE_BYTES) {
        setError(
          `File size exceeds ${MAX_FILE_SIZE_MB} MB. Please upload a smaller file.`
        )
        return
      }
      setFile(droppedFile)
      setError(null)
      await processDocument(droppedFile)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const processDocument = async (selectedFile: File) => {
    setIsProcessing(true)
    setError(null)
    setMessages([])
    setChatHistory([])
    setDocumentContext("")

    try {
      // For epigenetic/health reports, we can optionally use user preference
      // Default to no preference (can be extended to allow user input)
      const userPreference = "" // Can be "vegetarian", "vegan", etc.

      const prompt = getEpigeneticReportSummaryPrompt(
        userPreference || undefined
      )

      // Read file as base64
      const base64Data = await readFileAsBase64(selectedFile)
      const mimeType = selectedFile.type || "application/pdf"

      // Call the Gemini API through our service for summarization
      const result = await summarizeDocument("", prompt, {
        mimeType,
        base64Data,
      })

      if (!result.success) {
        throw new Error(result.error || "Failed to analyze document")
      }

      const summaryContent = result.content
      setSummary(summaryContent)
      setDocumentContext(summaryContent)

      // Add welcome message
      const welcomeMessage: Message = {
        id: generateId(),
        type: "bot",
        content: `Health report analyzed successfully! I've processed "${selectedFile.name}" and I'm ready to answer your questions about your epigenetic data, biomarkers, and personalized recommendations. What would you like to know?`,
        timestamp: Date.now(),
      }
      setMessages([welcomeMessage])
    } catch (error) {
      console.error("Error processing document:", error)
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const sendChatMessage = async (
    message: string,
    chatHistory: Array<{ role: string; content: string }>,
    documentContext: string
  ): Promise<string> => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY
      const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent"

      if (!apiKey) {
        throw new Error(
          "Gemini API key is missing. Please check your environment variables."
        )
      }

      const requestUrl = `${apiUrl}?key=${apiKey}`

      const parts = [
        {
          text: `You are an AI assistant helping with document analysis. You have access to the following document context:\n\n${documentContext}\n\nWhen answering questions, refer to this context. If the answer cannot be found in the document context, say so clearly. Always be helpful, concise, and accurate.`,
        },
      ]

      chatHistory.forEach((msg) => {
        parts.push({
          text: `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`,
        })
      })

      parts.push({ text: `User: ${message}` })
      parts.push({ text: "Assistant: " })

      const requestBody = {
        contents: [
          {
            parts: parts,
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 4096,
        },
      }

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      const responseText = data.candidates[0]?.content?.parts[0]?.text || ""
      return responseText
    } catch (error) {
      console.error("Error in chat with document:", error)
      throw error
    }
  }

  const processUserMessage = async (userInput: string): Promise<void> => {
    setIsProcessingMessage(true)

    try {
      const response = await sendChatMessage(
        userInput,
        chatHistory,
        documentContext
      )

      const botMessage: Message = {
        id: generateId(),
        type: "bot",
        content: response,
        timestamp: Date.now(),
      }

      setMessages((prevMessages) => [...prevMessages, botMessage])
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ])
    } catch (error) {
      console.error("Error processing message:", error)
      const errorMessage: Message = {
        id: generateId(),
        type: "bot",
        content:
          "Sorry, I encountered an error processing your message. Please try again.",
        timestamp: Date.now(),
      }
      setMessages((prevMessages) => [...prevMessages, errorMessage])
    } finally {
      setIsProcessingMessage(false)
    }
  }

  const handleChatSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault()

    if (!inputValue.trim() || !documentContext) return

    const userMessageId = generateId()
    const userMessage: Message = {
      id: userMessageId,
      type: "user",
      content: inputValue,
      timestamp: Date.now(),
    }

    setMessages((prevMessages) => [...prevMessages, userMessage])
    setChatHistory((prev) => [...prev, { role: "user", content: inputValue }])
    setInputValue("")

    await processUserMessage(inputValue)
  }

  const resetForm = () => {
    setFile(null)
    setSummary("")
    setIsProcessing(false)
    setError(null)
    setMessages([])
    setChatHistory([])
    setDocumentContext("")
    setInputValue("")
    setShowChat(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="w-full flex flex-col bg-[#f8f6f1] min-h-screen">
      <div className="px-6 py-4 mx-auto max-w-7xl w-full">
        {/* Header Section */}
        <div className="mb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
              Epigenetic Report Analyzer
            </h1>
            <div className="w-12 h-0.5 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Left Panel - Upload */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="flex items-center mb-6 space-x-3 text-lg font-semibold text-gray-900">
              <div className="p-2 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 shadow-sm">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <span>Upload Health Report</span>
            </h2>

            <div
              className="relative p-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 transition-all duration-300 cursor-pointer hover:border-gray-300 hover:bg-gray-100"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="relative z-10">
                <div
                  className="flex justify-center items-center mx-auto mb-6 w-20 h-20 bg-gradient-to-br rounded-xl shadow-sm from-gray-600 to-gray-700"
                >
                  <Upload className="w-10 h-10 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Drag and drop your health report here
                </h3>
                <p className="mb-8 text-base text-gray-600">
                  or click to browse your files
                </p>
                <label className="inline-flex items-center px-8 py-3 text-sm font-semibold text-white rounded-xl shadow-sm transition-all duration-300 cursor-pointer bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 hover:shadow-md">
                  <FileText className="mr-3 w-5 h-5" />
                  <span>Browse Files</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt"
                  />
                </label>
                <p className="mt-6 text-sm text-gray-500">
                  Supported: PDF, DOC, DOCX, TXT
                </p>
              </div>
            </div>

            <AnimatePresence>
              {file && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex justify-between items-center p-4 mt-6 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gradient-to-br rounded-lg from-gray-600 to-gray-700">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="block text-base font-semibold text-gray-900">
                        {file.name}
                      </span>
                      <span className="text-sm text-gray-600">
                        Ready for AI analysis
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Panel - Summary & Chat */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="flex items-center space-x-3 text-lg font-semibold text-gray-900">
                <div className="p-2 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 shadow-sm">
                  {showChat ? (
                    <MessageSquare className="w-5 h-5 text-white" />
                  ) : (
                    <FileText className="w-5 h-5 text-white" />
                  )}
                </div>
                <span>{showChat ? "Health Chat" : "Health Summary"}</span>
              </h2>
              {summary && documentContext && (
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all"
                >
                  {showChat ? "View Summary" : "Ask Questions"}
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col justify-center items-center space-y-6 h-80"
                >
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br rounded-full animate-spin from-gray-600 to-gray-700"></div>
                    <div className="absolute inset-2 bg-white rounded-full"></div>
                  </div>
                  <div className="text-center">
                    <h3 className="mb-2 text-xl font-semibold text-gray-900">
                      Analyzing Health Report
                    </h3>
                    <p className="text-base text-gray-600">
                      Our AI is processing your epigenetic data...
                    </p>
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 bg-red-50 rounded-xl border border-red-200"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-2 rounded-lg bg-red-500">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-base font-semibold text-red-800">
                        Processing Error
                      </h3>
                      <p className="mb-4 text-sm text-red-700">
                        {error}
                      </p>
                      <button
                        onClick={resetForm}
                        className="px-6 py-2 text-sm font-medium text-white rounded-xl transition-all bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : showChat && summary && documentContext ? (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 h-[500px] flex flex-col"
                >
                  {/* Chat Messages */}
                  <div
                    ref={chatContainerRef}
                    className="overflow-y-auto flex-1 p-4 space-y-3 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <AnimatePresence>
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{
                            opacity: 0,
                            x: message.type === "user" ? 50 : -50,
                          }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex ${
                            message.type === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[85%] rounded-xl p-4 ${
                              message.type === "user"
                                ? "bg-gradient-to-br from-gray-600 to-gray-700 text-white"
                                : "bg-white text-gray-800 border border-gray-200"
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                            <span
                              className={`text-xs mt-2 block ${
                                message.type === "user"
                                  ? "text-white/70"
                                  : "text-gray-500"
                              }`}
                            >
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {isProcessingMessage && (
                      <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex justify-start"
                      >
                        <div className="max-w-[85%] rounded-xl p-4 bg-white border border-gray-200">
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 rounded-full animate-bounce bg-gray-600"></div>
                              <div
                                className="w-2 h-2 rounded-full animate-bounce bg-gray-600"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 rounded-full animate-bounce bg-gray-600"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">
                              Thinking...
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={handleChatSubmit} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask about your biomarkers, nutrients, or recommendations..."
                        disabled={!documentContext || isProcessingMessage}
                        className="flex-1 px-4 py-3 text-sm rounded-xl border bg-gray-50 border-gray-200 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                      />
                      <button
                        type="submit"
                        disabled={
                          !inputValue.trim() ||
                          !documentContext ||
                          isProcessingMessage
                        }
                        className={`p-3 rounded-xl transition-all ${
                          !inputValue.trim() ||
                          !documentContext ||
                          isProcessingMessage
                            ? "bg-gray-300 text-gray-500"
                            : "bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-sm"
                        }`}
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : summary ? (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div
                    className="p-6 overflow-y-auto rounded-xl bg-gray-50 border border-gray-100 max-h-[500px] prose prose-sm max-w-none"
                  >
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }) => (
                          <h1
                            className="mb-4 text-xl font-semibold text-gray-900"
                            {...props}
                          />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2
                            className="mb-3 text-lg font-semibold text-gray-900"
                            {...props}
                          />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3
                            className="mb-2 text-base font-semibold text-gray-900"
                            {...props}
                          />
                        ),
                        p: ({ node, ...props }) => (
                          <p
                            className="mb-3 text-base leading-relaxed text-gray-700"
                            {...props}
                          />
                        ),
                      }}
                    >
                      {summary}
                    </ReactMarkdown>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row">
                    <a
                      href={`data:text/markdown;charset=utf-8,${encodeURIComponent(
                        summary
                      )}`}
                      download="health_summary.md"
                      className="flex justify-center items-center px-6 py-3 space-x-3 text-sm font-semibold text-white rounded-xl shadow-sm transition-all bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 hover:shadow-md"
                    >
                      <Download className="w-5 h-5" />
                      <span>Download Summary</span>
                    </a>

                    <button
                      onClick={resetForm}
                      className="flex justify-center items-center px-6 py-3 space-x-3 text-sm font-semibold text-gray-700 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all"
                    >
                      <FileText className="w-5 h-5" />
                      <span>New Report</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="no-summary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col justify-center items-center space-y-6 h-80 text-center"
                >
                  <div
                    className="flex justify-center items-center w-24 h-24 bg-gray-100 rounded-xl"
                  >
                    <FileText className="w-12 h-12 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="mb-3 text-xl font-semibold text-gray-900">
                      Ready to Analyze
                    </h3>
                    <p className="mb-2 text-base text-gray-600">
                      Upload a health report to get started
                    </p>
                    <p className="text-sm text-gray-500">
                      Get personalized insights about your epigenetic data and
                      biomarkers
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentSummarizer
