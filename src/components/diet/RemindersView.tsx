import React from "react"
import { HabitsSection } from "./HabitsSection"
import { RemindersSection } from "./RemindersSection"

/**
 * RemindersView - Manage habits and reminders
 */
const RemindersView: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <HabitsSection />
      <RemindersSection />
    </div>
  )
}

export default RemindersView
