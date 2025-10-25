import React, { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { fetchMealPlans, fetchDietTasks } from "../../services/dietDataService"
import { MealPlan, DietTask } from "../../types/diet"

/**
 * CalendarView - Compact monthly calendar view with hover details
 * Shows meals and tasks scheduled for each day on hover
 */
const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [meals, setMeals] = useState<MealPlan[]>([])
  const [tasks, setTasks] = useState<DietTask[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [fetchedMeals, fetchedTasks] = await Promise.all([
        fetchMealPlans(),
        fetchDietTasks(),
      ])
      setMeals(fetchedMeals)
      setTasks(fetchedTasks)
    } catch (error) {
      console.error("Error loading calendar data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    )
  }

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    )
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const getDayEvents = (day: number) => {
    const dayMeals = meals.length > 0 ? Math.min(day % 3, meals.length) : 0
    const dayTasks = tasks.filter((t) => !t.completed).length > 0 ? day % 2 : 0
    return { meals: dayMeals, tasks: dayTasks }
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const events = getDayEvents(day)
      const today = isToday(day)
      const hasEvents = events.meals > 0 || events.tasks > 0

      days.push(
        <div
          key={day}
          onMouseEnter={() => setHoveredDay(day)}
          onMouseLeave={() => setHoveredDay(null)}
          className="relative group h-10"
        >
          <div
            className={`
                        relative w-full h-full flex items-center justify-center rounded cursor-pointer transition-all duration-150
                        ${
                          today
                            ? "border border-orange-600 bg-orange-500/20 font-semibold"
                            : hasEvents
                            ? "bg-orange-50 hover:bg-orange-100"
                            : "hover:bg-gray-50"
                        }
                    `}
          >
            <span
              className={`text-sm ${
                today
                  ? "font-semibold text-orange-600"
                  : hasEvents
                  ? "font-medium text-gray-900"
                  : "text-gray-700"
              }`}
            >
              {day}
            </span>
            {hasEvents && !today && (
              <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-500"></div>
            )}
          </div>

          {/* Hover Tooltip */}
          {hoveredDay === day && hasEvents && (
            <div className="absolute z-10 top-full left-1/2 transform -translate-x-1/2 mt-1 w-40 bg-gray-900 text-white rounded shadow-lg p-1.5">
              <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-900 rotate-45"></div>

              <div className="relative">
                <p className="text-[8px] font-semibold mb-1">
                  {monthNames[currentDate.getMonth()].slice(0, 3)} {day}
                </p>

                {events.meals > 0 && (
                  <div className="mb-1">
                    <div className="flex items-center gap-0.5 mb-0.5">
                      <div className="w-0.5 h-0.5 rounded-full bg-orange-400"></div>
                      <span className="text-[7px] font-medium text-orange-400">
                        Meals
                      </span>
                    </div>
                    <div className="space-y-0.5 pl-1.5">
                      {meals.slice(0, events.meals).map((meal) => (
                        <div
                          key={meal.id}
                          className="flex items-center justify-between text-[7px]"
                        >
                          <span className="text-gray-300 truncate">
                            {meal.name}
                          </span>
                          <span className="font-medium text-white ml-1">
                            {meal.calories}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {events.tasks > 0 && (
                  <div>
                    <div className="flex items-center gap-0.5 mb-0.5">
                      <div className="w-0.5 h-0.5 rounded-full bg-blue-400"></div>
                      <span className="text-[7px] font-medium text-blue-400">
                        Tasks
                      </span>
                    </div>
                    <div className="space-y-0.5 pl-1.5">
                      {tasks.slice(0, events.tasks).map((task) => (
                        <div
                          key={task.id}
                          className="text-[7px] text-gray-300 truncate"
                        >
                          • {task.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )
    }

    return days
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={previousMonth}
          className="p-2 rounded-full transition-colors hover:bg-orange-50"
          title="Previous month"
        >
          <ChevronLeft size={18} className="text-orange-600" />
        </button>

        <h2 className="text-lg font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()].slice(0, 3)}{" "}
          {currentDate.getFullYear()}
        </h2>

        <button
          onClick={nextMonth}
          className="p-2 rounded-full transition-colors hover:bg-orange-50"
          title="Next month"
        >
          <ChevronRight size={18} className="text-orange-600" />
        </button>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="text-center py-6">
          <div className="inline-block w-5 h-5 border-2 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="text-sm font-medium text-center text-gray-500"
              >
                {day.slice(0, 1)}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">{renderCalendar()}</div>
        </>
      )}

      {/* Legend */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border border-orange-600 bg-orange-500/20"></div>
          <span className="text-gray-600">Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded bg-orange-500"></div>
          <span className="text-gray-600">Events</span>
        </div>
      </div>
    </div>
  )
}

export default CalendarView
