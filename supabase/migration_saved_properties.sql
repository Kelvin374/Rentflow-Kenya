-- Migration: Add saved_properties table
-- Run this in the Supabase SQL Editor

create table if not exists saved_properties (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  property_id  uuid not null references properties(id) on delete cascade,
  created_at   timestamptz default now(),
  unique(user_id, property_id)
);

create index if not exists idx_saved_properties_user on saved_properties(user_id);
create index if not exists idx_saved_properties_property on saved_properties(property_id);

alter table saved_properties enable row level security;

create policy "Public read access" on saved_properties for select using (true);
create policy "Auth insert" on saved_properties for insert with check (true);
create policy "Auth delete" on saved_properties for delete using (true);
