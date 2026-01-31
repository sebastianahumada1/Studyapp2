# supabase-schema-and-rls

## Cuando usar

Al crear/modificar tablas o al acceder a datos desde el frontend. Obligatorio antes de cualquier query.

## Objetivo

Habilitar RLS y crear policies para `<table>`. Garantizar que frontend NUNCA use service_role.

## Inputs obligatorios

- `/supabase/schema.sql` - Verificar estructura de `<table>`
- Código que accede a `<table>` - Verificar que usa cliente anónimo/autenticado

## Procedimiento

1. Verificar que `<table>` existe en schema.sql. Si no: **BLOCKER: falta en schema.sql**

2. Habilitar RLS en la tabla:

```sql
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
```

3. Crear policies según necesidad (reemplazar `<table>` con nombre real):

```sql
-- Policy para SELECT (usuarios autenticados ven solo sus datos)
CREATE POLICY "<table>_select_policy"
ON <table>
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy para INSERT (usuarios autenticados pueden insertar)
CREATE POLICY "<table>_insert_policy"
ON <table>
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy para UPDATE (usuarios autenticados pueden actualizar sus datos)
CREATE POLICY "<table>_update_policy"
ON <table>
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy para DELETE (usuarios autenticados pueden borrar sus datos)
CREATE POLICY "<table>_delete_policy"
ON <table>
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

4. En frontend, usar SOLO cliente anónimo/autenticado:

```typescript
// ✅ CORRECTO
import { createClient } from '@/lib/supabase/client';
const supabase = createClient(); // Cliente del navegador

// ❌ PROHIBIDO
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, serviceRoleKey); // NUNCA en frontend
```

5. Aplicar policies en migración o directamente en Supabase Dashboard

## Checks

- [ ] RLS habilitado: `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;`
- [ ] Policies creadas para todas las operaciones necesarias (SELECT/INSERT/UPDATE/DELETE)
- [ ] Frontend usa `createClient` desde `/src/lib/supabase/client` (no service_role)
- [ ] No hay `serviceRoleKey` en código frontend
- [ ] Policies usan `auth.uid()` o lógica apropiada según schema.sql
- [ ] Tabla `<table>` existe en schema.sql (verificado)

## Output obligatorio

**Archivos tocados:**
- `/supabase/migrations/XXXXX_<table>_rls.sql` (o aplicar en Dashboard)
- Cualquier archivo que acceda a `<table>` (verificar cliente usado)

**Pasos para probar:**
1. Ejecutar migración o aplicar SQL en Supabase Dashboard
2. Intentar query desde frontend sin autenticación → debe fallar
3. Autenticarse y verificar que policies permiten acceso correcto
4. Buscar en codebase: `serviceRoleKey` o `service_role` → no debe existir en frontend
