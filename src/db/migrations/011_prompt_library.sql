-- 011_prompt_library.sql
-- Prompts table for the prompt library feature in chat UI

CREATE TABLE IF NOT EXISTS prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('productivity', 'business', 'code', 'research')),
  title text NOT NULL,
  description text NOT NULL,
  prompt_text text NOT NULL,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_prompts_category ON prompts (category);

ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read prompts
CREATE POLICY "Authenticated users can read prompts"
  ON prompts FOR SELECT
  USING (auth.role() = 'authenticated');

-- Service role full access for curation
CREATE POLICY "Service role full access on prompts"
  ON prompts FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Allow anon reads so unauthenticated users can browse the prompt library
CREATE POLICY "Anon can read prompts"
  ON prompts FOR SELECT
  USING (true);

-- Seed placeholder prompts
INSERT INTO prompts (category, title, description, prompt_text, sort_order) VALUES
(
  'productivity',
  'Weekly prioritization framework',
  'Structure your week around the 3 most important outcomes, not just tasks.',
  'Help me plan my week. Ask me what my top 3 outcomes are, then help me break each into no more than 3 key actions. Push back if I list more than 3 outcomes or if any action isn''t directly tied to an outcome.',
  1
),
(
  'productivity',
  'Meeting prep in 5 minutes',
  'Walk through a quick pre-meeting checklist so you walk in clear and confident.',
  'I have a meeting coming up. Ask me: who''s attending, what''s the stated goal, what do I want them to think/feel/do afterward, and what''s the one thing I must not forget to say. Then help me shape a 2-sentence opening.',
  2
),
(
  'business',
  'Cold outreach audit',
  'Paste a cold email or LinkedIn message and get line-by-line feedback.',
  'I''m going to share a cold outreach message. Tear it down line by line. Point out clichés, weak hooks, missing personalization, and anything that sounds like it was written by AI. Then rewrite it to be shorter, sharper, and human.',
  1
),
(
  'business',
  'Deal diagnosis',
  'Stuck deal? Answer a few diagnostic questions to find the real blocker.',
  'I have a deal that''s stalled. Ask me: what stage is it in, when did I last hear from the champion, what was their last objection, and what''s my gut feeling about why it''s stuck. Then give me 2-3 concrete next moves.',
  2
),
(
  'code',
  'Code review assistant',
  'Paste a PR or code snippet and get a structured, constructive review.',
  'Review this code. Focus on: readability, potential bugs, edge cases, performance concerns, and adherence to common best practices. Be constructive, not pedantic. If something is a nitpick, say so. Rate overall: green / yellow / red.',
  1
),
(
  'code',
  'Debugging partner',
  'Rubber-duck through a bug with structured diagnostic questions.',
  'I''m debugging an issue. Ask me: what I expected to happen, what actually happened, what I''ve already tried, and what changed recently. Then help me form 3 hypotheses ranked by likelihood. Don''t jump to solutions until we''ve narrowed the cause.',
  2
),
(
  'research',
  'Literature synthesis',
  'Summarize and connect ideas across multiple sources on a topic.',
  'I''ll share key points from a few articles or papers on a topic. Help me synthesize them: what themes overlap, where do they disagree, what''s the consensus view, and what gaps remain unexplored. Keep it structured but avoid academic jargon.',
  1
),
(
  'research',
  'Competitive landscape scan',
  'Map out competitors, their positioning, and whitespace opportunities.',
  'Help me research a competitive landscape. Ask me: the market or category, who I think the main players are, and what dimension I want to compare them on (pricing, features, positioning, GTM). Then help me structure a comparison and identify whitespace.',
  2
);
