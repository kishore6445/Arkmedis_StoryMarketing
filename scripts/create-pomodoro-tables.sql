-- Timer Sessions Table - Tracks individual Pomodoro sessions
CREATE TABLE timer_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  task_id UUID,
  task_title TEXT NOT NULL,
  client_name TEXT,
  sprint_name TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER DEFAULT 0,
  status TEXT DEFAULT 'stopped' CHECK (status IN ('running', 'paused', 'stopped', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Daily Reports Table - Stores daily work reports
CREATE TABLE daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  report_date DATE NOT NULL,
  total_hours DECIMAL(5, 2) DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, report_date)
);

-- Time Entries Table - Individual time entries in a daily report
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_report_id UUID NOT NULL REFERENCES daily_reports(id) ON DELETE CASCADE,
  task_id UUID,
  task_title TEXT NOT NULL,
  client_id UUID,
  client_name TEXT NOT NULL,
  sprint_id UUID,
  sprint_name TEXT,
  hours DECIMAL(5, 2) NOT NULL,
  work_description TEXT NOT NULL,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'timer_captured', 'auto_suggested')),
  related_session_id UUID REFERENCES timer_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_timer_sessions_user_id ON timer_sessions(user_id);
CREATE INDEX idx_timer_sessions_session_date ON timer_sessions(session_date);
CREATE INDEX idx_timer_sessions_user_date ON timer_sessions(user_id, session_date);
CREATE INDEX idx_daily_reports_user_id ON daily_reports(user_id);
CREATE INDEX idx_daily_reports_user_date ON daily_reports(user_id, report_date);
CREATE INDEX idx_time_entries_daily_report_id ON time_entries(daily_report_id);
CREATE INDEX idx_time_entries_user_report ON time_entries(daily_report_id, created_at);

-- Enable Row Level Security
ALTER TABLE timer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for timer_sessions
CREATE POLICY "Users can view own timer sessions" ON timer_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own timer sessions" ON timer_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own timer sessions" ON timer_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own timer sessions" ON timer_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for daily_reports
CREATE POLICY "Users can view own daily reports" ON daily_reports
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily reports" ON daily_reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily reports" ON daily_reports
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete draft daily reports" ON daily_reports
  FOR DELETE
  USING (auth.uid() = user_id AND status = 'draft');

-- RLS Policies for time_entries (access through daily_reports)
CREATE POLICY "Users can view own time entries" ON time_entries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM daily_reports
      WHERE daily_reports.id = time_entries.daily_report_id
      AND daily_reports.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own time entries" ON time_entries
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_reports
      WHERE daily_reports.id = time_entries.daily_report_id
      AND daily_reports.user_id = auth.uid()
      AND daily_reports.status = 'draft'
    )
  );

CREATE POLICY "Users can update own time entries" ON time_entries
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM daily_reports
      WHERE daily_reports.id = time_entries.daily_report_id
      AND daily_reports.user_id = auth.uid()
      AND daily_reports.status = 'draft'
    )
  );

CREATE POLICY "Users can delete own time entries" ON time_entries
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM daily_reports
      WHERE daily_reports.id = time_entries.daily_report_id
      AND daily_reports.user_id = auth.uid()
      AND daily_reports.status = 'draft'
    )
  );
