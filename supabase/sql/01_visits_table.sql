-- ============================================================
-- Memento Curated · Page Visits
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABLE: page_visits
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.page_visits (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  page        text        NOT NULL DEFAULT '/',
  referrer    text,
  user_agent  text,
  ip_hash     text,           -- hashed IP for privacy (SHA-256)
  visited_at  timestamptz NOT NULL DEFAULT now()
);

-- Index for fast counting by page and date range
CREATE INDEX IF NOT EXISTS idx_page_visits_page        ON public.page_visits (page);
CREATE INDEX IF NOT EXISTS idx_page_visits_visited_at  ON public.page_visits (visited_at DESC);

-- ------------------------------------------------------------
-- 2. ROW LEVEL SECURITY
-- ------------------------------------------------------------
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) may INSERT a visit row (tracked from frontend)
CREATE POLICY "Allow public inserts"
  ON public.page_visits
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated users may SELECT (admin reads)
CREATE POLICY "Allow authenticated reads"
  ON public.page_visits
  FOR SELECT
  TO authenticated
  USING (true);

-- No one except service_role may UPDATE or DELETE
-- (service_role bypasses RLS by default)

-- ------------------------------------------------------------
-- 3. FUNCTION: track_visit()
--    Called from the Next.js API route on every page load.
--    Callable by anon — safe because RLS INSERT policy allows it.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.track_visit(
  p_page       text DEFAULT '/',
  p_referrer   text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_ip_hash    text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER          -- runs as the function owner (postgres), not the caller
SET search_path = public  -- prevents search_path injection
AS $$
BEGIN
  INSERT INTO public.page_visits (page, referrer, user_agent, ip_hash)
  VALUES (p_page, p_referrer, p_user_agent, p_ip_hash);
END;
$$;

-- Revoke public execute, grant only to anon + authenticated
REVOKE ALL ON FUNCTION public.track_visit FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_visit TO anon, authenticated;

-- ------------------------------------------------------------
-- 4. FUNCTION: count_visits()
--    SECURED — only authenticated users (admins) may call this.
--    Returns total visits, today's visits, and a 7-day breakdown.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.count_visits(
  p_page text DEFAULT NULL   -- NULL = all pages; pass '/' for a specific page
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total       bigint;
  v_today       bigint;
  v_this_week   bigint;
  v_daily       jsonb;
BEGIN
  -- Enforce: only authenticated users may call this function
  IF auth.role() NOT IN ('authenticated', 'service_role') THEN
    RAISE EXCEPTION 'Access denied: authentication required'
      USING ERRCODE = '42501';
  END IF;

  -- Total all-time visits
  SELECT COUNT(*) INTO v_total
  FROM public.page_visits
  WHERE (p_page IS NULL OR page = p_page);

  -- Visits today (UTC date)
  SELECT COUNT(*) INTO v_today
  FROM public.page_visits
  WHERE (p_page IS NULL OR page = p_page)
    AND visited_at >= date_trunc('day', now() AT TIME ZONE 'UTC');

  -- Visits this week
  SELECT COUNT(*) INTO v_this_week
  FROM public.page_visits
  WHERE (p_page IS NULL OR page = p_page)
    AND visited_at >= date_trunc('week', now() AT TIME ZONE 'UTC');

  -- Per-day breakdown for the last 7 days
  SELECT jsonb_agg(
    jsonb_build_object(
      'date',  day::date,
      'count', cnt
    ) ORDER BY day DESC
  ) INTO v_daily
  FROM (
    SELECT
      date_trunc('day', visited_at AT TIME ZONE 'UTC') AS day,
      COUNT(*) AS cnt
    FROM public.page_visits
    WHERE (p_page IS NULL OR page = p_page)
      AND visited_at >= now() - INTERVAL '7 days'
    GROUP BY 1
  ) sub;

  RETURN jsonb_build_object(
    'total',      v_total,
    'today',      v_today,
    'this_week',  v_this_week,
    'daily_7d',   COALESCE(v_daily, '[]'::jsonb),
    'page_filter', COALESCE(p_page, 'all')
  );
END;
$$;

-- Revoke from PUBLIC, grant ONLY to authenticated + service_role
REVOKE ALL ON FUNCTION public.count_visits FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.count_visits TO authenticated, service_role;

-- ------------------------------------------------------------
-- 5. QUICK SMOKE TEST (run after creating everything)
-- ------------------------------------------------------------
-- SELECT public.count_visits();           -- all pages
-- SELECT public.count_visits('/');        -- homepage only
-- SELECT public.track_visit('/', 'https://google.com', 'curl/7.x', NULL);
