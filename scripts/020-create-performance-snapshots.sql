-- Create post_performance_snapshots table for tracking metrics evolution
-- Captures reach, engagement, and other metrics at key intervals (Day 1, 7, 14, 21, 42)

CREATE TABLE IF NOT EXISTS post_performance_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  client_id UUID NOT NULL,
  snapshot_day INTEGER NOT NULL,
  reach_at_snapshot INTEGER DEFAULT 0,
  engagement_at_snapshot INTEGER DEFAULT 0,
  engagement_rate_at_snapshot DECIMAL(5, 2) DEFAULT 0,
  likes_at_snapshot INTEGER DEFAULT 0,
  comments_at_snapshot INTEGER DEFAULT 0,
  shares_at_snapshot INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  CONSTRAINT valid_snapshot_day CHECK (snapshot_day IN (1, 3, 7, 14, 21, 42))
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_post_performance_snapshots_post_id 
  ON post_performance_snapshots(post_id);
CREATE INDEX IF NOT EXISTS idx_post_performance_snapshots_client_id 
  ON post_performance_snapshots(client_id);
CREATE INDEX IF NOT EXISTS idx_post_performance_snapshots_snapshot_day 
  ON post_performance_snapshots(snapshot_day);

-- Create performance_insights table for auto-generated insights
CREATE TABLE IF NOT EXISTS performance_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  insight_type VARCHAR(50) NOT NULL,
  insight_text TEXT NOT NULL,
  performance_score DECIMAL(3, 2) DEFAULT 0,
  is_high_performer BOOLEAN DEFAULT FALSE,
  is_underperformer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT valid_insight_type CHECK (insight_type IN ('reach', 'engagement', 'audience', 'content_type', 'platform_specific'))
);

CREATE INDEX IF NOT EXISTS idx_performance_insights_post_id 
  ON performance_insights(post_id);
CREATE INDEX IF NOT EXISTS idx_performance_insights_insight_type 
  ON performance_insights(insight_type);
