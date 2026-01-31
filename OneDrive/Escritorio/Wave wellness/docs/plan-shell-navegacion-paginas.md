# Plan: Shell Protegido + Navegación por Rol + Páginas Base (PASO 7)

## Definition of Done (DoD)

- [ ] Layout protegido actualizado con shell consistente
- [ ] Topbar muestra: nombre del usuario, rol, botón Logout
- [ ] Navegación responsive:
  - Mobile: bottom navigation con 2-3 items según rol
  - Desktop: sidebar simple
- [ ] Links por rol implementados:
  - student: Dashboard, Pagos
  - coach: Dashboard
  - admin: Paquetes, Pagos
- [ ] Estados manejados: loading profile / error / sin profile (fallback + logout)
- [ ] Páginas base creadas con placeholders útiles:
  - `/student` - Cards de créditos y pagos + CTA
  - `/student/payments` - Empty state + CTA
  - `/coach` - Cards de disponibilidad y agenda
  - `/admin` - Cards de gestión + links
  - `/admin/packages` - Placeholder + CTA disabled
  - `/admin/payments` - Placeholder + empty state
- [ ] UI usa shadcn/ui base (no Kokonut)
- [ ] Mobile-first: tipografía >= 16px, botones >= 48px, tap targets >= 44px
- [ ] Focus visible ring claro
- [ ] Spacing generoso
- [ ] Guards por rol siguen funcionando

## Lista de Archivos a Crear/Modificar

### Archivos a Modificar:
- `src/app/(protected)/layout.tsx` - Actualizar shell con navegación responsive
- `src/components/ui/Topbar.tsx` - Mostrar nombre y rol del usuario
- `src/components/ui/Sidebar.tsx` - Actualizar para desktop
- `src/app/(protected)/student/page.tsx` - Placeholder útil
- `src/app/(protected)/coach/page.tsx` - Placeholder útil
- `src/app/(protected)/admin/page.tsx` - Placeholder útil

### Archivos a Crear:
- `src/components/ui/BottomNav.tsx` - Navegación bottom para mobile
- `src/app/(protected)/student/payments/page.tsx` - Página de pagos
- `src/app/(protected)/admin/packages/page.tsx` - Página de paquetes
- `src/app/(protected)/admin/payments/page.tsx` - Página de pagos admin

## Estructura de Implementación

### 1. Layout Protegido

**Responsive Design:**
- Desktop (>= 768px): Sidebar fijo a la izquierda + Topbar arriba
- Mobile (< 768px): Topbar arriba + BottomNav abajo (sin sidebar)

**Estados:**
- Loading: Mostrar skeleton o spinner
- Error: Mostrar mensaje de error + botón logout
- Sin profile: Mostrar mensaje + botón logout

### 2. Topbar

**Desktop:**
- Izquierda: Logo/Nombre app
- Derecha: Nombre usuario | Rol | Botón Logout

**Mobile:**
- Izquierda: Logo/Nombre app
- Derecha: Botón Logout (nombre y rol opcionales por espacio)

### 3. Navegación

**Desktop (Sidebar):**
- Links según rol
- Activo destacado
- Altura >= 48px por link

**Mobile (BottomNav):**
- Fijo en la parte inferior
- 2-3 items máximo según rol
- Iconos + texto
- Altura >= 56px
- Tap targets >= 44px

### 4. Páginas Base

**Student:**
- `/student`: Cards de créditos (0) + estado pagos + CTA grande
- `/student/payments`: Empty state + CTA "Ver planes"

**Coach:**
- `/coach`: Cards de disponibilidad, agenda, clases hoy

**Admin:**
- `/admin`: Cards con links a packages y payments
- `/admin/packages`: Placeholder + CTA disabled
- `/admin/payments`: Placeholder + empty state

## Componentes UI (shadcn/ui base)

**Usar:**
- `@/components/ui/base/button`
- `@/components/ui/base/card`
- `@/components/ui/base/input` (si aplica)

**NO usar:**
- Componentes de Kokonut

## Pasos de Implementación

1. Crear componente BottomNav
2. Actualizar Topbar para mostrar nombre y rol
3. Actualizar layout protegido para navegación responsive
4. Crear páginas base con placeholders
5. Probar en mobile y desktop

## Testing

### Prueba 1: Login y Navegación
- Login como student → verificar navegación student
- Login como coach → verificar navegación coach
- Login como admin → verificar navegación admin

### Prueba 2: Responsive
- Desktop: verificar sidebar visible
- Mobile: verificar bottom nav visible, sidebar oculto

### Prueba 3: Páginas
- Verificar que todas las páginas cargan
- Verificar que los CTAs funcionan (navegación)

### Prueba 4: Logout
- Verificar que logout funciona desde topbar
- Verificar que rutas quedan bloqueadas
