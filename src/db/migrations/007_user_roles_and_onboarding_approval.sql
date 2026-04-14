-- Add role column to users table for admin/mentor distinction
ALTER TABLE users ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Add agent approval tracking to onboarding_sessions
ALTER TABLE onboarding_sessions ADD COLUMN IF NOT EXISTS agent_approved boolean DEFAULT false;
ALTER TABLE onboarding_sessions ADD COLUMN IF NOT EXISTS agent_approved_at timestamptz;
