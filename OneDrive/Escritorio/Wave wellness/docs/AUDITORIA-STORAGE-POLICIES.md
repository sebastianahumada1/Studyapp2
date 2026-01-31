# Auditoría: Storage Policies - payment-proofs

## 1. Checklist de Validación de Policies Actuales

### Policy: `payment_proofs_select_admin` (SELECT)
**Condiciones que DEBE tener:**
- ✅ `bucket_id = 'payment-proofs'`
- ✅ Verificar que usuario es admin (usando `is_admin()` o consulta directa a `profiles`)
- ✅ Solo `TO authenticated`

**Revisar en USING:**
- [ ] ¿Verifica `bucket_id = 'payment-proofs'`? → **SÍ** (línea 205)
- [ ] ¿Usa `is_admin()` o consulta directa? → **SÍ, usa `is_admin()`** (línea 206)
- [ ] ¿Es `TO authenticated`? → **SÍ** (línea 203)

**Estado:** ✅ CORRECTO

---

### Policy: `payment_proofs_insert_own` (INSERT)
**Condiciones que DEBE tener:**
- ✅ `bucket_id = 'payment-proofs'`
- ✅ Path pattern: `payments/{auth.uid()}/{payment_id}.{ext}`
- ✅ Verificar que `payment.student_id = auth.uid()`
- ✅ Payment debe existir en DB

**Revisar en WITH CHECK:**
- [ ] ¿Verifica `bucket_id = 'payment-proofs'`? → **SÍ** (línea 217)
- [ ] ¿Path incluye `auth.uid()`? → **❌ NO** - Actualmente solo `payments/%` (línea 220)
- [ ] ¿Verifica ownership del payment? → **SÍ** (línea 224-225)
- [ ] ¿Path pattern es correcto? → **❌ NO** - Debe ser `payments/{auth.uid()}/{payment_id}.{ext}`

**Estado:** ❌ **REQUIERE CORRECCIÓN** - Path no incluye `auth.uid()`

---

### Policy: `payment_proofs_update_own` (UPDATE)
**Condiciones que DEBE tener (si se permite):**
- ✅ `bucket_id = 'payment-proofs'`
- ✅ Path pattern: `payments/{auth.uid()}/{payment_id}.{ext}`
- ✅ Verificar ownership del payment
- ✅ No permitir cambio de path (solo metadata)

**Revisar en USING/WITH CHECK:**
- [ ] ¿Verifica `bucket_id`? → **SÍ** (líneas 236, 246)
- [ ] ¿Path incluye `auth.uid()`? → **❌ NO** (líneas 237, 247)
- [ ] ¿Verifica ownership? → **SÍ** (líneas 238-242, 248-252)
- [ ] ¿Bloquea cambio de path? → **NO EXPLÍCITO** - Solo verifica mismo pattern

**Estado:** ⚠️ **REQUIERE EVALUACIÓN** - Ver sección 2

---

### Policy: `payment_proofs_delete_own` (DELETE)
**Condiciones que DEBE tener (si se permite):**
- ✅ `bucket_id = 'payment-proofs'`
- ✅ Path pattern: `payments/{auth.uid()}/{payment_id}.{ext}`
- ✅ Verificar ownership del payment

**Revisar en USING:**
- [ ] ¿Verifica `bucket_id`? → **SÍ** (línea 262)
- [ ] ¿Path incluye `auth.uid()`? → **❌ NO** (línea 263)
- [ ] ¿Verifica ownership? → **SÍ** (líneas 264-268)

**Estado:** ⚠️ **REQUIERE EVALUACIÓN** - Ver sección 2

---

## 2. Análisis: ¿UPDATE/DELETE "own" es necesario o riesgoso?

### Riesgos de permitir UPDATE/DELETE:

**UPDATE:**
- ❌ **Riesgo:** Student podría cambiar metadata del archivo (pero no el contenido directamente)
- ❌ **Riesgo:** Si se permite cambio de `name`, podría mover archivo a otro payment
- ✅ **Uso legítimo:** Actualizar metadata (cache-control, content-type) - **NO necesario para el flujo**
- ✅ **Recomendación:** **NO PERMITIR UPDATE** - Si student necesita cambiar comprobante, debe borrar y subir nuevo

**DELETE:**
- ⚠️ **Riesgo:** Student borra comprobante después de que admin lo revisó (pierde auditoría)
- ⚠️ **Riesgo:** Si payment ya fue aprobado, borrar comprobante rompe integridad
- ✅ **Uso legítimo:** Borrar comprobante incorrecto antes de aprobación - **ÚTIL pero RIESGOSO**
- ✅ **Recomendación:** **PERMITIR DELETE solo si payment.status = 'pending'** (usando trigger o policy más compleja)

**Alternativa más segura:**
- ❌ **NO permitir UPDATE/DELETE** por student
- ✅ **Solo INSERT** - Si student sube mal, admin puede borrar desde dashboard
- ✅ **Mantener auditoría completa** (no se pierden comprobantes)

---

## 3. Set Mínimo Recomendado de Policies

