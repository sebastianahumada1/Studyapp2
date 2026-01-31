# Implementación: Coach Availability - Fix Empty State + Agregar Bloque

## Archivos Creados/Modificados

### Archivos Creados:
1. `src/app/(protected)/coach/availability/actions.ts` - Server Action `createSlot()`
2. `src/app/(protected)/coach/availability/AddSlotDialog.tsx` - Dialog para agregar bloque
3. `docs/plan-coach-availability-fix.md` - Plan y DoD
4. `docs/PRUEBAS-COACH-AVAILABILITY-FIX.md` - Checklist de pruebas
5. `docs/IMPLEMENTACION-COACH-AVAILABILITY-FIX.md` - Este archivo

### Archivos Modificados:
1. `src/app/(protected)/coach/availability/page.tsx` - Implementación completa con datos reales

## Detalles de Implementación

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
- Usa función `getDayOfWeek()` que maneja timezone America/Bogota
- Mapea días: Lunes=1, Martes=2, ..., Domingo=7
- NO usa `getDay()` directamente (Domingo=0 rompe)

**Función Helper:**
```typescript
function getDayOfWeek(date: Date): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Bogota',
    weekday: 'long',
  })
  const dayName = formatter.format(date)
  const dayMap: Record<string, number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  }
  return dayMap[dayName] || 1
}
```

### 2. Empty State

**Condición:**
- Si `slotsByDay[dayKey].length === 0` → mostrar empty state
- Si `slotsByDay[dayKey].length > 0` → mostrar lista

**Mensaje:**
- "Aún no has configurado disponibilidad para <DIA>"
- "Agrega bloques de 1 hora para que los estudiantes puedan agendar."
- Botón "Agregar Bloque 1h" (habilitado)

### 3. Dialog "Agregar Bloque"

**Componente:** `AddSlotDialog.tsx` (Client Component)

**Campos:**
- **Fecha:** Automática (próxima fecha del día seleccionado)
- **Hora:** Select (6:00, 6:30, 7:00, ..., 20:00)
- **Resumen:** "Bloque: <fecha> <hora> - <hora+1h>"

**Función `getNextDateForDay()`:**
- Calcula próxima fecha del día seleccionado
- Maneja correctamente el cálculo de días (Lunes=1, Domingo=7)

**Validaciones:**
- Hora seleccionada (required)
- Fecha automática (no editable)

### 4. Server Action: `createSlot`

**Parámetros:**
- `startsAt: string` (ISO datetime)

**Validaciones:**
1. ✅ Usuario autenticado y es coach
2. ✅ `startsAt` no en el pasado
3. ✅ No existe slot duplicado (coach_id + starts_at)

**Lógica:**
1. Calcular `endsAt = startsAt + 1 hour`
2. Verificar duplicado
3. Insertar en `coach_slots`:
   - `coach_id = auth.uid()`
   - `starts_at = startsAt`
   - `ends_at = endsAt`
   - `capacity = 2`
   - `active = true`

**Manejo de Errores:**
- "No puedes crear bloques en el pasado"
- "Ya existe un bloque en este horario"
- "Error al crear el bloque"

### 5. Lista de Slots

**Mostrar:**
- Hora: "09:00 - 10:00"
- Fecha completa: "lunes, 15 de enero de 2024"
- Capacidad: "Capacidad: 2 estudiantes"
- Botón "Eliminar" (disabled, para siguiente paso)

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

**Problema Resuelto:**
- JavaScript `getDay()` retorna 0=Domingo, 1=Lunes, ...
- Necesitamos 1=Lunes, 2=Martes, ..., 7=Domingo

**Solución:**
- Usar `Intl.DateTimeFormat` con timezone 'America/Bogota'
- Mapear nombres de días a números correctos
- Función `getDayOfWeek()` maneja timezone correctamente

**Ejemplo:**
```typescript
// Antes (incorrecto):
const day = date.getDay() // 0=Domingo, 1=Lunes

// Ahora (correcto):
const day = getDayOfWeek(date) // 1=Lunes, 2=Martes, ..., 7=Domingo
```

## UX para +60

- ✅ Botones grandes (h-14, >= 56px)
- ✅ Labels claros (text-base)
- ✅ Texto base >= 16px
- ✅ Select grande (h-14)
- ✅ Dialog con botones grandes
- ✅ Estados claros (loading, error, éxito)
- ✅ Mobile-first: tabs accesibles, layout responsive

## Seguridad

### RLS (Row Level Security)
- Coach solo ve sus propios slots (policy `coach_slots_select_own`)
- Coach solo puede insertar sus propios slots (policy `coach_slots_insert_own`)

### Validaciones
- Verifica profile antes de queries
- Valida ownership del slot antes de mostrar
- Valida fecha/hora antes de insertar

## Flujo de Datos

1. **Cargar Página:**
   - Client Component → Supabase Client → Query slots del coach
   - Agrupa por día usando `getDayOfWeek()`
   - Renderiza empty state o lista según corresponda

2. **Crear Bloque:**
   - Click "Agregar Bloque 1h" → Abre Dialog
   - Seleccionar hora → Resumen visible
   - Click "Crear Bloque" → Server Action → Valida → Inserta slot
   - Client recibe resultado → Toast → Recarga página

## Notas Técnicas

### Cálculo de Próxima Fecha
- Función `getNextDateForDay()` calcula próxima fecha del día seleccionado
- Maneja correctamente el caso cuando el día ya pasó esta semana

### Generación de Horas
- Función `generateTimeOptions()` genera horas de 6:00 a 20:00, cada 30 min
- Total: 29 opciones (6:00, 6:30, 7:00, ..., 20:00)

### Formateo de Fechas
- Usa `toLocaleDateString` y `toLocaleTimeString` con timezone 'America/Bogota'
- Formato español (es-MX)
