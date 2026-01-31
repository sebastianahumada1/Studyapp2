# Implementación: Admin Vista Global de Clases (PASO 7)

## Archivos Creados/Modificados

### Archivos Creados:
1. `src/components/ui/base/accordion.tsx` - Componente Accordion de shadcn/ui
2. `src/app/(protected)/admin/classes/page.tsx` - Página Server Component
3. `src/app/(protected)/admin/classes/AdminClassesClient.tsx` - Client Component para interactividad
4. `docs/plan-admin-classes-view.md` - Plan y DoD
5. `docs/PRUEBAS-ADMIN-CLASSES-VIEW.md` - Checklist de pruebas
6. `docs/IMPLEMENTACION-ADMIN-CLASSES-VIEW.md` - Este archivo

### Archivos Modificados:
1. `tailwind.config.ts` - Agregadas animaciones de accordion
2. `package.json` - Agregada dependencia `@radix-ui/react-accordion`
3. `src/components/ui/NavLinks.tsx` - Agregado link "Clases"
4. `src/components/ui/BottomNav.tsx` - Agregado link "Clases"

## Detalles de Implementación

### 1. Componente Accordion

**Ubicación:** `src/components/ui/base/accordion.tsx`

**Características:**
- Basado en Radix UI Accordion
- Animaciones suaves (accordion-down/up)
- Mobile-friendly
- Accesible (ARIA)

**Animaciones en Tailwind:**
```typescript
keyframes: {
  'accordion-down': {
    from: { height: '0' },
    to: { height: 'var(--radix-accordion-content-height)' },
  },
  'accordion-up': {
    from: { height: 'var(--radix-accordion-content-height)' },
    to: { height: '0' },
  },
}
```

### 2. Página `/admin/classes`

**Estructura:**
- **Server Component** (`page.tsx`): Carga slots y bookings
- **Client Component** (`AdminClassesClient.tsx`): Maneja acordeón y UI interactiva

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
WHERE cs.starts_at >= week_start
  AND cs.starts_at <= week_end
ORDER BY cs.starts_at
```

**Query de Bookings:**
Para cada slot, se hace query separada:
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
- Por día usando timezone America/Bogota
- Función `getDayOfWeek()` mapea correctamente (Lunes=1, ..., Domingo=7)

### 3. Selector de Semana

**Default:**
- Semana actual (lunes a domingo)

**Cálculo:**
```typescript
function getMondayOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}
```

**UI:**
- Muestra rango: "Lunes, 15 de enero - Domingo, 21 de enero"
- Botones "Semana Anterior" / "Semana Próxima" (disabled por ahora)
- Resumen: "X clases • Y reservas"

### 4. Acordeón por Día

**Estructura:**
- Cada día es un `AccordionItem`
- Header (`AccordionTrigger`): "Lunes" + cantidad de slots
- Content (`AccordionContent`): Lista de slots del día

**Configuración:**
- `type="single"`: Solo un día expandido a la vez
- `collapsible`: Se puede colapsar
- Mobile-friendly: fácil de expandir/colapsar

### 5. Información por Slot

**Card con:**
- **Hora:** "09:00 - 10:00" (formateada)
- **Coach:** "Nombre del Coach"
- **Ocupación:** "2 / 2" (booked_count / capacity)
- **Breakdown de estados:**
  - Badges con counts por estado
  - Colores: booked=azul, attended=verde, cancelled=gris, no_show=rojo
- **Lista de alumnos:**
  - Nombre + Teléfono
  - Badge de estado por alumno

**Cálculo de Breakdown:**
```typescript
const statusCounts = {
  booked: bookings.filter(b => b.status === 'booked').length,
  cancelled: bookings.filter(b => b.status === 'cancelled').length,
  attended: bookings.filter(b => b.status === 'attended').length,
  no_show: bookings.filter(b => b.status === 'no_show').length,
}
```

## Validaciones

### En Query:
1. ✅ RLS: admin ve todo (policy `coach_slots_select_admin`)
2. ✅ Filtro por rango de fechas (semana actual)
3. ✅ Join correcto a profiles (coach y students)

### En UI:
1. ✅ Rango de fechas válido
2. ✅ Empty state si no hay slots
3. ✅ Solo días con slots aparecen en acordeón

## UX para +60

- ✅ Acordeón fácil de usar
- ✅ Tarjetas grandes
- ✅ Texto base >= 16px
- ✅ Botones grandes (h-14, >= 56px)
- ✅ Labels claros
- ✅ Focus-visible ring
- ✅ Espaciado generoso
- ✅ Mobile-first

## Seguridad

### RLS (Row Level Security)
- Admin ve todo (policy `coach_slots_select_admin`)
- Admin ve todos los bookings (policy `class_bookings_select_admin`)
- Queries no filtran por ownership (admin ve todo)

### Validaciones
- Verifica profile antes de queries
- Valida que es admin
- Redirige si no es admin

## Flujo de Datos

1. **Cargar Página:**
   - Server Component → Supabase Server → Query slots de semana
   - Para cada slot → Query bookings
   - Agrupa por día usando timezone
   - Renderiza con Client Component

2. **Interactividad:**
   - Click en día → Acordeón expande/colapsa
   - Navegación de semanas (placeholder, se implementará con query params)

## Notas Técnicas

### Timezone
- Usa timezone 'America/Bogota' para agrupar por día
- Función `getDayOfWeek()` mapea correctamente

### Performance
- Queries separadas por slot (podría optimizarse con un solo query con agregación)
- Por ahora funciona bien para volúmenes pequeños/medianos

### Navegación de Semanas
- Por ahora botones disabled
- En siguiente paso se puede implementar con query params:
  - `/admin/classes?week=2024-01-15`
  - Server Component lee query param y ajusta rango
