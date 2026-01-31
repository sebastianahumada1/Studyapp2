# Plan: Slice 2 - Student Reservar Slots (PASO 3)

## Definition of Done (DoD)

- [ ] Página `/student/book` creada
- [ ] Muestra slots disponibles (activos, futuros) agrupados por día
- [ ] UI mobile-first +60: tarjetas grandes, CTAs claros
- [ ] Banner si créditos <= 0: "Primero debes pagar para agendar" + CTA a /student/payments
- [ ] Cada slot muestra: hora, coach (nombre), cupos disponibles (2 - booked_count)
- [ ] Botón "Reservar" solo si hay cupo y tiene créditos
- [ ] Reserva inserta `class_booking` con `status='booked'`
- [ ] Validación de cupos antes de insertar (booked_count < 2)
- [ ] Manejo de error de concurrencia (slot lleno justo antes)
- [ ] Estados: loading, error, éxito, empty
- [ ] No inventar columnas

## Lista de Archivos a Crear/Modificar

### Archivos a Crear:
1. `src/app/(protected)/student/book/page.tsx` - Página de reserva de slots
2. `src/app/(protected)/student/book/actions.ts` - Server Actions para reservar
3. `docs/plan-slice2-student-book-slots.md` - Este archivo
4. `docs/IMPLEMENTACION-SLICE2-STUDENT-BOOK.md` - Documentación de implementación
5. `docs/PRUEBAS-SLICE2-STUDENT-BOOK.md` - Checklist de pruebas

### Archivos a Modificar:
1. `src/components/ui/NavLinks.tsx` - Agregar link "Agendar" para students
2. `src/components/ui/BottomNav.tsx` - Agregar link "Agendar" para students

## Estructura de Implementación

### 1. Página `/student/book`

**Componente:** Client Component (necesita interactividad)

**Funcionalidades:**
- Cargar slots disponibles (activos, futuros)
- Agrupar por día
- Mostrar créditos disponibles
- Banner si créditos <= 0
- Lista de slots con información
- Botón "Reservar" por slot

**Queries necesarios:**
1. Créditos disponibles: `SUM(delta) FROM credit_ledger WHERE student_id = auth.uid()`
2. Slots disponibles: 
   ```sql
   SELECT cs.*, p.full_name as coach_name
   FROM coach_slots cs
   JOIN profiles p ON cs.coach_id = p.id
   WHERE cs.active = true
     AND cs.starts_at > now()
   ORDER BY cs.starts_at
   ```
3. Booked count por slot: usar función `get_slot_booked_count(slot_id)`

### 2. Server Action: `reserveSlot`

**Validaciones:**
- Usuario autenticado
- Créditos disponibles > 0
- Slot existe y está activo
- Slot es futuro (starts_at > now())
- Cupos disponibles (booked_count < 2)
- No tiene reserva previa en ese slot (constraint UNIQUE)

**Lógica:**
1. Verificar créditos > 0
2. Verificar slot existe, activo, futuro
3. Contar bookings activos (status = 'booked')
4. Si booked_count >= 2, error "Slot lleno"
5. Insertar booking con `status='booked'`
6. Manejar error de constraint UNIQUE (ya reservó)
7. Manejar error de concurrencia (se llenó justo antes)

**Retorno:**
- `{ success: true, bookingId: string }` si éxito
- `{ success: false, error: string }` si error

### 3. UI Components

**Banner de Créditos:**
- Si créditos <= 0: Banner amarillo/rojo con mensaje + CTA a /student/payments
- Si créditos > 0: Banner verde con "Tienes X créditos disponibles"

**Lista de Slots:**
- Agrupados por día (tabs o secciones)
- Cada slot: Card con:
  - Hora (starts_at - ends_at)
  - Coach (full_name)
  - Cupos: "X de 2 disponibles"
  - Botón "Reservar" (disabled si no hay cupo o no tiene créditos)

**Estados:**
- Loading: Skeleton o spinner
- Empty: "No hay slots disponibles"
- Error: Toast con mensaje
- Success: Toast + recargar lista

## Validaciones

### En Server Action:
1. Créditos > 0
2. Slot existe
3. Slot activo
4. Slot futuro
5. Cupos disponibles (booked_count < 2)
6. No tiene reserva previa

### En UI:
1. Deshabilitar botón si créditos <= 0
2. Deshabilitar botón si cupos = 0
3. Mostrar mensaje claro en cada caso

## Manejo de Errores

### Error de Concurrencia:
- Si dos usuarios reservan al mismo tiempo
- Constraint UNIQUE falla o booked_count >= 2
- Mensaje: "Este slot se llenó justo antes. Por favor selecciona otro horario."

### Otros Errores:
- "No tienes créditos suficientes"
- "Este slot ya no está disponible"
- "Ya tienes una reserva en este horario"

## UX para +60

- Tarjetas grandes (mínimo 48px altura)
- Texto base >= 16px
- Botones grandes (>= 48px altura)
- Labels claros
- Focus-visible ring
- Espaciado generoso
- Mobile-first: cards en mobile, puede ser tabla en desktop
- Estados claros (loading, error, éxito)
