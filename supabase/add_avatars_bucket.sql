-- Migration: Add avatar storage bucket
-- Run this in the Supabase SQL Editor

-- ─── Create Storage Bucket ─────────────────────────────
-- Run this via the Supabase Dashboard > Storage > New Bucket:
--   Bucket name: avatars
--   Public: Yes (so avatars are publicly accessible)
--   File size limit: 5 MB
--   Allowed MIME types: image/jpeg, image/png, image/webp

-- ─── Storage RLS Policies (run in SQL Editor) ──────────
-- Allow public read access to avatars
CREATE POLICY "Public read access for avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Auth upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their own avatars
CREATE POLICY "Auth delete avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Allow authenticated users to update (overwrite) their avatars
CREATE POLICY "Auth update avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
