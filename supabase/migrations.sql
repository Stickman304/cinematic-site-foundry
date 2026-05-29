-- Mission Control — Supabase schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor

-- 1. behavioral_log — real-time pipeline activity feed
create table if not exists behavioral_log (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  agent text not null,
  action text not null,
  tier text,
  cost numeric(10, 6),
  build_id text,
  client_name text,
  status text
);

-- Index for fast build_id lookups
create index if not exists behavioral_log_build_id_idx on behavioral_log (build_id);
create index if not exists behavioral_log_created_at_idx on behavioral_log (created_at desc);

-- Enable Row Level Security (anon key can read, service key can write)
alter table behavioral_log enable row level security;

-- Allow anon reads (Mission Control browser polls this)
create policy "anon read" on behavioral_log
  for select using (true);

-- Allow authenticated/service inserts
create policy "service insert" on behavioral_log
  for insert with check (true);

-- 2. Storage bucket: client-assets
-- Run via Supabase Dashboard → Storage → New bucket
-- Name: client-assets
-- Public: false
-- Or run: insert into storage.buckets (id, name, public) values ('client-assets', 'client-assets', false) on conflict do nothing;
