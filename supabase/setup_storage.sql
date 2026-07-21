-- Run this in your Supabase SQL Editor ONCE
-- It creates both storage buckets and their RLS policies

-- ─── Helper function to setup storage ──────────────────
CREATE OR REPLACE FUNCTION setup_storage()
RETURNS void AS $$
BEGIN
  -- Create property-images bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('property-images', 'property-images', true, 5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
  ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  -- Create avatars bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('avatars', 'avatars', true, 5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp'])
  ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

  -- ─── property-images policies ─────────────────────
  DROP POLICY IF EXISTS "Public read access for property images" ON storage.objects;
  CREATE POLICY "Public read access for property images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

  DROP POLICY IF EXISTS "Auth upload property images" ON storage.objects;
  CREATE POLICY "Auth upload property images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'property-images' AND (select auth.uid()) IS NOT NULL);

  DROP POLICY IF EXISTS "Auth delete property images" ON storage.objects;
  CREATE POLICY "Auth delete property images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'property-images' AND (select auth.uid()) IS NOT NULL);

  -- ─── avatars policies ─────────────────────────────
  DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;
  CREATE POLICY "Public read access for avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

  DROP POLICY IF EXISTS "Auth upload avatars" ON storage.objects;
  CREATE POLICY "Auth upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND (select auth.uid()) IS NOT NULL);

  DROP POLICY IF EXISTS "Auth delete avatars" ON storage.objects;
  CREATE POLICY "Auth delete avatars"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND (select auth.uid()) IS NOT NULL);

  DROP POLICY IF EXISTS "Auth update avatars" ON storage.objects;
  CREATE POLICY "Auth update avatars"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND (select auth.uid()) IS NOT NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
