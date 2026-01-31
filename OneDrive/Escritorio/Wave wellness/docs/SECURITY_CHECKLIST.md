# Security Checklist - Slice 1

## Verificación de RLS (Row Level Security)

### 1. RLS Habilitado en Tablas

Ejecutar en Supabase SQL Editor:

```sql
-- Verificar que RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'packages', 'payments', 'credit_ledger');
```

**Resultado esperado:**
- ✅ `profiles`: `rowsecurity = true`
- ✅ `packages`: `rowsecurity = true`
- ✅ `payments`: `rowsecurity = true`
- ✅ `credit_ledger`: `rowsecurity = true`

### 2. Policies de Profiles

```sql
-- Verificar policies de profiles
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles';
```

**Policies esperadas:**
- ✅ `profiles_select_own`: SELECT donde `auth.uid() = id`
- ✅ `profiles_select_admin`: SELECT donde `is_admin() = true`
- ✅ `profiles_update_own`: UPDATE donde `auth.uid() = id`

**Verificación manual:**
- [ ] Student puede ver solo su propio profile
- [ ] Admin puede ver todos los profiles
- [ ] Student puede actualizar su propio profile
- [ ] Student NO puede actualizar profile de otro

### 3. Policies de Packages

```sql
-- Verificar policies de packages
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'packages';
```

**Policies esperadas:**
- ✅ `packages_select_authenticated`: SELECT para todos autenticados
- ✅ `packages_insert_admin`: INSERT solo admin
- ✅ `packages_update_admin`: UPDATE solo admin
- ✅ `packages_delete_admin`: DELETE solo admin

**Verificación manual:**
- [ ] Student puede leer packages (ver precios)
- [ ] Student NO puede crear/editar/eliminar packages
- [ ] Admin puede hacer CRUD completo de packages

### 4. Policies de Payments

```sql
-- Verificar policies de payments
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'payments';
```

**Policies esperadas:**
- ✅ `payments_select_own`: SELECT donde `student_id = auth.uid()`
- ✅ `payments_select_admin`: SELECT donde `is_admin() = true`
- ✅ `payments_insert_own`: INSERT donde `student_id = auth.uid()`
- ✅ `payments_update_own`: UPDATE donde `student_id = auth.uid()` (pero trigger bloquea cambio de status)
- ✅ `payments_update_admin`: UPDATE donde `is_admin() = true`

**Verificación manual:**
- [ ] Student puede ver solo sus payments
- [ ] Student puede crear payments solo para sí mismo
- [ ] Student NO puede cambiar status de payment (trigger bloquea)
- [ ] Admin puede ver todos los payments
- [ ] Admin puede actualizar cualquier payment (incluyendo status)

### 5. Policies de Credit Ledger

```sql
-- Verificar policies de credit_ledger
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'credit_ledger';
```

**Policies esperadas:**
- ✅ `credit_ledger_select_own`: SELECT donde `student_id = auth.uid()`
- ✅ `credit_ledger_select_admin`: SELECT donde `is_admin() = true`
- ✅ `credit_ledger_insert_admin`: INSERT solo admin

**Verificación manual:**
- [ ] Student puede ver solo su ledger
- [ ] Student NO puede crear registros en ledger
- [ ] Admin puede ver todos los ledgers
- [ ] Admin puede crear registros en ledger

## Verificación de Storage

### 1. Bucket Payment-Proofs Existe y es Privado

```sql
-- Verificar bucket
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'payment-proofs';
```

**Resultado esperado:**
- ✅ `id` = 'payment-proofs'
- ✅ `public` = `false` (PRIVADO)
- ✅ `file_size_limit` = 5242880 (5MB)
- ✅ `allowed_mime_types` incluye: image/jpeg, image/png, image/webp, application/pdf

### 2. Storage Policies

```sql
-- Verificar policies de storage
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';
```

**Policies esperadas:**
- ✅ `payment_proofs_select_admin`: SELECT solo admin
- ✅ `payment_proofs_insert_own`: INSERT donde path = `payments/{auth.uid()}/%` y payment existe y student es owner
- ✅ `payment_proofs_delete_admin`: DELETE solo admin

**Verificación manual:**
- [ ] Student puede subir archivo a `payments/{auth.uid()}/{payment_id}.{ext}`
- [ ] Student NO puede subir archivo a path de otro student
- [ ] Student NO puede leer archivos directamente (solo admin vía signed URL)
- [ ] Admin puede generar signed URLs para ver comprobantes
- [ ] Admin puede eliminar archivos

### 3. Path de Upload

**Formato esperado:**
```
payments/{auth.uid()}/{payment_id}.{ext}
```

