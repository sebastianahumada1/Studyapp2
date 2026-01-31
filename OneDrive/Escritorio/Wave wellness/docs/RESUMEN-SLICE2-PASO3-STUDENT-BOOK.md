# Resumen: Slice 2 - PASO 3 - Student Reservar Slots

## ✅ Implementación Completa

### Archivos Creados

1. **`src/app/(protected)/student/book/page.tsx`**
   - Página Client Component para reservar slots
   - UI mobile-first +60
   - Agrupa slots por día
   - Muestra créditos y cupos disponibles

2. **`src/app/(protected)/student/book/actions.ts`**
   - Server Action `reserveSlot()`
   - Validaciones completas
   - Manejo de errores de concurrencia

3. **`docs/plan-slice2-student-book-slots.md`**
   - Plan y Definition of Done

4. **`docs/PRUEBAS-SLICE2-STUDENT-BOOK.md`**
   - 17 pruebas detalladas paso a paso

5. **`docs/IMPLEMENTACION-SLICE2-STUDENT-BOOK.md`**
   - Documentación técnica completa

6. **`docs/RESUMEN-SLICE2-PASO3-STUDENT-BOOK.md`**
   - Este archivo

### Archivos Modificados

1. **`src/components/ui/NavLinks.tsx`**
   - Agregado link "Agendar" -> `/student/book`

2. **`src/components/ui/BottomNav.tsx`**
   - Agregado link "Agendar" -> `/student/book` con icono `BookOpen`

## Funcionalidades Implementadas

### ✅ Banner de Créditos

**Sin créditos (<= 0):**
- Card amarillo/rojo
- Mensaje: "Primero debes pagar para agendar"
- CTA: "Ir a Pagos" -> `/student/payments`
- Todos los botones "Reservar" deshabilitados

**Con créditos (> 0):**
- Card verde
- Mensaje: "Tienes X créditos disponibles"

### ✅ Lista de Slots Disponibles

**Filtros:**
- Solo slots activos (`active = true`)
- Solo slots futuros (`starts_at > now()`)
- Ordenados por fecha/hora

**Agrupación:**
- Agrupados por día
- Fecha formateada en español (ej: "lunes, 15 de enero")

**Información por Slot:**
- Hora (starts_at - ends_at) formateada
- Coach (nombre completo)
- Cupos disponibles: "X de 2" (verde si > 0, rojo si = 0)

### ✅ Reserva de Slots

**Validaciones:**
1. Usuario autenticado y es student
2. Créditos disponibles > 0
3. Slot existe, activo y futuro
4. Cupos disponibles (booked_count < 2)
5. No tiene reserva previa en ese slot

**Proceso:**
1. Click "Reservar"
2. Loading state (botón muestra "Reservando...")
3. Server Action valida y inserta booking
4. Toast de éxito/error
5. Recarga página para actualizar cupos

**Manejo de Errores:**
- **Concurrencia:** "Este slot se llenó justo antes. Por favor selecciona otro horario."
- **Sin créditos:** "No tienes créditos disponibles. Primero debes pagar..."
- **Reserva duplicada:** "Ya tienes una reserva en este horario"
- **Slot lleno:** "Este slot se llenó justo antes..."

### ✅ UI/UX para +60

- ✅ Tarjetas grandes (mínimo 48px altura)
- ✅ Texto base >= 16px
- ✅ Botones grandes (h-14, >= 56px)
- ✅ Labels claros
- ✅ Focus-visible ring
- ✅ Espaciado generoso
- ✅ Mobile-first: cards en mobile, grid en desktop
- ✅ Estados claros (loading, error, éxito, empty)

## Seguridad

### RLS (Row Level Security)
- Student solo ve slots activos (policy `coach_slots_select_active`)
- Student solo puede insertar bookings con `student_id = auth.uid()` (policy `class_bookings_insert_own`)
- Queries filtran por `student_id = profile.id`

### Validaciones
- Verifica profile antes de queries
- Valida créditos antes de reservar
- Valida cupos antes de insertar
- Maneja errores de concurrencia (constraint UNIQUE)

## Pasos para Probar

### 1. Créditos 0 vs Créditos > 0

**Test A: Sin Créditos**
1. Autenticarse como Student sin créditos
2. Navegar a `/student/book`
3. Verificar banner amarillo con mensaje
4. Verificar botones deshabilitados

**Test B: Con Créditos**
1. Autenticarse como Student con créditos > 0
2. Navegar a `/student/book`
3. Verificar banner verde con cantidad
4. Verificar botones habilitados (si hay cupos)

### 2. Cupo Lleno

**Pasos:**
1. Crear slot con 2 reservas (lleno)
2. Autenticarse como Student con créditos
3. Navegar a `/student/book`
4. Verificar que botón muestra "Sin cupos"
5. Verificar que botón está deshabilitado

### 3. Reserva Exitosa

**Pasos:**
1. Autenticarse como Student con créditos > 0
2. Navegar a `/student/book`
3. Encontrar slot con cupos disponibles
4. Click "Reservar"
5. Verificar loading state
6. Verificar toast de éxito
7. Verificar que página se recarga
8. Verificar que cupos se actualizan (1 menos)
9. Verificar en DB que booking se creó:
   ```sql
   SELECT * FROM class_bookings 
   WHERE student_id = 'student-uuid' 
     AND slot_id = 'slot-uuid';
   ```

### 4. Error de Concurrencia

**Pasos:**
1. Autenticarse como Student A
2. Navegar a `/student/book`
3. Encontrar slot con 1 cupo disponible
4. En otra pestaña, autenticarse como Student B
5. Reservar ese slot como Student B (debe llenarse)
6. Volver a Student A y click "Reservar"
7. Verificar toast de error: "Este slot se llenó justo antes..."

## Archivos de Referencia

- `src/app/(protected)/student/book/page.tsx` - Página principal
- `src/app/(protected)/student/book/actions.ts` - Server Actions
- `docs/PRUEBAS-SLICE2-STUDENT-BOOK.md` - Checklist de pruebas
- `docs/IMPLEMENTACION-SLICE2-STUDENT-BOOK.md` - Documentación técnica
- `docs/plan-slice2-student-book-slots.md` - Plan y DoD

## Próximos Pasos (Slice 2)

1. **Paso 4:** Implementar UI para coaches (crear slots)
2. **Paso 5:** Implementar triggers para descuento de créditos al marcar asistencia
3. **Paso 6:** Implementar vista de reservas del estudiante
