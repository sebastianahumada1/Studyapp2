# Implementación: Slice 2 - Student "Mis Reservas" + Cancelación (PASO 5)

## Archivos Creados/Modificados

### Archivos Creados:
1. `src/app/(protected)/student/bookings/page.tsx` - Página de Mis Reservas
2. `src/app/(protected)/student/bookings/actions.ts` - Server Action para cancelar
3. `src/app/(protected)/student/bookings/StudentBookingsClient.tsx` - Client Component para interactividad
4. `docs/plan-slice2-student-bookings-cancel.md` - Plan y DoD
5. `docs/PRUEBAS-SLICE2-STUDENT-BOOKINGS.md` - Checklist de pruebas
6. `docs/IMPLEMENTACION-SLICE2-STUDENT-BOOKINGS.md` - Este archivo

## Detalles de Implementación

### 1. Página `/student/bookings`

**Estructura:**
- **Server Component** (`page.tsx`): Carga bookings del student
- **Client Component** (`StudentBookingsClient.tsx`): Maneja interactividad (cancelar)

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

**Información Mostrada:**
- Fecha y hora (starts_at - ends_at) formateadas
- Coach name
- Estado badge (booked/attended/no_show/cancelled)
- Botón "Cancelar Reserva" (condicional)

### 2. Server Action: `cancelBooking`

**Parámetros:**
- `bookingId: string`

**Validaciones:**
1. ✅ Usuario autenticado y es student
2. ✅ Booking existe
3. ✅ Booking pertenece al student
4. ✅ Status es 'booked' (no se puede cancelar attended/no_show)
5. ✅ Faltan >= 6 horas para starts_at

**Lógica:**
1. Obtener booking con slot
2. Verificar ownership (student_id = auth.uid())
3. Verificar status = 'booked'
4. Calcular tiempo hasta starts_at
5. Si faltan < 6 horas, error
6. Update booking:
   - `status = 'cancelled'`
   - `cancelled_at = now()`

**Cálculo de Tiempo:**
```typescript
const slotStart = new Date(booking.coach_slots.starts_at)
const now = new Date()
const hoursUntilStart = (slotStart.getTime() - now.getTime()) / (1000 * 60 * 60)

if (hoursUntilStart < 6) {
  return { success: false, error: 'Solo puedes cancelar reservas con al menos 6 horas de anticipación.' }
}
```

**Manejo de Errores:**
- "No tienes permiso para cancelar esta reserva"
- "Esta reserva ya fue cancelada o completada"
- "Solo puedes cancelar reservas con al menos 6 horas de anticipación"
- "Error al cancelar la reserva"

### 3. UI Components

**Lista de Bookings:**
- Cards grandes con información completa
- Badge de estado por booking
- Botón "Cancelar Reserva" condicional

**Confirm Dialog:**
- Título: "¿Cancelar reserva?"
- Descripción: "Esta acción no se puede deshacer."
- Información del slot (fecha, hora, coach)
- Botones: "No, mantener" y "Sí, cancelar"

**Estados:**
- Loading: Spinner mientras cancela
- Empty: "No tienes reservas"
- Error: Toast con mensaje descriptivo
- Success: Toast + recargar página

### 4. Validaciones en UI

**Función `canCancel()`:**
- Verifica status = 'booked'
- Calcula horas hasta starts_at
- Retorna true si faltan >= 6 horas

**Función `getCancelMessage()`:**
- Retorna mensaje explicativo si no se puede cancelar
- Muestra tiempo restante si faltan < 6 horas

## Validaciones

### En Server Action:
1. ✅ Usuario es student
2. ✅ Booking pertenece al student
3. ✅ Status es 'booked'
4. ✅ Faltan >= 6 horas para starts_at

### En UI:
1. ✅ Solo mostrar botón "Cancelar" si aplica
2. ✅ Mostrar mensaje claro cuando no se puede cancelar
3. ✅ Deshabilitar botón durante loading

## Manejo de Errores

- "No tienes permiso para cancelar esta reserva"
- "Esta reserva ya fue cancelada o completada"
- "Solo puedes cancelar reservas con al menos 6 horas de anticipación"
- "Error al cancelar la reserva"
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
- Student solo ve sus bookings (policy `class_bookings_select_own`)
- Student solo puede actualizar sus bookings (policy `class_bookings_update_own`)

### Validaciones
- Verifica profile antes de queries
- Valida ownership antes de cancelar
- Valida tiempo antes de cancelar
- Valida status antes de cancelar

## Flujo de Datos

1. **Cargar Página:**
   - Server Component → Supabase Server → Query bookings del student
   - Agrupa por estado (opcional)
   - Renderiza lista con Client Component

2. **Cancelar Reserva:**
   - Click "Cancelar Reserva" → Abre Dialog
   - Click "Sí, cancelar" → Server Action → Valida → Actualiza booking
   - Client recibe resultado → Toast → Recarga página

## Notas Técnicas

### Política de Cancelación
- **Regla:** Faltan >= 6 horas para starts_at
- **Configurable:** Se puede cambiar el valor 6 en el código
- **Validación:** Tanto en UI como en Server Action

### No Descuento de Créditos
- En Slice 2, cancelar NO descuenta créditos
- Si se necesita en el futuro, se puede agregar lógica en `cancelBooking()`

### Formateo de Fechas
- Usa `toLocaleDateString` y `toLocaleTimeString` con timezone 'America/Bogota'
- Formato español (es-MX)
