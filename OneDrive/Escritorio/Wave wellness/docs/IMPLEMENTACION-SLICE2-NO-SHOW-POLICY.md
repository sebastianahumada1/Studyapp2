# Implementación: Slice 2 - Política No-Show con Descuento (HARDENING)

## Archivos Creados/Modificados

### Archivos Creados:
1. `supabase/schema-slice2-no-show-additions.sql` - SQL para agregar `'class_no_show'` al enum
2. `docs/plan-slice2-no-show-policy.md` - Plan y DoD
3. `docs/PRUEBAS-SLICE2-NO-SHOW-POLICY.md` - Checklist de pruebas
4. `docs/IMPLEMENTACION-SLICE2-NO-SHOW-POLICY.md` - Este archivo

### Archivos Modificados:
1. `supabase/schema.sql` - Agregado `'class_no_show'` al enum `ledger_reason`
2. `src/app/(protected)/coach/schedule/actions.ts` - Actualizado `markAttendance()` para descontar en no-show
3. `src/app/(protected)/coach/schedule/CoachScheduleClient.tsx` - Agregado Dialog de confirmación
4. `src/app/(protected)/student/page.tsx` - Actualizado `humanizeReason()` para `'class_no_show'`

## Detalles de Implementación

### 1. Actualización del Schema

**Agregar `'class_no_show'` al enum:**
```sql
ALTER TYPE ledger_reason ADD VALUE IF NOT EXISTS 'class_no_show';
```

**En `schema.sql`:**
```sql
CREATE TYPE ledger_reason AS ENUM (
  'payment_approved',
  'manual_adjustment',
  'class_attended',
  'class_no_show'  -- Nuevo
);
```

### 2. Actualización de Server Action: `markAttendance`

**Cambios principales:**

1. **Permitir Admin:**
   ```typescript
   if (profile.role !== 'coach' && profile.role !== 'admin') {
     return { success: false, error: 'Solo los coaches y administradores pueden marcar asistencia.' }
   }
   ```

2. **Admin puede marcar en cualquier slot:**
   ```typescript
   if (profile.role !== 'admin' && slot.coach_id !== profile.id) {
     return { success: false, error: 'No tienes permiso...' }
   }
   ```

3. **Descontar créditos en no-show:**
   ```typescript
   if (status === 'no_show') {
     const { error: ledgerError } = await supabase.from('credit_ledger').insert({
       student_id: booking.student_id,
       delta: -1,
       reason: 'class_no_show',
       created_by: profile.id,
     })
   }
   ```

**Idempotencia:**
- Verificamos que `booking.status = 'booked'` antes de actualizar
- Si el booking ya está `no_show`, no llegamos a insertar ledger
- Si por alguna razón se intenta marcar dos veces, la segunda vez fallará en la validación de status

**Validaciones:**
- ✅ Usuario es coach o admin
- ✅ Booking existe
- ✅ Slot pertenece al coach (o admin puede todo)
- ✅ Status actual es 'booked' (no se puede cambiar de attended/no_show a otro estado)
- ✅ No descontar si booking estaba cancelled (ya validado por status !== 'booked')

### 3. Actualización de UI: Dialog de Confirmación

**Componente:**
- Dialog con advertencia clara
- Muestra información del booking
- Botones: "Cancelar" y "Sí, marcar No Show"

**Flujo:**
1. Click en "Marcar No Show" → Abre Dialog
2. Dialog muestra advertencia sobre descuento
3. Click "Sí, marcar No Show" → Ejecuta `markAttendance()`
4. Click "Cancelar" → Cierra Dialog sin acción

**Código:**
```typescript
const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
const [selectedStatus, setSelectedStatus] = useState<'attended' | 'no_show' | null>(null)

const handleMarkAttendance = async (bookingId: string, status: 'attended' | 'no_show') => {
  if (status === 'no_show') {
    const booking = bookings.find((b) => b.id === bookingId)
    if (booking) {
      setSelectedBooking(booking)
      setSelectedStatus(status)
      setConfirmDialogOpen(true)
    }
    return
  }
  await executeMarkAttendance(bookingId, status)
}
```

### 4. Actualización de Student Dashboard

**Humanizar reason:**
```typescript
const humanizeReason = (reason: LedgerEntry['reason']): string => {
  switch (reason) {
    case 'payment_approved':
      return 'Pago aprobado'
    case 'manual_adjustment':
      return 'Ajuste manual'
    case 'class_attended':
      return 'Clase asistida'
    case 'class_no_show':
      return 'No asistió a clase'  // Nuevo
    default:
      return reason
  }
}
```

**Actualizar tipo:**
```typescript
type LedgerEntry = {
  id: string
  delta: number
  reason: 'payment_approved' | 'manual_adjustment' | 'class_attended' | 'class_no_show'
  created_at: string
  ref_payment_id: string | null
}
```

### 5. Toast Actualizado

**Mensaje para no-show:**
```typescript
toast({
  title: 'Asistencia marcada',
  description: 'Se registró que el estudiante no asistió y se descontó 1 crédito.',
})
```

## Validaciones

### En Server Action:
1. ✅ Usuario es coach o admin
2. ✅ Booking existe
3. ✅ Slot pertenece al coach (o admin puede todo)
4. ✅ Status actual es 'booked' (no se puede cambiar de attended/no_show)
5. ✅ Idempotencia: no duplicar descuento (validado por status !== 'booked')

### En UI:
1. ✅ Dialog muestra advertencia clara
2. ✅ Confirmación requerida antes de marcar no-show
3. ✅ Toast informa sobre descuento

## Manejo de Errores

- "Este booking ya fue marcado. No se puede cambiar el estado." (si status !== 'booked')
- "No tienes permiso para marcar asistencia en este booking." (si no es coach del slot y no es admin)
- "Error al insertar en credit_ledger" (logeado, no retorna error al usuario)

## UX para +60

- ✅ Dialog claro y accesible
- ✅ Mensaje de advertencia visible (fondo amarillo)
- ✅ Botones grandes (h-14)
- ✅ Texto legible (text-base)
- ✅ Información del booking visible

## Seguridad

### RLS (Row Level Security)
- Coach solo puede marcar en sus propios slots
- Admin puede marcar en cualquier slot
- Validaciones en Server Action antes de insertar ledger

### Auditoría
- `created_by` en ledger entry registra quién marcó el no-show
- Timestamp automático en `created_at`

## Flujo Completo

1. **Coach marca No-Show:**
   - Click en "Marcar No Show"
   - Dialog de confirmación aparece
   - Coach confirma
   - Server Action ejecuta:
     - Actualiza `class_bookings.status = 'no_show'`
     - Inserta en `credit_ledger`: `delta = -1`, `reason = 'class_no_show'`
   - Toast confirma acción
   - Página se recarga

2. **Student ve movimiento:**
   - Dashboard muestra movimiento: "No asistió a clase" con delta -1
   - Balance de créditos se reduce

## Notas Técnicas

### Idempotencia
- Verificamos `booking.status = 'booked'` antes de actualizar
- Si booking ya está `no_show`, no llegamos a insertar ledger
- No hay riesgo de duplicar descuento

### Comparación con Attended
- Ambos descuentan 1 crédito
- Diferencia: `reason` en ledger (`class_attended` vs `class_no_show`)
- Ambos tienen `delta = -1`

### No Descontar si Cancelled
- Validado por `booking.status !== 'booked'`
- Si booking está `cancelled`, no se puede marcar no-show
- No hay riesgo de descontar créditos de bookings cancelados
