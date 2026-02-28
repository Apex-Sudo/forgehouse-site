-- Add Stripe subscription fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscribed boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscribed_mentor_slugs text[];
