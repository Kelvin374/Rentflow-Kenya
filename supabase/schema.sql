-- RentFlow Kenya — Supabase Schema
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- ─── Profiles ───────────────────────────────────────────
create table if not exists profiles (
  id           uuid primary key,
  name         text not null default '',
  email        text unique not null default '',
  phone        text default '',
  role         text not null default 'tenant'
               check (role in ('admin','landlord','tenant','manager','caretaker')),
  national_id  text default '',
  avatar       text default '',
  subscription text default 'free'
               check (subscription in ('free','basic','professional','enterprise')),
  emergency_contact text default '',
  latitude     double precision,
  longitude    double precision,
  is_verified  boolean default true,
  is_active    boolean default true,
  created_at   timestamptz default now()
);

-- ─── Properties ─────────────────────────────────────────
create table if not exists properties (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  location     text not null default '',
  description  text default '',
  units        int not null default 0,
  type         text default 'Apartments',
  status       text default 'vacant'
               check (status in ('occupied','vacant','maintenance')),
  landlord_id  uuid not null references profiles(id) on delete cascade,
  image        text default '',
  images       jsonb default '[]',
  latitude     double precision,
  longitude    double precision,
  payment_info jsonb default '{}',
  created_at   timestamptz default now()
);

-- ─── Units ──────────────────────────────────────────────
create table if not exists units (
  id            uuid primary key default gen_random_uuid(),
  property_id   uuid not null references properties(id) on delete cascade,
  unit_number   text not null,
  type          text default '1 Bedroom',
  monthly_rent  numeric not null default 0,
  status        text default 'vacant'
                check (status in ('occupied','vacant','maintenance')),
  tenant_id     uuid references profiles(id) on delete set null
);

-- ─── Leases ─────────────────────────────────────────────
create table if not exists leases (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references profiles(id) on delete cascade,
  property_id         uuid not null references properties(id) on delete cascade,
  unit_id             uuid references units(id) on delete set null,
  start_date          date not null,
  end_date            date not null,
  rent_amount         numeric not null default 0,
  deposit_amount      numeric not null default 0,
  terms               text default '',
  status              text default 'active'
                      check (status in ('active','expired','terminated')),
  signed_by_tenant    boolean default false,
  signed_by_landlord  boolean default false
);

-- ─── Payments ───────────────────────────────────────────
create table if not exists payments (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references profiles(id) on delete cascade,
  unit_id        uuid references units(id) on delete set null,
  amount         numeric not null default 0,
  due_date       date not null,
  paid_date      timestamptz,
  status         text default 'pending'
                 check (status in ('paid','pending','overdue')),
  method         text default 'mpesa'
                 check (method in ('mpesa','bank','cash')),
  transaction_id text,
  receipt_id     text
);

-- ─── Maintenance Requests ───────────────────────────────
create table if not exists maintenance_requests (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references profiles(id) on delete cascade,
  unit_id      uuid references units(id) on delete set null,
  property_id  uuid not null references properties(id) on delete cascade,
  category     text not null default 'general',
  description  text not null default '',
  priority     text default 'normal'
               check (priority in ('low','normal','urgent')),
  status       text default 'submitted'
               check (status in ('submitted','assigned','in_progress','completed','cancelled')),
  assigned_to  text,
  images       jsonb default '[]',
  progress     int default 0,
  created_at   timestamptz default now(),
  completed_at timestamptz,
  cost         numeric
);

-- ─── Notifications ──────────────────────────────────────
create table if not exists notifications (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references profiles(id) on delete cascade,
  title     text not null default '',
  message   text default '',
  type      text default 'alert',
  is_read   boolean default false
);

-- ─── Indexes ────────────────────────────────────────────
create index if not exists idx_properties_landlord on properties(landlord_id);
create index if not exists idx_units_property on units(property_id);
create index if not exists idx_units_tenant on units(tenant_id);
create index if not exists idx_leases_tenant on leases(tenant_id);
create index if not exists idx_leases_property on leases(property_id);
create index if not exists idx_payments_tenant on payments(tenant_id);
create index if not exists idx_payments_unit on payments(unit_id);
create index if not exists idx_maintenance_property on maintenance_requests(property_id);
create index if not exists idx_maintenance_tenant on maintenance_requests(tenant_id);
create index if not exists idx_notifications_user on notifications(user_id);

-- ─── Row Level Security (disabled for demo) ─────────────
-- Enable RLS on all tables but allow all access for authenticated users.
-- For production, tighten these policies to match your authorization model.
alter table profiles enable row level security;
alter table properties enable row level security;
alter table units enable row level security;
alter table leases enable row level security;
alter table payments enable row level security;
alter table maintenance_requests enable row level security;
alter table notifications enable row level security;

-- Allow public read access (needed for demo login which bypasses auth)
create policy "Public read access" on profiles for select using (true);
create policy "Public read access" on properties for select using (true);
create policy "Public read access" on units for select using (true);
create policy "Public read access" on leases for select using (true);
create policy "Public read access" on payments for select using (true);
create policy "Public read access" on maintenance_requests for select using (true);
create policy "Public read access" on notifications for select using (true);

-- Allow insert/update/delete for authenticated users
create policy "Auth insert" on profiles for insert with check (true);
create policy "Auth update" on profiles for update using (true);
create policy "Auth delete" on profiles for delete using (true);

create policy "Auth insert" on properties for insert with check (true);
create policy "Auth update" on properties for update using (true);
create policy "Auth delete" on properties for delete using (true);

create policy "Auth insert" on units for insert with check (true);
create policy "Auth update" on units for update using (true);
create policy "Auth delete" on units for delete using (true);

create policy "Auth insert" on leases for insert with check (true);
create policy "Auth update" on leases for update using (true);
create policy "Auth delete" on leases for delete using (true);

create policy "Auth insert" on payments for insert with check (true);
create policy "Auth update" on payments for update using (true);
create policy "Auth delete" on payments for delete using (true);

create policy "Auth insert" on maintenance_requests for insert with check (true);
create policy "Auth update" on maintenance_requests for update using (true);
create policy "Auth delete" on maintenance_requests for delete using (true);

create policy "Auth insert" on notifications for insert with check (true);
create policy "Auth update" on notifications for update using (true);
create policy "Auth delete" on notifications for delete using (true);

-- ─── Migration: Add coordinates ──────────────────────────
-- Run these if the tables already exist without lat/lng columns:
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS latitude double precision;
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longitude double precision;
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS latitude double precision;
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS longitude double precision;
