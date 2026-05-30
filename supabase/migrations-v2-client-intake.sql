-- Mission Control v2 — Client Intake + Asset Management schema
-- Run AFTER migrations.sql in Supabase SQL Editor.
-- Safe to re-run: all statements use IF NOT EXISTS / IF EXISTS.

-- ── clients ───────────────────────────────────────────────────────────────────

create table if not exists clients (
  id              uuid    default gen_random_uuid() primary key,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  slug            text    not null unique,
  name            text    not null,
  business_type   text,
  website_url     text,
  brand_notes     text,
  primary_color   text,
  secondary_color text,
  font_preference text,
  logo_url        text,
  contact_name    text,
  contact_email   text,
  contact_phone   text,
  notes           text,
  active          boolean default true
);

create index if not exists clients_slug_idx   on clients (slug);
create index if not exists clients_active_idx on clients (active, created_at desc);

alter table clients enable row level security;

drop policy if exists "anon read clients"    on clients;
drop policy if exists "service write clients" on clients;

create policy "anon read clients"    on clients for select using (true);
create policy "service write clients" on clients for all    with check (true);

-- ── client_assets ─────────────────────────────────────────────────────────────
-- asset_type:      logo | product | personal | location | social | other
-- asset_source:    upload | url | generated
-- approval_status: approved | pending | needs_permission | restricted
-- allowed_use:     build | sales | social | any (text array)

create table if not exists client_assets (
  id              uuid    default gen_random_uuid() primary key,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  client_id       uuid    not null references clients(id) on delete cascade,
  build_id        text,
  asset_type      text    not null default 'other',
  asset_source    text    not null default 'upload',
  file_name       text,
  file_url        text    not null,
  storage_path    text,
  alt_text        text,
  approval_status text    not null default 'pending',
  allowed_use     text[]  default '{}',
  contains_people boolean default false,
  contains_minor  boolean default false,
  notes           text
);

create index if not exists client_assets_client_id_idx  on client_assets (client_id);
create index if not exists client_assets_build_id_idx   on client_assets (build_id);
create index if not exists client_assets_approval_idx   on client_assets (client_id, approval_status);

alter table client_assets enable row level security;

drop policy if exists "anon read client_assets"    on client_assets;
drop policy if exists "service write client_assets" on client_assets;

create policy "anon read client_assets"    on client_assets for select using (true);
create policy "service write client_assets" on client_assets for all    with check (true);

-- ── client_intake_notes ───────────────────────────────────────────────────────

create table if not exists client_intake_notes (
  id         uuid    default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  client_id  uuid    not null references clients(id) on delete cascade,
  note       text    not null,
  author     text    default 'operator'
);

create index if not exists client_intake_notes_client_id_idx on client_intake_notes (client_id);

alter table client_intake_notes enable row level security;

drop policy if exists "anon read client_intake_notes"    on client_intake_notes;
drop policy if exists "service write client_intake_notes" on client_intake_notes;

create policy "anon read client_intake_notes"    on client_intake_notes for select using (true);
create policy "service write client_intake_notes" on client_intake_notes for all    with check (true);

-- ── builds table — add client columns ─────────────────────────────────────────

alter table builds
  add column if not exists client_id       uuid references clients(id),
  add column if not exists client_slug     text,
  add column if not exists client_assets   jsonb default '[]',
  add column if not exists brand_notes     text,
  add column if not exists intake_snapshot jsonb;

create index if not exists builds_client_id_idx on builds (client_id);

-- ── Storage bucket (create via Dashboard if not already done) ─────────────────
-- Dashboard → Storage → New bucket → Name: client-assets → Public: false
-- Or uncomment:
-- insert into storage.buckets (id, name, public)
--   values ('client-assets', 'client-assets', false)
--   on conflict do nothing;