### Opción A: Mínimo Seguro (RECOMENDADO)
```
- Student: INSERT own (path: payments/{auth.uid()}/{payment_id}.{ext})
- Admin: SELECT all (para signed URLs)
- Admin: DELETE all (opcional, para limpieza)
```

**Ventajas:**
- ✅ Máxima seguridad (no se pueden borrar comprobantes)
- ✅ Auditoría completa
- ✅ Simple de implementar

**Desventajas:**
- ❌ Student no puede corregir error (debe contactar admin)

---

### Opción B: Con DELETE Condicional
```
- Student: INSERT own
- Student: DELETE own (solo si payment.status = 'pending')
- Admin: SELECT all
- Admin: DELETE all
```

**Ventajas:**
- ✅ Student puede corregir errores
- ✅ Bloquea DELETE si payment ya aprobado

**Desventajas:**
- ⚠️ Requiere trigger o policy más compleja
- ⚠️ Más superficie de ataque

---

### Opción C: Con SELECT own (NO RECOMENDADO)
```
- Student: INSERT own
- Student: SELECT own (para preview antes de subir)
- Admin: SELECT all
```

**Problema:**
- ❌ Bucket es PRIVADO - student no debería leer directamente
- ❌ Si student necesita preview, debe ser vía signed URL generada por admin
- ❌ No alinea con flujo: "admin revisa usando signed URL"

**Recomendación:** ❌ **NO incluir SELECT own para student**

---

## 4. SQL Final Recomendado

### Path Pattern
- **Formato:** `payments/{auth.uid()}/{payment_id}.{ext}`
- **Ejemplo:** `payments/550e8400-e29b-41d4-a716-446655440000/123e4567-e89b-12d3-a456-426614174000.pdf`

### Validación del Path
- **Parte 1:** `payments/` (prefijo fijo)
- **Parte 2:** `{auth.uid()}` (UUID del usuario autenticado)
- **Parte 3:** `/{payment_id}.{ext}` (UUID del payment + extensión)

### SQL para Aplicar

```sql
-- ============================================================================
-- Storage Policies: payment-proofs (CORREGIDAS)
-- ============================================================================
-- 
-- IMPORTANTE: Ejecutar esto DESPUÉS de eliminar las policies antiguas
-- DROP POLICY IF EXISTS "payment_proofs_select_admin" ON storage.objects;
-- DROP POLICY IF EXISTS "payment_proofs_insert_own" ON storage.objects;
-- DROP POLICY IF EXISTS "payment_proofs_update_own" ON storage.objects;
-- DROP POLICY IF EXISTS "payment_proofs_delete_own" ON storage.objects;
-- ============================================================================

-- SELECT: Solo admin puede leer (para generar signed URLs server-side)
CREATE POLICY "payment_proofs_select_admin"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs'
  AND EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  )
);

-- INSERT: Student puede subir comprobante solo a su payment
-- Path: payments/{auth.uid()}/{payment_id}.{ext}
-- Verifica: 1) path correcto, 2) payment existe, 3) student es owner
CREATE POLICY "payment_proofs_insert_own"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-proofs'
  AND name LIKE 'payments/' || auth.uid()::text || '/%'
  AND EXISTS (
    SELECT 1
    FROM public.payments
    WHERE id::text = split_part(split_part(name, '/', 3), '.', 1)
      AND student_id = auth.uid()
  )
);

-- DELETE: Solo admin puede borrar (para mantener auditoría)
-- Student NO puede borrar (si subió mal, contacta admin)
CREATE POLICY "payment_proofs_delete_admin"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'payment-proofs'
  AND EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  )
);
```

