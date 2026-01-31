# Pruebas: Coach Availability - Fix Empty State + Agregar Bloque

## Pre-requisitos

1. ✅ Schema de Slice 2 aplicado (tabla `coach_slots` existe)
2. ✅ RLS aplicado para `coach_slots`
3. ✅ Tener usuario Coach de prueba (id: coach-uuid)
4. ✅ Timezone configurado: America/Bogota

## Checklist: Empty State

### Test 1: Empty State Visible para Lunes Sin Slots

**Pasos:**
1. Autenticarse como Coach sin slots creados
2. Navegar a `/coach/availability`
3. Verificar que el tab "Lunes" está seleccionado por defecto
4. Verificar que aparece empty state:
   - Icono Clock
   - Mensaje: "Aún no has configurado disponibilidad para Lunes"
   - Texto secundario: "Agrega bloques de 1 hora para que los estudiantes puedan agendar."
   - Botón "Agregar Bloque 1h" (habilitado, no disabled)

**Resultado esperado:** ✅ Empty state visible con botón habilitado

---

### Test 2: Empty State para Otros Días

**Pasos:**
1. Autenticarse como Coach sin slots
2. Navegar a `/coach/availability`
3. Click en tab "Martes"
4. Verificar que aparece empty state con mensaje: "Aún no has configurado disponibilidad para Martes"
5. Repetir para todos los días de la semana

**Resultado esperado:** ✅ Empty state visible para cada día sin slots

---

### Test 3: Empty State Desaparece al Crear Slot

**Pasos:**
1. Autenticarse como Coach sin slots
2. Navegar a `/coach/availability`
3. Verificar empty state en Lunes
4. Click "Agregar Bloque 1h"
5. Crear bloque (Test 4)
6. Verificar que empty state desaparece y aparece lista de slots

**Resultado esperado:** ✅ Empty state desaparece después de crear slot

---

## Checklist: Agregar Bloque

### Test 4: Crear Bloque Exitoso

**Pasos:**
1. Autenticarse como Coach
2. Navegar a `/coach/availability`
3. Seleccionar día (ej: Lunes)
4. Click "Agregar Bloque 1h"
5. Verificar que se abre Dialog con:
   - Título: "Agregar Bloque 1h"
   - Fecha automática (próxima fecha del día seleccionado)
   - Selector de hora (6:00 - 20:00, cada 30 min)
   - Resumen del bloque
6. Seleccionar hora (ej: 09:00)
7. Verificar resumen: "Bloque: <fecha> 09:00 - 10:00"
8. Click "Crear Bloque"
9. Verificar loading state
10. Verificar toast de éxito: "¡Bloque creado!"
11. Verificar que Dialog se cierra
12. Verificar que página se recarga
13. Verificar que slot aparece en lista

**Resultado esperado:** ✅ Bloque creado exitosamente y aparece en lista

---

### Test 5: Verificar Slot en DB

**Pasos:**
1. Después de Test 4, verificar en Supabase:
   ```sql
   SELECT * FROM coach_slots 
   WHERE coach_id = 'coach-uuid' 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```
2. Verificar que:
   - `coach_id = coach-uuid`
   - `starts_at` es la fecha/hora seleccionada
   - `ends_at = starts_at + 1 hour`
   - `capacity = 2`
   - `active = true`

**Resultado esperado:** ✅ Slot creado correctamente en DB

---

### Test 6: Validación - No Crear en el Pasado

**Pasos:**
1. Autenticarse como Coach
2. Navegar a `/coach/availability`
3. Seleccionar día que ya pasó (si es posible)
4. Intentar crear bloque con hora pasada
5. Verificar toast de error: "No puedes crear bloques en el pasado"

**Resultado esperado:** ✅ Error por fecha/hora pasada

---

### Test 7: Validación - No Duplicados

