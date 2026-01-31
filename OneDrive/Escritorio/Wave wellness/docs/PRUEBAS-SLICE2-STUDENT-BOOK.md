# Pruebas: Slice 2 - Student Reservar Slots (PASO 3)

## Pre-requisitos

1. ✅ Schema de Slice 2 aplicado (`supabase/schema.sql` o `schema-slice2-additions.sql`)
2. ✅ RLS aplicado (`supabase/rls.sql` actualizado)
3. ✅ Tener usuarios de prueba:
   - Student A (id: student-a-uuid, con créditos > 0)
   - Student B (id: student-b-uuid, sin créditos)
   - Coach A (id: coach-a-uuid)
4. ✅ Tener slots creados:
   - Slot 1: Coach A, activo, futuro, sin reservas
   - Slot 2: Coach A, activo, futuro, 1 reserva (Student A)
   - Slot 3: Coach A, activo, futuro, 2 reservas (lleno)

## Checklist: Créditos <= 0

### Test 1: Banner Sin Créditos

**Pasos:**
1. Autenticarse como Student B (sin créditos)
2. Navegar a `/student/book`
3. Verificar que aparece banner amarillo/rojo
4. Verificar mensaje: "Primero debes pagar para agendar"
5. Verificar CTA "Ir a Pagos" -> `/student/payments`

**Resultado esperado:** ✅ Banner visible con mensaje y CTA

---

### Test 2: Botones Deshabilitados Sin Créditos

**Pasos:**
1. Autenticarse como Student B (sin créditos)
2. Navegar a `/student/book`
3. Verificar que todos los botones "Reservar" están deshabilitados
4. Verificar que muestran texto "Sin créditos"

**Resultado esperado:** ✅ Botones deshabilitados y muestran "Sin créditos"

---

## Checklist: Créditos > 0

### Test 3: Banner Con Créditos

**Pasos:**
1. Autenticarse como Student A (con créditos > 0)
2. Navegar a `/student/book`
3. Verificar que aparece banner verde
4. Verificar mensaje: "Tienes X créditos disponibles"

**Resultado esperado:** ✅ Banner verde con cantidad de créditos

---

### Test 4: Lista de Slots Disponibles

**Pasos:**
1. Autenticarse como Student A
2. Navegar a `/student/book`
3. Verificar que se muestran slots:
   - Activos (active = true)
   - Futuros (starts_at > now())
   - Agrupados por día
4. Verificar que cada slot muestra:
   - Hora (starts_at - ends_at)
   - Coach (nombre)
   - Cupos disponibles (X de 2)

**Resultado esperado:** ✅ Slots listados correctamente con información completa

---

### Test 5: Slots Agrupados por Día

**Pasos:**
1. Autenticarse como Student A
2. Navegar a `/student/book`
3. Verificar que slots están agrupados por día
4. Verificar que cada día muestra fecha formateada (ej: "lunes, 15 de enero")

**Resultado esperado:** ✅ Slots agrupados por día con fecha legible

---

## Checklist: Reserva Exitosa

### Test 6: Reservar Slot Disponible

**Pasos:**
1. Autenticarse como Student A (con créditos > 0)
2. Navegar a `/student/book`
3. Encontrar un slot con cupos disponibles (2 - booked_count > 0)
4. Click en botón "Reservar"
5. Verificar loading state (botón muestra "Reservando...")
6. Verificar toast de éxito: "¡Reserva exitosa!"
7. Verificar que la página se recarga
8. Verificar que el slot ahora muestra 1 cupo menos

**Resultado esperado:** ✅ Reserva exitosa, toast de éxito, cupos actualizados

---

### Test 7: Verificar Booking en DB

**Pasos:**
1. Después de Test 6, verificar en Supabase:
   ```sql
   SELECT * FROM class_bookings 
   WHERE student_id = 'student-a-uuid' 
     AND slot_id = 'slot-reservado-uuid';
   ```
2. Verificar que:
   - `status = 'booked'`
   - `student_id = student-a-uuid`
   - `slot_id = slot-reservado-uuid`
   - `created_at` es reciente

**Resultado esperado:** ✅ Booking creado correctamente en DB

---

## Checklist: Validaciones

### Test 8: Slot Lleno (Cupos = 0)

