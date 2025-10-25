-- Migration: Create habits table
-- Description: Stores user habits with recurring schedules and calorie tracking
-- Date: 2025-10-25

-- Create the habits table
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  habit_type TEXT NOT NULL CHECK (habit_type IN ('daily', 'weekly', 'monthly')),
  calories_burned INTEGER, -- Calculated by AI
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_type ON habits(habit_type);
CREATE INDEX IF NOT EXISTS idx_habits_is_completed ON habits(is_completed);
CREATE INDEX IF NOT EXISTS idx_habits_user_type ON habits(user_id, habit_type);

-- Enable Row Level Security
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only read their own habits
CREATE POLICY "Users can view own habits"
  ON habits
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own habits
CREATE POLICY "Users can insert own habits"
  ON habits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own habits
CREATE POLICY "Users can update own habits"
  ON habits
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own habits
CREATE POLICY "Users can delete own habits"
  ON habits
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE habits IS 'Stores user habits with recurring types and AI-calculated calorie tracking';
COMMENT ON COLUMN habits.habit_type IS 'Frequency: daily, weekly, or monthly';
COMMENT ON COLUMN habits.calories_burned IS 'AI-estimated calories burned for this activity';
COMMENT ON COLUMN habits.is_completed IS 'Whether the habit has been checked off';