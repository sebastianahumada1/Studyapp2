# Pruebas: Shell Protegido + Navegación por Rol + Páginas Base (PASO 7)

## Rutas a Visitar

### Student:
- `/student` - Dashboard
- `/student/payments` - Pagos

### Coach:
- `/coach` - Dashboard

### Admin:
- `/admin` - Dashboard
- `/admin/packages` - Paquetes
- `/admin/payments` - Pagos

---

## Prueba 1: Login como Student y Navegación

### Objetivo
Verificar que el login redirige correctamente y la navegación funciona.

### Pasos

1. **Login como student:**
   - Ir a `/auth/login`
   - Login con usuario student
   - Debería redirigir a `/student`

2. **Verificar Topbar:**
   - [ ] Topbar muestra "Wave Wellness" a la izquierda
   - [ ] Topbar muestra nombre del usuario (desktop)
   - [ ] Topbar muestra "Estudiante" (desktop)
   - [ ] Topbar muestra botón "Cerrar Sesión"

3. **Verificar Navegación Desktop (>= 768px):**
   - [ ] Sidebar visible a la izquierda
   - [ ] Sidebar muestra "Wave Wellness" como título
   - [ ] Sidebar muestra links: "Dashboard", "Pagos"
   - [ ] Link activo ("Dashboard") está destacado
   - [ ] Links tienen altura >= 48px
   - [ ] BottomNav NO visible (solo mobile)

4. **Verificar Navegación Mobile (< 768px):**
   - [ ] Sidebar NO visible
   - [ ] BottomNav visible en la parte inferior
   - [ ] BottomNav muestra 2 items: "Dashboard", "Pagos"
   - [ ] Items tienen iconos y texto
   - [ ] Item activo está destacado
   - [ ] Tap targets >= 44px

5. **Navegar entre páginas:**
   - Click en "Pagos" (sidebar o bottom nav)
   - [ ] Debería navegar a `/student/payments`
   - [ ] Link "Pagos" está activo
   - [ ] Contenido de la página carga correctamente

### Resultado Esperado
- ✅ Topbar muestra información del usuario
- ✅ Navegación funciona en desktop y mobile
- ✅ Links activos están destacados
- ✅ Navegación entre páginas funciona

---

## Prueba 2: Login como Coach y Navegación

### Pasos

1. **Login como coach:**
   - Login con usuario coach
   - Debería redirigir a `/coach`

2. **Verificar Navegación:**
   - [ ] Desktop: Sidebar muestra solo "Dashboard"
   - [ ] Mobile: BottomNav muestra solo "Dashboard"
   - [ ] Topbar muestra "Coach" como rol

3. **Verificar Página:**
   - [ ] Página muestra cards: Disponibilidad, Agenda, Clases Hoy
   - [ ] Cards tienen iconos
   - [ ] Texto es legible (16px mínimo)

### Resultado Esperado
- ✅ Navegación coach funciona
- ✅ Solo muestra link de Dashboard
- ✅ Página carga correctamente

---

## Prueba 3: Login como Admin y Navegación

### Pasos

1. **Login como admin:**
   - Login con usuario admin
   - Debería redirigir a `/admin`

2. **Verificar Navegación:**
   - [ ] Desktop: Sidebar muestra "Dashboard", "Paquetes", "Pagos"
   - [ ] Mobile: BottomNav muestra "Paquetes", "Pagos" (2 items)
   - [ ] Topbar muestra "Administrador" como rol

3. **Navegar a Paquetes:**
   - Click en "Paquetes"
   - [ ] Debería navegar a `/admin/packages`
   - [ ] Página muestra placeholder útil
   - [ ] Botón "Crear Paquete" está disabled

4. **Navegar a Pagos:**
   - Click en "Pagos"
   - [ ] Debería navegar a `/admin/payments`
   - [ ] Página muestra empty state
   - [ ] Empty state tiene icono y mensaje claro

