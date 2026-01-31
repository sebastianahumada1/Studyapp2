# Pruebas: Slice 2 - Política No-Show con Descuento (HARDENING)

## Pre-requisitos

1. ✅ Schema actualizado con `'class_no_show'` en enum `ledger_reason`
2. ✅ Tener usuario Coach de prueba
3. ✅ Tener estudiante con booking en estado 'booked'
4. ✅ Estudiante debe tener créditos disponibles > 0

## Checklist: Política No-Show

### Test 1: Marcar No-Show Descuenta Créditos

**Pasos:**
1. Autenticarse como Coach
2. Navegar a `/coach/schedule`
3. Encontrar booking con status 'booked'
4. Click en "Marcar No Show"
5. Verificar que aparece Dialog de confirmación con advertencia:
   - "¿Marcar como No Show?"
   - "Esta acción descontará 1 crédito del estudiante."
   - Información del booking (hora, estudiante)
6. Click en "Sí, marcar No Show"
7. Verificar toast: "Se registró que el estudiante no asistió y se descontó 1 crédito."
8. Verificar en DB que:
   - `class_bookings.status = 'no_show'`
   - Existe entrada en `credit_ledger`:
     - `delta = -1`
     - `reason = 'class_no_show'`
     - `student_id = booking.student_id`
     - `created_by = coach.id`

**Resultado esperado:** ✅ No-show descuenta 1 crédito correctamente

---

### Test 2: Idempotencia - No Duplicar Descuento

**Pasos:**
1. Marcar booking como no-show (Test 1)
2. Verificar que booking.status = 'no_show'
3. Intentar marcar no-show de nuevo (si es posible)
4. Verificar que NO se crea segunda entrada en `credit_ledger`
5. Verificar que solo hay 1 entrada con `reason = 'class_no_show'` para ese booking

**Resultado esperado:** ✅ No se duplica descuento (idempotente)

---

### Test 3: No Descontar si Booking Estaba Cancelled

**Pasos:**
1. Crear booking con status 'cancelled'
2. Autenticarse como Coach
3. Navegar a `/coach/schedule`
4. Verificar que booking cancelled NO aparece (solo aparecen booked/attended/no_show)
5. Si aparece, intentar marcar no-show
6. Verificar que retorna error: "Este booking ya fue marcado. No se puede cambiar el estado."

**Resultado esperado:** ✅ No se puede marcar no-show en booking cancelled

---

### Test 4: Solo Coach/Admin Puede Marcar No-Show

**Pasos:**
1. Autenticarse como Student
2. Intentar acceder a `/coach/schedule`
3. Verificar que es redirigido (no puede acceder)
4. Autenticarse como Admin
5. Navegar a `/coach/schedule` (o ruta equivalente)
6. Verificar que puede marcar no-show

**Resultado esperado:** ✅ Solo coach/admin puede marcar no-show

---

### Test 5: Dialog de Confirmación

**Pasos:**
1. Autenticarse como Coach
2. Navegar a `/coach/schedule`
3. Click en "Marcar No Show"
4. Verificar que aparece Dialog con:
   - Título: "¿Marcar como No Show?"
   - Advertencia: "Esta acción descontará 1 crédito del estudiante."
   - Información del booking (hora, estudiante)
   - Botones: "Cancelar" y "Sí, marcar No Show"
5. Click en "Cancelar"
6. Verificar que Dialog se cierra y NO se marca no-show
7. Verificar que NO se descuenta crédito

**Resultado esperado:** ✅ Dialog funcional, cancelar no ejecuta acción

---

### Test 6: Toast de Confirmación

**Pasos:**
1. Marcar booking como no-show
2. Verificar que aparece toast:
   - Título: "Asistencia marcada"
   - Descripción: "Se registró que el estudiante no asistió y se descontó 1 crédito."

**Resultado esperado:** ✅ Toast muestra información correcta

---

### Test 7: Student Dashboard Muestra Movimiento

**Pasos:**
1. Marcar booking como no-show
2. Autenticarse como Student
3. Navegar a `/student`
4. Verificar que en "Últimos Movimientos" aparece:
   - Fecha del movimiento
   - Reason: "No asistió a clase" (humanizado)
   - Delta: -1 (rojo o negativo)
5. Verificar que balance de créditos se redujo en 1

**Resultado esperado:** ✅ Student ve movimiento de no-show en dashboard

---

### Test 8: No Descontar si Booking Ya Estaba No-Show

**Pasos:**
1. Marcar booking como no-show (Test 1)
2. Verificar que booking.status = 'no_show'
3. Recargar página
4. Verificar que booking ya NO muestra botones "Marcar Asistió" / "Marcar No Show"
5. Verificar que solo hay 1 entrada en ledger para ese booking

**Resultado esperado:** ✅ No se puede marcar no-show dos veces

---

### Test 9: Comparar con Attended

**Pasos:**
1. Crear 2 bookings (booked)
2. Marcar uno como 'attended'
3. Marcar otro como 'no_show'
4. Verificar que ambos descuentan 1 crédito:
   - Attended: `reason = 'class_attended'`
   - No-show: `reason = 'class_no_show'`
5. Verificar que ambos tienen `delta = -1`

**Resultado esperado:** ✅ Ambos descuentan créditos correctamente

---

## Checklist: Validaciones

### Test 10: Validación de Status

**Pasos:**
1. Intentar marcar no-show en booking con status 'attended'
2. Verificar que retorna error: "Este booking ya fue marcado. No se puede cambiar el estado."

**Resultado esperado:** ✅ No se puede cambiar de attended a no-show

---

### Test 11: Validación de Ownership

**Pasos:**
1. Coach A crea slot
2. Student reserva slot
3. Coach B intenta marcar no-show
4. Verificar que retorna error: "No tienes permiso para marcar asistencia en este booking."

**Resultado esperado:** ✅ Solo el coach del slot puede marcar no-show

---

### Test 12: Admin Puede Marcar No-Show

**Pasos:**
1. Autenticarse como Admin
2. Navegar a vista de bookings (o usar ruta equivalente)
3. Verificar que puede marcar no-show en cualquier booking
4. Verificar que se descuenta crédito correctamente

**Resultado esperado:** ✅ Admin puede marcar no-show en cualquier booking

---

## Checklist Final

### Funcionalidad
- [ ] No-show descuenta 1 crédito
- [ ] Idempotencia: no duplica descuento
- [ ] No descontar si booking estaba cancelled
- [ ] Solo coach/admin puede marcar no-show
- [ ] Dialog de confirmación funcional
- [ ] Toast muestra información correcta
- [ ] Student dashboard muestra movimiento
- [ ] No se puede marcar no-show dos veces
- [ ] Comparación con attended correcta
- [ ] Validaciones funcionan

### UI/UX
- [ ] Dialog claro y accesible
- [ ] Mensaje de advertencia visible
- [ ] Botones grandes y claros
- [ ] Toast informativo
