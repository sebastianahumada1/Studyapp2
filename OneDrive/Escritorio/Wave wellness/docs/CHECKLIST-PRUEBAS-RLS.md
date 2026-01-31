# Checklist de Pruebas Manuales - RLS + Storage

## Pre-requisitos

1. Haber ejecutado `/supabase/schema.sql` en Supabase
2. Haber ejecutado `/supabase/rls.sql` en Supabase
3. Tener al menos 2 usuarios de prueba:
   - Student A (id: student-a-uuid)
   - Admin (id: admin-uuid)
4. Tener al menos 2 payments de prueba:
   - Payment 1: student_id = student-a-uuid
   - Payment 2: student_id = otro-student-uuid

## Tests de RLS

### Test 1: Student no ve payments ajenos

**Pasos:**
1. Autenticarse como Student A en frontend
2. Ejecutar query: `SELECT * FROM payments`
3. Verificar que solo aparecen payments donde `student_id = student-a-uuid`
4. Intentar query específico: `SELECT * FROM payments WHERE student_id = 'otro-student-uuid'`
5. Verificar que retorna 0 filas (o error de permisos)

**Resultado esperado:** ✅ Student solo ve sus propios payments

---

### Test 2: Student no puede editar packages

**Pasos:**
1. Autenticarse como Student A
2. Intentar UPDATE: `UPDATE packages SET price = 999 WHERE id = 'package-uuid'`
3. Verificar que falla con error de permisos
4. Intentar INSERT: `INSERT INTO packages (name, price) VALUES ('Test', 100)`
5. Verificar que falla con error de permisos
6. Intentar DELETE: `DELETE FROM packages WHERE id = 'package-uuid'`
7. Verificar que falla con error de permisos
8. Intentar SELECT: `SELECT * FROM packages`
9. Verificar que funciona (puede leer)

**Resultado esperado:** ✅ Student puede leer packages pero NO puede modificar

---

### Test 3: Student no puede insertar credit_ledger

**Pasos:**
1. Autenticarse como Student A
2. Intentar INSERT: 
   ```sql
   INSERT INTO credit_ledger (student_id, delta, reason)
   VALUES (auth.uid(), 100, 'manual_adjustment')
   ```
3. Verificar que falla con error de permisos
4. Intentar SELECT: `SELECT * FROM credit_ledger WHERE student_id = auth.uid()`
5. Verificar que funciona (puede leer su propio ledger)

**Resultado esperado:** ✅ Student puede leer su ledger pero NO puede insertar

---

### Test 4: Admin sí puede ver todo y aprobar

**Pasos:**
1. Autenticarse como Admin
2. Ejecutar: `SELECT * FROM payments`
3. Verificar que ve TODOS los payments (no solo los propios)
4. Ejecutar: `SELECT * FROM credit_ledger`
5. Verificar que ve TODOS los ledger entries
6. Aprobar un payment:
   ```sql
   UPDATE payments 
   SET status = 'approved', 
       approved_at = now(), 
       approved_by = auth.uid()
   WHERE id = 'payment-uuid'
   ```
7. Verificar que funciona
8. Insertar en credit_ledger:
   ```sql
   INSERT INTO credit_ledger (student_id, delta, reason, created_by)
   VALUES ('student-uuid', 100, 'payment_approved', auth.uid())
   ```
9. Verificar que funciona

**Resultado esperado:** ✅ Admin puede ver todo y aprobar payments

---

### Test 5: Student NO puede aprobar payments

**Pasos:**
1. Autenticarse como Student A
2. Intentar aprobar su propio payment:
   ```sql
   UPDATE payments 
   SET status = 'approved'
   WHERE id = 'payment-own-uuid' AND student_id = auth.uid()
   ```
3. Verificar que falla con error de permisos (policy bloquea cambio de status)
4. Intentar actualizar solo proof_path:
   ```sql
   UPDATE payments 
   SET proof_path = 'payments/payment-id.jpg'
   WHERE id = 'payment-own-uuid' AND student_id = auth.uid()
   ```
5. Verificar que funciona (puede actualizar proof_path pero NO status)

**Resultado esperado:** ✅ Student NO puede cambiar status, pero sí proof_path

---

## Tests de Storage

### Test 6: Bucket privado configurado

**Pasos:**
1. En Supabase Dashboard → Storage
2. Verificar que bucket `payment-proofs` existe
3. Verificar que está marcado como PRIVADO (no público)
4. Intentar acceso directo desde frontend (sin signed URL):
   ```typescript
   const { data } = supabase.storage.from('payment-proofs').getPublicUrl('payments/test.jpg')
   ```
5. Verificar que la URL no funciona (bucket es privado)

**Resultado esperado:** ✅ Bucket existe y es PRIVADO

---

### Test 7: Student puede subir comprobante

**Pasos:**
1. Autenticarse como Student A
2. Crear un payment primero (o usar uno existente con id conocido)
3. Subir archivo a ruta correcta:
   ```typescript
   const { data, error } = await supabase.storage
     .from('payment-proofs')
     .upload(`payments/${paymentId}.jpg`, file)
   ```
4. Verificar que funciona (no hay error)
5. Intentar subir a payment ajeno:
   ```typescript
   const { data, error } = await supabase.storage
     .from('payment-proofs')
     .upload(`payments/${otherStudentPaymentId}.jpg`, file)
   ```
6. Verificar que falla con error de permisos

**Resultado esperado:** ✅ Student puede subir solo a sus propios payments

---

### Test 8: Admin puede generar signed URL

**Pasos:**
1. Autenticarse como Admin (server-side)
2. Generar signed URL:
   ```typescript
   const { data, error } = await supabase.storage
     .from('payment-proofs')
     .createSignedUrl('payments/payment-id.jpg', 3600)
   ```
3. Verificar que funciona y retorna URL firmada
4. Usar la URL en navegador
5. Verificar que se puede ver el archivo
6. Esperar que expire (o usar tiempo corto)
7. Verificar que URL expirada no funciona

**Resultado esperado:** ✅ Admin puede generar signed URLs que funcionan temporalmente

---

## Verificación de Policies

Para verificar que todas las policies se crearon:

```sql
-- Ver todas las policies de RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Ver policies de storage
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;

-- Verificar bucket
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE id = 'payment-proofs';
```

## Resumen de Resultados Esperados

- [ ] Test 1: Student no ve payments ajenos ✅
- [ ] Test 2: Student no puede editar packages ✅
- [ ] Test 3: Student no puede insertar credit_ledger ✅
- [ ] Test 4: Admin sí puede ver todo y aprobar ✅
- [ ] Test 5: Student NO puede aprobar payments ✅
- [ ] Test 6: Bucket privado configurado ✅
- [ ] Test 7: Student puede subir comprobante ✅
- [ ] Test 8: Admin puede generar signed URL ✅
