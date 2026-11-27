-- ============================================================================
-- FinTrack — Migration 0002: Row Level Security, Least Privilege & User Seed
-- ============================================================================
-- 1. Revokes anonymous/public access and grants least-privilege access to authenticated.
-- 2. Enables and forces RLS on all user-owned tables with explicit CRUD policies.
-- 3. Creates SECURITY DEFINER trigger to initialize profile + 12 default categories
--    safely upon user registration (without sample transactions or budgets).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Least-Privilege Table Grants
-- ----------------------------------------------------------------------------
REVOKE ALL ON TABLE
  public.profiles,
  public.categories,
  public.transactions,
  public.budgets
FROM PUBLIC, anon;

-- Profiles are created by trigger and deleted via auth.users CASCADE
GRANT SELECT, UPDATE (full_name) ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.budgets TO authenticated;

-- ----------------------------------------------------------------------------
-- 2. Enable Row Level Security on all public tables
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories FORCE ROW LEVEL SECURITY;

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions FORCE ROW LEVEL SECURITY;

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets FORCE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 3. Explicit RLS Policies — public.profiles
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- ----------------------------------------------------------------------------
-- 4. Explicit RLS Policies — public.categories
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "categories_select_own" ON public.categories;
CREATE POLICY "categories_select_own"
  ON public.categories
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "categories_insert_own" ON public.categories;
CREATE POLICY "categories_insert_own"
  ON public.categories
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "categories_update_own" ON public.categories;
CREATE POLICY "categories_update_own"
  ON public.categories
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "categories_delete_own" ON public.categories;
CREATE POLICY "categories_delete_own"
  ON public.categories
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ----------------------------------------------------------------------------
-- 5. Explicit RLS Policies — public.transactions
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "transactions_select_own" ON public.transactions;
CREATE POLICY "transactions_select_own"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "transactions_insert_own" ON public.transactions;
CREATE POLICY "transactions_insert_own"
  ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "transactions_update_own" ON public.transactions;
CREATE POLICY "transactions_update_own"
  ON public.transactions
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "transactions_delete_own" ON public.transactions;
CREATE POLICY "transactions_delete_own"
  ON public.transactions
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ----------------------------------------------------------------------------
-- 6. Explicit RLS Policies — public.budgets
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "budgets_select_own" ON public.budgets;
CREATE POLICY "budgets_select_own"
  ON public.budgets
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "budgets_insert_own" ON public.budgets;
CREATE POLICY "budgets_insert_own"
  ON public.budgets
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "budgets_update_own" ON public.budgets;
CREATE POLICY "budgets_update_own"
  ON public.budgets
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "budgets_delete_own" ON public.budgets;
CREATE POLICY "budgets_delete_own"
  ON public.budgets
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ----------------------------------------------------------------------------
-- 7. Automatic Profile + 12 Default Categories Trigger (SECURITY DEFINER)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_raw_name text;
  v_full_name text;
BEGIN
  -- Safely extract, trim, and bound full_name from user metadata
  v_raw_name := btrim(coalesce(NEW.raw_user_meta_data ->> 'full_name', ''));
  IF char_length(v_raw_name) < 2 THEN
    v_full_name := 'Usuario FinTrack';
  ELSE
    v_full_name := left(v_raw_name, 100);
  END IF;

  INSERT INTO public.profiles (id, full_name, currency, timezone)
  VALUES (NEW.id, v_full_name, 'USD', 'America/El_Salvador')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.categories (user_id, name, type, color, icon, is_default)
  VALUES
    -- 4 Income Categories
    (NEW.id, 'Salario',         'income',  '#059669', 'briefcase',      true),
    (NEW.id, 'Freelance',       'income',  '#0D9488', 'laptop',         true),
    (NEW.id, 'Inversiones',     'income',  '#0284C7', 'trending-up',    true),
    (NEW.id, 'Otros ingresos',  'income',  '#4F46E5', 'wallet',         true),
    -- 8 Expense Categories
    (NEW.id, 'Alimentación',    'expense', '#D97706', 'utensils',       true),
    (NEW.id, 'Vivienda',        'expense', '#10251F', 'home',           true),
    (NEW.id, 'Transporte',      'expense', '#0284C7', 'car',            true),
    (NEW.id, 'Servicios',       'expense', '#4F46E5', 'zap',            true),
    (NEW.id, 'Salud',           'expense', '#DC5656', 'heart-pulse',    true),
    (NEW.id, 'Entretenimiento', 'expense', '#EA580C', 'film',           true),
    (NEW.id, 'Educación',       'expense', '#0D9488', 'graduation-cap', true),
    (NEW.id, 'Otros gastos',    'expense', '#475569', 'tag',            true)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- Restrict direct RPC execution of trigger function
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
