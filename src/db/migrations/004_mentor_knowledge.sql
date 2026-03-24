-- 004_mentor_knowledge.sql
-- Vector knowledge base for RAG-powered mentor agents
-- Each mentor's knowledge is partitioned by mentor_slug

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS mentor_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_slug text NOT NULL,
  chunk_type text NOT NULL CHECK (chunk_type IN ('career', 'methodology', 'story', 'belief')),
  topic text,
  content text NOT NULL,
  metadata jsonb DEFAULT '{}',
  embedding vector(1024),
  source_file text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mentor_knowledge_slug ON mentor_knowledge(mentor_slug);
CREATE INDEX IF NOT EXISTS idx_mentor_knowledge_type ON mentor_knowledge(mentor_slug, chunk_type);

ALTER TABLE mentor_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on mentor_knowledge"
  ON mentor_knowledge FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Similarity search function scoped by mentor
CREATE OR REPLACE FUNCTION match_mentor_knowledge(
  query_embedding vector(1024),
  p_mentor_slug text,
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 5
) RETURNS TABLE (
  id uuid,
  content text,
  chunk_type text,
  topic text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql STABLE AS $$
  SELECT
    mk.id,
    mk.content,
    mk.chunk_type,
    mk.topic,
    mk.metadata,
    1 - (mk.embedding <=> query_embedding) AS similarity
  FROM mentor_knowledge mk
  WHERE mk.mentor_slug = p_mentor_slug
    AND 1 - (mk.embedding <=> query_embedding) > match_threshold
  ORDER BY mk.embedding <=> query_embedding
  LIMIT match_count;
$$;
