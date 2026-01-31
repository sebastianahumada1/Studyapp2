# Implementación: Slice 2 - Coach Agenda + Asistencia (PASO 4)

## Archivos Creados/Modificados

### Archivos Creados:
1. `supabase/schema-slice2-paso4-additions.sql` - SQL para agregar `'class_attended'` al enum
2. `src/app/(protected)/coach/schedule/actions.ts` - Server Actions para marcar asistencia
3. `src/app/(protected)/coach/schedule/CoachScheduleClient.tsx` - Client Component para interactividad
4. `docs/plan-slice2-coach-schedule-attendance.md` - Plan y DoD
5. `docs/PRUEBAS-SLICE2-COACH-SCHEDULE.md` - Checklist de pruebas
6. `docs/IMPLEMENTACION-SLICE2-COACH-SCHEDULE.md` - Este archivo

### Archivos Modificados:
1. `supabase/schema.sql` - Agregado `'class_attended'` al enum `ledger_reason`
2. `src/app/(protected)/coach/schedule/page.tsx` - Implementación completa con bookings reales
3. `src/app/(protected)/student/page.tsx` - Actualizado `humanizeReason` para incluir `'class_attended'`

## Detalles de Implementación

### 1. Actualización del Schema

**Agregar `'class_attended'` al enum:**
```sql
ALTER TYPE ledger_reason ADD VALUE IF NOT EXISTS 'class_attended';
```

**Archivo separado:** `supabase/schema-slice2-paso4-additions.sql` para aplicar solo este cambio.

**Schema principal:** `supabase/schema.sql` actualizado con el nuevo valor en el enum.

### 2. Página `/coach/schedule`

**Estructura:**
- **Server Component** (`page.tsx`): Carga bookings del coach
- **Client Component** (`CoachScheduleClient.tsx`): Maneja interactividad (marcar asistencia)

**Query de Bookings:**
```sql
SELECT 
  cb.id,
  cb.status,
  cb.created_at,
  cs.starts_at,
  cs.ends_at,
  p.full_name as student_name,
  p.id as student_id
FROM class_bookings cb
JOIN coach_slots cs ON cb.slot_id = cs.id
JOIN profiles p ON cb.student_id = p.id
WHERE cs.coach_id = auth.uid()
  AND cs.starts_at >= CURRENT_DATE
  AND cs.starts_at < CURRENT_DATE + INTERVAL '2 days'
  AND cb.status IN ('booked', 'attended', 'no_show')
ORDER BY cs.starts_at
```

**Agrupación:**
- Bookings de hoy
- Bookings de mañana
- Empty state si no hay bookings

### 3. Server Action: `markAttendance`

**Parámetros:**
- `bookingId: string`
- `status: 'attended' | 'no_show'`

**Validaciones:**
1. ✅ Usuario autenticado y es coach
2. ✅ Booking existe
3. ✅ Slot pertenece al coach (`coach_id = auth.uid()`)
4. ✅ Status actual es `'booked'` (solo se puede marcar una vez)

**Lógica para `attended`:**
1. Actualizar `class_bookings.status = 'attended'`
2. Insertar en `credit_ledger`:
   - `student_id = booking.student_id`
   - `delta = -1`
   - `reason = 'class_attended'`
   - `created_by = coach.id`

**Idempotencia:**
- Verificamos que `booking.status = 'booked'` antes de actualizar
- Si el booking ya está `'attended'`, no llegamos a insertar el ledger
- No hay riesgo de duplicación porque solo se puede marcar una vez

**Lógica para `no_show`:**
1. Actualizar `class_bookings.status = 'no_show'`
2. NO insertar en ledger (no descuenta créditos)

### 4. UI Components

**Lista de Bookings:**
- Agrupados por día (hoy/mañana)
- Cada booking: Card con:
  - Hora (starts_at - ends_at) formateada
  - Estudiante (full_name)
  - Status badge (booked/attended/no_show)
  - Botones "Marcar Asistió" / "Marcar No Show" (solo si `status = 'booked'`)

**Badges de Status:**
- `'booked'`: Badge azul "Reservado"
- `'attended'`: Badge verde "Asistió" con icono CheckCircle2
- `'no_show'`: Badge rojo "No asistió" con icono XCircle

**Estados:**
- Loading: Spinner mientras marca asistencia
- Empty: "No hay clases programadas"
- Error: Toast con mensaje descriptivo
- Success: Toast + recargar página

## Validaciones

### En Server Action:
1. ✅ Usuario es coach
2. ✅ Booking existe
3. ✅ Slot pertenece al coach
4. ✅ Status actual es `'booked'` (solo se puede marcar una vez)
5. ✅ Idempotencia: no duplicar descuento (verificamos status antes de actualizar)

### En UI:
1. ✅ Solo mostrar botones si `status = 'booked'`
2. ✅ Deshabilitar botones durante loading

## Manejo de Errores

- "No tienes permiso para marcar asistencia en este booking"
- "Este booking ya fue marcado. No se puede cambiar el estado."
- "Error al actualizar el booking"
- "Error inesperado. Por favor intenta de nuevo."

## UX para +60

- ✅ Tarjetas grandes
- ✅ Texto base >= 16px
- ✅ Botones grandes (h-14, >= 56px)
- ✅ Labels claros
- ✅ Focus-visible ring
- ✅ Espaciado generoso
- ✅ Mobile-first: cards en mobile, layout flexible en desktop
- ✅ Estados claros (loading, error, éxito)

## Seguridad

### RLS (Row Level Security)
- Coach solo ve bookings de sus slots (policy `class_bookings_select_coach_slots`)
- Coach solo puede actualizar bookings de sus slots (policy `class_bookings_update_coach_slots`)
- Student no puede auto-marcar (solo coach puede actualizar a `attended`/`no_show`)

### Validaciones
- Verifica profile antes de queries
- Valida ownership del slot antes de actualizar
- Idempotencia previene duplicación de descuentos

## Flujo de Datos

1. **Cargar Página:**
   - Server Component → Supabase Server → Query bookings del coach
   - Agrupa por día (hoy/mañana)
   - Renderiza lista con Client Component

2. **Marcar Asistencia:**
   - Click botón → Server Action → Valida → Actualiza booking
   - Si `attended`: Inserta en ledger
   - Client recibe resultado → Toast → Recarga página

## Notas Técnicas

### Idempotencia
- Verificamos `booking.status = 'booked'` antes de actualizar
- Si ya está `'attended'`, no llegamos a insertar el ledger
- No hay riesgo de duplicación porque el flujo es lineal

### Tracking de Bookings
- Actualmente no tenemos `ref_booking_id` en `credit_ledger`
- Para tracking más preciso, podríamos agregar esa columna en el futuro
- Por ahora, confiamos en que el flujo es correcto (status = 'booked' → 'attended')

### Manejo de Errores en Ledger
- Si el insert del ledger falla después de actualizar el booking, solo logueamos el error
- El booking queda marcado como `'attended'` pero sin descuento
- En producción, podríamos implementar un job de compensación o alerta

## Actualización en Student Dashboard

**Cambio en `humanizeReason`:**
- Agregado caso `'class_attended'` → "Clase asistida"
- Actualizado tipo `LedgerEntry` para incluir `'class_attended'`
