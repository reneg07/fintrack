-- ============================================================================
-- FinTrack — Migration 0003: Corrective UTF-8 Seed & Table Comments
-- ============================================================================
-- Corrige la doble codificación UTF-8 que afectó al archivo consolidado
-- `supabase/phase-03-setup.sql` generado inicialmente con PowerShell 5.1.
-- Idempotente y segura: actualiza comentarios de tablas, la función
-- `public.handle_new_user()` y corrige cualquier categoría inicial afectada.
-- ============================================================================

COMMENT ON TABLE public.profiles IS 'Perfil de usuario FinTrack vinculado 1:1 con auth.users.';
COMMENT ON TABLE public.categories IS 'Categorías de ingresos y gastos propiedad de cada usuario.';
COMMENT ON TABLE public.transactions IS 'Movimientos financieros de ingresos y gastos almacenados en centavos enteros USD.';
COMMENT ON TABLE public.budgets IS 'Presupuestos mensuales por categoría de gasto en centavos enteros USD.';

-- Corrige nombres en categorías iniciales ya sembradas si sufrieron mojibake
UPDATE public.categories
SET name = 'Alimentación'
WHERE is_default = true AND name = 'AlimentaciÃ³n';

UPDATE public.categories
SET name = 'Educación'
WHERE is_default = true AND name = 'EducaciÃ³n';

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

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
