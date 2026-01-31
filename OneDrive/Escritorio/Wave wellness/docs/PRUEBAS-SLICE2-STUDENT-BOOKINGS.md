# Pruebas: Slice 2 - Student "Mis Reservas" + Cancelación (PASO 5)

## Pre-requisitos

1. ✅ Schema de Slice 2 aplicado (tabla `class_bookings` existe)
2. ✅ RLS aplicado para `class_bookings`
3. ✅ Tener usuario Student de prueba (id: student-uuid)
4. ✅ Tener bookings creados:
   - Booking 1: Student, status='booked', starts_at en 8 horas (puede cancelar)
   - Booking 2: Student, status='booked', starts_at en 4 horas (NO puede cancelar)
   - Booking 3: Student, status='attended' (NO puede cancelar)
   - Booking 4: Student, status='cancelled' (NO puede cancelar)

## Checklist: Ver Mis Reservas

### Test 1: Lista de Reservas

**Pasos:**
1. Autenticarse como Student
2. Navegar a `/student/bookings`
3. Verificar que se muestran todas las reservas del student
4. Verificar que cada reserva muestra:
   - Fecha y hora (starts_at - ends_at)
   - Coach name
   - Estado badge (booked/attended/no_show/cancelled)

**Resultado esperado:** ✅ Reservas listadas correctamente

---

### Test 2: Empty State

**Pasos:**
1. Autenticarse como Student sin bookings
2. Navegar a `/student/bookings`
3. Verificar que aparece empty state:
   - Icono Calendar
   - Mensaje: "No tienes reservas"
   - Texto: "Cuando reserves una clase, aparecerá aquí."

**Resultado esperado:** ✅ Empty state visible

---

### Test 3: Badges de Estado

**Pasos:**
1. Autenticarse como Student con bookings de diferentes estados
2. Navegar a `/student/bookings`
3. Verificar badges:
   - 'booked': Badge azul "Reservada" con icono Calendar
   - 'attended': Badge verde "Asistió" con icono CheckCircle2
   - 'no_show': Badge rojo "No asistió" con icono AlertCircle
   - 'cancelled': Badge gris "Cancelada" con icono XCircle

**Resultado esperado:** ✅ Badges correctos y visibles

---

## Checklist: Cancelar Reserva

### Test 4: Cancelar - Éxito (>= 6 horas)

**Pasos:**
1. Autenticarse como Student
2. Navegar a `/student/bookings`
3. Encontrar booking con status='booked' y faltan >= 6 horas
4. Verificar que aparece botón "Cancelar Reserva"
5. Click en botón
6. Verificar que se abre Dialog de confirmación:
   - Título: "¿Cancelar reserva?"
   - Información del slot (fecha, hora, coach)
   - Botones: "No, mantener" y "Sí, cancelar"
7. Click "Sí, cancelar"
8. Verificar loading state
9. Verificar toast de éxito: "Reserva cancelada"
10. Verificar que página se recarga
11. Verificar que booking ahora muestra status='cancelled'
12. Verificar que botón "Cancelar Reserva" desaparece

**Resultado esperado:** ✅ Cancelación exitosa, booking actualizado

---

### Test 5: Verificar Cancelación en DB

**Pasos:**
1. Después de Test 4, verificar en Supabase:
   ```sql
   SELECT * FROM class_bookings 
   WHERE id = 'booking-cancelado-uuid';
   ```
2. Verificar que:
   - `status = 'cancelled'`
   - `cancelled_at` es reciente (no NULL)

**Resultado esperado:** ✅ Booking actualizado correctamente en DB

---

### Test 6: No Cancelar si Faltan < 6 Horas

**Pasos:**
1. Autenticarse como Student
2. Navegar a `/student/bookings`
3. Encontrar booking con status='booked' y faltan < 6 horas
4. Verificar que NO aparece botón "Cancelar Reserva"
5. Verificar que aparece mensaje: "Solo puedes cancelar con al menos 6 horas de anticipación. Faltan Xh Ym."

**Resultado esperado:** ✅ Botón no visible, mensaje claro

---

### Test 7: No Cancelar si ya está Attended

