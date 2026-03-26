-- Add meeting alert tracking columns to support deadline and meeting alerts
ALTER TABLE meetings 
ADD COLUMN IF NOT EXISTS start_time TIMESTAMP,
ADD COLUMN IF NOT EXISTS end_time TIMESTAMP,
ADD COLUMN IF NOT EXISTS meeting_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS alert_1_day_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS alert_1_hour_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS alert_start_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_reminder_been_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS alert_dismissed_by_user BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS dismissed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_alert_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;

-- Create meeting_alert_history table to track all alerts sent
CREATE TABLE IF NOT EXISTS meeting_alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('scheduled', '1_day_before', '1_hour_before', 'started', 'cancelled', 'rescheduled')),
  sent_via VARCHAR(50) NOT NULL CHECK (sent_via IN ('whatsapp', 'toast', 'both')),
  sent_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'dismissed')),
  message_content TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_meeting_alert_history_meeting_id ON meeting_alert_history(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_alert_history_user_id ON meeting_alert_history(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_alert_history_alert_type ON meeting_alert_history(alert_type);
CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON meetings(start_time);
CREATE INDEX IF NOT EXISTS idx_meetings_alert_1_hour_sent ON meetings(alert_1_hour_sent);

-- Add columns to track task completion for PKR (in_review counts as completion)
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;

-- Add index for reviewed_at to support PKR calculations
CREATE INDEX IF NOT EXISTS idx_tasks_reviewed_at ON tasks(reviewed_at);
