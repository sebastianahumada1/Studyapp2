# Pruebas: Slice 2 - Coach Agenda + Asistencia (PASO 4)

## Pre-requisitos

1. ✅ Schema actualizado con `'class_attended'` en enum `ledger_reason`
2. ✅ RLS aplicado para `coach_slots` y `class_bookings`
3. ✅ Tener usuarios de prueba:
   - Coach A (id: coach-a-uuid)
   - Student A (id: student-a-uuid, con créditos > 0)
   - Student B (id: student-b-uuid, con créditos > 0)
4. ✅ Tener slots creados:
   - Slot 1: Coach A, hoy, activo
   - Slot 2: Coach A, mañana, activo
5. ✅ Tener bookings creados:
   - Booking 1: Student A en Slot 1, status='booked'
   - Booking 2: Student B en Slot 1, status='booked'
   - Booking 3: Student A en Slot 2, status='booked'

## Checklist: Ver Agenda

### Test 1: Ver Bookings de Hoy

**Pasos:**
1. Autenticarse como Coach A
2. Navegar a `/coach/schedule`
3. Verificar que se muestran bookings de hoy
4. Verificar que cada booking muestra:
   - Hora (starts_at - ends_at)
   - Estudiante (full_name)
   - Status badge (booked/attended/no_show)

**Resultado esperado:** ✅ Bookings de hoy listados correctamente

---

### Test 2: Ver Bookings de Mañana

**Pasos:**
1. Autenticarse como Coach A
2. Navegar a `/coach/schedule`
3. Verificar que se muestran bookings de mañana
4. Verificar información completa de cada booking

**Resultado esperado:** ✅ Bookings de mañana listados correctamente

---

### Test 3: Empty State

**Pasos:**
1. Autenticarse como Coach sin bookings
2. Navegar a `/coach/schedule`
3. Verificar que aparece mensaje: "No hay clases programadas"

**Resultado esperado:** ✅ Empty state visible

---

## Checklist: Marcar Asistencia (Attended)

### Test 4: Marcar Asistió - Éxito

**Pasos:**
1. Autenticarse como Coach A
2. Navegar a `/coach/schedule`
3. Encontrar booking con status='booked'
4. Click en botón "Marcar Asistió"
5. Verificar loading state
6. Verificar toast de éxito: "Se registró la asistencia y se descontó 1 crédito"
7. Verificar que página se recarga
8. Verificar que booking ahora muestra status='attended'
9. Verificar que botones desaparecen (solo se puede marcar una vez)

**Resultado esperado:** ✅ Asistencia marcada, booking actualizado, botones desaparecen

---

### Test 5: Verificar Descuento en Ledger

**Pasos:**
1. Después de Test 4, verificar en Supabase:
   ```sql
   SELECT * FROM credit_ledger 
   WHERE student_id = 'student-a-uuid' 
     AND reason = 'class_attended'
     AND delta = -1
   ORDER BY created_at DESC
   LIMIT 1;
   ```
2. Verificar que:
   - `delta = -1`
   - `reason = 'class_attended'`
   - `student_id = student-a-uuid`
   - `created_by = coach-a-uuid`
   - `created_at` es reciente

**Resultado esperado:** ✅ Ledger entry creado correctamente

---

### Test 6: Verificar Créditos del Estudiante

**Pasos:**
1. Después de Test 4, autenticarse como Student A
2. Navegar a `/student`
3. Verificar que créditos disponibles disminuyeron en 1
4. Verificar que en "Últimos movimientos" aparece: "Clase asistida" con delta = -1

**Resultado esperado:** ✅ Créditos actualizados, movimiento visible

---

### Test 7: Idempotencia - No Duplicar Descuento

**Pasos:**
1. Autenticarse como Coach A
2. Navegar a `/coach/schedule`
3. Encontrar booking con status='attended' (ya marcado)
4. Verificar que NO aparecen botones "Marcar Asistió" / "Marcar No Show"
5. Intentar marcar asistencia directamente en DB (si es posible):
   ```sql
   -- Esto no debería ser posible desde la UI, pero verificamos
   ```
6. Verificar que solo existe 1 ledger entry para ese booking

**Resultado esperado:** ✅ No se puede marcar dos veces, no hay descuento duplicado

---

