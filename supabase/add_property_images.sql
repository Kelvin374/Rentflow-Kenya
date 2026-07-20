-- Migration: Add images support to properties
-- Run this in the Supabase SQL Editor AFTER schema.sql

-- ─── Add images column to properties ────────────────────
ALTER TABLE properties ADD COLUMN IF NOT EXISTS images jsonb default '[]';

-- ─── Create Storage Bucket ─────────────────────────────
-- Run this via the Supabase Dashboard > Storage > New Bucket:
--   Bucket name: property-images
--   Public: Yes (so images are publicly accessible)
--   File size limit: 5 MB
--   Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

-- ─── Storage RLS Policies (run in SQL Editor) ──────────
-- Allow public read access to property images
CREATE POLICY "Public read access for property images"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

-- Allow authenticated users to upload property images
CREATE POLICY "Auth upload property images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their property images
CREATE POLICY "Auth delete property images"
ON storage.objects FOR DELETE
USING (bucket_id = 'property-images' AND auth.role() = 'authenticated');
