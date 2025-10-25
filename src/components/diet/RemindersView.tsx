import React from 'react';
import { HabitsSection } from './HabitsSection';
import { RemindersSection } from './RemindersSection';

/**
 * RemindersView - Manage habits and reminders
 * Displays habits tracking and one-time reminders
 */
const RemindersView: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Habits Section */}
            <HabitsSection />

            {/* Reminders Section */}
            <RemindersSection />
        </div>
    );
};

export default RemindersView;