**Pasos:**
1. Autenticarse como Student
2. Navegar a `/student/bookings`
3. Encontrar booking con status='attended'
4. Verificar que NO aparece botón "Cancelar Reserva"
5. Verificar que aparece mensaje: "Esta reserva ya fue cancelada o completada."

**Resultado esperado:** ✅ Botón no visible, mensaje claro

---

### Test 8: No Cancelar si ya está Cancelled

**Pasos:**
1. Autenticarse como Student
2. Navegar a `/student/bookings`
3. Encontrar booking con status='cancelled'
4. Verificar que NO aparece botón "Cancelar Reserva"
5. Verificar que aparece mensaje: "Esta reserva ya fue cancelada o completada."

**Resultado esperado:** ✅ Botón no visible, mensaje claro

---

### Test 9: No Cancelar si ya está No Show

**Pasos:**
1. Autenticarse como Student
2. Navegar a `/student/bookings`
3. Encontrar booking con status='no_show'
4. Verificar que NO aparece botón "Cancelar Reserva"
5. Verificar que aparece mensaje: "Esta reserva ya fue cancelada o completada."

**Resultado esperado:** ✅ Botón no visible, mensaje claro

---

### Test 10: Validación en Server Action - Tiempo Insuficiente

**Pasos:**
1. Crear booking con faltan 4 horas (manualmente en DB si es necesario)
2. Autenticarse como Student
3. Intentar cancelar directamente (si es posible desde UI)
4. Verificar toast de error: "Solo puedes cancelar reservas con al menos 6 horas de anticipación."

**Resultado esperado:** ✅ Error por tiempo insuficiente

---

### Test 11: Validación en Server Action - No es Owner

**Pasos:**
1. Autenticarse como Student A
2. Intentar cancelar booking de Student B (si es posible)
3. Verificar toast de error: "No tienes permiso para cancelar esta reserva."

**Resultado esperado:** ✅ Error por ownership

---

### Test 12: Confirm Dialog - Cancelar Acción

**Pasos:**
1. Autenticarse como Student
2. Navegar a `/student/bookings`
3. Click "Cancelar Reserva"
4. Verificar que Dialog se abre
5. Click "No, mantener"
6. Verificar que Dialog se cierra
7. Verificar que booking NO se cancela

**Resultado esperado:** ✅ Dialog funcional, cancelación no ejecutada

---

## Checklist: UI/UX

### Test 13: Mobile-First

**Pasos:**
1. Abrir `/student/bookings` en móvil (DevTools)
2. Verificar que:
   - Cards ocupan ancho completo
   - Botones son grandes (>= 48px altura)
   - Texto es legible (>= 16px)
   - Espaciado generoso

**Resultado esperado:** ✅ UI mobile-first correcta

---

### Test 14: Estados de Loading

**Pasos:**
1. Autenticarse como Student
2. Navegar a `/student/bookings`
3. Click "Cancelar Reserva"
4. Click "Sí, cancelar"
5. Verificar que botón muestra "Cancelando..." con spinner
6. Verificar que botones están deshabilitados durante loading

**Resultado esperado:** ✅ Loading state visible

---

### Test 15: Orden de Reservas

**Pasos:**
1. Autenticarse como Student con múltiples bookings
2. Navegar a `/student/bookings`
3. Verificar que reservas están ordenadas por fecha (más recientes primero)

**Resultado esperado:** ✅ Reservas ordenadas correctamente

---

## Checklist Final

### Funcionalidad
- [ ] Lista de reservas visible
- [ ] Empty state visible
- [ ] Badges de estado correctos
- [ ] Cancelar funciona (>= 6 horas)
- [ ] Booking actualizado en DB
- [ ] No cancelar si faltan < 6 horas
- [ ] No cancelar si ya está attended
- [ ] No cancelar si ya está cancelled
- [ ] No cancelar si ya está no_show
- [ ] Validaciones en Server Action funcionan
- [ ] Confirm dialog funcional
- [ ] Reservas ordenadas correctamente

### UI/UX
- [ ] Mobile-first correcto
- [ ] Loading states visibles
- [ ] Botones grandes y accesibles
- [ ] Texto legible
- [ ] Mensajes claros
