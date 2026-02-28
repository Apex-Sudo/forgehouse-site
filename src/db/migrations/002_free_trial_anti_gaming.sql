-- 002_free_trial_anti_gaming.sql
-- Prevent gaming of 7-day free memory trial

-- Add linkedin_id as unique key (prevents re-registration)
ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin_id text UNIQUE;

-- Track when free trial was activated (null = never used)
ALTER TABLE users ADD COLUMN IF NOT EXISTS free_trial_started_at timestamptz;

-- Update unique constraint: linkedin_id is the real identity, not email
-- (email can change, linkedin_id cannot)

-- After 7 days: conversations become read-only (enforced in API)
-- After 30 days: soft-deleted (kept for re-activation on subscribe)
ALTER TABLE free_tier_conversations ADD COLUMN IF NOT EXISTS read_only boolean DEFAULT false;
ALTER TABLE free_tier_conversations ADD COLUMN IF NOT EXISTS soft_deleted boolean DEFAULT false;
