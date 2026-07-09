-- ============================================================
-- Memento Curated · Product Images Storage Bucket
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ------------------------------------------------------------
-- 1. Create the storage bucket (public — images are viewable by anyone)
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,                        -- 5 MB max per file
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 2. RLS Policies on storage.objects
-- ------------------------------------------------------------

-- Anyone can view images (public bucket)
CREATE POLICY "product-images: public read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'product-images');

-- Only authenticated (admins via server-side secret key) can upload
CREATE POLICY "product-images: auth upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

-- Only authenticated can update
CREATE POLICY "product-images: auth update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images');

-- Only authenticated can delete
CREATE POLICY "product-images: auth delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');

-- ------------------------------------------------------------
-- 3. SMOKE TEST
-- ------------------------------------------------------------
-- SELECT * FROM storage.buckets WHERE id = 'product-images';
