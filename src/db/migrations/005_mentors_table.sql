-- 005_mentors_table.sql
-- Dynamic mentor configuration: prompts, starters, pricing, and scenarios stored in DB

CREATE TABLE IF NOT EXISTS mentors (
  slug text PRIMARY KEY,
  name text NOT NULL,
  tagline text NOT NULL,
  avatar_url text NOT NULL,
  system_prompt text NOT NULL,
  welcome_message text NOT NULL,
  default_starters jsonb NOT NULL DEFAULT '[]',
  starters_hint text,
  bio text,
  stripe_price_id text,
  monthly_price int NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access on mentors"
  ON mentors FOR SELECT
  USING (true);

CREATE POLICY "Service role full access on mentors"
  ON mentors FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS mentor_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_slug text NOT NULL REFERENCES mentors(slug) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'search',
  questions jsonb NOT NULL DEFAULT '[]',
  system_prompt_addition text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_mentor_scenarios_slug ON mentor_scenarios(mentor_slug);

ALTER TABLE mentor_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access on mentor_scenarios"
  ON mentor_scenarios FOR SELECT
  USING (true);

CREATE POLICY "Service role full access on mentor_scenarios"
  ON mentor_scenarios FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
