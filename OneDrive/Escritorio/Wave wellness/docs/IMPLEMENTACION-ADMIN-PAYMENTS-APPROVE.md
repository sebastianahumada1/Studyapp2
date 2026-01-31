# Implementación: Admin Pagos - Ver Comprobante + Aprobar/Rechazar + Ledger

## Archivos Creados/Modificados

### Archivos Creados:
1. `src/app/(protected)/admin/payments/actions.ts` - Server Actions para aprobar/rechazar y generar signed URL
2. `src/components/ui/base/tabs.tsx` - Componente Tabs de shadcn/ui para filtros
3. `docs/plan-admin-payments-approve.md` - Plan y DoD
4. `docs/PRUEBAS-ADMIN-PAYMENTS-APPROVE.md` - Pasos de prueba detallados

### Archivos Modificados:
1. `src/app/(protected)/admin/payments/page.tsx` - Implementación completa de la UI

## Detalles de Implementación

### 1. Server Actions (`actions.ts`)

#### `getProofSignedUrl(proofPath: string)`
- Genera una signed URL para ver el comprobante
- Valida que el usuario es admin
- Usa `supabase.storage.from('payment-proofs').createSignedUrl()` con expiración de 1 hora
- Retorna `{ url: string }` o `{ error: string }`

#### `approvePayment(paymentId: string)`
- Valida que el usuario es admin
- Obtiene el payment y valida:
  - status = 'pending'
  - proof_path NOT NULL
  - package_credits NOT NULL (bloquea ilimitados)
- Verifica si ya existe ledger (idempotente)
- Si no existe, crea ledger con:
  - student_id = payment.student_id
  - delta = payment.package_credits
  - reason = 'payment_approved'
  - ref_payment_id = payment.id
  - created_by = admin.id
- Actualiza payment:
  - status = 'approved'
  - approved_at = now()
  - approved_by = admin.id
- Retorna `{ success: true }` o `{ error: string }`

#### `rejectPayment(paymentId: string)`
- Valida que el usuario es admin
- Obtiene el payment y valida status = 'pending'
- Actualiza payment:
  - status = 'rejected'
- No toca ledger
- Retorna `{ success: true }` o `{ error: string }`

### 2. UI Component (`page.tsx`)

#### Estado
- `payments`: Lista de pagos
- `loading`: Estado de carga
- `filter`: Filtro actual (pending/approved/rejected/all)
- `selectedPayment`: Pago seleccionado para acciones
- `isProofDialogOpen`: Control de dialog de comprobante
- `proofUrl`: URL firmada del comprobante
- `loadingProof`: Estado de carga del comprobante
- `isConfirmDialogOpen`: Control de dialog de confirmación
- `confirmAction`: Acción a confirmar ('approve' | 'reject')
- `processing`: Estado de procesamiento de acciones

#### Funciones Principales

**`loadPayments()`**
- Carga todos los pagos con join a profiles
- Ordena por created_at descendente
- Maneja errores con toast

**`handleViewProof(payment)`**
- Valida que payment tiene proof_path
- Llama a `getProofSignedUrl` server action
- Abre dialog con la URL firmada
- Maneja errores con toast

**`handleApprove()`**
- Llama a `approvePayment` server action
- Muestra toast de éxito/error
- Recarga lista de pagos
- Cierra dialog de confirmación

**`handleReject()`**
- Llama a `rejectPayment` server action
- Muestra toast de éxito/error
- Recarga lista de pagos
- Cierra dialog de confirmación

**`openConfirmDialog(payment, action)`**
- Abre dialog de confirmación
- Establece payment y acción

#### UI Components

**Filtros (Tabs)**
- Tabs para filtrar: Pendientes, Aprobados, Rechazados, Todos
- Por defecto muestra "Pendientes"
- Ordena: pending primero, luego por fecha

**Lista de Pagos**
- Desktop: Tabla con columnas:
  - Estudiante (nombre + teléfono)
  - Plan (nombre + créditos)
  - Monto
  - Estado (badge con icono)
  - Comprobante (indicador)
  - Fecha
  - Acciones (Ver, Aprobar, Rechazar)
- Mobile: Cards con toda la información
- Botones grandes (>= 48px) para +60 UX

**Dialog: Ver Comprobante**
- Si es imagen: muestra `<img>` con la URL firmada
- Si es PDF: muestra botón "Abrir PDF en nueva pestaña"
- Si no hay comprobante: mensaje claro
- Loading state mientras genera URL

**Dialog: Confirmación**
- Muestra detalles del pago
- Botones: Cancelar, Confirmar
- Loading state durante procesamiento

### 3. Componente Tabs (`tabs.tsx`)

- Implementación de shadcn/ui Tabs
- Usa Radix UI primitives
- Estilos para +60 UX (texto grande, botones altos)
- Accesible (focus-visible, aria)

## Validaciones y Seguridad

### RLS (Row Level Security)
- Admin puede ver todos los payments (policy `payments_select_admin`)
- Admin puede actualizar payments (policy `payments_update_admin`)
- Admin puede generar signed URLs (policy `payment_proofs_select_admin`)

### Validaciones en Server Actions
- Verifica que usuario es admin antes de cualquier acción
- Valida que payment existe
- Valida que payment está en estado correcto (pending para aprobar/rechazar)
- Valida que proof_path existe antes de aprobar
- Valida que package_credits NOT NULL antes de aprobar (Slice 1)

### Idempotencia
- `approvePayment`: Verifica si ledger ya existe antes de crear
- `rejectPayment`: Solo actualiza si status = 'pending' (idempotente)

## UX para +60

- Botones grandes (>= 48px altura)
- Texto base >= 16px
- Labels claros y visibles
- Focus-visible ring
- Espaciado generoso
- Mobile-first: cards en mobile, tabla en desktop
- Estados de loading claros
- Mensajes de error descriptivos
- Confirmación antes de acciones destructivas

## Flujo de Datos

1. **Cargar Pagos:**
   - Client Component → Supabase Client → Query con join
   - Renderiza lista con filtros

2. **Ver Comprobante:**
   - Click "Ver" → Server Action → Genera signed URL
   - Client recibe URL → Abre dialog → Muestra comprobante

3. **Aprobar Pago:**
   - Click "Aprobar" → Dialog confirmación
   - Confirmar → Server Action → Valida → Crea ledger → Actualiza payment
   - Client recibe resultado → Toast → Recarga lista

4. **Rechazar Pago:**
   - Click "Rechazar" → Dialog confirmación
   - Confirmar → Server Action → Valida → Actualiza payment
   - Client recibe resultado → Toast → Recarga lista

## Notas Técnicas

### Join con Profiles
- Usa `profiles!inner(full_name, phone)` para join
- `!inner` asegura que solo se muestren payments con profile válido

### Signed URLs
- Expiración: 1 hora (3600 segundos)
- Solo admin puede generar (RLS)
- Path completo desde `proof_path` en DB

### Ledger Entry
- Solo se crea al aprobar
- Idempotente: verifica existencia antes de insertar
- Usa snapshot del payment (package_credits, amount, package_name)

### Estados de Payment
- `pending`: Esperando aprobación
- `approved`: Aprobado, ledger creado
- `rejected`: Rechazado, sin ledger

## Próximos Pasos (Slice 2+)

- Aprobar pagos con créditos ilimitados
- Campos rejected_at y rejected_by (si se agregan al schema)
- Notificaciones al estudiante
- Historial de cambios de estado
