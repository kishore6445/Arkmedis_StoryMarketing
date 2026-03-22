-- Create content_records table for Add Content CRUD
CREATE TABLE IF NOT EXISTS public.content_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content_type VARCHAR(50),
  platform VARCHAR(50) NOT NULL,
  planning_month VARCHAR(20),
  planning_week VARCHAR(20),
  planned_date DATE,
  scheduled_date DATE,
  published_date DATE,
  attachment_url TEXT,
  attachment_name TEXT,
  attachment_type TEXT,
  attachment_size BIGINT,
  status VARCHAR(50) NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'scheduled', 'published', 'pending', 'missed', 'paused')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_records_client_id
  ON public.content_records(client_id);

CREATE INDEX IF NOT EXISTS idx_content_records_owner_id
  ON public.content_records(owner_id);

CREATE INDEX IF NOT EXISTS idx_content_records_status
  ON public.content_records(status);

CREATE INDEX IF NOT EXISTS idx_content_records_planning_month
  ON public.content_records(planning_month);

CREATE INDEX IF NOT EXISTS idx_content_records_planning_week
  ON public.content_records(planning_week);

CREATE INDEX IF NOT EXISTS idx_content_records_scheduled_date
  ON public.content_records(scheduled_date DESC);

ALTER TABLE public.content_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view content records" ON public.content_records
  FOR SELECT
  USING (
    created_by = auth.uid()
    OR owner_id = auth.uid()
    OR client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert content records" ON public.content_records
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update owned content records" ON public.content_records
  FOR UPDATE
  USING (created_by = auth.uid() OR owner_id = auth.uid());

CREATE POLICY "Users can delete owned content records" ON public.content_records
  FOR DELETE
  USING (created_by = auth.uid() OR owner_id = auth.uid());

CREATE OR REPLACE FUNCTION update_content_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS content_records_updated_at ON public.content_records;

CREATE TRIGGER content_records_updated_at
  BEFORE UPDATE ON public.content_records
  FOR EACH ROW
  EXECUTE FUNCTION update_content_records_updated_at();