### Resultado Esperado
- ✅ Navegación admin funciona
- ✅ Muestra links correctos según rol
- ✅ Páginas cargan correctamente

---

## Prueba 4: Responsive Design

### Desktop (>= 768px)

1. **Abrir en desktop o DevTools desktop view:**
   - [ ] Sidebar visible a la izquierda (w-64)
   - [ ] Topbar visible arriba (left-64 para compensar sidebar)
   - [ ] BottomNav NO visible
   - [ ] Main content tiene margin-left (ml-64)
   - [ ] Main content tiene padding adecuado

### Mobile (< 768px)

1. **Abrir en mobile o DevTools mobile view:**
   - [ ] Sidebar NO visible (hidden md:block)
   - [ ] Topbar visible arriba (left-0)
   - [ ] BottomNav visible abajo (fixed bottom-0)
   - [ ] Main content NO tiene margin-left
   - [ ] Main content tiene padding-bottom para bottom nav (pb-20)
   - [ ] Tap targets >= 44px en bottom nav

### Resultado Esperado
- ✅ Desktop: Sidebar + Topbar
- ✅ Mobile: Topbar + BottomNav (sin sidebar)
- ✅ Layout se adapta correctamente

---

## Prueba 5: Páginas Base - Student

### `/student`

1. **Verificar contenido:**
   - [ ] Título: "Dashboard"
   - [ ] Descripción: "Gestiona tus créditos y pagos"
   - [ ] Card "Créditos Disponibles" muestra "0"
   - [ ] Card "Estado de Pagos" muestra mensaje
   - [ ] CTA grande "Comprar / Subir Comprobante"
   - [ ] CTA tiene altura >= 56px (h-14)
   - [ ] CTA navega a `/student/payments`

2. **Verificar UI:**
   - [ ] Texto es legible (16px mínimo)
   - [ ] Cards tienen spacing generoso
   - [ ] Botones tienen altura >= 48px

### `/student/payments`

1. **Verificar contenido:**
   - [ ] Título: "Pagos"
   - [ ] Empty state con icono
   - [ ] Mensaje: "Aún no has realizado pagos"
   - [ ] CTA "Ver Planes Disponibles"
   - [ ] CTA tiene altura >= 56px

### Resultado Esperado
- ✅ Páginas muestran placeholders útiles
- ✅ CTAs funcionan correctamente
- ✅ UI es legible y accesible

---

## Prueba 6: Páginas Base - Coach

### `/coach`

1. **Verificar contenido:**
   - [ ] Título: "Dashboard"
   - [ ] 3 Cards: Disponibilidad, Agenda, Clases Hoy
   - [ ] Card "Clases Hoy" muestra "0"
   - [ ] Cards "Disponibilidad" y "Agenda" muestran "Próximamente"
   - [ ] Texto es legible (16px mínimo)

### Resultado Esperado
- ✅ Página muestra información útil
- ✅ Cards tienen iconos y descripciones

---

## Prueba 7: Páginas Base - Admin

### `/admin`

1. **Verificar contenido:**
   - [ ] Título: "Dashboard"
   - [ ] 2 Cards: "Gestionar Paquetes", "Revisar Pagos Pendientes"
   - [ ] Cards tienen botones "Ir a Paquetes" e "Ir a Pagos"
   - [ ] Botones navegan correctamente

### `/admin/packages`

1. **Verificar contenido:**
   - [ ] Título: "Paquetes"
   - [ ] Placeholder útil con descripción
   - [ ] Lista de funcionalidades próximas
   - [ ] Botón "Crear Paquete" está disabled

### `/admin/payments`

1. **Verificar contenido:**
   - [ ] Título: "Pagos"
   - [ ] Empty state con icono
   - [ ] Mensaje: "Los pagos pendientes aparecerán aquí"
   - [ ] Descripción útil

### Resultado Esperado
- ✅ Páginas muestran placeholders útiles
- ✅ Links funcionan correctamente
- ✅ Empty states son claros

