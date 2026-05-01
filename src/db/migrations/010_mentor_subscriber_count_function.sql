-- 010_mentor_subscriber_count_function.sql
-- Create a function to count subscribers for a given mentor slug
-- This function can be called from the API with service role permissions
-- The subscribed_mentor_slugs column is in public.users, not auth.users

CREATE OR REPLACE FUNCTION get_mentor_subscriber_count(mentor_slug_param text)
RETURNS bigint AS $$
DECLARE
  count_result bigint;
BEGIN
  SELECT COUNT(*) INTO count_result
  FROM public.users
  WHERE subscribed_mentor_slugs @> ARRAY[mentor_slug_param];
  
  RETURN count_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION get_mentor_subscriber_count(text) TO service_role;
