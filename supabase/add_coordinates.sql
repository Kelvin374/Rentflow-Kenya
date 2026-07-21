-- Run this in your Supabase SQL Editor to add coordinate columns
-- This allows properties to be matched by proximity

ALTER TABLE properties ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS longitude double precision;

-- Optional: Backfill coordinates for existing properties from location text
-- This is a best-effort using the app's Nairobi area lookup
