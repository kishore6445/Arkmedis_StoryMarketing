-- Knowledge Base Tables for Supabase

-- Users table (if not already created)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Pages/Notes table (main content storage)
CREATE TABLE IF NOT EXISTS kb_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES kb_pages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  position INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Tags table for categorizing pages
CREATE TABLE IF NOT EXISTS kb_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT 'blue',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE(user_id, name)
);

-- Page tags junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS kb_page_tags (
  page_id UUID NOT NULL REFERENCES kb_pages(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES kb_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (page_id, tag_id)
);

-- Root pages/folders table (top-level organization like Home, Finance, etc)
CREATE TABLE IF NOT EXISTS kb_root_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  icon TEXT DEFAULT '📄',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE(user_id, title)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_kb_pages_user_id ON kb_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_kb_pages_parent_id ON kb_pages(parent_id);
CREATE INDEX IF NOT EXISTS idx_kb_pages_user_parent ON kb_pages(user_id, parent_id);
CREATE INDEX IF NOT EXISTS idx_kb_tags_user_id ON kb_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_kb_root_pages_user_id ON kb_root_pages(user_id);

-- Enable Row Level Security
ALTER TABLE kb_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_page_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_root_pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kb_pages
CREATE POLICY "Users can view their own pages" ON kb_pages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pages" ON kb_pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pages" ON kb_pages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pages" ON kb_pages
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for kb_tags
CREATE POLICY "Users can view their own tags" ON kb_tags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tags" ON kb_tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags" ON kb_tags
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags" ON kb_tags
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for kb_page_tags (through page_id)
CREATE POLICY "Users can view page tags for their pages" ON kb_page_tags
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM kb_pages WHERE id = page_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can insert page tags for their pages" ON kb_page_tags
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM kb_pages WHERE id = page_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete page tags for their pages" ON kb_page_tags
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM kb_pages WHERE id = page_id AND user_id = auth.uid())
  );

-- RLS Policies for kb_root_pages
CREATE POLICY "Users can view their own root pages" ON kb_root_pages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own root pages" ON kb_root_pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own root pages" ON kb_root_pages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own root pages" ON kb_root_pages
  FOR DELETE USING (auth.uid() = user_id);
