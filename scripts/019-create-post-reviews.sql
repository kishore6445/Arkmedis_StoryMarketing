-- Post Reviews Table for manual content performance reviews
CREATE TABLE post_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_record_id UUID NOT NULL REFERENCES content_records(id) ON DELETE CASCADE,
  review_text TEXT,
  reach_metric INTEGER DEFAULT 0,
  engagement_metric INTEGER DEFAULT 0,
  likes_metric INTEGER DEFAULT 0,
  comments_metric INTEGER DEFAULT 0,
  shares_metric INTEGER DEFAULT 0,
  engagement_rate NUMERIC(5, 2),
  traction_status VARCHAR(20) DEFAULT 'neutral',
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_post_reviews_user_id ON post_reviews(user_id);
CREATE INDEX idx_post_reviews_content_record_id ON post_reviews(content_record_id);
CREATE INDEX idx_post_reviews_reviewed_at ON post_reviews(reviewed_at DESC);

-- RLS Policies
ALTER TABLE post_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own post reviews"
  ON post_reviews FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create post reviews"
  ON post_reviews FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own post reviews"
  ON post_reviews FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own post reviews"
  ON post_reviews FOR DELETE
  USING (user_id = auth.uid());
