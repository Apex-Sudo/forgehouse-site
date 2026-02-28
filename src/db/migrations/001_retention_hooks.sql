-- 001_retention_hooks.sql
-- Tables for auth, conversation history, free tier memory, and saved insights

-- Users table (upserted on OAuth sign-in)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  image text,
  provider text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Service role only for writes; no direct user access needed (server-side only)
CREATE POLICY "Service role full access on users"
  ON users FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Conversations (paying subscribers - persistent)
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentor_slug text NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_conversations_user_mentor ON conversations(user_id, mentor_slug);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own conversations"
  ON conversations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users write own conversations"
  ON conversations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own conversations"
  ON conversations FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Service role full access on conversations"
  ON conversations FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Free tier conversations (7-day expiry)
CREATE TABLE IF NOT EXISTS free_tier_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentor_slug text NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

CREATE INDEX idx_free_conversations_user_mentor ON free_tier_conversations(user_id, mentor_slug);
CREATE INDEX idx_free_conversations_expires ON free_tier_conversations(expires_at);

ALTER TABLE free_tier_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own free conversations"
  ON free_tier_conversations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users write own free conversations"
  ON free_tier_conversations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own free conversations"
  ON free_tier_conversations FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Service role full access on free_tier_conversations"
  ON free_tier_conversations FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Saved insights (subscribers only)
CREATE TABLE IF NOT EXISTS saved_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentor_slug text NOT NULL,
  content text NOT NULL,
  source_message_id text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_insights_user_mentor ON saved_insights(user_id, mentor_slug);

ALTER TABLE saved_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own insights"
  ON saved_insights FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users write own insights"
  ON saved_insights FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own insights"
  ON saved_insights FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Service role full access on saved_insights"
  ON saved_insights FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
