# Troubleshooting: Errores al Reservar como Estudiante

## Error: "Error inesperado al reservar. Por favor intenta de nuevo."

Este error puede ocurrir por varias razones. Sigue estos pasos para identificar y resolver el problema:

### 1. Verificar que la función RPC está aplicada

**Problema más común:** La función `book_slot` no está aplicada en Supabase.

**Solución:**
1. Abre Supabase Dashboard → SQL Editor
2. Ejecuta el archivo `supabase/rpc-book-slot.sql`
3. Verifica que la función se creó:
   ```sql
   SELECT proname, prosrc 
   FROM pg_proc 
   WHERE proname = 'book_slot';
   ```
4. Debe retornar una fila con la función

### 2. Verificar permisos de la función

**Problema:** La función no tiene permisos para ejecutarse.

**Solución:**
```sql
-- Verificar permisos
SELECT 
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  p.prosecdef as security_definer
FROM pg_proc p
WHERE p.proname = 'book_slot';

-- Si security_definer es false, puede causar problemas
-- La función debe tener SECURITY DEFINER
```

### 3. Verificar RLS (Row Level Security)

**Problema:** Las políticas RLS pueden estar bloqueando el acceso.

**Solución:**
1. Verifica que RLS está habilitado:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
     AND tablename IN ('coach_slots', 'class_bookings');
   ```

2. Verifica que las políticas permiten al estudiante:
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename IN ('coach_slots', 'class_bookings');
   ```

### 4. Verificar logs en consola del navegador

**Pasos:**
1. Abre DevTools (F12)
2. Ve a la pestaña "Console"
3. Intenta reservar un slot
4. Busca errores que comiencen con:
   - "Error al llamar RPC book_slot:"
   - "Error inesperado al reservar slot:"
   - "RPC retornó null/undefined"

### 5. Verificar que el estudiante tiene créditos

**Problema:** El estudiante no tiene créditos disponibles.

**Solución:**
1. Verifica en `/student` que el balance de créditos > 0
2. Si es 0, el estudiante debe pagar primero

### 6. Verificar que el slot existe y está activo

**Problema:** El slot puede haber sido eliminado o desactivado.

**Solución:**
```sql
-- Verificar slot
SELECT id, active, starts_at, capacity
FROM coach_slots
WHERE id = 'slot-id-aqui';
```

### 7. Probar la función RPC directamente

**Pasos:**
1. En Supabase SQL Editor, ejecuta:
   ```sql
   -- Primero autentícate como estudiante (reemplaza con tu user_id)
   SET LOCAL request.jwt.claim.sub = 'student-user-id-here';
   
   -- Luego llama la función
   SELECT book_slot('slot-id-here');
   ```

2. Si retorna error, el problema está en la función SQL
3. Si retorna éxito, el problema está en la aplicación

## Errores Específicos

### Error: "function book_slot(uuid) does not exist"

**Causa:** La función RPC no está aplicada.

**Solución:** Ejecuta `supabase/rpc-book-slot.sql` en Supabase SQL Editor.

### Error: "permission denied for function book_slot"

**Causa:** La función no tiene permisos.

**Solución:**
```sql
GRANT EXECUTE ON FUNCTION book_slot(uuid) TO authenticated;
```

### Error: "new row violates row-level security policy"

**Causa:** RLS está bloqueando la inserción.

**Solución:** Verifica las políticas RLS en `class_bookings`:
```sql
SELECT * FROM pg_policies WHERE tablename = 'class_bookings';
```

### Error: "duplicate key value violates unique constraint"

**Causa:** El estudiante ya tiene una reserva en ese slot.

**Solución:** Este es un error esperado. El mensaje debe ser: "Ya tienes una reserva en este horario."

## Verificación Rápida

Ejecuta este script en Supabase SQL Editor para verificar todo:

```sql
-- 1. Verificar función existe
SELECT proname FROM pg_proc WHERE proname = 'book_slot';

-- 2. Verificar RLS habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('coach_slots', 'class_bookings');

-- 3. Verificar políticas
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('coach_slots', 'class_bookings')
ORDER BY tablename, policyname;
```

## Contacto

Si el problema persiste después de seguir estos pasos, proporciona:
1. Mensaje de error exacto
2. Logs de la consola del navegador
3. Resultado de las verificaciones SQL anteriores
