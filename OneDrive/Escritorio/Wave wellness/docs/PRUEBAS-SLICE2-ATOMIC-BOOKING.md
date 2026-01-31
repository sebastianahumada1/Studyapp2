# Pruebas: Slice 2 - Reserva Atómica con RPC (PASO 6)

## Pre-requisitos

1. ✅ Schema de Slice 2 aplicado
2. ✅ Función RPC `book_slot()` aplicada (`supabase/rpc-book-slot.sql`)
3. ✅ RLS aplicado
4. ✅ Tener usuarios de prueba:
   - Student A (id: student-a-uuid, con créditos > 0)
   - Student B (id: student-b-uuid, con créditos > 0)
   - Student C (id: student-c-uuid, con créditos > 0)
5. ✅ Tener slot creado:
   - Slot 1: activo, futuro, sin reservas (capacity = 2)

## Checklist: Reserva Atómica

### Test 1: Reserva Exitosa (Primera Reserva)

**Pasos:**
1. Autenticarse como Student A (con créditos > 0)
2. Navegar a `/student/book`
3. Encontrar Slot 1 (sin reservas)
4. Click "Reservar"
5. Verificar toast de éxito
6. Verificar que booking se creó en DB:
   ```sql
   SELECT * FROM class_bookings 
   WHERE slot_id = 'slot-1-uuid' 
     AND student_id = 'student-a-uuid';
   ```
7. Verificar que `status = 'booked'`

**Resultado esperado:** ✅ Primera reserva exitosa

---

### Test 2: Reserva Exitosa (Segunda Reserva)

**Pasos:**
1. Autenticarse como Student B (con créditos > 0)
2. Navegar a `/student/book`
3. Encontrar Slot 1 (1 reserva, 1 cupo disponible)
4. Click "Reservar"
5. Verificar toast de éxito
6. Verificar que booking se creó en DB
7. Verificar que ahora hay 2 bookings para ese slot:
   ```sql
   SELECT COUNT(*) FROM class_bookings 
   WHERE slot_id = 'slot-1-uuid' 
     AND status = 'booked';
   ```
   Debe retornar: 2

**Resultado esperado:** ✅ Segunda reserva exitosa, slot lleno

---

### Test 3: Reserva Fallida (Tercera Reserva - Slot Lleno)

**Pasos:**
1. Autenticarse como Student C (con créditos > 0)
2. Navegar a `/student/book`
3. Encontrar Slot 1 (2 reservas, 0 cupos disponibles)
4. Verificar que botón muestra "Sin cupos" y está deshabilitado
5. Si se intenta reservar de otra forma, verificar toast de error:
   "Este horario ya se llenó"

**Resultado esperado:** ✅ Tercera reserva bloqueada, error claro

---

### Test 4: Concurrencia - 3 Reservas Simultáneas

**Pasos:**
1. Crear slot nuevo (sin reservas)
2. Simular 3 reservas simultáneas:
   - Student A reserva
   - Student B reserva (al mismo tiempo)
   - Student C intenta reservar (al mismo tiempo)
3. Verificar en DB que solo hay 2 bookings:
   ```sql
   SELECT COUNT(*) FROM class_bookings 
   WHERE slot_id = 'slot-nuevo-uuid' 
     AND status = 'booked';
   ```
4. Verificar que Student C recibió error: "Este horario ya se llenó"

**Resultado esperado:** ✅ Solo 2 reservas exitosas, 1 falla

---

### Test 5: Reserva Duplicada (Mismo Student)

**Pasos:**
1. Autenticarse como Student A
2. Reservar Slot 1 (Test 1)
3. Intentar reservar el mismo Slot 1 de nuevo
4. Verificar toast de error: "Ya tienes una reserva en este horario"

**Resultado esperado:** ✅ Error por reserva duplicada

---

### Test 6: Validación - Slot Inactivo

**Pasos:**
1. Crear slot con `active = false`
2. Autenticarse como Student A
3. Intentar reservar ese slot
4. Verificar toast de error: "Este slot ya no está activo"

**Resultado esperado:** ✅ Error por slot inactivo

---

### Test 7: Validación - Slot Pasado

**Pasos:**
1. Crear slot con `starts_at` en el pasado
2. Autenticarse como Student A
3. Intentar reservar ese slot
4. Verificar toast de error: "Este slot ya pasó. Solo puedes reservar slots futuros."

**Resultado esperado:** ✅ Error por slot pasado

---

### Test 8: Validación - Sin Créditos

**Pasos:**
1. Autenticarse como Student sin créditos
2. Navegar a `/student/book`
3. Verificar que aparece banner: "Primero debes pagar para agendar"
4. Verificar que botones están deshabilitados
5. Si se intenta reservar, verificar error: "No tienes créditos disponibles"

**Resultado esperado:** ✅ Error por falta de créditos (validación en Server Action)

---

## Checklist: Funcionalidad RPC

### Test 9: Llamar RPC Directamente

**Pasos:**
1. En Supabase SQL Editor, llamar RPC:
   ```sql
   SELECT book_slot('slot-uuid-here');
   ```
2. Verificar que retorna JSON:
   ```json
   { "success": true, "booking_id": "uuid" }
   ```
3. Verificar que booking se creó en DB

**Resultado esperado:** ✅ RPC funciona correctamente

---

### Test 10: RPC con Slot Lleno

**Pasos:**
1. Llenar slot (2 reservas)
2. En Supabase SQL Editor, llamar RPC:
   ```sql
   SELECT book_slot('slot-lleno-uuid');
   ```
3. Verificar que retorna JSON:
   ```json
   { "success": false, "error": "Este horario ya se llenó." }
   ```

**Resultado esperado:** ✅ RPC retorna error cuando slot está lleno

---

### Test 11: RPC con Booking Duplicado

**Pasos:**
1. Crear booking para Student A en Slot 1
2. En Supabase SQL Editor, llamar RPC como Student A:
   ```sql
   SELECT book_slot('slot-1-uuid');
   ```
3. Verificar que retorna JSON:
   ```json
   { "success": false, "error": "Ya tienes una reserva en este horario." }
   ```

**Resultado esperado:** ✅ RPC retorna error por booking duplicado

---

## Checklist: Transacciones Seguras

### Test 12: SELECT FOR UPDATE Funciona

**Pasos:**
1. Abrir 2 conexiones a Supabase
2. En conexión 1, iniciar transacción:
   ```sql
   BEGIN;
   SELECT * FROM coach_slots WHERE id = 'slot-uuid' FOR UPDATE;
   ```
3. En conexión 2, intentar actualizar el mismo slot (debe esperar)
4. En conexión 1, hacer commit
5. Verificar que conexión 2 puede continuar

**Resultado esperado:** ✅ SELECT FOR UPDATE bloquea correctamente

---

## Checklist Final

### Funcionalidad
- [ ] Primera reserva exitosa
- [ ] Segunda reserva exitosa
- [ ] Tercera reserva bloqueada (slot lleno)
- [ ] Concurrencia manejada correctamente (solo 2 reservas)
- [ ] Reserva duplicada bloqueada
- [ ] Validaciones funcionan (inactivo, pasado)
- [ ] RPC funciona directamente
- [ ] RPC retorna errores correctos
- [ ] SELECT FOR UPDATE bloquea correctamente

### Errores Humanizados
- [ ] "Este horario ya se llenó" (cuando capacity = 2)
- [ ] "Ya tienes una reserva en este horario" (duplicado)
- [ ] "Este slot ya no está activo" (inactivo)
- [ ] "Este slot ya pasó" (pasado)