### Notas del SQL:
1. **SELECT admin:** Usa consulta directa a `profiles` (más explícito que `is_admin()``)
2. **INSERT student:** 
   - Path pattern: `payments/{auth.uid()}/%` usando concatenación
   - Extrae `payment_id` de la 3ra parte del path (split_part con índice 3)
   - Verifica ownership en `payments.student_id`
3. **DELETE admin:** Solo admin puede borrar (mantiene auditoría)
4. **NO UPDATE:** No se permite UPDATE (student no puede modificar metadata)

---

## 5. Pasos para Probar

### Setup Inicial
1. Crear 3 usuarios en Supabase Auth:
   - **Student A:** `student-a@test.com` (role: `student`)
   - **Student B:** `student-b@test.com` (role: `student`)
   - **Admin:** `admin@test.com` (role: `admin`)

2. Crear profiles para cada usuario:
```sql
INSERT INTO profiles (id, full_name, phone, role)
VALUES 
  ((SELECT id FROM auth.users WHERE email = 'student-a@test.com'), 'Student A', '1234567890', 'student'),
  ((SELECT id FROM auth.users WHERE email = 'student-b@test.com'), 'Student B', '1234567891', 'student'),
  ((SELECT id FROM auth.users WHERE email = 'admin@test.com'), 'Admin', '1234567892', 'admin');
```

3. Crear un package:
```sql
INSERT INTO packages (name, credits, price, active)
VALUES ('Test Package', 10, 100.00, true);
```

4. Crear payments para Student A:
```sql
INSERT INTO payments (student_id, package_id, package_name, package_credits, amount, status)
VALUES 
  ((SELECT id FROM auth.users WHERE email = 'student-a@test.com'), 
   (SELECT id FROM packages LIMIT 1),
   'Test Package', 10, 100.00, 'pending');
```

### Prueba 1: Student A - INSERT correcto
**Acción:**
```typescript
// Frontend: Student A autenticado
const paymentId = '...'; // ID del payment creado
const userId = supabase.auth.getUser().then(u => u.data.user?.id);
const path = `payments/${userId}/${paymentId}.pdf`;

const { data, error } = await supabase.storage
  .from('payment-proofs')
  .upload(path, file);
```

**Resultado esperado:**
- ✅ Upload exitoso
- ✅ Archivo guardado en `payments/{student-a-id}/{payment-id}.pdf`

---

### Prueba 2: Student A - INSERT path incorrecto (sin user_id)
**Acción:**
```typescript
const path = `payments/${paymentId}.pdf`; // ❌ Sin user_id
```

**Resultado esperado:**
- ❌ Error: "new row violates row-level security policy"
- ❌ Upload rechazado

---

### Prueba 3: Student A - INSERT a payment de Student B
**Acción:**
```typescript
// Intentar subir a payment de Student B
const studentBId = '...'; // ID de Student B
const studentBPaymentId = '...'; // Payment ID de Student B
const path = `payments/${studentAId}/${studentBPaymentId}.pdf`; // ❌ Payment no es de Student A
```

**Resultado esperado:**
- ❌ Error: "new row violates row-level security policy"
- ❌ Upload rechazado (payment.student_id != auth.uid())

---

### Prueba 4: Student B - SELECT archivo de Student A
**Acción:**
```typescript
// Student B intenta leer archivo de Student A
const path = `payments/${studentAId}/${paymentId}.pdf`;
const { data, error } = await supabase.storage
  .from('payment-proofs')
  .download(path);
```

**Resultado esperado:**
- ❌ Error: "new row violates row-level security policy"
- ❌ Download rechazado (solo admin puede SELECT)

---

### Prueba 5: Admin - SELECT archivo de Student A
**Acción:**
```typescript
// Admin genera signed URL (server-side)
const { data } = await supabase.storage
  .from('payment-proofs')
  .createSignedUrl(path, 3600);
```

**Resultado esperado:**
- ✅ Signed URL generada exitosamente
- ✅ URL válida por 1 hora

---

### Prueba 6: Student A - DELETE propio archivo
**Acción:**
```typescript
// Student A intenta borrar su archivo
const { error } = await supabase.storage
  .from('payment-proofs')
  .remove([path]);
```

**Resultado esperado:**
- ❌ Error: "new row violates row-level security policy"
- ❌ Delete rechazado (solo admin puede DELETE)

---

### Prueba 7: Admin - DELETE archivo
**Acción:**
```typescript
// Admin borra archivo
const { error } = await supabase.storage
  .from('payment-proofs')
  .remove([path]);
```

**Resultado esperado:**
- ✅ Delete exitoso
- ✅ Archivo eliminado

---

## 6. Nota: Path en Frontend al hacer Upload

### Formato del `proof_path` en DB
El campo `proof_path` en la tabla `payments` debe almacenar el path completo:

```typescript
// Frontend: Al subir comprobante
const userId = (await supabase.auth.getUser()).data.user?.id;
const paymentId = payment.id; // UUID del payment
const fileExt = file.name.split('.').pop(); // jpg, png, pdf, etc.
const storagePath = `payments/${userId}/${paymentId}.${fileExt}`;

// 1. Upload a Storage
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('payment-proofs')
  .upload(storagePath, file, {
    cacheControl: '3600',
    upsert: false, // No permitir sobrescribir
  });

if (uploadError) throw uploadError;

// 2. Actualizar payment.proof_path en DB
const { error: dbError } = await supabase
  .from('payments')
  .update({ proof_path: storagePath })
  .eq('id', paymentId)
  .eq('student_id', userId); // Verificar ownership

if (dbError) throw dbError;
```

### Ejemplo de `proof_path` en DB:
```
payments/550e8400-e29b-41d4-a716-446655440000/123e4567-e89b-12d3-a456-426614174000.pdf
```

### Validación en Frontend (antes de upload):
```typescript
function validateStoragePath(userId: string, paymentId: string, fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (!ext || !['jpg', 'jpeg', 'png', 'webp', 'pdf'].includes(ext)) {
    throw new Error('Invalid file type');
  }
  return `payments/${userId}/${paymentId}.${ext}`;
}
```

---

## Resumen de Cambios Requeridos

1. ✅ **Path pattern:** Cambiar de `payments/{payment_id}.{ext}` a `payments/{auth.uid()}/{payment_id}.{ext}`
2. ✅ **Eliminar UPDATE:** No permitir UPDATE por student
3. ✅ **Eliminar DELETE student:** Solo admin puede DELETE
4. ✅ **SELECT:** Solo admin (sin cambios)
5. ✅ **INSERT:** Corregir path pattern y validación
