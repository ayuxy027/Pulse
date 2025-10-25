/**
 * AddDietEntryForm - Modal form for adding water intake and meal entries
 */

import React, { useState } from "react"
import { X, Droplet, Utensils, Loader2, Plus, Minus } from "lucide-react"
import {
  createDietEntry,
  updateMealNutrition,
} from "../../services/dietEntryService"
import { analyzeMealNutrition } from "../../services/nutritionAnalysisService"
import { MealType } from "../../types/dietEntry"

interface AddDietEntryFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type EntryMode = "water" | "meal"

const waterContainers = [
  { id: "glass", name: "Glass", ml: 250, icon: "🥤", emoji: "🥛", cups: 2.5 },
  {
    id: "half-liter",
    name: "Half Liter",
    ml: 500,
    icon: "🍶",
    emoji: "🧃",
    cups: 5,
  },
  { id: "liter", name: "1 Liter", ml: 1000, icon: "💧", emoji: "🍾", cups: 10 },
]

export const AddDietEntryForm: React.FC<AddDietEntryFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<EntryMode>("water")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>("")

  const [selectedContainer, setSelectedContainer] = useState(waterContainers[0])
  const [waterQuantity, setWaterQuantity] = useState<number>(1)

  const [mealType, setMealType] = useState<MealType>("breakfast")
  const [mealDescription, setMealDescription] = useState("")
  const [mealDate, setMealDate] = useState(() => {
    const now = new Date()
    return now.toISOString().split("T")[0]
  })
  const [mealTime, setMealTime] = useState(() => {
    const now = new Date()
    return now.toTimeString().slice(0, 5)
  })

  const resetForm = () => {
    setSelectedContainer(waterContainers[0])
    setWaterQuantity(1)
    setMealType("breakfast")
    setMealDescription("")
    const now = new Date()
    setMealDate(now.toISOString().split("T")[0])
    setMealTime(now.toTimeString().slice(0, 5))
    setError("")
    setIsSubmitting(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      if (mode === "water") {
        // Calculate total water amount in cups (100ml each)
        const totalCups = (selectedContainer.ml * waterQuantity) / 100

        // Add water entry
        const result = await createDietEntry({
          entry_type: "water",
          water_amount: totalCups,
        })

        if (!result.success) {
          setError(result.error || "Failed to add water entry")
          setIsSubmitting(false)
          return
        }
      } else {
        // Add meal entry
        if (!mealDescription.trim()) {
          setError("Please enter a meal description")
          setIsSubmitting(false)
          return
        }

        // First, create the meal entry without nutrition
        const createResult = await createDietEntry({
          entry_type: "meal",
          meal_type: mealType,
          meal_description: mealDescription,
          meal_date: mealDate,
          meal_time: mealTime,
        })

        if (!createResult.success || !createResult.data) {
          setError(createResult.error || "Failed to add meal entry")
          setIsSubmitting(false)
          return
        }

        // Then, analyze the meal and update with nutrition info
        const analysisResult = await analyzeMealNutrition(mealDescription)

        if (analysisResult.success && analysisResult.nutrition) {
          // Update the entry with nutrition data
          await updateMealNutrition(
            createResult.data.id,
            analysisResult.nutrition
          )
        } else {
          console.warn("Failed to analyze nutrition:", analysisResult.error)
          // Entry is still saved, just without nutrition data
        }
      }

      // Success!
      resetForm()
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error("Error submitting diet entry:", error)
      setError("An unexpected error occurred")
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">
            Add Diet Entry
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setMode("water")}
              disabled={isSubmitting}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                mode === "water"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Droplet className="w-5 h-5" />
              Water
            </button>
            <button
              type="button"
              onClick={() => setMode("meal")}
              disabled={isSubmitting}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                mode === "meal"
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Utensils className="w-5 h-5" />
              Meal
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {mode === "water" ? (
            <>
              {/* Container Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Container Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {waterContainers.map((container) => (
                    <button
                      key={container.id}
                      type="button"
                      onClick={() => setSelectedContainer(container)}
                      disabled={isSubmitting}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        selectedContainer.id === container.id
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">{container.emoji}</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {container.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {container.ml}ml
                        </span>
                      </div>
                      {selectedContainer.id === container.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setWaterQuantity(Math.max(1, waterQuantity - 1))
                    }
                    disabled={isSubmitting || waterQuantity <= 1}
                    className="w-12 h-12 rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                  >
                    <Minus className="w-5 h-5 text-gray-600" />
                  </button>

                  <div className="flex-1 text-center">
                    <div className="text-4xl font-bold text-blue-600">
                      {waterQuantity}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {selectedContainer.name}
                      {waterQuantity > 1 ? "s" : ""}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setWaterQuantity(Math.min(10, waterQuantity + 1))
                    }
                    disabled={isSubmitting || waterQuantity >= 10}
                    className="w-12 h-12 rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                  >
                    <Plus className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Total Water
                  </span>
                  <Droplet className="w-5 h-5 text-blue-500" />
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedContainer.ml * waterQuantity}ml
                  </div>
                  <div className="text-xs text-gray-600">
                    ={" "}
                    {((selectedContainer.ml * waterQuantity) / 100).toFixed(1)}{" "}
                    cups (100ml each)
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meal Type
                </label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as MealType)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  disabled={isSubmitting}
                  required
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="snacks">Snacks</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={mealDate}
                    onChange={(e) => setMealDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={mealTime}
                    onChange={(e) => setMealTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meal Description
                </label>
                <textarea
                  value={mealDescription}
                  onChange={(e) => setMealDescription(e.target.value)}
                  placeholder="E.g., 2 chapati with dal, rice, and vegetables"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
                  disabled={isSubmitting}
                  required
                />
                <p className="mt-2 text-xs text-gray-500">
                  Describe your meal in detail. AI will calculate nutrition
                  automatically.
                </p>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-6 py-3 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2 ${
                mode === "water"
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-green-500 hover:bg-green-600"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {mode === "meal" ? "Analyzing..." : "Adding..."}
                </>
              ) : (
                "Add Entry"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
