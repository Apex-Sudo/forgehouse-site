-- Add is_active column to mentors table
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;

-- Set existing mentors to active by default (you may want to adjust this logic)
UPDATE mentors SET is_active = true WHERE active = true;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_mentors_is_active ON mentors (is_active);
