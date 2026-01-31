# Plan: Slice 2 - Coach Agenda + Asistencia con Descuento (PASO 4)

## Definition of Done (DoD)

- [ ] Enum `ledger_reason` actualizado con `'class_attended'`
- [ ] Página `/coach/schedule` muestra bookings de slots del coach (hoy/mañana)
- [ ] Cada booking muestra: estudiante, hora, status
- [ ] Coach puede marcar `attended` o `no_show`
- [ ] Al marcar `attended`:
  - Actualiza `class_bookings.status = 'attended'`
  - Inserta en `credit_ledger`: `delta = -1`, `reason = 'class_attended'`
  - Idempotente: no duplica descuento si ya se marcó `attended`
- [ ] Al marcar `no_show`:
  - Actualiza `class_bookings.status = 'no_show'`
  - NO descuenta créditos (por defecto)
- [ ] Validación: solo coach del slot puede marcar asistencia
- [ ] UI mobile-first +60: botones grandes, texto claro
- [ ] Estados: loading, error, éxito
- [ ] No inventar columnas

## Lista de Archivos a Crear/Modificar

### Archivos a Crear:
1. `supabase/schema-slice2-paso4-additions.sql` - SQL para agregar `class_attended` al enum
2. `src/app/(protected)/coach/schedule/actions.ts` - Server Actions para marcar asistencia
3. `docs/plan-slice2-coach-schedule-attendance.md` - Este archivo
4. `docs/IMPLEMENTACION-SLICE2-COACH-SCHEDULE.md` - Documentación de implementación
5. `docs/PRUEBAS-SLICE2-COACH-SCHEDULE.md` - Checklist de pruebas

### Archivos a Modificar:
1. `supabase/schema.sql` - Agregar `'class_attended'` al enum `ledger_reason`
2. `src/app/(protected)/coach/schedule/page.tsx` - Implementar vista real con bookings
3. `src/app/(protected)/student/page.tsx` - Actualizar `humanizeReason` para incluir `'class_attended'`

## Estructura de Implementación

### 1. Actualizar Schema

**Agregar `'class_attended'` al enum:**
```sql
ALTER TYPE ledger_reason ADD VALUE IF NOT EXISTS 'class_attended';
```

**Nota:** PostgreSQL no permite `DROP VALUE` de enums, así que solo agregamos.

### 2. Página `/coach/schedule`

**Componente:** Server Component (puede ser Client si necesita interactividad)

**Funcionalidades:**
- Cargar bookings de slots del coach (hoy/mañana)
- Agrupar por día (hoy/mañana)
- Mostrar información: estudiante, hora, status
- Botones para marcar `attended` / `no_show`

**Query:**
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

### 3. Server Action: `markAttendance`

**Parámetros:**
- `bookingId: string`
- `status: 'attended' | 'no_show'`

**Validaciones:**
1. Usuario autenticado y es coach
2. Booking existe
3. Slot pertenece al coach (`coach_id = auth.uid()`)
4. Status actual es `'booked'` (no se puede cambiar de `attended` a `no_show` o viceversa)

**Lógica para `attended`:**
1. Actualizar `class_bookings.status = 'attended'`
2. Verificar si ya existe ledger entry para este booking (idempotencia):
   ```sql
   SELECT id FROM credit_ledger 
   WHERE student_id = booking.student_id 
     AND reason = 'class_attended'
     AND ref_booking_id = booking.id  -- Necesitamos agregar esta columna o usar otro método
   ```
3. Si NO existe, insertar en `credit_ledger`:
   - `student_id = booking.student_id`
   - `delta = -1`
   - `reason = 'class_attended'`
   - `created_by = coach.id`
   - `ref_booking_id = booking.id` (si agregamos la columna)

**Nota sobre Idempotencia:**
- Opción 1: Agregar columna `ref_booking_id` a `credit_ledger`
- Opción 2: Usar una combinación única de `student_id`, `reason`, `created_at` (menos preciso)
- Opción 3: Verificar si el booking ya está marcado como `attended` antes de insertar

**Recomendación:** Usar Opción 3 (más simple, no requiere cambios en schema):
- Si `booking.status = 'attended'`, no insertar ledger
- Solo insertar si `booking.status = 'booked'` y estamos marcando como `attended`

**Lógica para `no_show`:**
1. Actualizar `class_bookings.status = 'no_show'`
2. NO insertar en ledger (no descuenta créditos)

### 4. UI Components

**Lista de Bookings:**
- Agrupados por día (hoy/mañana)
- Cada booking: Card con:
  - Hora (starts_at - ends_at)
  - Estudiante (full_name)
  - Status badge (booked/attended/no_show)
  - Botones "Marcar Asistió" / "Marcar No Show" (solo si status = 'booked')

**Estados:**
- Loading: Spinner mientras carga
- Empty: "No hay clases programadas"
- Error: Toast con mensaje
- Success: Toast + recargar página

## Validaciones

### En Server Action:
1. ✅ Usuario es coach
2. ✅ Booking existe
3. ✅ Slot pertenece al coach
4. ✅ Status actual es `'booked'` (solo se puede marcar una vez)
5. ✅ Idempotencia: no duplicar descuento si ya está `attended`

### En UI:
1. ✅ Solo mostrar botones si `status = 'booked'`
2. ✅ Deshabilitar botones si ya está marcado

## Manejo de Errores

- "No tienes permiso para marcar asistencia en este booking"
- "Este booking ya fue marcado"
- "Error al actualizar el booking"
- "Error al registrar el descuento de créditos"

## UX para +60

- ✅ Tarjetas grandes
- ✅ Texto base >= 16px
- ✅ Botones grandes (>= 48px altura)
- ✅ Labels claros
- ✅ Focus-visible ring
- ✅ Espaciado generoso
- ✅ Mobile-first
- ✅ Estados claros

## Seguridad

### RLS
- Coach solo ve bookings de sus slots (policy `class_bookings_select_coach_slots`)
- Coach solo puede actualizar bookings de sus slots (policy `class_bookings_update_coach_slots`)
- Student no puede auto-marcar (solo coach puede actualizar a `attended`/`no_show`)

### Validaciones
- Verifica profile antes de queries
- Valida ownership del slot antes de actualizar
- Idempotencia previene duplicación de descuentos
