# Bootstrap + Kokonut UI + Estructura Base

## Contexto
- Establecer base del proyecto Next.js con Kokonut UI como único design system
- Crear estructura de rutas públicas y protegidas con guards por rol
- Preparar helpers de Supabase y auth sin conectar DB real aún
- ¿Qué usuario lo necesita?: Desarrolladores que implementarán features posteriores

## Requisitos

### DB
- [ ] **No hay DB real aún** - Helpers son stubs, no se conecta a Supabase
- [ ] No inventar schema en este paso
- [ ] Helpers preparados para cuando exista schema.sql

### UI
- [ ] Componentes Kokonut UI: `Button`, `Input`, `Card`, `Table`, `Dialog/Modal`, `Toast/Alert`
- [ ] PROHIBIDO: sugerir librerías UI nuevas (shadcn, MUI, Chakra, etc.)
- [ ] Layout: Sidebar + Topbar con Kokonut UI
- [ ] Página `/ui` (solo dev) muestra ejemplos de componentes

### Rutas
- [ ] `/` - Landing pública
- [ ] `/auth/register` - Registro
- [ ] `/auth/login` - Login
- [ ] `/(protected)/student` - Dashboard estudiante
- [ ] `/(protected)/coach` - Dashboard coach
- [ ] `/(protected)/admin` - Dashboard admin
- [ ] `/ui` - Showcase de componentes (solo dev)

### Auth & Roles
- [ ] Helper `src/lib/auth/roles.ts` con tipo `Role = 'student'|'coach'|'admin'`
- [ ] Helpers `requireUser`, `requireRole` (stubs por ahora)
- [ ] Layout protegido `/(protected)` con guards
- [ ] Middleware para proteger rutas por rol

### Helpers
- [ ] `src/lib/supabase/client.ts` - Cliente para navegador (stub)
- [ ] `src/lib/supabase/server.ts` - Cliente para servidor (stub)
- [ ] No usar service_role en frontend

### Design Tokens
- [ ] Tailwind classes reutilizables para "Earth & Ocean"
- [ ] Background, text, accent, border colors
- [ ] Sin paleta compleja, solo tokens mínimos

## Implementación

1. Inicializar Next.js App Router + TypeScript strict + Tailwind
2. Instalar Kokonut UI
3. Crear estructura de carpetas: `src/app`, `src/components/ui`, `src/lib`
4. Crear helpers Supabase (stubs)
5. Crear helpers auth/roles
6. Crear rutas públicas
7. Crear layout protegido con sidebar/topbar
8. Crear rutas protegidas por rol
9. Crear página `/ui` con ejemplos
10. Crear design tokens en Tailwind

## Testing

- [ ] TypeScript compila sin errores (strict mode)
- [ ] UI usa solo Kokonut (verificar imports)
- [ ] Rutas públicas accesibles sin auth
- [ ] Rutas protegidas redirigen sin auth
- [ ] Layout muestra sidebar/topbar correctamente
- [ ] Página `/ui` muestra todos los componentes
- [ ] No hay referencias a librerías UI prohibidas
