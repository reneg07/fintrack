BEGIN;

-- ============================================================================
-- FinTrack â€” Migration 0001: Initial PostgreSQL Schema, Constraints & Indexes
-- ============================================================================
-- Compatible with Supabase CLI & Supabase SQL Editor.
-- Monetary amounts are stored strictly as positive BIGINT integer cents
-- bounded by 900,000,000,000,000 (safe headroom below JS Number.MAX_SAFE_INTEGER).
-- Calendar dates use DATE to eliminate UTC timezone drift against America/El_Salvador.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- Trigger helper: automatically maintain updated_at timestamps
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 1. public.profiles (1:1 with auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name text NOT NULL
    CONSTRAINT profiles_full_name_length CHECK (char_length(btrim(full_name)) BETWEEN 2 AND 100),
  currency text NOT NULL DEFAULT 'USD'
    CONSTRAINT profiles_currency_usd CHECK (currency = 'USD'),
  timezone text NOT NULL DEFAULT 'America/El_Salvador'
    CONSTRAINT profiles_timezone_sv CHECK (timezone = 'America/El_Salvador'),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

COMMENT ON TABLE public.profiles IS 'Perfil de usuario FinTrack vinculado 1:1 con auth.users.';

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 2. public.categories
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL
    CONSTRAINT categories_name_length CHECK (char_length(btrim(name)) BETWEEN 1 AND 60),
  type text NOT NULL
    CONSTRAINT categories_type_valid CHECK (type IN ('income', 'expense')),
  color text NOT NULL
    CONSTRAINT categories_color_hex CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  icon text NOT NULL
    CONSTRAINT categories_icon_catalog CHECK (
      icon IN (
        'briefcase',
        'laptop',
        'trending-up',
        'wallet',
        'utensils',
        'home',
        'car',
        'zap',
        'heart-pulse',
        'film',
        'graduation-cap',
        'shopping-bag',
        'tag'
      )
    ),
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  -- Composite unique key enabling cross-table owner + type integrity
  CONSTRAINT categories_id_user_type_unique UNIQUE (id, user_id, type)
);

COMMENT ON TABLE public.categories IS 'CategorÃ­as de ingresos y gastos propiedad de cada usuario.';

-- Unique trimmed case-insensitive category name per user and type
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_unique_name
  ON public.categories (user_id, type, lower(btrim(name)));

-- Query index: categories filtered by user and type
CREATE INDEX IF NOT EXISTS idx_categories_user_type
  ON public.categories (user_id, type);

DROP TRIGGER IF EXISTS trg_categories_updated_at ON public.categories;
CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. public.transactions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  category_id uuid NOT NULL,
  type text NOT NULL
    CONSTRAINT transactions_type_valid CHECK (type IN ('income', 'expense')),
  amount_cents bigint NOT NULL
    CONSTRAINT transactions_amount_positive_safe CHECK (
      amount_cents > 0 AND amount_cents <= 900000000000000
    ),
  occurred_on date NOT NULL,
  description text NOT NULL
    CONSTRAINT transactions_description_length CHECK (char_length(btrim(description)) BETWEEN 1 AND 200),
  notes text
    CONSTRAINT transactions_notes_length CHECK (notes IS NULL OR char_length(notes) <= 500),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  -- Enforces: same owner, matching category type, and blocks deleting/retyping used categories
  CONSTRAINT transactions_category_owner_type_fkey
    FOREIGN KEY (category_id, user_id, type)
    REFERENCES public.categories (id, user_id, type)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT
);

COMMENT ON TABLE public.transactions IS 'Movimientos financieros de ingresos y gastos almacenados en centavos enteros USD.';

-- Query indexes for dashboard, filters, reports, and safe-delete checks
CREATE INDEX IF NOT EXISTS idx_transactions_user_occurred_on
  ON public.transactions (user_id, occurred_on DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_user_type_occurred_on
  ON public.transactions (user_id, type, occurred_on DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_category_id
  ON public.transactions (category_id);

DROP TRIGGER IF EXISTS trg_transactions_updated_at ON public.transactions;
CREATE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. public.budgets (strictly expense categories, unique per user/category/month)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  category_id uuid NOT NULL,
  category_type text GENERATED ALWAYS AS ('expense') STORED,
  month date NOT NULL
    CONSTRAINT budgets_month_first_day CHECK (EXTRACT(DAY FROM month) = 1),
  limit_cents bigint NOT NULL
    CONSTRAINT budgets_limit_positive_safe CHECK (
      limit_cents > 0 AND limit_cents <= 900000000000000
    ),
  alert_threshold_pct smallint NOT NULL DEFAULT 80
    CONSTRAINT budgets_alert_threshold_range CHECK (alert_threshold_pct BETWEEN 50 AND 99),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT budgets_user_category_month_unique UNIQUE (user_id, category_id, month),
  -- Enforces: category belongs to user, is strictly type='expense', and cannot be deleted while budgeted
  CONSTRAINT budgets_expense_category_owner_fkey
    FOREIGN KEY (category_id, user_id, category_type)
    REFERENCES public.categories (id, user_id, type)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT
);

COMMENT ON TABLE public.budgets IS 'Presupuestos mensuales por categorÃ­a de gasto en centavos enteros USD.';

-- Query index: monthly budgets lookup
CREATE INDEX IF NOT EXISTS idx_budgets_user_month
  ON public.budgets (user_id, month);

DROP TRIGGER IF EXISTS trg_budgets_updated_at ON public.budgets;
CREATE TRIGGER trg_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();


-- ============================================================================
-- FinTrack â€” Migration 0002: Row Level Security, Least Privilege & User Seed
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
-- 3. Explicit RLS Policies â€” public.profiles
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
-- 4. Explicit RLS Policies â€” public.categories
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
-- 5. Explicit RLS Policies â€” public.transactions
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
-- 6. Explicit RLS Policies â€” public.budgets
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
    (NEW.id, 'AlimentaciÃ³n',    'expense', '#D97706', 'utensils',       true),
    (NEW.id, 'Vivienda',        'expense', '#10251F', 'home',           true),
    (NEW.id, 'Transporte',      'expense', '#0284C7', 'car',            true),
    (NEW.id, 'Servicios',       'expense', '#4F46E5', 'zap',            true),
    (NEW.id, 'Salud',           'expense', '#DC5656', 'heart-pulse',    true),
    (NEW.id, 'Entretenimiento', 'expense', '#EA580C', 'film',           true),
    (NEW.id, 'EducaciÃ³n',       'expense', '#0D9488', 'graduation-cap', true),
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

COMMIT;

