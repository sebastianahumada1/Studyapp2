# Pruebas: Coach Routes + Placeholders (PASO 12)

## Prueba 1: Navegación Coach (Desktop Sidebar)

### Objetivo
Verificar que la navegación del coach muestra los 3 items correctos.

### Pasos
1. Autenticarse como coach
2. Verificar que el sidebar (desktop) muestra:
   - Dashboard -> /coach
   - Disponibilidad -> /coach/availability
   - Agenda -> /coach/schedule
3. Click en cada link
4. Verificar que navega correctamente

### Resultado Esperado
✅ Sidebar muestra 3 items
✅ Links funcionan correctamente
✅ Navegación fluida

---

## Prueba 2: Navegación Coach (Mobile BottomNav)

### Objetivo
Verificar que la navegación móvil del coach muestra los 3 items correctos.

### Pasos
1. Abrir DevTools y activar modo mobile
2. Autenticarse como coach
3. Verificar que el bottom nav muestra:
   - Dashboard -> /coach
   - Disponibilidad -> /coach/availability
   - Agenda -> /coach/schedule
4. Click en cada link
5. Verificar que navega correctamente

### Resultado Esperado
✅ Bottom nav muestra 3 items
✅ Links funcionan correctamente
✅ Navegación fluida en mobile

---

## Prueba 3: Dashboard Coach

### Objetivo
Verificar que el dashboard del coach muestra las cards correctas.

### Pasos
1. Autenticarse como coach
2. Navegar a `/coach`
3. Verificar que se muestran:
   - Card "Clases Hoy" con valor 0
   - Card "Próxima Clase" con mensaje placeholder
   - Card "Disponibilidad" con CTA "Configurar Disponibilidad"
   - Card "Ver Agenda" con CTA "Ver Agenda Completa"
4. Click en "Configurar Disponibilidad"
5. Verificar que redirige a `/coach/availability`
6. Volver a dashboard
7. Click en "Ver Agenda Completa"
8. Verificar que redirige a `/coach/schedule`

### Resultado Esperado
✅ Cards se muestran correctamente
✅ CTAs funcionan y redirigen correctamente
✅ Valores placeholder son claros

---

## Prueba 4: Disponibilidad (Placeholder)

### Objetivo
Verificar que la página de disponibilidad muestra el placeholder útil.

### Pasos
1. Autenticarse como coach
2. Navegar a `/coach/availability`
3. Verificar que se muestra:
   - Explicación: "Aquí marcarás tus horas disponibles para clases de 1 hora (capacidad 2)."
   - Nota sobre Slice 2
   - Selector de día (tabs: Lunes-Domingo)
   - Empty state: "Aún no has configurado disponibilidad para [día]"
   - Botón "Agregar Bloque 1h" (disabled)
   - Texto "(Disponible en Slice 2)"
4. Click en diferentes días (tabs)
5. Verificar que cada día muestra el empty state

### Resultado Esperado
✅ Explicación clara del flujo
✅ Selector de día funciona
✅ Empty state se muestra para cada día
✅ Botones disabled con mensaje claro
✅ Nota sobre Slice 2 visible

---

## Prueba 5: Agenda (Placeholder)

### Objetivo
Verificar que la página de agenda muestra el placeholder útil.

### Pasos
1. Autenticarse como coach
2. Navegar a `/coach/schedule`
3. Verificar que se muestra:
   - Sección "Hoy" con fecha formateada
   - Empty state: "No hay clases programadas para hoy"
   - Sección "Mañana" con fecha formateada
   - Empty state: "No hay clases programadas para mañana"
   - Card "Configurar Disponibilidad" con CTA
4. Click en CTA "Ir a Disponibilidad"
5. Verificar que redirige a `/coach/availability`

### Resultado Esperado
✅ Secciones por día se muestran
✅ Fechas formateadas correctamente
✅ Empty states claros
✅ CTA funciona correctamente

---

## Prueba 6: Asistencia (Placeholder)

### Objetivo
Verificar que la página de asistencia muestra el placeholder útil.

### Pasos
1. Autenticarse como coach
2. Navegar a `/coach/attendance`
3. Verificar que se muestra:
   - Explicación: "Aquí marcarás asistió/faltó y se descontará crédito..."
   - Nota sobre Slice 2
   - Lista placeholder de estudiantes con:
     - Nombre
     - Hora
     - Botones "Faltó" y "Asistió" (disabled)
   - Recordatorio sobre cómo funciona