**Pasos:**
1. Autenticarse como Coach
2. Crear bloque para Lunes 09:00 (Test 4)
3. Intentar crear otro bloque para Lunes 09:00
4. Verificar toast de error: "Ya existe un bloque en este horario"

**Resultado esperado:** ✅ Error por duplicado

---

## Checklist: Lista de Slots

### Test 8: Lista de Slots Visible

**Pasos:**
1. Autenticarse como Coach con slots creados
2. Navegar a `/coach/availability`
3. Seleccionar día con slots
4. Verificar que aparece lista con:
   - Hora: "09:00 - 10:00"
   - Fecha completa
   - Capacidad: "Capacidad: 2 estudiantes"
   - Botón "Eliminar" (disabled por ahora)

**Resultado esperado:** ✅ Lista de slots visible con información completa

---

### Test 9: Slots Agrupados por Día Correctamente

**Pasos:**
1. Crear slots para diferentes días:
   - Lunes 09:00
   - Martes 10:00
   - Miércoles 11:00
2. Autenticarse como Coach
3. Navegar a `/coach/availability`
4. Verificar que:
   - Lunes muestra solo slot de Lunes
   - Martes muestra solo slot de Martes
   - Miércoles muestra solo slot de Miércoles

**Resultado esperado:** ✅ Slots agrupados correctamente por día

---

### Test 10: Timezone Correcto (America/Bogota)

**Pasos:**
1. Crear slot para Lunes 09:00 (timezone America/Bogota)
2. Verificar en DB que `starts_at` está en formato correcto
3. Autenticarse como Coach
4. Navegar a `/coach/availability`
5. Verificar que el slot aparece en el día correcto (Lunes)
6. Verificar que la hora mostrada es correcta (09:00)

**Resultado esperado:** ✅ Timezone manejado correctamente

---

## Checklist: UI/UX

### Test 11: Mobile-First

**Pasos:**
1. Abrir `/coach/availability` en móvil (DevTools)
2. Verificar que:
   - Tabs son accesibles (min-h-[48px])
   - Botones son grandes (h-14, >= 56px)
   - Texto es legible (>= 16px)
   - Dialog es responsive

**Resultado esperado:** ✅ UI mobile-first correcta

---

### Test 12: Estados de Loading

**Pasos:**
1. Autenticarse como Coach
2. Navegar a `/coach/availability`
3. Click "Agregar Bloque 1h"
4. Seleccionar hora y click "Crear Bloque"
5. Verificar que botón muestra "Creando..." con spinner
6. Verificar que botones están deshabilitados durante loading

**Resultado esperado:** ✅ Loading state visible

---

### Test 13: Dialog Funcional

**Pasos:**
1. Autenticarse como Coach
2. Navegar a `/coach/availability`
3. Click "Agregar Bloque 1h"
4. Verificar que Dialog se abre
5. Verificar que se puede cerrar con:
   - Botón "Cancelar"
   - Botón X (esquina superior derecha)
   - Click fuera del Dialog

**Resultado esperado:** ✅ Dialog funcional y accesible

---

## Checklist Final

### Funcionalidad
- [ ] Empty state visible para días sin slots
- [ ] Botón "Agregar Bloque 1h" habilitado
- [ ] Dialog se abre correctamente
- [ ] Fecha automática calculada correctamente
- [ ] Selector de hora funcional (6:00-20:00, cada 30 min)
- [ ] Resumen del bloque visible
- [ ] Bloque creado exitosamente
- [ ] Slot aparece en lista después de crear
- [ ] Validación: no crear en el pasado
- [ ] Validación: no duplicados
- [ ] Slots agrupados por día correctamente
- [ ] Timezone manejado correctamente (America/Bogota)

### UI/UX
- [ ] Mobile-first correcto
- [ ] Loading states visibles
- [ ] Dialog funcional y accesible
- [ ] Botones grandes y accesibles
- [ ] Texto legible
- [ ] Empty state desaparece al crear slot
