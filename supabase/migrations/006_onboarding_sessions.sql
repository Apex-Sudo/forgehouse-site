-- Migration for onboarding sessions table
create table if not exists onboarding_sessions (
  id uuid default gen_random_uuid() primary key,
  extraction_data jsonb,
  calibration_data jsonb,
  ingestion_data jsonb,
  current_phase text default 'extraction',
  email text,
  mentor_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '7 days')
);

-- Create indexes for better performance
create index if not exists idx_onboarding_sessions_email on onboarding_sessions (email);
create index if not exists idx_onboarding_sessions_phase on onboarding_sessions (current_phase);
create index if not exists idx_onboarding_sessions_expires on onboarding_sessions (expires_at);

-- Enable Row Level Security
alter table onboarding_sessions enable row level security;

-- Service role only (onboarding data is sensitive)
create policy "Service role only" on onboarding_sessions
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
