# Plan: RLS Policies + Storage Privado (PASO 3)

## Definition of Done (DoD)

- [ ] RLS habilitado en todas las tablas: profiles, packages, payments, credit_ledger
- [ ] Policies de profiles: usuario ve/edita su perfil, admin ve todos
- [ ] Policies de packages: todos autenticados pueden leer, solo admin puede escribir
- [ ] Policies de payments: student ve solo los suyos, puede insertar los suyos, no puede aprobar; admin ve todos y puede aprobar
- [ ] Policies de credit_ledger: student ve solo el suyo, solo admin puede insertar
- [ ] Bucket `payment-proofs` creado como PRIVADO
- [ ] Políticas de storage: student puede subir, admin puede leer vía signed URL
- [ ] Comentarios explicativos en cada policy
- [ ] Todo ejecutable desde Supabase SQL Editor
- [ ] Checklist de pruebas manuales documentado

## Lista de Archivos a Crear

- `/supabase/rls.sql` - Todas las policies RLS + storage

## Estructura de Policies

### profiles
- SELECT: `auth.uid() = id` (usuario ve su perfil) OR admin
- UPDATE: `auth.uid() = id` (usuario actualiza su perfil)
- Admin SELECT: verifica `role = 'admin'` desde profiles

### packages
- SELECT: `authenticated` (todos los autenticados pueden leer)
- INSERT/UPDATE/DELETE: solo admin

### payments
- SELECT: `student_id = auth.uid()` (student ve solo los suyos) OR admin
- INSERT: `student_id = auth.uid()` (student solo puede crear payments para sí mismo)
- UPDATE: 
  - Student NO puede cambiar status (bloquear UPDATE si intenta cambiar status)
  - Admin puede actualizar todo (incluyendo status y proof_path)

### credit_ledger
- SELECT: `student_id = auth.uid()` (student ve solo el suyo) OR admin
- INSERT: solo admin

### Storage
- Bucket `payment-proofs` PRIVADO
- Policy: student puede INSERT a `payments/{payment_id}.{ext}` donde payment.student_id = auth.uid()
- Admin puede SELECT (para generar signed URLs server-side)

## Pasos de Implementación

1. Habilitar RLS en todas las tablas
2. Crear helper function para verificar si usuario es admin
3. Crear policies de profiles
4. Crear policies de packages
5. Crear policies de payments (con bloqueo de student para aprobar)
6. Crear policies de credit_ledger
7. Crear bucket de storage
8. Crear políticas de storage
9. Agregar comentarios explicativos

## Checklist de Pruebas Manuales

### RLS Tests
1. **Student no ve payments ajenos:**
   - Autenticarse como student A
   - Intentar SELECT payments de student B → debe fallar
   - Ver solo payments propios → debe funcionar

2. **Student no puede editar packages:**
   - Autenticarse como student
   - Intentar UPDATE/INSERT/DELETE en packages → debe fallar
   - SELECT packages → debe funcionar

3. **Student no puede insertar credit_ledger:**
   - Autenticarse como student
   - Intentar INSERT en credit_ledger → debe fallar
   - SELECT su propio ledger → debe funcionar

4. **Admin sí puede ver todo y aprobar:**
   - Autenticarse como admin
   - SELECT todos los payments → debe funcionar
   - UPDATE payment (cambiar status a approved) → debe funcionar
   - SELECT todos los credit_ledger → debe funcionar
   - INSERT credit_ledger → debe funcionar

### Storage Tests
5. **Bucket privado:**
   - Verificar que bucket `payment-proofs` existe
   - Verificar que es PRIVADO (no público)
   - Intentar acceso público directo → debe fallar

6. **Student puede subir comprobante:**
   - Autenticarse como student
   - Subir archivo a `payments/{payment_id}.jpg` donde payment.student_id = auth.uid() → debe funcionar
   - Intentar subir a payment ajeno → debe fallar

7. **Admin puede generar signed URL:**
   - Autenticarse como admin (server-side)
   - Generar signed URL para cualquier comprobante → debe funcionar
   - Verificar que URL expira después de tiempo configurado