4. Verificar que los botones están disabled

### Resultado Esperado
✅ Explicación clara del flujo
✅ Lista placeholder se muestra
✅ Botones disabled
✅ Nota sobre Slice 2 visible
✅ Recordatorio útil

---

## Prueba 7: Guards por Rol - Student

### Objetivo
Verificar que un student NO puede acceder a rutas del coach.

### Pasos
1. Autenticarse como student
2. Intentar navegar directamente a:
   - `/coach`
   - `/coach/availability`
   - `/coach/schedule`
   - `/coach/attendance`
3. Verificar que se redirige al home del student (`/student`)

### Resultado Esperado
✅ Student NO puede acceder a rutas del coach
✅ Redirección automática a `/student`
✅ Guards funcionan correctamente

---

## Prueba 8: Guards por Rol - Admin

### Objetivo
Verificar que un admin NO puede acceder a rutas del coach.

### Pasos
1. Autenticarse como admin
2. Intentar navegar directamente a:
   - `/coach`
   - `/coach/availability`
   - `/coach/schedule`
   - `/coach/attendance`
3. Verificar que se redirige al home del admin (`/admin`)

### Resultado Esperado
✅ Admin NO puede acceder a rutas del coach
✅ Redirección automática a `/admin`
✅ Guards funcionan correctamente

---

## Prueba 9: Guards por Rol - Coach

### Objetivo
Verificar que un coach SÍ puede acceder a todas sus rutas.

### Pasos
1. Autenticarse como coach
2. Navegar a:
   - `/coach` ✅
   - `/coach/availability` ✅
   - `/coach/schedule` ✅
   - `/coach/attendance` ✅
3. Verificar que todas las rutas cargan correctamente
4. Verificar que NO hay redirecciones

### Resultado Esperado
✅ Coach puede acceder a todas sus rutas
✅ No hay redirecciones
✅ Guards permiten acceso correcto

---

## Prueba 10: Responsive (Mobile)

### Objetivo
Verificar que todas las páginas funcionan correctamente en mobile.

### Pasos
1. Abrir DevTools y activar modo mobile
2. Autenticarse como coach
3. Navegar a cada página:
   - `/coach`
   - `/coach/availability`
   - `/coach/schedule`
   - `/coach/attendance`
4. Verificar que:
   - Texto es legible (>= 16px)
   - Botones son grandes (>= 48px)
   - Spacing es generoso
   - Bottom nav funciona
   - Todo el contenido es accesible

### Resultado Esperado
✅ Layout responsive funciona
✅ Texto legible en mobile
✅ Botones accesibles
✅ Spacing adecuado
✅ Bottom nav funciona

---

## Prueba 11: UX para +60

### Objetivo
Verificar que la UX es adecuada para usuarios +60.

### Pasos
1. Autenticarse como coach
2. Revisar cada página y verificar:
   - Texto base >= 16px
   - Botones altura >= 48px
   - Labels claros y descriptivos
   - Focus-visible ring visible
   - Spacing generoso
   - Contraste adecuado

### Resultado Esperado
✅ Texto grande y legible
✅ Botones grandes y accesibles
✅ Labels claros
✅ Focus visible
✅ Spacing generoso

---

## Prueba 12: Navegación Completa

### Objetivo
Verificar el flujo completo de navegación del coach.

### Pasos
1. Autenticarse como coach
2. Empezar en `/coach` (dashboard)
3. Navegar a `/coach/availability` desde:
   - Sidebar/Bottom nav
   - CTA en dashboard
4. Navegar a `/coach/schedule` desde:
   - Sidebar/Bottom nav
   - CTA en dashboard
5. Navegar a `/coach/attendance` (si hay link o desde otra página)
6. Verificar que la navegación es fluida y consistente

### Resultado Esperado
✅ Navegación fluida entre todas las páginas
✅ Links funcionan desde múltiples lugares
✅ Consistencia en la navegación

---

## Checklist Final

- [ ] Navegación desktop muestra 3 items
- [ ] Navegación mobile muestra 3 items
- [ ] Dashboard muestra cards correctas
- [ ] Disponibilidad muestra placeholder útil
- [ ] Agenda muestra placeholder útil
- [ ] Asistencia muestra placeholder útil
- [ ] Guards bloquean student
- [ ] Guards bloquean admin
- [ ] Guards permiten coach
- [ ] Responsive funciona
- [ ] UX para +60 adecuada
- [ ] Navegación completa funciona
