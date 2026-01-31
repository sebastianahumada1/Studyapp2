# Solución: auth.uid() retorna NULL en SECURITY DEFINER

## Problema Identificado

La función `book_slot` usa `SECURITY DEFINER`, y en este contexto `auth.uid()` retorna `NULL`. Esto causa que la función no pueda identificar al usuario autenticado.

**Verificación:**
```sql
SELECT test_auth_in_rpc();
-- Retorna: { "auth_uid": null, "is_null": true }
```

## Solución Implementada

Se actualizó la función para usar `current_setting('request.jwt.claim.sub', true)` en lugar de `auth.uid()`. Este método obtiene el `user_id` directamente del JWT token.

**Cambio en la función:**
```sql
-- Antes:
v_student_id := auth.uid();

-- Ahora:
BEGIN
  v_student_id := current_setting('request.jwt.claim.sub', true)::uuid;
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback a auth.uid() si falla
    v_student_id := auth.uid();
END;
```

## Pasos para Aplicar

1. **Ejecuta el archivo actualizado `supabase/rpc-book-slot.sql`** en Supabase SQL Editor
2. **Verifica que la función se actualizó:**
   ```sql
   SELECT proname, prosrc 
   FROM pg_proc 
   WHERE proname = 'book_slot';
   ```
3. **Prueba la función:**
   ```sql
   -- Debe retornar tu user_id correctamente
   SELECT test_auth_in_rpc();
   ```
4. **Intenta reservar desde la aplicación**

## Verificación

Después de aplicar el fix, verifica que funciona:

```sql
-- Crear función de prueba actualizada
CREATE OR REPLACE FUNCTION test_auth_in_rpc()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid;
BEGIN
  BEGIN
    v_uid := current_setting('request.jwt.claim.sub', true)::uuid;
  EXCEPTION
    WHEN OTHERS THEN
      v_uid := auth.uid();
  END;
  
  RETURN json_build_object(
    'jwt_uid', v_uid,
    'auth_uid', auth.uid(),
    'is_null', v_uid IS NULL
  );
END;
$$;

-- Probar (debe estar autenticado)
SELECT test_auth_in_rpc();
```

**Resultado esperado:**
- `jwt_uid`: Tu user_id (no null)
- `auth_uid`: null (esperado en SECURITY DEFINER)
- `is_null`: false

## Notas Técnicas

### ¿Por qué auth.uid() retorna NULL?

En funciones `SECURITY DEFINER`, la función se ejecuta con los permisos del creador, no del usuario que la llama. Esto puede causar que `auth.uid()` no esté disponible correctamente.

### ¿Por qué current_setting funciona?

`current_setting('request.jwt.claim.sub', true)` lee directamente el claim `sub` del JWT token que Supabase pasa en cada request. Este claim contiene el `user_id` del usuario autenticado.

### Seguridad

Esta solución es segura porque:
- Solo funciona si el usuario está autenticado (el JWT debe existir)
- El `user_id` viene del token firmado por Supabase
- La función sigue siendo `SECURITY DEFINER` para tener permisos necesarios

## Próximos Pasos

1. Ejecuta `supabase/rpc-book-slot.sql` actualizado
2. Prueba reservar un slot desde la aplicación
3. Si sigue fallando, comparte el mensaje de error específico
