import React, { useState } from "react"
import { CalendarView, RemindersView, DietOverview } from "../components/diet"
import { AddDietEntryForm } from "../components/diet/AddDietEntryForm"
import { Plus } from "lucide-react"

/**
 * DietPage - Comprehensive nutrition and diet management interface
 */
interface DietPageProps {
  sidebarOpen?: boolean
}

type TabType = "overview" | "calendar" | "reminders"

const DietPage: React.FC<DietPageProps> = ({ sidebarOpen = true }) => {
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [isAddFormOpen, setIsAddFormOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAddSuccess = () => {
    // Refresh the data after successful addition
    setRefreshKey((prev) => prev + 1)
    setIsAddFormOpen(false)
  }

  return (
    <div
      className={`flex-1 flex flex-col h-screen bg-[#f8f6f1] transition-all duration-300 ease-in-out ${
        sidebarOpen ? "ml-0" : "ml-0"
      }`}
    >
      {/* Header Section - Fixed */}
      <div className="shrink-0 p-[30px] pb-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
                Diet & Nutrition
              </h1>
              <div className="w-12 h-0.5 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full"></div>
            </div>
            {/* Add Diet Entry Button - Only visible in overview tab */}
            {activeTab === "overview" && (
              <button
                onClick={() => setIsAddFormOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Add Entry
              </button>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-1 inline-flex gap-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === "overview"
                  ? "bg-gray-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("calendar")}
              className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === "calendar"
                  ? "bg-gray-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setActiveTab("reminders")}
              className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === "reminders"
                  ? "bg-gray-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Reminders
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto px-[30px] py-[30px]">
        <div className="max-w-7xl mx-auto">
          {activeTab === "overview" && (
            <DietOverview refreshTrigger={refreshKey} />
          )}

          {activeTab === "calendar" && <CalendarView />}

          {activeTab === "reminders" && <RemindersView />}
        </div>
      </div>

      {/* Add Diet Entry Modal */}
      <AddDietEntryForm
        isOpen={isAddFormOpen}
        onClose={() => setIsAddFormOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  )
}

export default DietPage
