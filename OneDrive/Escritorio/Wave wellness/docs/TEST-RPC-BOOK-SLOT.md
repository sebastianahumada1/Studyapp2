# Test de la Función RPC book_slot

## Test Rápido

Ejecuta este script en Supabase SQL Editor para probar la función:

```sql
-- 1. Verificar que la función existe
SELECT proname, prosecdef 
FROM pg_proc 
WHERE proname = 'book_slot';

-- Debe retornar: book_slot | true (security_definer)

-- 2. Verificar permisos
SELECT 
  has_function_privilege('authenticated', 'book_slot(uuid)', 'EXECUTE') as authenticated_can_execute,
  has_function_privilege('anon', 'book_slot(uuid)', 'EXECUTE') as anon_can_execute;

-- authenticated_can_execute debe ser true

-- 3. Probar la función (requiere autenticación)
-- Nota: Esto solo funciona si estás autenticado como estudiante
-- Reemplaza 'slot-id-real' con un ID de slot real que exista
SELECT book_slot('slot-id-real'::uuid);
```

## Test desde la Aplicación

1. **Abre la aplicación en el navegador**
2. **Abre DevTools (F12) → Console**
3. **Intenta reservar un slot**
4. **Revisa los mensajes en la consola:**
   - Busca: "Error al llamar RPC book_slot:"
   - Busca: "RPC retornó null/undefined"
   - Busca: "Error inesperado al reservar slot:"

## Posibles Problemas y Soluciones

### Problema 1: "function book_slot(uuid) does not exist"

**Solución:**
```sql
-- Verificar que la función existe con el nombre correcto
SELECT proname, pg_get_function_identity_arguments(oid) 
FROM pg_proc 
WHERE proname LIKE '%book%';
```

Si no aparece, ejecuta `supabase/rpc-book-slot.sql` completo.

### Problema 2: "permission denied for function book_slot"

**Solución:**
```sql
GRANT EXECUTE ON FUNCTION book_slot(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION book_slot(uuid) TO anon;
```

### Problema 3: La función retorna null

**Causa:** Puede ser un problema con SECURITY DEFINER o con auth.uid()

**Solución:**
```sql
-- Verificar que la función tiene SECURITY DEFINER
SELECT proname, prosecdef 
FROM pg_proc 
WHERE proname = 'book_slot';

-- Debe ser true
```

### Problema 4: Error de RLS

**Causa:** Las políticas RLS pueden estar bloqueando el acceso

**Solución:**
```sql
-- Verificar políticas
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('coach_slots', 'class_bookings');
```

## Debugging Avanzado

Si el problema persiste, ejecuta este script completo:

```sql
-- 1. Verificar función
SELECT 
  p.proname,
  p.prosecdef,
  pg_get_function_identity_arguments(p.oid) as args,
  l.lanname
FROM pg_proc p
JOIN pg_language l ON p.prolang = l.oid
WHERE p.proname = 'book_slot';

-- 2. Verificar permisos
SELECT 
  has_function_privilege('authenticated', 'book_slot(uuid)', 'EXECUTE') as auth,
  has_function_privilege('anon', 'book_slot(uuid)', 'EXECUTE') as anon;

-- 3. Verificar RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('coach_slots', 'class_bookings');

-- 4. Verificar políticas
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('coach_slots', 'class_bookings')
ORDER BY tablename, policyname;
```

## Próximo Paso

Después de verificar todo, intenta reservar de nuevo y comparte:
1. El mensaje de error exacto (si hay)
2. Los logs de la consola del navegador
3. El resultado de las verificaciones SQL anteriores
