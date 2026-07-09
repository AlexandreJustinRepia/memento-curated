-- ============================================================
-- Memento Curated · Products
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABLE: products
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name         text        NOT NULL,
  description  text,
  category     text        NOT NULL DEFAULT 'Uncategorized',
  price        numeric(10, 2) NOT NULL DEFAULT 0,
  stock        integer     NOT NULL DEFAULT 0,
  image_url    text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category   ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);

-- ------------------------------------------------------------
-- 2. ROW LEVEL SECURITY
-- ------------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can read products (public storefront)
CREATE POLICY "Allow public reads"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only service_role (server-side secret key) can write
-- (INSERT / UPDATE / DELETE come from Next.js API routes using SUPABASE_SECRET_KEY)

-- ------------------------------------------------------------
-- 3. QUICK SEED  (optional — remove if you don't want sample data)
-- ------------------------------------------------------------
INSERT INTO public.products (name, description, category, price, stock, image_url) VALUES
  ('Aurelia Pearl Drop Earrings', '18k gold plated drop earrings featuring freshwater cultured pearls.', 'Earrings', 189.00, 12, 'https://picsum.photos/seed/earring1/600/800'),
  ('Helios Chunky Ring',          'Bold textured band in solid sterling silver plated with 24k gold.',  'Rings',    145.00, 8,  'https://picsum.photos/seed/ring1/600/800'),
  ('Selene Link Choker',          'Handcrafted interlocking gold links reflecting classic sophistication.','Necklaces',270.00, 5,  'https://picsum.photos/seed/neck1/600/800'),
  ('Solstice Cuff Bracelet',      'Minimalist open-cuff bracelet with polished geometric finishes.',     'Bracelets',310.00, 7,  'https://picsum.photos/seed/brace1/600/800')
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 4. SMOKE TEST
-- ------------------------------------------------------------
-- SELECT * FROM public.products ORDER BY created_at DESC;
