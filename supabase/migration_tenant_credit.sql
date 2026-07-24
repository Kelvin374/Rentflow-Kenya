-- Migration: Add tenant credit (carry-forward) to units
-- Run this in your Supabase SQL Editor

-- Add credit column to units for overpayment carry-forward
ALTER TABLE units ADD COLUMN IF NOT EXISTS credit numeric DEFAULT 0;
