-- Create daily_reports table
CREATE TABLE IF NOT EXISTS daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  report_date DATE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, report_date)
);

-- Create time_entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES daily_reports(id) ON DELETE CASCADE,
  client_id UUID,
  sprint_id UUID,
  task_id UUID,
  hours DECIMAL(4, 2) NOT NULL CHECK (hours > 0 AND hours <= 10),
  work_description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_daily_reports_user_date ON daily_reports(user_id, report_date);
CREATE INDEX IF NOT EXISTS idx_daily_reports_status ON daily_reports(status);
CREATE INDEX IF NOT EXISTS idx_time_entries_report ON time_entries(report_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_client ON time_entries(client_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_sprint ON time_entries(sprint_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_task ON time_entries(task_id);

-- Enable Row Level Security (RLS)
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for daily_reports
CREATE POLICY "Users can only see their own reports" ON daily_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own reports" ON daily_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own reports" ON daily_reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own reports" ON daily_reports
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for time_entries (via daily_reports)
CREATE POLICY "Users can access time entries in their reports" ON time_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM daily_reports
      WHERE daily_reports.id = time_entries.report_id
      AND daily_reports.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert time entries in their reports" ON time_entries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_reports
      WHERE daily_reports.id = report_id
      AND daily_reports.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update time entries in their reports" ON time_entries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM daily_reports
      WHERE daily_reports.id = report_id
      AND daily_reports.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete time entries in their reports" ON time_entries
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM daily_reports
      WHERE daily_reports.id = report_id
      AND daily_reports.user_id = auth.uid()
    )
  );
