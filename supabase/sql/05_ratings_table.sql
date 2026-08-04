-- ============================================================
-- Memento Curated · Product Ratings
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABLE: ratings
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ratings (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id   bigint      NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id      text        NOT NULL,
  user_name    text        NOT NULL,
  rating       integer     NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment      text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ratings_product_id ON public.ratings (product_id);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at  ON public.ratings (created_at DESC);

-- ------------------------------------------------------------
-- 2. ROW LEVEL SECURITY
-- ------------------------------------------------------------
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Anyone can read ratings for products (public storefront)
CREATE POLICY "Allow public reads"
  ON public.ratings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only service_role (server-side secret key) can write
-- (INSERT / UPDATE / DELETE come from Next.js API routes using SUPABASE_SECRET_KEY)

-- ------------------------------------------------------------
-- 3. FUNCTION: get_product_avg_rating()
--    Returns the average rating and count for a product.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_product_avg_rating(p_product_id bigint)
RETURNS TABLE (
  avg_rating numeric,
  rating_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROUND(AVG(rating)::numeric, 1) AS avg_rating,
    COUNT(*)::bigint AS rating_count
  FROM public.ratings
  WHERE product_id = p_product_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_product_avg_rating FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_product_avg_rating TO anon, authenticated, service_role;

-- ------------------------------------------------------------
-- 4. SMOKE TEST
-- ------------------------------------------------------------
-- SELECT * FROM public.ratings ORDER BY created_at DESC;
-- SELECT * FROM public.get_product_avg_rating(1);
