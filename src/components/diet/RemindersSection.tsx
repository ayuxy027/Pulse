/**
 * RemindersSection - Manages one-time reminders that auto-delete when checked
 */

import React, { useState, useEffect } from "react"
import {
  Plus,
  Check,
  X,
  Loader2,
  Clock,
  Calendar,
  Trash2,
  Bell,
} from "lucide-react"
import {
  createReminder,
  getUserReminders,
  completeReminder,
  deleteReminder,
} from "../../services/remindersService"
import { Reminder } from "../../types/habits"

export const RemindersSection: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Form state
  const [description, setDescription] = useState("")
  const [reminderDate, setReminderDate] = useState(() => {
    const now = new Date()
    return now.toISOString().split("T")[0]
  })
  const [reminderTime, setReminderTime] = useState(() => {
    const now = new Date()
    return now.toTimeString().slice(0, 5)
  })

  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    setIsLoading(true)
    const result = await getUserReminders()
    if (result.success && result.data) {
      setReminders(result.data)
    }
    setIsLoading(false)
  }

  const resetForm = () => {
    setDescription("")
    const now = new Date()
    setReminderDate(now.toISOString().split("T")[0])
    setReminderTime(now.toTimeString().slice(0, 5))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      if (!description.trim()) {
        setError("Please enter a reminder description")
        setIsSubmitting(false)
        return
      }

      const result = await createReminder({
        description,
        reminder_date: reminderDate,
        reminder_time: reminderTime,
      })

      if (!result.success) {
        setError(result.error || "Failed to create reminder")
        setIsSubmitting(false)
        return
      }

      await fetchReminders()
      resetForm()
      setIsFormOpen(false)
    } catch (error) {
      console.error("Error creating reminder:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleComplete = async (reminderId: string) => {
    const result = await completeReminder(reminderId)
    if (result.success) {
      await fetchReminders()
    }
  }

  const handleDelete = async (reminderId: string) => {
    if (confirm("Are you sure you want to delete this reminder?")) {
      const result = await deleteReminder(reminderId)
      if (result.success) {
        await fetchReminders()
      }
    }
  }

  const isOverdue = (date: string, time: string) => {
    const reminderDateTime = new Date(`${date}T${time}`)
    return reminderDateTime < new Date()
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-100">
            <Bell size={16} className="text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Reminders</h2>
            <p className="text-[10px] text-gray-500 mt-0.5">
              {reminders.length} active
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all shadow-sm text-sm ${
            isFormOpen
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
              : "bg-purple-500 text-white hover:bg-purple-600"
          }`}
        >
          {isFormOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {isFormOpen ? "Cancel" : "Add Reminder"}
        </button>
      </div>

      {/* Add Reminder Form */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100 space-y-3"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Reminder Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., Take medication, Call doctor, Drink water"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-400 focus:ring-1 focus:ring-purple-100 outline-none transition-all text-sm"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                <Calendar size={12} />
                Date
              </label>
              <input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-400 focus:ring-1 focus:ring-purple-100 outline-none transition-all text-sm"
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                <Clock size={12} />
                Time
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-400 focus:ring-1 focus:ring-purple-100 outline-none transition-all text-sm"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2.5 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Reminder"
            )}
          </button>
        </form>
      )}

      {/* Reminders List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : reminders.length === 0 ? (
        <div className="text-center py-12">
          <Bell size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            No reminders yet. Create your first reminder!
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {reminders.map((reminder) => {
            const overdue = isOverdue(
              reminder.reminder_date,
              reminder.reminder_time
            )

            return (
              <div
                key={reminder.id}
                className={`group p-3 rounded-xl border transition-all duration-200 ${
                  overdue
                    ? "bg-red-50 border-red-200"
                    : "bg-white border-gray-200 hover:bg-purple-50 hover:border-purple-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleComplete(reminder.id)}
                    className="shrink-0 w-6 h-6 rounded-lg border-2 border-gray-300 hover:border-purple-500 transition-all flex items-center justify-center hover:bg-purple-50"
                  >
                    <Check className="w-4 h-4 text-transparent hover:text-purple-500" />
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">
                      {reminder.description}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 text-xs">
                      <span
                        className={`flex items-center gap-1 ${
                          overdue
                            ? "text-red-600 font-semibold"
                            : "text-gray-600"
                        }`}
                      >
                        <Calendar className="w-3 h-3" />
                        {formatDate(reminder.reminder_date)}
                      </span>
                      <span
                        className={`flex items-center gap-1 ${
                          overdue
                            ? "text-red-600 font-semibold"
                            : "text-gray-600"
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {reminder.reminder_time}
                      </span>
                      {overdue && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(reminder.id)}
                    className="shrink-0 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
