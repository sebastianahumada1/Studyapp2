# Plan: Slice 2 - Admin Vista Global de Clases (PASO 7)

## Definition of Done (DoD)

- [ ] Página `/admin/classes` creada
- [ ] Selector de rango de fechas (default: semana actual)
- [ ] Lista de slots agrupados por día (acordeón)
- [ ] Cada slot muestra:
  - Hora (starts_at - ends_at, 1 hora)
  - Coach (nombre)
  - Ocupación: booked_count / 2
  - Breakdown de estados: booked/cancelled/attended/no_show (counts)
  - Lista de alumnos (nombre + teléfono) para slots del día
- [ ] UI mobile-first +60: acordeón, tarjetas grandes, texto legible
- [ ] RLS: admin ve todo (usar is_admin() helper)
- [ ] No inventar columnas/tablas
- [ ] Estados: loading, error, empty

## Lista de Archivos a Crear/Modificar

### Archivos a Crear:
1. `src/app/(protected)/admin/classes/page.tsx` - Página de vista global
2. `docs/plan-admin-classes-view.md` - Este archivo
3. `docs/IMPLEMENTACION-ADMIN-CLASSES-VIEW.md` - Documentación
4. `docs/PRUEBAS-ADMIN-CLASSES-VIEW.md` - Checklist de pruebas

### Archivos a Modificar:
1. `src/components/ui/NavLinks.tsx` - Agregar link "Clases" para admin (opcional)
2. `src/components/ui/BottomNav.tsx` - Agregar link "Clases" para admin (opcional)

## Estructura de Implementación

### 1. Página `/admin/classes`

**Componente:** Server Component (puede ser Client si necesita interactividad para fechas)

**Query de Slots:**
```sql
SELECT 
  cs.id,
  cs.starts_at,
  cs.ends_at,
  cs.capacity,
  p_coach.full_name as coach_name,
  p_coach.id as coach_id
FROM coach_slots cs
JOIN profiles p_coach ON cs.coach_id = p_coach.id
WHERE cs.starts_at >= start_date
  AND cs.starts_at < end_date
ORDER BY cs.starts_at
```

**Query de Bookings por Slot:**
```sql
SELECT 
  cb.id,
  cb.status,
  p_student.full_name as student_name,
  p_student.phone as student_phone
FROM class_bookings cb
JOIN profiles p_student ON cb.student_id = p_student.id
WHERE cb.slot_id = slot_id
```

**Agrupación:**
- Por día (usando timezone America/Bogota)
- Acordeón por día (mobile-friendly)

### 2. Selector de Rango de Fechas

**Default:**
- Semana actual (lunes a domingo)

**Opciones:**
- Semana actual
- Semana próxima
- Semana anterior
- Rango personalizado (opcional, para siguiente paso)

**UI:**
- Tabs o botones para cambiar semana
- Mostrar rango visible: "15 - 21 de enero"

### 3. Acordeón por Día

**Componente:** shadcn/ui Accordion

**Estructura:**
- Cada día es un AccordionItem
- Header: "Lunes, 15 de enero" + cantidad de slots
- Content: Lista de slots del día

**Mobile-First:**
- Acordeón colapsado por defecto
- Fácil de expandir/colapsar

### 4. Información por Slot

**Card con:**
- Hora: "09:00 - 10:00"
- Coach: "Nombre del Coach"
- Ocupación: "2 / 2" (booked_count / capacity)
- Breakdown de estados:
  - Booked: X
  - Cancelled: Y
  - Attended: Z
  - No Show: W
- Lista de alumnos:
  - Nombre + Teléfono
  - Badge de estado por alumno

### 5. Breakdown de Estados

**Cálculo:**
```typescript
const statusCounts = {
  booked: bookings.filter(b => b.status === 'booked').length,
  cancelled: bookings.filter(b => b.status === 'cancelled').length,
  attended: bookings.filter(b => b.status === 'attended').length,
  no_show: bookings.filter(b => b.status === 'no_show').length,
}
```

**UI:**
- Badges pequeños con counts
- Colores: booked=azul, cancelled=gris, attended=verde, no_show=rojo

## Validaciones

### En Query:
1. ✅ RLS: admin ve todo (usar is_admin() o policy admin)
2. ✅ Filtro por rango de fechas
3. ✅ Join correcto a profiles (coach y students)

### En UI:
1. ✅ Rango de fechas válido
2. ✅ Empty state si no hay slots
3. ✅ Loading state mientras carga

## UX para +60

- ✅ Acordeón fácil de usar
- ✅ Tarjetas grandes
- ✅ Texto base >= 16px
- ✅ Botones grandes (>= 48px)
- ✅ Labels claros
- ✅ Focus-visible ring
- ✅ Espaciado generoso
- ✅ Mobile-first

## Seguridad

### RLS
- Admin ve todo (policy `coach_slots_select_admin`)
- Admin ve todos los bookings (policy `class_bookings_select_admin`)

### Validaciones
- Verifica profile antes de queries
- Valida que es admin
- Redirige si no es admin
