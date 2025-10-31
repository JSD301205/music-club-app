-- ============================================
-- JAM BOARD TABLES (Phase 2 - Sprint 1)
-- ============================================

-- 1. JAM POSTS TABLE
-- Posts where musicians can find collaborators, jam sessions, etc.
CREATE TABLE jam_posts (
  id BIGSERIAL PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instruments_needed TEXT[] NOT NULL DEFAULT '{}',
  genres TEXT[] NOT NULL DEFAULT '{}',
  skill_level TEXT NOT NULL DEFAULT 'any' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'any')),
  location TEXT,
  available_times TEXT[] DEFAULT '{}',
  type TEXT NOT NULL CHECK (type IN ('looking_for_members', 'jam_session', 'collaboration', 'performance')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'filled')),
  responses_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. JAM POST RESPONSES TABLE
-- Users can respond/express interest in posts
CREATE TABLE jam_post_responses (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES jam_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_jam_posts_author ON jam_posts(author_id);
CREATE INDEX idx_jam_posts_type ON jam_posts(type);
CREATE INDEX idx_jam_posts_status ON jam_posts(status);
CREATE INDEX idx_jam_posts_created ON jam_posts(created_at DESC);
CREATE INDEX idx_jam_post_responses_post ON jam_post_responses(post_id);
CREATE INDEX idx_jam_post_responses_user ON jam_post_responses(user_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE jam_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE jam_post_responses ENABLE ROW LEVEL SECURITY;

-- JAM POSTS POLICIES
-- Anyone can view posts
CREATE POLICY "Jam posts are viewable by everyone"
  ON jam_posts FOR SELECT
  USING (true);

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create jam posts"
  ON jam_posts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

-- Users can update their own posts
CREATE POLICY "Users can update their own jam posts"
  ON jam_posts FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete their own jam posts"
  ON jam_posts FOR DELETE
  USING (auth.uid() = author_id);

-- JAM POST RESPONSES POLICIES
-- Anyone can view responses
CREATE POLICY "Jam post responses are viewable by everyone"
  ON jam_post_responses FOR SELECT
  USING (true);

-- Authenticated users can create responses
CREATE POLICY "Authenticated users can create responses"
  ON jam_post_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own responses
CREATE POLICY "Users can delete their own responses"
  ON jam_post_responses FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to update updated_at on jam_posts
CREATE TRIGGER update_jam_posts_updated_at
  BEFORE UPDATE ON jam_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update response count
CREATE OR REPLACE FUNCTION update_jam_post_response_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE jam_posts
    SET responses_count = responses_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE jam_posts
    SET responses_count = responses_count - 1
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update response count automatically
CREATE TRIGGER update_response_count_on_insert
  AFTER INSERT ON jam_post_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_jam_post_response_count();

CREATE TRIGGER update_response_count_on_delete
  AFTER DELETE ON jam_post_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_jam_post_response_count();

-- ============================================
-- HELPFUL VIEWS (Optional)
-- ============================================

-- View to get jam posts with author profile info
CREATE OR REPLACE VIEW jam_posts_with_author AS
SELECT 
  jp.*,
  p.username,
  p.full_name,
  p.avatar_url,
  p.instruments,
  p.musical_interests AS favorite_genres
FROM jam_posts jp
LEFT JOIN public.profiles p ON jp.author_id = p.id;

-- Grant access to the view
GRANT SELECT ON jam_posts_with_author TO authenticated;
GRANT SELECT ON jam_posts_with_author TO anon;

-- ============================================
-- SUCCESS!
-- ============================================

-- Run this SQL in your Supabase SQL Editor
-- After running, you'll have:
-- ✅ jam_posts table
-- ✅ jam_post_responses table
-- ✅ Indexes for fast queries
-- ✅ RLS policies for security
-- ✅ Triggers for auto-updates
-- ✅ View for easy joins
