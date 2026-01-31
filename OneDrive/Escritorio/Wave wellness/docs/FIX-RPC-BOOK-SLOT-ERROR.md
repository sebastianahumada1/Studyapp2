# Fix: Error en RPC book_slot

## Problema

La función RPC `book_slot` está retornando:
```json
{
  "success": false,
  "error": "Error inesperado al reservar. Por favor intenta de nuevo."
}
```

Esto indica que está cayendo en el bloque `WHEN OTHERS` de la función SQL.

## Solución

### Paso 1: Actualizar la función RPC

Ejecuta el archivo `supabase/rpc-book-slot.sql` actualizado en Supabase SQL Editor. La nueva versión:
- Captura errores específicos (unique_violation, insufficient_privilege)
- Retorna el mensaje de error SQL real para debugging
- Maneja mejor los errores de RLS

### Paso 2: Verificar RLS en class_bookings

El problema más común es que la política RLS está bloqueando el INSERT. Verifica:

```sql
-- Verificar que RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'class_bookings';

-- Debe ser: true
```

### Paso 3: Verificar política INSERT

```sql
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'class_bookings'
  AND cmd = 'INSERT';
```

**Debe existir:**
- `class_bookings_insert_own` con `WITH CHECK (student_id = auth.uid())`

### Paso 4: Probar la función directamente

```sql
-- Autentícate como estudiante primero
-- Luego ejecuta:
SELECT book_slot('slot-id-real'::uuid);
```

Si retorna error, el mensaje ahora será más específico.

### Paso 5: Verificar auth.uid() en SECURITY DEFINER

La función usa `SECURITY DEFINER`, lo que significa que se ejecuta con permisos del creador. Sin embargo, `auth.uid()` debería seguir retornando el usuario autenticado.

Verifica:

```sql
-- Crear función de prueba
CREATE OR REPLACE FUNCTION test_auth_uid()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN json_build_object(
    'uid', auth.uid(),
    'is_null', auth.uid() IS NULL
  );
END;
$$;

-- Probar (debe estar autenticado)
SELECT test_auth_uid();

-- Si retorna null, hay un problema con la autenticación
```

## Posibles Causas

1. **RLS bloqueando INSERT**: La política `class_bookings_insert_own` puede estar rechazando el INSERT
2. **auth.uid() es NULL**: En SECURITY DEFINER, `auth.uid()` puede ser NULL si no se pasa correctamente
3. **Problema con los locks**: `SELECT FOR UPDATE` puede estar causando deadlocks
4. **Constraint violado**: Algún constraint de la tabla está siendo violado

## Debugging Avanzado

Si el problema persiste, agrega logging temporal en la función:

```sql
-- Agregar al inicio de la función (después de DECLARE)
RAISE NOTICE 'v_student_id: %', v_student_id;
RAISE NOTICE 'auth.uid(): %', auth.uid();
RAISE NOTICE 'slot_id: %', slot_id;
```

Luego revisa los logs en Supabase Dashboard → Logs → Postgres Logs.

## Próximos Pasos

1. Ejecuta el archivo `supabase/rpc-book-slot.sql` actualizado
2. Intenta reservar de nuevo
3. Revisa el mensaje de error (ahora será más específico)
4. Comparte el mensaje de error exacto para debugging adicional
