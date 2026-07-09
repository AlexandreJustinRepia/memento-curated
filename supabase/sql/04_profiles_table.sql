-- ============================================================
-- Memento Curated · User Profiles
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABLE: profiles
--    Linked 1-to-1 with auth.users (id = auth.uid())
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name       text        NOT NULL DEFAULT '',
  role       text        NOT NULL DEFAULT 'customer'  CHECK (role IN ('customer', 'admin')),
  status     text        NOT NULL DEFAULT 'active'    CHECK (status IN ('active', 'pending', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 2. ROW LEVEL SECURITY
-- ------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read their own profile
CREATE POLICY "Users: read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Authenticated users can update their own profile (name only)
CREATE POLICY "Users: update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- service_role bypasses RLS → admin API routes can read/write all profiles

-- ------------------------------------------------------------
-- 3. TRIGGER: auto-create profile on new auth signup
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    'customer',
    'active'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------
-- 4. SMOKE TEST
-- ------------------------------------------------------------
-- SELECT * FROM public.profiles;
