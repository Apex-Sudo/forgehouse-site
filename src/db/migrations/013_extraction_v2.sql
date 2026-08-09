-- 013_extraction_v2.sql
-- Mentor Extraction 2.0
--
-- Replaces the single long extraction interview with a battery of short,
-- episode-anchored modules run over ~2 weeks, plus a corpus of the mentor's
-- existing published material that is mined BEFORE the interview so session
-- time is spent only on gaps.
--
-- Existing v1 sessions are grandfathered: they keep program_version = 1 and
-- continue to run the legacy extraction/calibration/ingestion phases. Only
-- newly created sessions get program_version = 2.

-- ── Sessions ────────────────────────────────────────────────────────────────

ALTER TABLE onboarding_sessions
  ADD COLUMN IF NOT EXISTS program_version int NOT NULL DEFAULT 1;

-- Aggregate coverage across all modules, e.g.
-- {"episodes":0.7,"reasoning":0.5,"heuristics":0.4,"boundaries":0.2,"voice":0.6,"range":0.5}
ALTER TABLE onboarding_sessions
  ADD COLUMN IF NOT EXISTS coverage jsonb NOT NULL DEFAULT '{}'::jsonb;

-- ── Modules ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS extraction_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id uuid NOT NULL REFERENCES onboarding_sessions(id) ON DELETE CASCADE,

  module_type text NOT NULL CHECK (module_type IN (
    'domain_scan',
    'case_replay',
    'failure_autopsy',
    'think_aloud',
    'contrast_probe',
    'artifact_walkthrough',
    'boundary_mapping'
  )),

  status text NOT NULL DEFAULT 'locked' CHECK (status IN (
    'locked', 'available', 'in_progress', 'complete'
  )),

  -- Conversation for this module: [{ role, content }]
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- Per-module coverage vector, 0..1 per dimension
  coverage jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Artifact walkthrough: [{ name, chars, uploadedAt }]. Extracted text only —
  -- uploaded files themselves are never stored.
  artifacts jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- Think-aloud golden set, reused later to calibrate against the live agent:
  -- [{ scenario, mentorAnswer }]
  golden_set jsonb NOT NULL DEFAULT '[]'::jsonb,

  sort_order int NOT NULL DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (onboarding_id, module_type)
);

CREATE INDEX IF NOT EXISTS idx_extraction_modules_onboarding
  ON extraction_modules (onboarding_id, sort_order);

-- ── Corpus ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS mentor_corpus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id uuid NOT NULL REFERENCES onboarding_sessions(id) ON DELETE CASCADE,

  source_type text NOT NULL CHECK (source_type IN ('url', 'youtube', 'file', 'paste')),
  url text,
  title text,
  raw_text text,
  char_count int NOT NULL DEFAULT 0,

  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  error text,

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mentor_corpus_onboarding
  ON mentor_corpus (onboarding_id, created_at DESC);

-- ── Knowledge chunk types ───────────────────────────────────────────────────
-- v1 stored career | methodology | story | belief. v2 adds the types that hold
-- reasoning rather than facts: decision (a walked-through judgement call),
-- heuristic (an if/then rule with its exception), boundary (explicitly not
-- their area). Dropping the old CHECK is conditional so this is safe to re-run.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'mentor_knowledge_chunk_type_check'
  ) THEN
    ALTER TABLE mentor_knowledge DROP CONSTRAINT mentor_knowledge_chunk_type_check;
  END IF;
END $$;

ALTER TABLE mentor_knowledge
  ADD CONSTRAINT mentor_knowledge_chunk_type_check
  CHECK (chunk_type IN (
    'career', 'methodology', 'story', 'belief',
    'decision', 'heuristic', 'boundary'
  ));

-- ── RLS ─────────────────────────────────────────────────────────────────────
-- Both tables are only ever reached through server routes using the service
-- key. Policies mirror the existing tables as defence in depth.

ALTER TABLE extraction_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_corpus ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on extraction_modules" ON extraction_modules;
CREATE POLICY "Service role full access on extraction_modules"
  ON extraction_modules FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access on mentor_corpus" ON mentor_corpus;
CREATE POLICY "Service role full access on mentor_corpus"
  ON mentor_corpus FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
