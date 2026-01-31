# Plan: Slice 2 - Política No-Show con Descuento (HARDENING)

## Definition of Done (DoD)

- [ ] Enum `ledger_reason` actualizado con `'class_no_show'` (si no existe)
- [ ] Función `markAttendance()` actualizada:
  - Al marcar `no_show`: insertar en `credit_ledger` con `delta = -1`, `reason = 'class_no_show'`
  - Idempotente: no duplicar descuento si ya se marcó `no_show`
  - No descontar si booking ya estaba `cancelled`
- [ ] Validación: solo coach/admin puede marcar `no_show`
- [ ] UI: mensaje claro al coach antes de marcar `no_show`
- [ ] Confirm dialog actualizado con advertencia sobre descuento
- [ ] Auditoría: `created_by` en ledger entry
- [ ] Actualizar `humanizeReason` en student dashboard para incluir `'class_no_show'`
- [ ] Pruebas: no-show descuenta créditos, idempotencia, no descontar si cancelled
- [ ] No inventar columnas

## Lista de Archivos a Crear/Modificar

### Archivos a Crear:
1. `supabase/schema-slice2-no-show-additions.sql` - SQL para agregar `'class_no_show'` al enum
2. `docs/plan-slice2-no-show-policy.md` - Este archivo
3. `docs/IMPLEMENTACION-SLICE2-NO-SHOW-POLICY.md` - Documentación
4. `docs/PRUEBAS-SLICE2-NO-SHOW-POLICY.md` - Checklist de pruebas

### Archivos a Modificar:
1. `supabase/schema.sql` - Agregar `'class_no_show'` al enum `ledger_reason` (si no existe)
2. `src/app/(protected)/coach/schedule/actions.ts` - Actualizar `markAttendance()` para descontar en no_show
3. `src/app/(protected)/coach/schedule/CoachScheduleClient.tsx` - Actualizar UI con mensaje claro
4. `src/app/(protected)/student/page.tsx` - Actualizar `humanizeReason` para `'class_no_show'`

## Estructura de Implementación

### 1. Actualizar Schema

**Agregar `'class_no_show'` al enum:**
```sql
ALTER TYPE ledger_reason ADD VALUE IF NOT EXISTS 'class_no_show';
```

**Nota:** Verificar si ya existe antes de agregar.

### 2. Actualizar Server Action: `markAttendance`

**Lógica para `no_show`:**
1. Actualizar `class_bookings.status = 'no_show'`
2. Verificar que booking NO estaba `cancelled` antes
3. Verificar idempotencia: si ya existe ledger entry para este booking
4. Insertar en `credit_ledger`:
   - `student_id = booking.student_id`
   - `delta = -1`
   - `reason = 'class_no_show'`
   - `created_by = coach.id`

**Idempotencia:**
- Verificar si booking ya estaba `no_show` antes de actualizar
- Si ya estaba `no_show`, no insertar ledger (ya se descontó)
- Alternativa: verificar si existe ledger entry con `reason = 'class_no_show'` para este booking

**Validación:**
- No descontar si booking estaba `cancelled` antes
- Solo coach/admin puede marcar `no_show`

### 3. Actualizar UI

**Confirm Dialog:**
- Mensaje claro: "Al marcar 'No asistió', se descontará 1 crédito del estudiante."
- Información del booking (fecha, hora, estudiante)
- Botones: "Cancelar" y "Sí, marcar No Show"

**Toast:**
- Éxito: "Se registró que el estudiante no asistió y se descontó 1 crédito."

### 4. Actualizar Student Dashboard

**Humanizar reason:**
- `'class_no_show'` → "No asistió a clase"

## Validaciones

### En Server Action:
1. ✅ Usuario es coach o admin
2. ✅ Booking existe
3. ✅ Slot pertenece al coach (o admin)
4. ✅ Status actual es 'booked' (no se puede cambiar de attended a no_show)
5. ✅ Booking NO estaba 'cancelled' antes
6. ✅ Idempotencia: no duplicar descuento

### En UI:
1. ✅ Mensaje claro sobre descuento
2. ✅ Confirm dialog con advertencia

## Manejo de Errores

- "No puedes marcar no-show en un booking cancelado"
- "Este booking ya fue marcado como no-show"
- "Error al registrar el descuento de créditos"

## UX para +60

- ✅ Mensaje claro sobre descuento
- ✅ Confirm dialog con advertencia visible
- ✅ Toast con información completa
- ✅ Estados claros
