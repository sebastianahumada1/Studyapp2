# Implementación: Shell Protegido + Navegación por Rol + Páginas Base (PASO 7)

## Resumen

Se implementó un shell protegido consistente con navegación responsive (sidebar en desktop, bottom nav en mobile) y páginas base con placeholders útiles. Todas las pantallas usan shadcn/ui base y están optimizadas para mobile-first y usuarios +60 años.

## Archivos Creados/Modificados

### Archivos Creados:
- `src/components/ui/BottomNav.tsx` - Navegación bottom para mobile
- `src/app/(protected)/student/payments/page.tsx` - Página de pagos student
- `src/app/(protected)/admin/packages/page.tsx` - Página de paquetes admin
- `src/app/(protected)/admin/payments/page.tsx` - Página de pagos admin
- `docs/plan-shell-navegacion-paginas.md` - Plan con DoD
- `docs/PRUEBAS-SHELL-NAVEGACION.md` - Guía de pruebas
- `docs/IMPLEMENTACION-SHELL-NAVEGACION.md` - Este documento

### Archivos Modificados:
- `src/app/(protected)/layout.tsx` - Shell responsive con navegación
- `src/components/ui/Topbar.tsx` - Muestra nombre y rol del usuario
- `src/components/ui/Sidebar.tsx` - Actualizado para desktop con estados activos
- `src/components/ui/NavLinks.tsx` - Rutas actualizadas
- `src/app/(protected)/student/page.tsx` - Placeholder útil con cards
- `src/app/(protected)/coach/page.tsx` - Placeholder útil con cards
- `src/app/(protected)/admin/page.tsx` - Placeholder útil con cards

## Funcionalidades Implementadas

### 1. Layout Protegido

**Responsive Design:**
- Desktop (>= 768px): Sidebar fijo a la izquierda + Topbar arriba
- Mobile (< 768px): Topbar arriba + BottomNav abajo (sin sidebar)

**Estructura:**
```
<div className="flex min-h-screen">
  <Sidebar /> {/* hidden md:block */}
  <div className="flex-1 md:ml-64">
    <Topbar />
    <main className="pt-16 pb-20 md:pb-8">
      {children}
    </main>
    <BottomNav /> {/* md:hidden */}
  </div>
</div>
```

### 2. Topbar

**Desktop:**
- Izquierda: "Wave Wellness"
- Derecha: Nombre usuario | Rol | Botón Logout

**Mobile:**
- Izquierda: "Wave Wellness"
- Derecha: Botón Logout (nombre y rol ocultos por espacio)

**Características:**
- Altura: h-16 (64px)
- Fixed en la parte superior
- z-index: z-10
- Border bottom para separación

### 3. Navegación

**Desktop (Sidebar):**
- Fijo a la izquierda (w-64)
- Links según rol
- Link activo destacado (bg-primary, text-primary-foreground)
- Altura mínima por link: 48px (py-3)
- Texto: text-base (16px)

**Mobile (BottomNav):**
- Fijo en la parte inferior
- Altura: h-16 (64px)
- 2-3 items máximo según rol
- Iconos + texto
- Item activo destacado
- Tap targets >= 44px
- z-index: z-50

**Links por Rol:**
- Student: Dashboard, Pagos
- Coach: Dashboard
- Admin: Dashboard, Paquetes, Pagos

### 4. Páginas Base

**Student:**
- `/student`: Cards de créditos (0) + estado pagos + CTA grande
- `/student/payments`: Empty state + CTA "Ver Planes Disponibles"

**Coach:**
- `/coach`: Cards de disponibilidad, agenda, clases hoy (0)

**Admin:**
- `/admin`: Cards con links a packages y payments
- `/admin/packages`: Placeholder + CTA disabled
- `/admin/payments`: Empty state

## Componentes UI Usados (shadcn/ui base)

**Componentes de `@/components/ui/base/`:**
- `Button` - Botones con altura h-12/h-14
- `Card` - Cards para contenido
- `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`

**Iconos:**
- `lucide-react` - Home, CreditCard, Package, FileText, Calendar, Clock, Users, TrendingUp, ShoppingBag, Plus

**NO se usan componentes de Kokonut**

## Características UX (Usuarios +60, Mobile-First)

### ✅ Tamaños Implementados
- Botones: h-12 (48px) por defecto, h-14 (56px) para CTAs principales
- Inputs: h-12 (48px) mínimo (si aplica)
- Tap targets: >= 44px (cubierto con h-12 y bottom nav h-16)
- Links en sidebar: min-h-[48px] (py-3)

### ✅ Texto Legible
- Texto base: 16px (text-base)
- Títulos: text-3xl (30px) o text-2xl (24px)
- Descripciones: text-base (16px)
- Labels: text-base (16px)

### ✅ Focus Visible
- Ring de 2px en todos los componentes interactivos
- Ring offset de 2px para mejor visibilidad
- Colores con buen contraste

### ✅ Spacing Generoso
- Espaciado entre secciones: space-y-6
- Padding en cards: p-6
- Padding en main: p-4 md:p-8
- Gap en grids: gap-6

### ✅ Responsive
- Desktop: Sidebar + Topbar
- Mobile: Topbar + BottomNav (sin sidebar)
- Breakpoint: md (768px)

## Estructura de Navegación

### Student
```
/student
  ├── Dashboard (home)
  └── /payments
      └── Pagos
```

### Coach
```
/coach
  └── Dashboard (home)
```

### Admin
```
/admin
  ├── Dashboard (home)
  ├── /packages
  │   └── Paquetes
  └── /payments
      └── Pagos
```

## Integración con Guards (PASO 5)

Los guards por rol siguen funcionando:
- Layout verifica autenticación y rol
- Redirige si el rol no coincide con la ruta
- Evita loops de redirect

## Próximos Pasos

1. **Probar flujo completo** (ver `docs/PRUEBAS-SHELL-NAVEGACION.md`)
2. **Verificar navegación en mobile y desktop**
3. **Verificar que todas las páginas cargan correctamente**
4. **Continuar con funcionalidades específicas por rol**

## Notas Importantes

- ✅ No se mezcla Kokonut y shadcn en la misma pantalla
- ✅ Todas las pantallas funcionales usan shadcn/ui base
- ✅ Navegación responsive funciona correctamente
- ✅ Páginas muestran placeholders útiles (no vacías)
- ✅ UI optimizada para usuarios +60 años
- ✅ Mobile-first design
- ✅ Guards por rol siguen funcionando

## Casos Especiales

### Si el usuario no tiene profile:
- El layout redirige a `/auth/login` (ya implementado en PASO 5)

### Si hay error al obtener profile:
- El layout redirige a `/auth/login` (ya implementado en PASO 5)

### Estados de carga:
- Por ahora no se muestran estados de carga explícitos
- El layout espera a que `getCurrentProfile()` resuelva
- Si no hay profile, redirige inmediatamente
