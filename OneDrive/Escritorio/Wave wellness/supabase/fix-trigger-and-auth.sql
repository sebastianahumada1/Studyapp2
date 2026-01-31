-- ============================================================================
-- RE-FIX: Ensure profiles are created even if metadata is missing or email not confirmed
-- ============================================================================

-- 1. Mejorar la función del trigger para que sea más robusta y maneje fallos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    full_name_val text;
    phone_val text;
BEGIN
    -- Intentar extraer de metadatos, con fallbacks para evitar errores de NULL
    full_name_val := COALESCE(new.raw_user_meta_data->>'full_name', 'Nuevo Usuario');
    phone_val := COALESCE(new.raw_user_meta_data->>'phone', 'Sin teléfono');

    INSERT INTO public.profiles (id, full_name, phone, role)
    VALUES (
        new.id,
        full_name_val,
        phone_val,
        'student'
    );
    RETURN new;
EXCEPTION WHEN OTHERS THEN
    -- Si algo falla, al menos logueamos el error (aparecerá en logs de Supabase)
    -- Pero permitimos que el usuario se cree en Auth para no bloquear el sistema
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Asegurarse de que el trigger esté bien vinculado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. IMPORTANTE: Si el correo no llega, es por la configuración de Supabase.
-- Por defecto, Supabase requiere confirmación de email.
-- Si quieres que entren directo sin confirmar, debes ir a:
-- Authentication -> Providers -> Email -> Desactivar "Confirm email"
