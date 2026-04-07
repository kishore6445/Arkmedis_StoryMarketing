-- Migration: Add platform-level targeting to content_targets table
-- This allows setting different target counts for each platform (Instagram, LinkedIn, YouTube, etc.)

-- Update content_targets table to support platform-level targets
-- Instead of one target per month per client, we now support per-platform targets

-- Drop existing unique constraint if present (one target per month per client)
ALTER TABLE content_targets DROP CONSTRAINT IF EXISTS content_targets_client_month_unique;

-- Add platform column if not exists
ALTER TABLE content_targets ADD COLUMN IF NOT EXISTS platform VARCHAR(50) DEFAULT 'All';

-- Add a new unique constraint that includes platform
ALTER TABLE content_targets ADD CONSTRAINT content_targets_client_month_platform_unique 
  UNIQUE (client_id, month, year, platform);

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_content_targets_client_month_platform 
  ON content_targets(client_id, month, year, platform);

-- Add RLS policy for reading targets (users can see targets for their clients)
ALTER TABLE content_targets ENABLE ROW LEVEL SECURITY;

-- Create policy for select (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'content_targets' AND policyname = 'Users can view targets for their clients'
  ) THEN
    CREATE POLICY "Users can view targets for their clients"
      ON content_targets FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM clients c
          WHERE c.id = content_targets.client_id
          AND c.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Create policy for insert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'content_targets' AND policyname = 'Users can create targets for their clients'
  ) THEN
    CREATE POLICY "Users can create targets for their clients"
      ON content_targets FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM clients c
          WHERE c.id = content_targets.client_id
          AND c.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Create policy for update
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'content_targets' AND policyname = 'Users can update targets for their clients'
  ) THEN
    CREATE POLICY "Users can update targets for their clients"
      ON content_targets FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM clients c
          WHERE c.id = content_targets.client_id
          AND c.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM clients c
          WHERE c.id = content_targets.client_id
          AND c.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Create policy for delete
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'content_targets' AND policyname = 'Users can delete targets for their clients'
  ) THEN
    CREATE POLICY "Users can delete targets for their clients"
      ON content_targets FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM clients c
          WHERE c.id = content_targets.client_id
          AND c.user_id = auth.uid()
        )
      );
  END IF;
END $$;
