-- Migration 017: Add content targets table and production_done field
-- Enables tracking of monthly content commitments and production readiness

-- 1. Create content_targets table for tracking monthly content goals per client
CREATE TABLE IF NOT EXISTS content_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  month VARCHAR(20) NOT NULL,
  year INTEGER NOT NULL,
  target_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(client_id, month, year)
);

-- 2. Add production_done field to content_records (tracks when content is ready for scheduling)
ALTER TABLE content_records ADD COLUMN IF NOT EXISTS production_done BOOLEAN DEFAULT FALSE;
ALTER TABLE content_records ADD COLUMN IF NOT EXISTS production_done_at TIMESTAMPTZ;

-- 3. Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_content_targets_client_id ON content_targets(client_id);
CREATE INDEX IF NOT EXISTS idx_content_targets_month_year ON content_targets(month, year);
CREATE INDEX IF NOT EXISTS idx_content_records_production_done ON content_records(production_done);

-- 4. Enable RLS on content_targets
ALTER TABLE content_targets ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policy for content_targets (users can only see their team's targets)
CREATE POLICY "Users can view content targets for their clients" 
  ON content_targets FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE account_id = auth.jwt() ->> 'account_id'::text
    )
  );

CREATE POLICY "Team leads can create content targets"
  ON content_targets FOR INSERT
  WITH CHECK (
    client_id IN (
      SELECT id FROM clients 
      WHERE account_id = auth.jwt() ->> 'account_id'::text
    )
  );

CREATE POLICY "Team leads can update content targets"
  ON content_targets FOR UPDATE
  USING (
    client_id IN (
      SELECT id FROM clients 
      WHERE account_id = auth.jwt() ->> 'account_id'::text
    )
  );

-- 6. Add comment for documentation
COMMENT ON TABLE content_targets IS 'Tracks monthly content production targets per client for planning and forecasting';
COMMENT ON COLUMN content_targets.target_count IS 'Number of content pieces target for the given month';
COMMENT ON COLUMN content_records.production_done IS 'Indicates content is produced and ready for scheduling/publication';
