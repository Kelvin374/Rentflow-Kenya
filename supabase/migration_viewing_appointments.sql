-- Migration: Add viewing_appointments table
-- Run this in the Supabase SQL Editor

create table if not exists viewing_appointments (
  id           uuid primary key default gen_random_uuid(),
  property_id  uuid not null references properties(id) on delete cascade,
  tenant_id    uuid references profiles(id) on delete set null,
  name         text not null default '',
  email        text not null default '',
  phone        text default '',
  preferred_date timestamptz,
  notes        text default '',
  status       text default 'pending'
               check (status in ('pending','confirmed','cancelled')),
  created_at   timestamptz default now()
);

create index if not exists idx_viewing_property on viewing_appointments(property_id);
create index if not exists idx_viewing_tenant on viewing_appointments(tenant_id);

alter table viewing_appointments enable row level security;

create policy "Public read access" on viewing_appointments for select using (true);
create policy "Auth insert" on viewing_appointments for insert with check (true);
create policy "Auth update" on viewing_appointments for update using (true);
create policy "Auth delete" on viewing_appointments for delete using (true);
