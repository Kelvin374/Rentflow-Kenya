-- Migration: Add rent due day to properties
-- Run this in your Supabase SQL Editor

-- Add rent_due_day column (day of month rent is due, 1-31, default 1)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS rent_due_day integer DEFAULT 1
  CHECK (rent_due_day >= 1 AND rent_due_day <= 31);
