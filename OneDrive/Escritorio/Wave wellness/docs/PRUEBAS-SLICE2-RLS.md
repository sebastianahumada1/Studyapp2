# Pruebas: Slice 2 - RLS para coach_slots y class_bookings

## Pre-requisitos

1. ✅ Schema de Slice 2 aplicado (`supabase/schema.sql` o `schema-slice2-additions.sql`)
2. ✅ RLS aplicado (`supabase/rls.sql` actualizado)
3. ✅ Tener usuarios de prueba:
   - Student A (id: student-a-uuid)
   - Coach A (id: coach-a-uuid)
   - Admin (id: admin-uuid)

## Checklist: coach_slots - SELECT

### Test 1: Authenticated Puede Ver Slots Activos

**Pasos:**
1. Autenticarse como Student A
2. Ejecutar query:
   ```sql
   SELECT * FROM coach_slots WHERE active = true;
   ```
3. Verificar que se muestran solo slots con `active = true`
4. Verificar que NO se muestran slots con `active = false`

**Resultado esperado:** ✅ Student puede ver solo slots activos

---

### Test 2: Coach Puede Ver Sus Slots (Activos o No)

**Pasos:**
1. Autenticarse como Coach A
2. Crear slots:
   - Slot 1: `coach_id = coach-a-uuid`, `active = true`
   - Slot 2: `coach_id = coach-a-uuid`, `active = false`
3. Ejecutar query:
   ```sql
   SELECT * FROM coach_slots WHERE coach_id = auth.uid();
   ```
4. Verificar que se muestran ambos slots (activo e inactivo)

**Resultado esperado:** ✅ Coach puede ver todos sus slots

---

### Test 3: Coach NO Puede Ver Slots de Otro Coach

**Pasos:**
1. Autenticarse como Coach A
2. Intentar ver slots de otro coach:
   ```sql
   SELECT * FROM coach_slots WHERE coach_id = 'otro-coach-uuid';
   ```
3. Verificar que NO se muestran slots (o retorna 0 filas)

**Resultado esperado:** ✅ Coach solo ve sus propios slots

---

### Test 4: Admin Puede Ver Todo

**Pasos:**
1. Autenticarse como Admin
2. Ejecutar query:
   ```sql
   SELECT * FROM coach_slots;
   ```
3. Verificar que se muestran todos los slots (de todos los coaches, activos e inactivos)

**Resultado esperado:** ✅ Admin puede ver todos los slots

---

## Checklist: coach_slots - INSERT

### Test 5: Coach Puede Crear Sus Slots

**Pasos:**
1. Autenticarse como Coach A
2. Insertar slot:
   ```sql
   INSERT INTO coach_slots (coach_id, starts_at, ends_at)
   VALUES (
     auth.uid(),
     '2024-01-15 09:00:00+00',
     '2024-01-15 10:00:00+00'
   );
   ```
3. Verificar que se crea correctamente

**Resultado esperado:** ✅ Coach puede crear sus slots

---

### Test 6: Coach NO Puede Crear Slots para Otro Coach

**Pasos:**
1. Autenticarse como Coach A
2. Intentar insertar slot con `coach_id` de otro coach:
   ```sql
   INSERT INTO coach_slots (coach_id, starts_at, ends_at)
   VALUES (
     'otro-coach-uuid',
     '2024-01-15 09:00:00+00',
     '2024-01-15 10:00:00+00'
   );
   ```
3. Verificar que falla con error de permisos

**Resultado esperado:** ❌ Error: "new row violates row-level security policy"

---

### Test 7: Student NO Puede Crear Slots

**Pasos:**
1. Autenticarse como Student A
2. Intentar insertar slot:
   ```sql
   INSERT INTO coach_slots (coach_id, starts_at, ends_at)
   VALUES (
     auth.uid(),
     '2024-01-15 09:00:00+00',
     '2024-01-15 10:00:00+00'
   );
   ```
3. Verificar que falla con error de permisos

**Resultado esperado:** ❌ Error: "new row violates row-level security policy"

---

## Checklist: coach_slots - UPDATE/DELETE

### Test 8: Coach Puede Actualizar Sus Slots

**Pasos:**
1. Autenticarse como Coach A
2. Crear un slot
3. Actualizar slot:
   ```sql
   UPDATE coach_slots
   SET active = false
   WHERE id = 'slot-uuid' AND coach_id = auth.uid();
   ```
4. Verificar que se actualiza correctamente

