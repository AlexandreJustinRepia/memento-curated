-- ============================================================
-- Memento Curated · Orders
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABLES: orders + order_items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id               bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  custom_order_id  text        UNIQUE,
  user_id          text        NOT NULL,
  user_name        text        NOT NULL,
  user_email       text        NOT NULL,
  status           text        NOT NULL DEFAULT 'pending',
  total            numeric(10,2) NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id          bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id    bigint      NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  bigint      NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity    integer     NOT NULL DEFAULT 1,
  price       numeric(10,2) NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_custom_id ON public.orders (custom_order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items (product_id);

-- ------------------------------------------------------------
-- 2. ROW LEVEL SECURITY
-- ------------------------------------------------------------
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Public can read orders (for storefront / admin public views)
CREATE POLICY "Allow public reads"
  ON public.orders
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public reads"
  ON public.order_items
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only service_role (server-side secret key) can write
-- (INSERT / UPDATE / DELETE come from Next.js API routes using SUPABASE_SECRET_KEY)

-- ------------------------------------------------------------
-- 3. SMOKE TEST
-- ------------------------------------------------------------
-- SELECT * FROM public.orders ORDER BY created_at DESC;
-- SELECT * FROM public.order_items ORDER BY created_at DESC;
