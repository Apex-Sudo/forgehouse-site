-- 009_subscribed_mentor_slugs.sql

-- Add subscribed_mentor_slugs array column to auth.users
ALTER TABLE auth.users
  ADD COLUMN IF NOT EXISTS subscribed_mentor_slugs text[] DEFAULT ARRAY[]::text[];

-- Function to safely append a mentor slug to the subscribed array (prevents duplicates)
CREATE OR REPLACE FUNCTION add_mentor_slug_to_subscribed_array(user_id uuid, slug text)
RETURNS void AS $$
BEGIN
  UPDATE auth.users
  SET subscribed_mentor_slugs = array_append(subscribed_mentor_slugs, slug)
  WHERE id = user_id
    AND NOT array_contains(subscribed_mentor_slugs, slug);
END;
$$ LANGUAGE plpgsql;

-- Function to remove a mentor slug from the subscribed array
CREATE OR REPLACE FUNCTION remove_mentor_slug_from_subscribed_array(user_id uuid, slug text)
RETURNS void AS $$
BEGIN
  UPDATE auth.users
  SET subscribed_mentor_slugs = array_remove(subscribed_mentor_slugs, slug)
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;