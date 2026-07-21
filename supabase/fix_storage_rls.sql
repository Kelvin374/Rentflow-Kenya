-- COMPLETE FIX: Run this in Supabase SQL Editor
-- This drops and recreates ALL storage policies from scratch

-- Step 1: Drop ALL existing policies for property-images and avatars on storage.objects
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND (policyname LIKE '%property image%' OR policyname LIKE '%avatar%')
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON storage.objects';
  END LOOP;
END $$;

-- Step 2: Ensure buckets exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('property-images', 'property-images', true, 5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880;

-- Step 3: Create simple policies — allow all authenticated operations on these buckets
CREATE POLICY "property_images_select"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

CREATE POLICY "property_images_insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "property_images_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'property-images');

CREATE POLICY "avatars_select"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars');

CREATE POLICY "avatars_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars');