**Pasos:**
1. Autenticarse como Student A
2. Navegar a `/student/book`
3. Encontrar un slot con cupos = 0 (2 reservas)
4. Verificar que botón muestra "Sin cupos"
5. Verificar que botón está deshabilitado
6. Intentar click (no debería hacer nada)

**Resultado esperado:** ✅ Botón deshabilitado y muestra "Sin cupos"

---

### Test 9: Error de Concurrencia (Slot se Llenó Justo Antes)

**Pasos:**
1. Autenticarse como Student A
2. Navegar a `/student/book`
3. Encontrar un slot con 1 cupo disponible
4. En otra pestaña/navegador, autenticarse como Student B
5. Reservar ese slot como Student B (debe llenarse)
6. Volver a Student A y click "Reservar" en el mismo slot
7. Verificar toast de error: "Este slot se llenó justo antes..."

**Resultado esperado:** ✅ Error de concurrencia manejado correctamente

---

### Test 10: Ya Tiene Reserva en ese Slot

**Pasos:**
1. Autenticarse como Student A
2. Reservar un slot (Test 6)
3. Intentar reservar el mismo slot de nuevo
4. Verificar toast de error: "Ya tienes una reserva en este horario"

**Resultado esperado:** ✅ Error por reserva duplicada

---

### Test 11: Slot Pasado (No Futuro)

**Pasos:**
1. Crear un slot con `starts_at` en el pasado (manualmente en DB)
2. Autenticarse como Student A
3. Navegar a `/student/book`
4. Verificar que el slot NO aparece en la lista

**Resultado esperado:** ✅ Slots pasados no se muestran

---

### Test 12: Slot Inactivo

**Pasos:**
1. Crear un slot con `active = false` (manualmente en DB)
2. Autenticarse como Student A
3. Navegar a `/student/book`
4. Verificar que el slot NO aparece en la lista

**Resultado esperado:** ✅ Slots inactivos no se muestran

---

## Checklist: UI/UX

### Test 13: Mobile-First

**Pasos:**
1. Abrir `/student/book` en móvil (DevTools)
2. Verificar que:
   - Cards ocupan ancho completo
   - Botones son grandes (>= 48px altura)
   - Texto es legible (>= 16px)
   - Espaciado generoso

**Resultado esperado:** ✅ UI mobile-first correcta

---

### Test 14: Estados de Loading

**Pasos:**
1. Autenticarse como Student A
2. Navegar a `/student/book`
3. Verificar que aparece spinner mientras carga
4. Después de cargar, verificar que spinner desaparece

**Resultado esperado:** ✅ Loading state visible durante carga

---

### Test 15: Empty State

**Pasos:**
1. Eliminar todos los slots activos (o crear usuario sin slots)
2. Autenticarse como Student A
3. Navegar a `/student/book`
4. Verificar que aparece mensaje: "No hay slots disponibles en este momento"

**Resultado esperado:** ✅ Empty state visible cuando no hay slots

---

## Checklist: Navegación

### Test 16: Link en Sidebar

**Pasos:**
1. Autenticarse como Student A
2. Verificar que en Sidebar aparece link "Agendar" -> `/student/book`
3. Click en link
4. Verificar que navega a `/student/book`

**Resultado esperado:** ✅ Link en Sidebar funciona

---

### Test 17: Link en BottomNav

**Pasos:**
1. Autenticarse como Student A
2. En móvil, verificar que en BottomNav aparece link "Agendar" -> `/student/book`
3. Click en link
4. Verificar que navega a `/student/book`

**Resultado esperado:** ✅ Link en BottomNav funciona

---

## Checklist Final

### Funcionalidad
- [ ] Banner sin créditos visible y funcional
- [ ] Banner con créditos visible
- [ ] Slots listados correctamente
- [ ] Slots agrupados por día
- [ ] Reserva exitosa funciona
- [ ] Booking creado en DB
- [ ] Validación de cupos funciona
- [ ] Error de concurrencia manejado
- [ ] Error de reserva duplicada manejado
- [ ] Slots pasados no se muestran
- [ ] Slots inactivos no se muestran

### UI/UX
- [ ] Mobile-first correcto
- [ ] Loading states visibles
- [ ] Empty state visible
- [ ] Botones grandes y accesibles
- [ ] Texto legible

### Navegación
- [ ] Link en Sidebar funciona
- [ ] Link en BottomNav funciona