**Resultado esperado:** ✅ Coach puede actualizar sus slots

---

### Test 9: Coach NO Puede Actualizar Slots de Otro Coach

**Pasos:**
1. Autenticarse como Coach A
2. Intentar actualizar slot de otro coach:
   ```sql
   UPDATE coach_slots
   SET active = false
   WHERE id = 'slot-de-otro-coach-uuid';
   ```
3. Verificar que falla o no actualiza nada

**Resultado esperado:** ❌ Error o 0 filas actualizadas

---

### Test 10: Admin Puede Actualizar/Eliminar Todo

**Pasos:**
1. Autenticarse como Admin
2. Actualizar cualquier slot:
   ```sql
   UPDATE coach_slots SET active = false WHERE id = 'cualquier-slot-uuid';
   ```
3. Eliminar cualquier slot:
   ```sql
   DELETE FROM coach_slots WHERE id = 'cualquier-slot-uuid';
   ```
4. Verificar que funciona

**Resultado esperado:** ✅ Admin puede actualizar/eliminar cualquier slot

---

## Checklist: class_bookings - SELECT

### Test 11: Student Solo Ve Sus Bookings

**Pasos:**
1. Autenticarse como Student A
2. Crear booking para Student A
3. Crear booking para Student B (como admin o desde otro contexto)
4. Ejecutar query:
   ```sql
   SELECT * FROM class_bookings WHERE student_id = auth.uid();
   ```
5. Verificar que solo se muestran bookings de Student A

**Resultado esperado:** ✅ Student solo ve sus bookings

---

### Test 12: Coach Ve Bookings de Sus Slots

**Pasos:**
1. Autenticarse como Coach A
2. Crear slot para Coach A
3. Crear booking en ese slot (Student A)
4. Crear booking en slot de otro coach (Student B)
5. Ejecutar query:
   ```sql
   SELECT * FROM class_bookings
   WHERE slot_id IN (
     SELECT id FROM coach_slots WHERE coach_id = auth.uid()
   );
   ```
6. Verificar que solo se muestran bookings de slots del Coach A

**Resultado esperado:** ✅ Coach ve bookings de sus slots

---

### Test 13: Admin Ve Todos los Bookings

**Pasos:**
1. Autenticarse como Admin
2. Ejecutar query:
   ```sql
   SELECT * FROM class_bookings;
   ```
3. Verificar que se muestran todos los bookings

**Resultado esperado:** ✅ Admin ve todos los bookings

---

## Checklist: class_bookings - INSERT

### Test 14: Student Puede Crear Booking para Sí Mismo

**Pasos:**
1. Autenticarse como Student A
2. Obtener un slot activo
3. Insertar booking:
   ```sql
   INSERT INTO class_bookings (slot_id, student_id, status)
   VALUES ('slot-uuid', auth.uid(), 'booked');
   ```
4. Verificar que se crea correctamente

**Resultado esperado:** ✅ Student puede crear booking para sí mismo

---

### Test 15: Student NO Puede Crear Booking para Otro Student

**Pasos:**
1. Autenticarse como Student A
2. Intentar insertar booking con `student_id` de otro student:
   ```sql
   INSERT INTO class_bookings (slot_id, student_id, status)
   VALUES ('slot-uuid', 'otro-student-uuid', 'booked');
   ```
3. Verificar que falla con error de permisos

**Resultado esperado:** ❌ Error: "new row violates row-level security policy"

---

### Test 16: Coach NO Puede Crear Bookings

**Pasos:**
1. Autenticarse como Coach A
2. Intentar insertar booking:
   ```sql
   INSERT INTO class_bookings (slot_id, student_id, status)
   VALUES ('slot-uuid', 'student-uuid', 'booked');
   ```
3. Verificar que falla con error de permisos

**Resultado esperado:** ❌ Error: "new row violates row-level security policy"

---

## Checklist: class_bookings - UPDATE

### Test 17: Student Puede Cancelar Su Booking

**Pasos:**
1. Autenticarse como Student A
2. Crear booking para Student A
3. Cancelar booking:
   ```sql
   UPDATE class_bookings
   SET status = 'cancelled', cancelled_at = now()
   WHERE id = 'booking-uuid' AND student_id = auth.uid();
   ```
4. Verificar que se actualiza correctamente

**Resultado esperado:** ✅ Student puede cancelar su booking

---

### Test 18: Student NO Puede Cambiar Status a Attended/No_Show

