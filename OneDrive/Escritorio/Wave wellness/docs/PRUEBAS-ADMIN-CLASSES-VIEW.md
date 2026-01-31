# Pruebas: Admin Vista Global de Clases (PASO 7)

## Pre-requisitos

1. ✅ Schema de Slice 2 aplicado
2. ✅ RLS aplicado (admin ve todo)
3. ✅ Tener usuario Admin de prueba
4. ✅ Tener coaches con slots creados
5. ✅ Tener estudiantes con bookings en diferentes estados

## Checklist: Vista Global

### Test 1: Ver Clases de Semana Actual

**Pasos:**
1. Autenticarse como Admin
2. Navegar a `/admin/classes`
3. Verificar que se muestran slots de la semana actual (lunes a domingo)
4. Verificar que aparece selector de semana con rango de fechas
5. Verificar que aparece resumen: "X clases • Y reservas"

**Resultado esperado:** ✅ Slots de semana actual listados

---

### Test 2: Acordeón por Día

**Pasos:**
1. Autenticarse como Admin
2. Navegar a `/admin/classes`
3. Verificar que slots están agrupados por día en acordeón
4. Verificar que cada día muestra:
   - Nombre del día (Lunes, Martes, etc.)
   - Cantidad de slots: "X clases"
5. Click en un día para expandir
6. Verificar que se expande y muestra slots del día

**Resultado esperado:** ✅ Acordeón funcional, slots agrupados por día

---

### Test 3: Información por Slot

**Pasos:**
1. Autenticarse como Admin
2. Navegar a `/admin/classes`
3. Expandir un día con slots
4. Verificar que cada slot muestra:
   - Hora: "09:00 - 10:00"
   - Coach: "Nombre del Coach"
   - Ocupación: "X / 2" (booked_count / capacity)
   - Breakdown de estados (badges con counts)
   - Lista de alumnos (nombre + teléfono)

**Resultado esperado:** ✅ Información completa por slot

---

### Test 4: Breakdown de Estados

**Pasos:**
1. Autenticarse como Admin
2. Navegar a `/admin/classes`
3. Encontrar slot con bookings de diferentes estados
4. Verificar badges:
   - "Reservadas: X" (azul, si hay booked)
   - "Asistieron: Y" (verde, si hay attended)
   - "Canceladas: Z" (gris, si hay cancelled)
   - "No asistieron: W" (rojo, si hay no_show)

**Resultado esperado:** ✅ Breakdown de estados visible y correcto

---

### Test 5: Lista de Alumnos

**Pasos:**
1. Autenticarse como Admin
2. Navegar a `/admin/classes`
3. Expandir slot con bookings
4. Verificar que lista de alumnos muestra:
   - Nombre del estudiante
   - Teléfono del estudiante
   - Badge de estado (booked/cancelled/attended/no_show)

**Resultado esperado:** ✅ Lista de alumnos completa

---

### Test 6: Ocupación Correcta

**Pasos:**
1. Crear slot con 2 bookings (booked)
2. Autenticarse como Admin
3. Navegar a `/admin/classes`
4. Verificar que muestra "2 / 2" ocupados
5. Crear slot con 1 booking (booked)
6. Verificar que muestra "1 / 2" ocupados

**Resultado esperado:** ✅ Ocupación calculada correctamente

---

### Test 7: Empty State

**Pasos:**
1. Eliminar todos los slots de la semana actual (o usar semana sin slots)
2. Autenticarse como Admin
3. Navegar a `/admin/classes`
4. Verificar que aparece empty state:
   - Icono Calendar
   - Mensaje: "No hay clases programadas para esta semana"
   - Texto: "Las clases aparecerán aquí cuando los coaches configuren su disponibilidad."

**Resultado esperado:** ✅ Empty state visible

---

### Test 8: Día Sin Slots

**Pasos:**
1. Autenticarse como Admin
2. Navegar a `/admin/classes`
3. Verificar que días sin slots NO aparecen en el acordeón
4. Solo aparecen días con al menos 1 slot

**Resultado esperado:** ✅ Solo días con slots aparecen

---

## Checklist: RLS

### Test 9: Admin Ve Todo

**Pasos:**
1. Autenticarse como Admin
2. Navegar a `/admin/classes`
3. Verificar que ve slots de todos los coaches
4. Verificar que ve bookings de todos los estudiantes

**Resultado esperado:** ✅ Admin ve todo (RLS correcto)

---

### Test 10: Student No Puede Acceder

**Pasos:**
1. Autenticarse como Student
2. Intentar navegar a `/admin/classes`
3. Verificar que es redirigido a `/admin` o `/student`

**Resultado esperado:** ✅ Student no puede acceder

---

## Checklist: UI/UX

### Test 11: Mobile-First

**Pasos:**
1. Abrir `/admin/classes` en móvil (DevTools)
2. Verificar que:
   - Acordeón es fácil de usar
   - Cards ocupan ancho completo
   - Texto es legible (>= 16px)
   - Botones son grandes (>= 48px)
   - Espaciado generoso

**Resultado esperado:** ✅ UI mobile-first correcta

---

### Test 12: Acordeón Funcional

**Pasos:**
1. Autenticarse como Admin
2. Navegar a `/admin/classes`
3. Verificar que acordeón:
   - Se puede expandir/colapsar
   - Solo un día expandido a la vez (o múltiples, según configuración)
   - Animación suave

**Resultado esperado:** ✅ Acordeón funcional y accesible

---

## Checklist Final

### Funcionalidad
- [ ] Slots de semana actual listados
- [ ] Acordeón por día funcional
- [ ] Información completa por slot
- [ ] Breakdown de estados correcto
- [ ] Lista de alumnos visible
- [ ] Ocupación calculada correctamente
- [ ] Empty state visible
- [ ] Días sin slots no aparecen
- [ ] Admin ve todo (RLS)
- [ ] Student no puede acceder

### UI/UX
- [ ] Mobile-first correcto
- [ ] Acordeón funcional y accesible
- [ ] Texto legible
- [ ] Botones grandes
- [ ] Espaciado generoso
