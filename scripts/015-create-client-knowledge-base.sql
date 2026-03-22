-- Create client_knowledge_base table for WorkFlowy-style hierarchical notes
CREATE TABLE IF NOT EXISTS client_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES client_knowledge_base(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  type TEXT NOT NULL DEFAULT 'note' CHECK (type IN ('topic', 'decision', 'action_item', 'note', 'insight')),
  source_meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
  created_from_meeting_date TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_collapsed BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  version_number INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_kb_client_id ON client_knowledge_base(client_id);
CREATE INDEX IF NOT EXISTS idx_kb_parent_id ON client_knowledge_base(parent_id);
CREATE INDEX IF NOT EXISTS idx_kb_type ON client_knowledge_base(type);
CREATE INDEX IF NOT EXISTS idx_kb_created_by ON client_knowledge_base(created_by);
CREATE INDEX IF NOT EXISTS idx_kb_source_meeting ON client_knowledge_base(source_meeting_id);
CREATE INDEX IF NOT EXISTS idx_kb_archived ON client_knowledge_base(is_archived);
CREATE INDEX IF NOT EXISTS idx_kb_client_parent ON client_knowledge_base(client_id, parent_id);
CREATE INDEX IF NOT EXISTS idx_kb_tags ON client_knowledge_base USING GIN(tags);

-- Create client_kb_versions table for version history
CREATE TABLE IF NOT EXISTS client_kb_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kb_node_id UUID NOT NULL REFERENCES client_knowledge_base(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  changed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  change_reason TEXT,
  version_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for version queries
CREATE INDEX IF NOT EXISTS idx_kb_versions_node_id ON client_kb_versions(kb_node_id);
CREATE INDEX IF NOT EXISTS idx_kb_versions_created_at ON client_kb_versions(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_kb_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_client_knowledge_base_updated_at ON client_knowledge_base;
CREATE TRIGGER update_client_knowledge_base_updated_at
BEFORE UPDATE ON client_knowledge_base
FOR EACH ROW
EXECUTE FUNCTION update_kb_updated_at();
