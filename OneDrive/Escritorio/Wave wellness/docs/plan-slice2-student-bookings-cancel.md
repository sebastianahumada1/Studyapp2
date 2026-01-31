# Plan: Slice 2 - Student "Mis Reservas" + Cancelación (PASO 5)

## Definition of Done (DoD)

- [ ] Página `/student/bookings` creada
- [ ] Query de bookings del student con join a coach_slots y profiles(coach)
- [ ] Lista muestra: fecha/hora, coach name, estado badge
- [ ] Botón "Cancelar" solo si aplica (status='booked' y faltan >= 6 horas)
- [ ] Server Action `cancelBooking()` con validaciones:
  - Solo student puede cancelar sus bookings
  - Status debe ser 'booked'
  - Faltan >= 6 horas para starts_at
  - No permitir si ya está attended/no_show
- [ ] Update booking: status='cancelled', cancelled_at=now()
- [ ] Confirm dialog "¿Cancelar reserva?"
- [ ] Toast éxito/error
- [ ] Empty state cuando no hay reservas
- [ ] UI mobile-first +60: tarjetas grandes, botones grandes, estados claros
- [ ] No inventar columnas

## Lista de Archivos a Crear/Modificar

### Archivos a Crear:
1. `src/app/(protected)/student/bookings/page.tsx` - Página de Mis Reservas
2. `src/app/(protected)/student/bookings/actions.ts` - Server Action para cancelar
3. `docs/plan-slice2-student-bookings-cancel.md` - Este archivo
4. `docs/IMPLEMENTACION-SLICE2-STUDENT-BOOKINGS.md` - Documentación
5. `docs/PRUEBAS-SLICE2-STUDENT-BOOKINGS.md` - Checklist de pruebas

### Archivos a Modificar:
1. `src/components/ui/NavLinks.tsx` - Agregar link "Mis Reservas" (opcional)
2. `src/components/ui/BottomNav.tsx` - Agregar link "Mis Reservas" (opcional)

## Estructura de Implementación

### 1. Página `/student/bookings`

**Componente:** Server Component (puede ser Client si necesita interactividad)

**Query:**
```sql
SELECT 
  cb.id,
  cb.status,
  cb.created_at,
  cb.cancelled_at,
  cs.starts_at,
  cs.ends_at,
  p.full_name as coach_name,
  p.id as coach_id
FROM class_bookings cb
JOIN coach_slots cs ON cb.slot_id = cs.id
JOIN profiles p ON cs.coach_id = p.id
WHERE cb.student_id = auth.uid()
ORDER BY cs.starts_at DESC
```

**Agrupación:**
- Por estado: Próximas (booked, futuras), Pasadas (attended, no_show), Canceladas
- O simplemente ordenar por fecha (próximas primero)

**Información a Mostrar:**
- Fecha y hora (starts_at - ends_at)
- Coach name
- Estado badge (booked/attended/no_show/cancelled)
- Botón "Cancelar" (solo si status='booked' y faltan >= 6 horas)

### 2. Server Action: `cancelBooking`

**Parámetros:**
- `bookingId: string`

**Validaciones:**
1. Usuario autenticado y es student
2. Booking existe y pertenece al student
3. Status actual es 'booked' (no se puede cancelar attended/no_show)
4. Faltan >= 6 horas para starts_at del slot

**Lógica:**
1. Obtener booking con slot
2. Verificar ownership (student_id = auth.uid())
3. Verificar status = 'booked'
4. Calcular tiempo hasta starts_at
5. Si faltan < 6 horas, error
6. Update booking:
   - `status = 'cancelled'`
   - `cancelled_at = now()`

**Manejo de Errores:**
- "No puedes cancelar esta reserva"
- "Solo puedes cancelar reservas con al menos 6 horas de anticipación"
- "Esta reserva ya fue cancelada o completada"
- "Error al cancelar la reserva"

### 3. UI Components

**Lista de Bookings:**
- Cards grandes con información
- Badge de estado
- Botón "Cancelar" condicional

**Confirm Dialog:**
- "¿Estás seguro de cancelar esta reserva?"
- Información del slot (fecha, hora, coach)
- Botones: "Cancelar" y "Confirmar"

**Estados:**
- Loading: Spinner mientras cancela
- Empty: "No tienes reservas"
- Error: Toast con mensaje
- Success: Toast + recargar página

### 4. Cálculo de Tiempo

**Validación en Server Action:**
```typescript
const slotStart = new Date(booking.coach_slots.starts_at)
const now = new Date()
const hoursUntilStart = (slotStart.getTime() - now.getTime()) / (1000 * 60 * 60)

if (hoursUntilStart < 6) {
  return { success: false, error: 'Solo puedes cancelar reservas con al menos 6 horas de anticipación.' }
}
```

**Mostrar en UI (opcional):**
- "Puedes cancelar hasta 6 horas antes"
- Mostrar tiempo restante si es < 6 horas

## Validaciones

### En Server Action:
1. ✅ Usuario es student
2. ✅ Booking pertenece al student
3. ✅ Status es 'booked'
4. ✅ Faltan >= 6 horas para starts_at

### En UI:
1. ✅ Solo mostrar botón "Cancelar" si aplica
2. ✅ Deshabilitar botón si faltan < 6 horas
3. ✅ Mostrar mensaje claro cuando no se puede cancelar

## UX para +60

- ✅ Tarjetas grandes
- ✅ Texto base >= 16px
- ✅ Botones grandes (>= 48px altura)
- ✅ Labels claros
- ✅ Focus-visible ring
- ✅ Espaciado generoso
- ✅ Mobile-first
- ✅ Estados claros (loading, error, éxito, empty)

## Seguridad

### RLS
- Student solo ve sus bookings (policy `class_bookings_select_own`)
- Student solo puede actualizar sus bookings (policy `class_bookings_update_own`)

### Validaciones
- Verifica profile antes de queries
- Valida ownership antes de cancelar
- Valida tiempo antes de cancelar
