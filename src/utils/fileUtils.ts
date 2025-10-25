/**
 * File utility functions for document processing
 */

/**
 * Reads a file and converts it to base64 string
 */
export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === "string") {
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64String = reader.result.split(",")[1]
        resolve(base64String)
      } else {
        reject(new Error("Failed to read file as base64"))
      }
    }

    reader.onerror = () => {
      reject(new Error("Error reading file"))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Reads a file as text content
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
      } else {
        reject(new Error("Failed to read file as text"))
      }
    }

    reader.onerror = () => {
      reject(new Error("Error reading file"))
    }

    reader.readAsText(file)
  })
}

/**
 * Validates file type and size
 */
export const validateFile = (
  file: File,
  allowedTypes: string[],
  maxSizeBytes: number
): { valid: boolean; error?: string } => {
  // Check file type
  const fileExtension = file.name.split(".").pop()?.toLowerCase()
  if (!fileExtension || !allowedTypes.includes(fileExtension)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
    }
  }

  // Check file size
  if (file.size > maxSizeBytes) {
    const maxSizeMB = maxSizeBytes / (1024 * 1024)
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    }
  }

  return { valid: true }
}

/**
 * Formats file size to human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}
