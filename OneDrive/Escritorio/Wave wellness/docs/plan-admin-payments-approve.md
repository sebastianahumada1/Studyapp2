# Plan: Admin Pagos - Ver Comprobante + Aprobar/Rechazar + Ledger (PASO 10)

## Definition of Done (DoD)

- [ ] Lista de pagos con filtros (pending/approved/rejected)
- [ ] Mostrar primero pending
- [ ] Cada item muestra: student (full_name, phone), package_name, amount, status, created_at, indicator de comprobante
- [ ] Mobile-friendly (cards o table responsive)
- [ ] Ver comprobante: generar signed URL server-side
- [ ] Dialog muestra: PDF (link) o imagen (preview)
- [ ] Si no hay comprobante: mensaje claro
- [ ] Aprobar payment (Server Action idempotente):
  - Validar: status = pending, proof_path NOT NULL, package_credits NOT NULL
  - Update payment: status = approved, approved_at = now(), approved_by = admin id
  - Insert ledger: delta = package_credits, reason = 'payment_approved', ref_payment_id, created_by
  - Idempotente: verificar si ledger ya existe antes de insertar
- [ ] Rechazar payment:
  - Update payment: status = rejected
  - No tocar ledger
- [ ] Confirmación modal antes de aprobar/rechazar
- [ ] Toast de éxito/error
- [ ] Estados: loading/empty
- [ ] Botones grandes y claros
- [ ] No inventar columnas fuera de schema.sql
- [ ] No usar service role key
- [ ] RLS respetado

## Lista de Archivos a Crear/Modificar

### Archivos a Modificar:
- `src/app/(protected)/admin/payments/page.tsx` - Implementación completa

### Archivos a Crear:
- `src/app/(protected)/admin/payments/actions.ts` - Server Actions para aprobar/rechazar y generar signed URL

## Estructura de Implementación

### 1. Lista de Pagos

**Query con join:**
```typescript
supabase
  .from('payments')
  .select(`
    id,
    student_id,
    package_name,
    package_credits,
    amount,
    status,
    proof_path,
    created_at,
    approved_at,
    approved_by,
    profiles!payments_student_id_fkey(full_name, phone)
  `)
  .order('created_at', { ascending: false })
```

**Filtros:**
- Tabs: Pending, Approved, Rejected
- Por defecto mostrar pending primero

**UI:**
- Desktop: Tabla
- Mobile: Cards
- Columnas: Student, Plan, Monto, Estado, Comprobante, Fecha, Acciones

### 2. Ver Comprobante (Server Action)

**Generar signed URL:**
```typescript
'use server'

export async function getProofSignedUrl(proofPath: string) {
  const supabase = await createClient()
  
  // Verificar que el usuario es admin (RLS ya lo valida)
  const { data: { data: signedUrlData }, error } = await supabase.storage
    .from('payment-proofs')
    .createSignedUrl(proofPath, 3600) // 1 hora
  
  if (error) throw error
  return signedUrlData.signedUrl
}
```

**Dialog:**
- Si es PDF: mostrar link "Abrir en nueva pestaña"
- Si es imagen: mostrar `<img src={signedUrl} />`
- Si no hay comprobante: mensaje claro

### 3. Aprobar Payment (Server Action Idempotente)

**Validaciones:**
- status = 'pending'
- proof_path NOT NULL
- package_credits NOT NULL (bloquear si es null)

**Flujo:**
1. Verificar que payment existe y está pending
2. Verificar que proof_path existe
3. Verificar que package_credits NOT NULL
4. Verificar si ya existe ledger para este payment (idempotente)
5. Si no existe, insertar ledger
6. Update payment: status, approved_at, approved_by

**Idempotencia:**
```typescript
// Verificar si ya existe ledger
const { data: existingLedger } = await supabase
  .from('credit_ledger')
  .select('id')
  .eq('ref_payment_id', paymentId)
  .single()

if (!existingLedger) {
  // Insertar ledger solo si no existe
  await supabase.from('credit_ledger').insert({...})
}
```

### 4. Rechazar Payment (Server Action)

**Flujo:**
1. Verificar que payment existe y está pending
2. Update payment: status = 'rejected'
3. No tocar ledger

### 5. Confirmación Modal

**Dialog de confirmación:**
- "¿Estás seguro de aprobar este pago?"
- "¿Estás seguro de rechazar este pago?"
- Botones: Cancelar, Confirmar

## Componentes UI (shadcn/ui base)

**Usar:**
- `@/components/ui/base/button`
- `@/components/ui/base/card`
- `@/components/ui/base/table`
- `@/components/ui/base/dialog`
- `@/components/ui/base/toast`
- `@/components/ui/base/tabs` (para filtros)

## Pasos de Implementación

1. Crear Server Actions (aprobar, rechazar, getSignedUrl)
2. Implementar lista de pagos con filtros
3. Implementar dialog para ver comprobante
4. Implementar confirmación modal
5. Agregar estados y toasts
6. Probar flujo completo

## Testing

### Prueba 1: Lista de Pagos
- Verificar que muestra todos los payments
- Verificar filtros funcionan
- Verificar join con profiles

### Prueba 2: Ver Comprobante
- Click en "Ver comprobante"
- Verificar: signed URL generada
- Verificar: PDF muestra link, imagen muestra preview

### Prueba 3: Aprobar Payment
- Aprobar payment pending con comprobante
- Verificar: payment actualizado
- Verificar: ledger creado
- Verificar: créditos sumados al student

### Prueba 4: Idempotencia
- Intentar aprobar el mismo payment dos veces
- Verificar: no duplica ledger
- Verificar: payment sigue approved

### Prueba 5: Rechazar Payment
- Rechazar payment
- Verificar: payment actualizado
- Verificar: ledger NO creado