## Checklist: Marcar No Show

### Test 8: Marcar No Show - Éxito

**Pasos:**
1. Autenticarse como Coach A
2. Navegar a `/coach/schedule`
3. Encontrar booking con status='booked'
4. Click en botón "Marcar No Show"
5. Verificar loading state
6. Verificar toast de éxito: "Se registró que el estudiante no asistió"
7. Verificar que página se recarga
8. Verificar que booking ahora muestra status='no_show'
9. Verificar que botones desaparecen

**Resultado esperado:** ✅ No show marcado, booking actualizado

---

### Test 9: No Show NO Descuenta Créditos

**Pasos:**
1. Obtener créditos iniciales del Student A
2. Marcar booking como 'no_show' (Test 8)
3. Verificar en Supabase que NO se creó ledger entry:
   ```sql
   SELECT * FROM credit_ledger 
   WHERE student_id = 'student-a-uuid' 
     AND reason = 'class_attended'
     AND created_at > NOW() - INTERVAL '1 minute';
   ```
4. Verificar que créditos del Student A NO cambiaron

**Resultado esperado:** ✅ No se descuenta crédito por no_show

---

## Checklist: Validaciones

### Test 10: Solo Coach del Slot Puede Marcar

**Pasos:**
1. Crear slot con Coach B (diferente coach)
2. Crear booking en ese slot
3. Autenticarse como Coach A
4. Navegar a `/coach/schedule`
5. Verificar que NO aparece el booking del Coach B
6. Intentar marcar asistencia directamente (si es posible):
   - Debería fallar con error de permisos

**Resultado esperado:** ✅ Solo ve bookings de sus propios slots

---

### Test 11: No Se Puede Cambiar de Attended a No Show

**Pasos:**
1. Marcar booking como 'attended' (Test 4)
2. Verificar que booking muestra status='attended'
3. Verificar que NO aparecen botones para cambiar
4. Intentar cambiar directamente en DB (si es posible):
   ```sql
   -- Esto no debería ser posible desde la UI
   ```

**Resultado esperado:** ✅ No se puede cambiar una vez marcado

---

### Test 12: Error si Booking No Existe

**Pasos:**
1. Autenticarse como Coach A
2. Intentar marcar asistencia con bookingId inexistente
3. Verificar toast de error: "Este booking no existe"

**Resultado esperado:** ✅ Error manejado correctamente

---

## Checklist: UI/UX

### Test 13: Mobile-First

**Pasos:**
1. Abrir `/coach/schedule` en móvil (DevTools)
2. Verificar que:
   - Cards ocupan ancho completo
   - Botones son grandes (>= 48px altura)
   - Texto es legible (>= 16px)
   - Espaciado generoso

**Resultado esperado:** ✅ UI mobile-first correcta

---

### Test 14: Estados de Loading

**Pasos:**
1. Autenticarse como Coach A
2. Navegar a `/coach/schedule`
3. Click en "Marcar Asistió"
4. Verificar que botón muestra "Procesando..." con spinner
5. Verificar que otros botones están deshabilitados

**Resultado esperado:** ✅ Loading state visible durante operación

---

### Test 15: Badges de Status

**Pasos:**
1. Autenticarse como Coach A
2. Navegar a `/coach/schedule`
3. Verificar badges:
   - 'booked': Badge azul "Reservado"
   - 'attended': Badge verde "Asistió" con icono
   - 'no_show': Badge rojo "No asistió" con icono

**Resultado esperado:** ✅ Badges correctos y visibles

---

## Checklist Final

### Funcionalidad
- [ ] Bookings de hoy listados
- [ ] Bookings de mañana listados
- [ ] Empty state visible
- [ ] Marcar asistió funciona
- [ ] Descuento en ledger creado
- [ ] Créditos del estudiante actualizados
- [ ] Idempotencia funciona (no duplica)
- [ ] Marcar no show funciona
- [ ] No show NO descuenta créditos
- [ ] Solo coach del slot puede marcar
- [ ] No se puede cambiar una vez marcado
- [ ] Errores manejados correctamente

### UI/UX
- [ ] Mobile-first correcto
- [ ] Loading states visibles
- [ ] Badges correctos
- [ ] Botones grandes y accesibles
- [ ] Texto legible
