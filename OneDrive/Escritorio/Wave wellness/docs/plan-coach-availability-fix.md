# Plan: Coach Availability - Fix Empty State + Agregar Bloque Funcional

## Definition of Done (DoD)

- [ ] Selector de día empieza en Lunes (array correcto)
- [ ] Carga slots reales del coach desde DB
- [ ] Agrupa slots por día usando timezone America/Bogota
- [ ] Mapeo correcto de días (Lunes=1, no usar getDay() directamente)
- [ ] Empty state visible solo cuando NO hay slots para ese día
- [ ] Botón "Agregar Bloque 1h" funcional (no disabled)
- [ ] Dialog para crear bloque con:
  - Selector de hora (6:00-20:00, cada 30 min)
  - Fecha automática (próxima fecha del día seleccionado)
  - Resumen del bloque
- [ ] Server Action para crear slot:
  - Inserta en coach_slots
  - Valida: no pasado, no duplicado
  - Retorna éxito/error
- [ ] Lista de slots cuando existen (hora, capacidad, botón eliminar)
- [ ] Estados: loading, error, éxito (toast)
- [ ] Refrescar lista después de crear
- [ ] UI mobile-first +60: botones grandes, labels claros
- [ ] No inventar columnas

## Lista de Archivos a Crear/Modificar

### Archivos a Crear:
1. `src/app/(protected)/coach/availability/actions.ts` - Server Actions para crear slot
2. `src/app/(protected)/coach/availability/AddSlotDialog.tsx` - Dialog para agregar bloque
3. `docs/plan-coach-availability-fix.md` - Este archivo
4. `docs/IMPLEMENTACION-COACH-AVAILABILITY-FIX.md` - Documentación
5. `docs/PRUEBAS-COACH-AVAILABILITY-FIX.md` - Checklist de pruebas

### Archivos a Modificar:
1. `src/app/(protected)/coach/availability/page.tsx` - Implementación completa con datos reales

## Estructura de Implementación

### 1. Carga de Slots

**Query:**
```sql
SELECT id, starts_at, ends_at, capacity, active
FROM coach_slots
WHERE coach_id = auth.uid()
  AND starts_at >= NOW()
ORDER BY starts_at
```

**Agrupación por Día:**
- Usar timezone America/Bogota
- Mapear días: Lunes=1, Martes=2, ..., Domingo=7
- NO usar getDay() directamente (Domingo=0 rompe)

**Función Helper:**
```typescript
function getDayOfWeek(date: Date, timezone: string = 'America/Bogota'): number {
  // Retorna 1=Lunes, 2=Martes, ..., 7=Domingo
}
```

### 2. Empty State

**Condición:**
- Si NO hay slots para el día seleccionado → mostrar empty state
- Si hay slots → mostrar lista

**Mensaje:**
- "Aún no has configurado disponibilidad para <DIA>"
- "Agrega bloques de 1 hora para que los estudiantes puedan agendar."
- Botón "Agregar Bloque 1h" (habilitado)

### 3. Dialog "Agregar Bloque"

**Campos:**
- Hora de inicio: Select (6:00, 6:30, 7:00, ..., 20:00)
- Fecha: Automática (próxima fecha del día seleccionado)
- Resumen: "Bloque: <fecha> <hora> - <hora+1h>"

**Validaciones:**
- Hora seleccionada
- Fecha no en el pasado

### 4. Server Action: `createSlot`

**Parámetros:**
- `startsAt: string` (ISO datetime)

**Validaciones:**
1. Usuario autenticado y es coach
2. `startsAt` no en el pasado
3. No existe slot duplicado (coach_id + starts_at)

**Lógica:**
1. Calcular `endsAt = startsAt + 1 hour`
2. Insertar en `coach_slots`:
   - `coach_id = auth.uid()`
   - `starts_at = startsAt`
   - `ends_at = endsAt`
   - `capacity = 2`
   - `active = true`

**Manejo de Errores:**
- "No puedes crear slots en el pasado"
- "Ya existe un bloque en este horario"
- "Error al crear el bloque"

### 5. Lista de Slots

**Mostrar:**
- Hora: "09:00 - 10:00"
- Capacidad: "Capacidad: 2 estudiantes"
- Botón "Eliminar" (opcional, para siguiente paso)

**Orden:**
- Por hora (ascendente)

## Validaciones

### En Server Action:
1. ✅ Usuario es coach
2. ✅ `startsAt` no en el pasado
3. ✅ No existe slot duplicado

### En UI:
1. ✅ Hora seleccionada
2. ✅ Fecha calculada automáticamente
3. ✅ Resumen visible antes de confirmar

## Manejo de Timezone

**Problema:**
- JavaScript `getDay()` retorna 0=Domingo, 1=Lunes, ...
- Necesitamos 1=Lunes, 2=Martes, ..., 7=Domingo

**Solución:**
```typescript
function getDayOfWeek(date: Date): number {
  const day = date.getDay() // 0=Domingo, 1=Lunes, ...
  return day === 0 ? 7 : day // Convertir Domingo de 0 a 7
}

// O usar timezone-aware
function getDayOfWeekInTimezone(date: Date, timezone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'long'
  })
  const dayName = formatter.format(date)
  const dayMap: Record<string, number> = {
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6,
    'Sunday': 7
  }
  return dayMap[dayName] || 1
}
```

## UX para +60

- ✅ Botones grandes (>= 48px, ideal h-14)
- ✅ Labels claros
- ✅ Texto base >= 16px
- ✅ Select grande y accesible
- ✅ Dialog con botones grandes
- ✅ Estados claros (loading, error, éxito)
- ✅ Mobile-first
