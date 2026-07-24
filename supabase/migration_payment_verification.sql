-- Migration: Add landlord verification workflow to payments
-- Run this in your Supabase SQL Editor

-- Add new columns for landlord verification
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS approved_by uuid references profiles(id),
  ADD COLUMN IF NOT EXISTS approved_at timestamptz;

-- Drop the old check constraint and add updated one with new statuses
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE payments
  ADD CONSTRAINT payments_status_check
  CHECK (status IN ('paid','pending','overdue','pending_verification','approved','rejected'));
