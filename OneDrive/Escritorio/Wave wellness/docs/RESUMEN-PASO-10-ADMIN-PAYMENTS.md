# Resumen: PASO 10 - Admin Pagos (Ver Comprobante + Aprobar/Rechazar + Ledger)

## ✅ Implementación Completa

### Archivos Creados

1. **`src/app/(protected)/admin/payments/actions.ts`**
   - Server Actions:
     - `getProofSignedUrl()`: Genera signed URL para ver comprobante
     - `approvePayment()`: Aprueba payment y crea ledger (idempotente)
     - `rejectPayment()`: Rechaza payment

2. **`src/components/ui/base/tabs.tsx`**
   - Componente Tabs de shadcn/ui para filtros
   - Accesible y mobile-friendly

3. **`docs/plan-admin-payments-approve.md`**
   - Plan detallado y Definition of Done

4. **`docs/PRUEBAS-ADMIN-PAYMENTS-APPROVE.md`**
   - 13 pruebas detalladas paso a paso

5. **`docs/IMPLEMENTACION-ADMIN-PAYMENTS-APPROVE.md`**
   - Documentación técnica de la implementación

### Archivos Modificados

1. **`src/app/(protected)/admin/payments/page.tsx`**
   - Implementación completa de la UI:
     - Lista de pagos con filtros (pending/approved/rejected/all)
     - Vista de comprobante (imagen o PDF con signed URL)
     - Aprobar payment con confirmación
     - Rechazar payment con confirmación
     - Responsive (tabla desktop, cards mobile)
     - UX para +60 (botones grandes, texto legible)

## Funcionalidades Implementadas

### ✅ Lista de Pagos
- Query con join a profiles (full_name, phone)
- Filtros por estado (tabs)
- Ordenamiento: pending primero, luego por fecha
- Desktop: tabla completa
- Mobile: cards responsive
- Indicador de comprobante (con/sin)

### ✅ Ver Comprobante
- Genera signed URL server-side (1 hora de validez)
- Dialog con preview:
  - Imagen: muestra `<img>` directamente
  - PDF: botón "Abrir en nueva pestaña"
- Manejo de errores claro
- Loading state

### ✅ Aprobar Payment
- Validaciones:
  - Usuario es admin
  - Payment existe
  - Status = 'pending'
  - proof_path NOT NULL
  - package_credits NOT NULL (bloquea ilimitados en Slice 1)
- Idempotente:
  - Verifica si ledger ya existe antes de crear
  - No duplica ledger si se aprueba dos veces
- Actualiza payment:
  - status = 'approved'
  - approved_at = now()
  - approved_by = admin.id
- Crea ledger:
  - student_id = payment.student_id
  - delta = payment.package_credits
  - reason = 'payment_approved'
  - ref_payment_id = payment.id
  - created_by = admin.id

### ✅ Rechazar Payment
- Validaciones:
  - Usuario es admin
  - Payment existe
  - Status = 'pending'
- Actualiza payment:
  - status = 'rejected'
- No toca ledger

### ✅ UX
- Botones grandes (>= 48px)
- Texto base >= 16px
- Labels claros
- Focus-visible ring
- Espaciado generoso
- Confirmación modal antes de aprobar/rechazar
- Toast de éxito/error
- Estados de loading
- Empty states

## Seguridad y Validaciones

### RLS (Row Level Security)
- Admin puede ver todos los payments
- Admin puede actualizar payments
- Admin puede generar signed URLs
- Student NO puede ver payments de otros

### Validaciones en Server Actions
- Verifica rol admin antes de cualquier acción
- Valida estado del payment
- Valida existencia de comprobante
- Bloquea aprobación de créditos ilimitados (Slice 1)

### Idempotencia
- `approvePayment`: Verifica existencia de ledger antes de crear
- `rejectPayment`: Solo actualiza si status = 'pending'

## Pasos para Probar End-to-End

