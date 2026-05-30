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

create index if not exists behavioral_log_build_id_idx on behavioral_log (build_id);
create index if not exists behavioral_log_created_at_idx on behavioral_log (created_at desc);

alter table behavioral_log enable row level security;

create policy "anon read" on behavioral_log
  for select using (true);

create policy "service insert" on behavioral_log
  for insert with check (true);

-- 2. builds — full pipeline state per build
create table if not exists builds (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  build_id text not null unique,
  url text,
  client_name text,
  tier text,
  notes text,
  photo_urls jsonb default '[]',
  workflow_state text default 'URL_RECEIVED',
  audit_object jsonb,
  direction_a jsonb,
  direction_b jsonb,
  approved_direction text,
  locked_build_spec text,
  executor_type text,
  executor_result jsonb,
  qa_scorecard jsonb,
  sales_package jsonb,
  total_cost numeric(10, 4) default 0,
  error_message text
);

create index if not exists builds_build_id_idx on builds (build_id);
create index if not exists builds_created_at_idx on builds (created_at desc);

alter table builds enable row level security;

create policy "anon read builds" on builds
  for select using (true);

create policy "service write builds" on builds
  for all with check (true);

-- 3. Storage bucket: client-assets
-- Run via Supabase Dashboard → Storage → New bucket
-- Name: client-assets
-- Public: false
-- Or run:
-- insert into storage.buckets (id, name, public)
--   values ('client-assets', 'client-assets', false)
--   on conflict do nothing;
