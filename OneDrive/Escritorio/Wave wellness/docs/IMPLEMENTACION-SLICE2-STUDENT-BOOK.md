# Implementación: Slice 2 - Student Reservar Slots (PASO 3)

## Archivos Creados/Modificados

### Archivos Creados:
1. `src/app/(protected)/student/book/page.tsx` - Página de reserva de slots
2. `src/app/(protected)/student/book/actions.ts` - Server Actions para reservar
3. `docs/plan-slice2-student-book-slots.md` - Plan y DoD
4. `docs/PRUEBAS-SLICE2-STUDENT-BOOK.md` - Checklist de pruebas
5. `docs/IMPLEMENTACION-SLICE2-STUDENT-BOOK.md` - Este archivo

### Archivos Modificados:
1. `src/components/ui/NavLinks.tsx` - Agregado link "Agendar"
2. `src/components/ui/BottomNav.tsx` - Agregado link "Agendar"

## Detalles de Implementación

### 1. Página `/student/book`

**Tipo:** Client Component (`'use client'`)

**Funcionalidades:**
- Carga créditos disponibles del estudiante
- Carga slots disponibles (activos, futuros)
- Agrupa slots por día
- Muestra banner según créditos
- Permite reservar slots

**Queries:**
1. **Créditos:** `SUM(delta) FROM credit_ledger WHERE student_id = auth.uid()`
2. **Slots:** 
   ```sql
   SELECT cs.*, p.full_name
   FROM coach_slots cs
   JOIN profiles p ON cs.coach_id = p.id
   WHERE cs.active = true AND cs.starts_at > now()
   ORDER BY cs.starts_at
   ```
3. **Booked Count:** Para cada slot, cuenta bookings con `status = 'booked'`

**UI:**
- Banner amarillo si créditos <= 0 (con CTA a pagos)
- Banner verde si créditos > 0 (muestra cantidad)
- Lista de slots agrupados por día
- Cards grandes con información del slot
- Botón "Reservar" por slot

### 2. Server Action: `reserveSlot`

**Validaciones:**
1. Usuario autenticado y es student
2. Créditos disponibles > 0
3. Slot existe, activo y futuro
4. Cupos disponibles (booked_count < capacity)
5. No tiene reserva previa en ese slot

**Lógica:**
```typescript
1. Verificar créditos > 0
2. Verificar slot existe, activo, futuro
3. Contar bookings activos (status = 'booked')
4. Si booked_count >= capacity, error "Slot lleno"
5. Verificar no tiene reserva previa
6. Insertar booking con status='booked'
7. Manejar error de constraint UNIQUE (concurrencia)
```

**Manejo de Errores:**
- **Concurrencia:** Si constraint UNIQUE falla o booked_count >= capacity
- **Sin créditos:** Mensaje claro con CTA a pagos
- **Slot lleno:** Mensaje "Este slot se llenó justo antes..."
- **Reserva duplicada:** Mensaje "Ya tienes una reserva en este horario"

### 3. UI Components

**Banner de Créditos:**
- Si créditos <= 0:
  - Card amarillo/rojo
  - Mensaje: "Primero debes pagar para agendar"
  - CTA: "Ir a Pagos" -> `/student/payments`
- Si créditos > 0:
  - Card verde
  - Mensaje: "Tienes X créditos disponibles"

**Lista de Slots:**
- Agrupados por día (usando `toLocaleDateString`)
- Cada slot: Card con:
  - Hora (starts_at - ends_at) formateada
  - Coach (full_name)
  - Cupos: "X de 2 disponibles" (verde si > 0, rojo si = 0)
  - Botón "Reservar" (disabled si no hay cupo o no tiene créditos)

**Estados:**
- Loading: Spinner mientras carga
- Empty: "No hay slots disponibles en este momento"
- Error: Toast con mensaje descriptivo
- Success: Toast + recargar página

## Validaciones

### En Server Action:
1. ✅ Créditos > 0
2. ✅ Slot existe
3. ✅ Slot activo
4. ✅ Slot futuro
5. ✅ Cupos disponibles (booked_count < capacity)
6. ✅ No tiene reserva previa

### En UI:
1. ✅ Deshabilitar botón si créditos <= 0
2. ✅ Deshabilitar botón si cupos = 0
3. ✅ Mostrar mensaje claro en cada caso

## Manejo de Errores

### Error de Concurrencia:
- Si dos usuarios reservan al mismo tiempo
- Constraint UNIQUE falla o booked_count >= capacity
- Mensaje: "Este slot se llenó justo antes. Por favor selecciona otro horario."

### Otros Errores:
- "No tienes créditos suficientes"
- "Este slot ya no está disponible"
- "Ya tienes una reserva en este horario"
- "Este slot ya pasó. Solo puedes reservar slots futuros."

## UX para +60

- ✅ Tarjetas grandes (mínimo 48px altura)
- ✅ Texto base >= 16px
- ✅ Botones grandes (>= 48px altura, h-14)
- ✅ Labels claros
- ✅ Focus-visible ring
- ✅ Espaciado generoso
- ✅ Mobile-first: cards en mobile, grid en desktop
- ✅ Estados claros (loading, error, éxito)

## Seguridad

### RLS (Row Level Security)
- Student solo ve slots activos (policy `coach_slots_select_active`)
- Student solo puede insertar bookings con `student_id = auth.uid()` (policy `class_bookings_insert_own`)
- Queries filtran por `student_id = profile.id`

### Validaciones
- Verifica profile antes de queries
- Valida créditos antes de reservar
- Valida cupos antes de insertar
- Maneja errores de concurrencia

## Flujo de Datos

1. **Cargar Página:**
   - Client Component → Supabase Client → Query créditos
   - Client Component → Supabase Client → Query slots
   - Client Component → Supabase Client → Query booked_count por slot
   - Renderiza lista agrupada por día

2. **Reservar Slot:**
   - Click "Reservar" → Server Action → Valida → Inserta booking
   - Client recibe resultado → Toast → Recarga página

## Notas Técnicas

### Formateo de Fechas
- Usa `toLocaleDateString` y `toLocaleTimeString` nativos de JavaScript
- No requiere dependencias externas (date-fns)
- Formato español (es-MX)

### Agrupación por Día
- Usa `toISOString().split('T')[0]` para obtener key (yyyy-MM-dd)
- Agrupa slots en objeto `GroupedSlots`
- Ordena días con `sort()`

### Recarga de Página
- Después de reserva exitosa, usa `window.location.reload()`
- Esto asegura que los cupos se actualicen correctamente
- Alternativa: usar `router.refresh()` en Next.js 13+