### 1. Preparación
```sql
-- Crear un package activo
INSERT INTO packages (name, credits, price, active)
VALUES ('Plan Básico', 10, 500.00, true);

-- Crear un student (si no existe)
-- (usar registro desde UI o SQL directo)
```

### 2. Student Crea Payment y Sube Comprobante
1. Autenticarse como student
2. Ir a `/student/payments`
3. Seleccionar un plan activo
4. Click en "Pagar este plan"
5. Subir comprobante (jpg/png/pdf)
6. Verificar que payment se creó con status = 'pending'

### 3. Admin Ve Pending
1. Autenticarse como admin
2. Ir a `/admin/payments`
3. Verificar que el pago aparece en tab "Pendientes"
4. Verificar que muestra "Con comprobante"

### 4. Admin Abre Comprobante
1. Click en botón "Ver" o "Ver Comprobante"
2. Verificar que se abre dialog
3. Verificar que se muestra el comprobante:
   - Si es imagen: preview
   - Si es PDF: botón "Abrir PDF"

### 5. Admin Aprueba Payment
1. Click en botón "Aprobar"
2. Verificar dialog de confirmación
3. Verificar que muestra detalles del pago
4. Click en "Aprobar Pago"
5. Verificar toast de éxito
6. Recargar página
7. Verificar que pago está en tab "Aprobados"
8. Verificar en DB:
   ```sql
   -- Payment actualizado
   SELECT status, approved_at, approved_by FROM payments WHERE id = '...';
   
   -- Ledger creado
   SELECT * FROM credit_ledger WHERE ref_payment_id = '...';
   ```

### 6. Verificar Idempotencia
1. Cambiar status del payment a 'pending' en DB (si es necesario)
2. Intentar aprobar de nuevo
3. Verificar en DB que NO se creó ledger duplicado:
   ```sql
   SELECT COUNT(*) FROM credit_ledger WHERE ref_payment_id = '...';
   -- Debe ser 1
   ```

### 7. Rechazar Payment
1. Crear otro payment como student
2. Como admin, ir a `/admin/payments`
3. Buscar el payment pendiente
4. Click en "Rechazar"
5. Confirmar en dialog
6. Verificar toast de éxito
7. Verificar que pago está en tab "Rechazados"
8. Verificar en DB que NO existe ledger para ese payment

## Checklist de Pruebas

- [ ] Lista de pagos carga correctamente
- [ ] Filtros funcionan (pending/approved/rejected/all)
- [ ] Ver comprobante (imagen) funciona
- [ ] Ver comprobante (PDF) funciona
- [ ] Ver comprobante sin archivo muestra mensaje
- [ ] Aprobar pago funciona
- [ ] Aprobar sin comprobante muestra error
- [ ] Aprobar con créditos ilimitados muestra error
- [ ] Aprobar idempotente (no duplica ledger)
- [ ] Rechazar pago funciona
- [ ] Rechazar idempotente
- [ ] Responsive funciona (mobile/desktop)
- [ ] End-to-end completo funciona

## Notas Técnicas

### Join con Profiles
- Usa `profiles!inner(full_name, phone)` para join
- Transforma array a objeto en el cliente

### Signed URLs
- Expiración: 1 hora (3600 segundos)
- Solo admin puede generar (RLS)
- Path completo desde `proof_path` en DB

### Ledger Entry
- Solo se crea al aprobar
- Idempotente: verifica existencia antes de insertar
- Usa snapshot del payment

## Restricciones Cumplidas

- ✅ No se inventaron columnas fuera de schema.sql
- ✅ No se usa service role key
- ✅ RLS respetado (admin puede, student no puede)
- ✅ Slice 1: bloquea aprobación de créditos ilimitados
- ✅ Idempotencia implementada
- ✅ Mobile-first y UX para +60

## Próximos Pasos (Slice 2+)

- Aprobar pagos con créditos ilimitados
- Campos rejected_at y rejected_by (si se agregan al schema)
- Notificaciones al estudiante
- Historial de cambios de estado
- Filtros avanzados (por estudiante, fecha, monto)