**Verificación:**
- [ ] Student A sube archivo → path contiene `payments/{studentA_id}/...`
- [ ] Student B NO puede subir a path de Student A
- [ ] Admin puede leer archivos de cualquier student (vía signed URL)

## Verificación de Código

### 1. No Service Role Key en Repo

**Verificar:**
- [ ] `.env.example` NO contiene `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `.env.local` NO contiene `SUPABASE_SERVICE_ROLE_KEY` (si existe en repo)
- [ ] No hay referencias a `SUPABASE_SERVICE_ROLE_KEY` en código
- [ ] No hay `process.env.SUPABASE_SERVICE_ROLE_KEY` en ningún archivo

**Búsqueda:**
```bash
grep -r "SERVICE_ROLE" .
```

**Resultado esperado:** Solo menciones en documentación, NO en código.

### 2. Hobby-Safe Uploads

**Verificar:**
- [ ] Uploads se hacen desde cliente (Client Component)
- [ ] NO se usan Server Actions para recibir archivos
- [ ] NO se usan Route Handlers con `multipart/form-data`
- [ ] Upload directo a Supabase Storage: `supabase.storage.from('payment-proofs').upload()`

**Archivos a revisar:**
- `src/app/(protected)/student/payments/page.tsx` - Verificar que upload es cliente → Supabase Storage directo

### 3. Signed URLs Server-Side

**Verificar:**
- [ ] Signed URLs se generan en Server Action
- [ ] NO se generan en Client Component
- [ ] Solo admin puede generar signed URLs

**Archivo:**
- `src/app/(protected)/admin/payments/actions.ts` - Función `getProofSignedUrl()`

## Verificación de Guards por Rol

### 1. Middleware

**Archivo:** `src/middleware.ts`

**Verificar:**
- [ ] Verifica sesión antes de permitir acceso
- [ ] Verifica rol y redirige si no coincide
- [ ] Student → redirige a `/student` si intenta acceder a `/admin` o `/coach`
- [ ] Admin → redirige a `/admin` si intenta acceder a `/student` o `/coach`
- [ ] Coach → redirige a `/coach` si intenta acceder a `/student` o `/admin`

### 2. Layout Guards

**Archivo:** `src/app/(protected)/layout.tsx`

**Verificar:**
- [ ] Redirige a `/auth/login` si no hay profile
- [ ] Middleware ya maneja redirección por rol

## Verificación de Validaciones

### 1. Validación de Uploads

**Verificar:**
- [ ] Tamaño máximo: 5MB
- [ ] Tipos permitidos: jpg, png, webp, pdf
- [ ] Validación en cliente antes de upload

### 2. Validación de Aprobación

**Verificar:**
- [ ] Solo se puede aprobar si `status = 'pending'`
- [ ] Solo se puede aprobar si `proof_path NOT NULL`
- [ ] Solo se puede aprobar si `package_credits NOT NULL` (Slice 1)
- [ ] Idempotente: no duplica ledger si ya existe

## Checklist Final

### RLS
- [ ] RLS habilitado en todas las tablas
- [ ] Policies correctas para cada tabla
- [ ] Student solo ve/modifica lo suyo
- [ ] Admin puede ver/modificar todo (según policies)

### Storage
- [ ] Bucket es privado
- [ ] Policies correctas
- [ ] Path correcto: `payments/{uid}/{payment_id}.{ext}`
- [ ] Student solo sube a su carpeta
- [ ] Admin puede leer todo (signed URLs)

### Código
- [ ] No service role key en repo
- [ ] Uploads Hobby-safe (directo desde cliente)
- [ ] Signed URLs server-side
- [ ] Guards por rol funcionan

### Validaciones
- [ ] Validación de uploads (tamaño, tipo)
- [ ] Validación de aprobación (status, proof_path, credits)
- [ ] Idempotencia en aprobación

## Notas de Seguridad

### Buenas Prácticas Implementadas

1. **RLS desde el inicio:** Todas las tablas tienen RLS habilitado
2. **Principio de menor privilegio:** Cada rol solo tiene acceso a lo necesario
3. **Storage privado:** Comprobantes no son públicos
4. **Hobby-safe:** Uploads directos, no pasan por servidor
5. **No service role:** No se usa en frontend

### Limitaciones de Slice 1

- **Créditos ilimitados:** No se pueden aprobar (requiere lógica adicional en Slice 2)
- **Agenda:** No implementada aún (no hay slots/reservations)

### Próximos Pasos (Slice 2+)

- Implementar slots y reservas con RLS
- Aprobar créditos ilimitados
- Notificaciones seguras
- Auditoría de cambios
