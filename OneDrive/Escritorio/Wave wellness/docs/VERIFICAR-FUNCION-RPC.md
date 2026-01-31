# Verificar Función RPC book_slot

## Verificación Completa

Ejecuta estos queries en Supabase SQL Editor para verificar que todo está correcto:

### 1. Verificar que la función existe y está correctamente definida

```sql
SELECT 
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  p.prosecdef as security_definer,
  p.provolatile as volatility,
  l.lanname as language
FROM pg_proc p
JOIN pg_language l ON p.prolang = l.oid
WHERE p.proname = 'book_slot';
```

**Resultado esperado:**
- `function_name`: `book_slot`
- `arguments`: `slot_id uuid`
- `security_definer`: `true` (debe ser true)
- `volatility`: `v` (volatile)
- `language`: `plpgsql`

### 2. Verificar permisos

```sql
SELECT 
  p.proname,
  r.rolname as granted_to,
  has_function_privilege(r.rolname, p.oid, 'EXECUTE') as can_execute
FROM pg_proc p
CROSS JOIN pg_roles r
WHERE p.proname = 'book_slot'
  AND r.rolname IN ('authenticated', 'anon', 'public')
  AND has_function_privilege(r.rolname, p.oid, 'EXECUTE');
```

**Resultado esperado:**
- `authenticated` debe tener `can_execute = true`

### 3. Probar la función directamente (con un slot de prueba)

```sql
-- Primero, crea un slot de prueba si no tienes uno
-- (Reemplaza 'coach-id-here' con un ID de coach real)
INSERT INTO coach_slots (coach_id, starts_at, ends_at, capacity, active)
VALUES (
  'coach-id-here',
  (NOW() + INTERVAL '1 day')::timestamptz,
  (NOW() + INTERVAL '1 day' + INTERVAL '1 hour')::timestamptz,
  2,
  true
)
ON CONFLICT DO NOTHING
RETURNING id;

-- Luego, prueba la función (reemplaza con el slot_id y student_id reales)
-- Nota: Esto requiere que estés autenticado como estudiante
SELECT book_slot('slot-id-here'::uuid);
```

### 4. Verificar RLS en tablas relacionadas

```sql
-- Verificar que RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('coach_slots', 'class_bookings', 'profiles');
```

**Resultado esperado:**
- `rowsecurity` debe ser `true` para todas las tablas

### 5. Verificar políticas RLS

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('coach_slots', 'class_bookings')
ORDER BY tablename, policyname;
```

**Resultado esperado:**
- Debe haber políticas para `SELECT`, `INSERT` en `class_bookings`
- Debe haber políticas para `SELECT` en `coach_slots`

## Si la función no funciona

### Opción 1: Recrear la función

```sql
-- Eliminar función existente
DROP FUNCTION IF EXISTS book_slot(uuid);

-- Luego ejecuta todo el contenido de supabase/rpc-book-slot.sql
```

### Opción 2: Verificar logs de Supabase

1. Ve a Supabase Dashboard → Logs → Postgres Logs
2. Busca errores relacionados con `book_slot`
3. Revisa los mensajes de error específicos

## Próximos Pasos

Después de verificar todo:

1. Intenta reservar un slot desde la aplicación
2. Abre DevTools (F12) → Console
3. Revisa los mensajes de error (si hay)
4. Comparte el mensaje exacto para debugging adicional
