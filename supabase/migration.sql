-- Run this in Supabase SQL Editor after creating the project

create table if not exists fh_sessions (
  id uuid default gen_random_uuid() primary key,
  slug text not null,
  type text not null,
  messages jsonb not null default '[]'::jsonb,
  exchange_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint fh_sessions_slug_type_key unique (slug, type)
);

create index if not exists idx_fh_sessions_slug on fh_sessions (slug);

-- Enable RLS
alter table fh_sessions enable row level security;

-- Service role only (mentor extraction data is sensitive IP)
create policy "Service role only" on fh_sessions
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
