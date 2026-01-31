# Plan: Coach Routes + Placeholders (PASO 12)

## Definition of Done (DoD)

- [ ] Navegación actualizada: Dashboard, Disponibilidad, Agenda (3 items)
- [ ] BottomNav actualizado con 3 items para coach
- [ ] Dashboard Coach con cards grandes:
  - "Clases hoy" (0)
  - "Próxima clase" (placeholder)
  - CTA "Configurar disponibilidad" -> /coach/availability
  - CTA "Ver agenda" -> /coach/schedule
- [ ] Disponibilidad (placeholder útil):
  - Explicación clara del flujo
  - UI mock: selector de día, botones "Agregar bloque 1h" (disabled)
  - Empty state
  - Nota: "Esta función se habilita en Slice 2"
- [ ] Agenda (placeholder útil):
  - Lista por día (hoy/mañana) con items placeholder
  - Empty state
- [ ] Asistencia (placeholder útil):
  - Lista placeholder de alumnos con switches (disabled)
  - Texto explicativo sobre Slice 2
- [ ] Guards por rol funcionan (solo coach entra a /coach/*)
- [ ] Mobile-first, texto grande, botones altos, spacing generoso
- [ ] No crear tablas nuevas
- [ ] No inventar endpoints ni lógica

## Lista de Archivos a Crear/Modificar

### Archivos a Modificar:
1. `src/components/ui/NavLinks.tsx` - Agregar Disponibilidad y Agenda
2. `src/components/ui/BottomNav.tsx` - Agregar Disponibilidad y Agenda
3. `src/app/(protected)/coach/page.tsx` - Actualizar dashboard

### Archivos a Crear:
1. `src/app/(protected)/coach/availability/page.tsx` - Disponibilidad placeholder
2. `src/app/(protected)/coach/schedule/page.tsx` - Agenda placeholder
3. `src/app/(protected)/coach/attendance/page.tsx` - Asistencia placeholder
4. `docs/plan-coach-routes-placeholders.md` - Este archivo
5. `docs/PRUEBAS-COACH-ROUTES.md` - Pasos de prueba

## Estructura de Implementación

### 1. Navegación

**NavLinks (Desktop Sidebar):**
- Dashboard -> /coach
- Disponibilidad -> /coach/availability
- Agenda -> /coach/schedule

**BottomNav (Mobile):**
- Dashboard -> /coach
- Disponibilidad -> /coach/availability
- Agenda -> /coach/schedule

### 2. Dashboard Coach

**Cards:**
- "Clases hoy": 0 (placeholder)
- "Próxima clase": "No hay clases programadas" (placeholder)
- CTAs:
  - "Configurar disponibilidad" -> /coach/availability
  - "Ver agenda" -> /coach/schedule

### 3. Disponibilidad

**Contenido:**
- Explicación: "Aquí marcarás tus horas disponibles para clases de 1 hora (capacidad 2)."
- UI mock:
  - Tabs o selector de día (Lunes-Domingo)
  - Botones "Agregar bloque 1h" (disabled)
  - Empty state: "Aún no has configurado disponibilidad."
- Nota: "Esta función se habilita en Slice 2."

### 4. Agenda

**Contenido:**
- Lista por día (hoy/mañana)
- Items placeholder con:
  - Hora
  - Estudiante(s)
  - Estado
- Empty state: "No hay clases programadas todavía."

### 5. Asistencia

**Contenido:**
- Lista placeholder de alumnos con switches (disabled)
- Texto: "Aquí marcarás asistió/faltó y se descontará crédito (Slice 2)."
- Nota: "Esta función se habilita en Slice 2."

## Componentes UI (shadcn/ui base)

**Usar:**
- `@/components/ui/base/card`
- `@/components/ui/base/button`
- `@/components/ui/base/tabs` (para selector de día)
- `@/components/ui/base/switch` (para asistencia, si existe)

## Pasos de Implementación

1. Actualizar NavLinks.tsx
2. Actualizar BottomNav.tsx
3. Actualizar /coach/page.tsx
4. Crear /coach/availability/page.tsx
5. Crear /coach/schedule/page.tsx
6. Crear /coach/attendance/page.tsx
7. Verificar guards por rol
8. Probar navegación

## Testing

### Prueba 1: Navegación Coach
- Login como coach
- Verificar que sidebar/bottom nav muestra 3 items
- Navegar a todas las rutas

### Prueba 2: Guards por Rol
- Login como student
- Intentar acceder a /coach/*
- Verificar redirección

### Prueba 3: Guards por Rol (Admin)
- Login como admin
- Intentar acceder a /coach/*
- Verificar redirección