---

## Prueba 8: Logout desde Topbar

### Pasos

1. **Estar logueado:**
   - Login con cualquier usuario
   - Deberías estar en una ruta protegida

2. **Cerrar sesión:**
   - Click en botón "Cerrar Sesión" en Topbar
   - [ ] Debería mostrar toast: "Sesión cerrada"
   - [ ] Debería redirigir a `/auth/login`

3. **Verificar que rutas están bloqueadas:**
   - Intentar acceder a `/student` directamente
   - [ ] Debería redirigir a `/auth/login`
   - Intentar acceder a `/coach`
   - [ ] Debería redirigir a `/auth/login`
   - Intentar acceder a `/admin`
   - [ ] Debería redirigir a `/auth/login`

### Resultado Esperado
- ✅ Logout funciona desde topbar
- ✅ Rutas protegidas quedan bloqueadas
- ✅ Toast de confirmación mostrado

---

## Prueba 9: Accesibilidad (Focus Visible)

### Pasos

1. **Abrir cualquier página protegida**

2. **Navegar con Tab:**
   - Presionar Tab repetidamente
   - [ ] Cada elemento interactivo muestra ring de focus visible
   - [ ] Ring es claro y visible (2px mínimo)
   - [ ] Puedes navegar todo el contenido con Tab
   - [ ] Puedes activar botones con Enter

3. **Verificar navegación:**
   - [ ] Links en sidebar/bottom nav tienen focus visible
   - [ ] Botones tienen focus visible
   - [ ] CTAs tienen focus visible

### Resultado Esperado
- ✅ Focus visible en todos los elementos interactivos
- ✅ Navegación completa con teclado posible

---

## Prueba 10: Estados de Carga y Error

### Nota
Los estados de carga y error se manejan en el layout. Si hay un error al obtener el profile, debería redirigir a login (ya implementado en PASO 5).

### Verificación
- [ ] Si no hay profile, redirige a `/auth/login`
- [ ] Guards por rol siguen funcionando (PASO 5)

---

## Checklist Final

### Layout Protegido
- [ ] Topbar muestra nombre y rol del usuario (desktop)
- [ ] Topbar muestra botón logout
- [ ] Sidebar visible en desktop (>= 768px)
- [ ] BottomNav visible en mobile (< 768px)
- [ ] Navegación adapta según rol

### Navegación por Rol
- [ ] Student: Dashboard, Pagos
- [ ] Coach: Dashboard
- [ ] Admin: Dashboard, Paquetes, Pagos

### Páginas Base
- [ ] `/student` - Cards útiles + CTA
- [ ] `/student/payments` - Empty state + CTA
- [ ] `/coach` - Cards de disponibilidad y agenda
- [ ] `/admin` - Cards con links
- [ ] `/admin/packages` - Placeholder + CTA disabled
- [ ] `/admin/payments` - Empty state

### UI/UX
- [ ] Componentes usan shadcn/ui base (no Kokonut)
- [ ] Texto >= 16px
- [ ] Botones >= 48px (CTAs >= 56px)
- [ ] Tap targets >= 44px
- [ ] Focus visible ring claro
- [ ] Spacing generoso

### Funcionalidad
- [ ] Logout funciona desde topbar
- [ ] Rutas protegidas bloqueadas después de logout
- [ ] Guards por rol siguen funcionando
- [ ] Navegación entre páginas funciona

---

## Notas Adicionales

### Para Probar en Mobile

1. Abre DevTools (F12)
2. Activa modo móvil (Ctrl+Shift+M)
3. Selecciona un dispositivo móvil (ej: iPhone 12)
4. Visita cualquier ruta protegida
5. Verifica:
   - BottomNav visible
   - Sidebar oculto
   - Tap targets fáciles de tocar

### Para Probar Responsive

1. Cambia el tamaño de la ventana del navegador
2. En >= 768px: debería mostrar sidebar
3. En < 768px: debería mostrar bottom nav
