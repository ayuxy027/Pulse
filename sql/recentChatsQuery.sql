-- Migration: Create recent_chats table
-- Description: Stores recent chat history for users in the coach component
-- Date: 2025-10-26

-- Create the recent_chats table
CREATE TABLE IF NOT EXISTS recent_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_id UUID NOT NULL DEFAULT gen_random_uuid(), -- Unique identifier for grouping messages in a conversation
  chat_title TEXT NOT NULL, -- Brief title/description of the chat
  message_content TEXT NOT NULL, -- The actual chat message content
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'coach', 'analyzer')), -- Who sent the message
  sender_name TEXT, -- Display name (e.g., "AI Health Coach")
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_recent_chats_user_id ON recent_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_recent_chats_chat_id ON recent_chats(chat_id);
CREATE INDEX IF NOT EXISTS idx_recent_chats_created_at ON recent_chats(created_at);
CREATE INDEX IF NOT EXISTS idx_recent_chats_user_chat ON recent_chats(user_id, chat_id, created_at DESC);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_recent_chats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recent_chats_timestamp
BEFORE UPDATE ON recent_chats
FOR EACH ROW
EXECUTE FUNCTION update_recent_chats_updated_at();

-- Enable Row Level Security
ALTER TABLE recent_chats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only read their own recent chats
CREATE POLICY "Users can view own recent chats"
  ON recent_chats
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own recent chats
CREATE POLICY "Users can insert own recent chats"
  ON recent_chats
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own recent chats
CREATE POLICY "Users can update own recent chats"
  ON recent_chats
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own recent chats
CREATE POLICY "Users can delete own recent chats"
  ON recent_chats
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE recent_chats IS 'Stores recent chat history for users in the coach component, allowing quick access to previous conversations';
COMMENT ON COLUMN recent_chats.chat_id IS 'Unique identifier for grouping multiple messages into a single conversation';
COMMENT ON COLUMN recent_chats.chat_title IS 'Brief title or summary of the chat conversation';
COMMENT ON COLUMN recent_chats.message_content IS 'The actual content of the chat message';
COMMENT ON COLUMN recent_chats.sender_type IS 'Indicates if the message was sent by user, coach agent, or analyzer agent';
COMMENT ON COLUMN recent_chats.sender_name IS 'Display name of the sender (e.g., "AI Health Coach", "User")';