**Pasos:**
1. Autenticarse como Student A
2. Crear booking para Student A
3. Intentar cambiar status a 'attended':
   ```sql
   UPDATE class_bookings
   SET status = 'attended'
   WHERE id = 'booking-uuid' AND student_id = auth.uid();
   ```
4. Verificar que falla o no actualiza

**Resultado esperado:** ❌ Error o status no cambia (solo puede cancelar)

---

### Test 19: Coach Puede Marcar Attended/No_Show en Sus Slots

**Pasos:**
1. Autenticarse como Coach A
2. Crear slot para Coach A
3. Crear booking en ese slot (Student A)
4. Marcar como attended:
   ```sql
   UPDATE class_bookings
   SET status = 'attended'
   WHERE id = 'booking-uuid'
     AND slot_id IN (
       SELECT id FROM coach_slots WHERE coach_id = auth.uid()
     );
   ```
5. Verificar que se actualiza correctamente

**Resultado esperado:** ✅ Coach puede marcar attended/no_show

---

### Test 20: Coach NO Puede Marcar Attended en Slots de Otro Coach

**Pasos:**
1. Autenticarse como Coach A
2. Intentar actualizar booking de slot de otro coach:
   ```sql
   UPDATE class_bookings
   SET status = 'attended'
   WHERE id = 'booking-de-otro-coach-uuid';
   ```
3. Verificar que falla o no actualiza

**Resultado esperado:** ❌ Error o 0 filas actualizadas

---

### Test 21: Admin Puede Actualizar Cualquier Booking

**Pasos:**
1. Autenticarse como Admin
2. Actualizar cualquier booking:
   ```sql
   UPDATE class_bookings
   SET status = 'attended'
   WHERE id = 'cualquier-booking-uuid';
   ```
3. Verificar que funciona

**Resultado esperado:** ✅ Admin puede actualizar cualquier booking

---

## Checklist: Casos Edge

### Test 22: Student NO Puede Reservar Dos Veces el Mismo Slot

**Pasos:**
1. Autenticarse como Student A
2. Crear booking en un slot
3. Intentar crear otro booking en el mismo slot:
   ```sql
   INSERT INTO class_bookings (slot_id, student_id)
   VALUES ('mismo-slot-uuid', auth.uid());
   ```
4. Verificar que falla por constraint UNIQUE

**Resultado esperado:** ❌ Error: "duplicate key value violates unique constraint"

---

### Test 23: Dos Students Pueden Reservar el Mismo Slot

**Pasos:**
1. Autenticarse como Student A
2. Crear booking en un slot
3. Autenticarse como Student B
4. Crear booking en el mismo slot
5. Verificar que ambos bookings se crean correctamente

**Resultado esperado:** ✅ Dos students pueden reservar el mismo slot (hasta capacity = 2)

---

### Test 24: Student NO Puede Ver Bookings de Otros Students

**Pasos:**
1. Autenticarse como Student A
2. Intentar ver bookings de Student B:
   ```sql
   SELECT * FROM class_bookings WHERE student_id = 'student-b-uuid';
   ```
3. Verificar que NO se muestran bookings (o retorna 0 filas)

**Resultado esperado:** ✅ Student solo ve sus bookings

---

## Checklist Final

### coach_slots
- [ ] Authenticated puede ver slots activos
- [ ] Coach puede ver sus slots (activos o no)
- [ ] Coach NO puede ver slots de otros coaches
- [ ] Admin puede ver todo
- [ ] Coach puede crear sus slots
- [ ] Coach NO puede crear slots para otros
- [ ] Student NO puede crear slots
- [ ] Coach puede actualizar/eliminar sus slots
- [ ] Coach NO puede actualizar/eliminar slots de otros
- [ ] Admin puede actualizar/eliminar todo

### class_bookings
- [ ] Student solo ve sus bookings
- [ ] Coach ve bookings de sus slots
- [ ] Admin ve todos los bookings
- [ ] Student puede crear booking para sí mismo
- [ ] Student NO puede crear booking para otros
- [ ] Coach NO puede crear bookings
- [ ] Student puede cancelar su booking
- [ ] Student NO puede cambiar a attended/no_show
- [ ] Coach puede marcar attended/no_show en sus slots
- [ ] Coach NO puede marcar en slots de otros
- [ ] Admin puede actualizar cualquier booking
- [ ] Student NO puede reservar dos veces el mismo slot (constraint)
- [ ] Dos students pueden reservar el mismo slot (hasta capacity)
- [ ] Student NO puede ver bookings de otros
