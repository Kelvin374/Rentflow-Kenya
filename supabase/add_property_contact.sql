-- Run this in your Supabase SQL Editor to add contact info columns
-- This allows tenants to contact the property manager for viewings

ALTER TABLE properties ADD COLUMN IF NOT EXISTS contact_phone text default '';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS contact_email text default '';
