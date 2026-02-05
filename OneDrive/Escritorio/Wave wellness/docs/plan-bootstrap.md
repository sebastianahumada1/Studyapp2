# Plan: Bootstrap + Kokonut UI + Estructura Base

## Definition of Done (DoD)

- [ ] Next.js App Router configurado con TypeScript strict
- [ ] Tailwind CSS configurado y funcionando
- [ ] Kokonut UI instalado y funcionando
- [ ] Todas las rutas creadas y accesibles
- [ ] Helpers Supabase creados (stubs, sin conexión real)
- [ ] Helpers auth/roles creados
- [ ] Layout protegido con sidebar + topbar usando Kokonut
- [ ] Guards de rutas funcionando (redirecciones)
- [ ] Página `/ui` muestra ejemplos de componentes Kokonut
- [ ] Design tokens "Earth & Ocean" en Tailwind
- [ ] TypeScript compila sin errores (strict)
- [ ] No hay imports de librerías UI prohibidas
- [ ] Estructura de carpetas limpia y organizada

## Lista de Archivos a Crear/Modificar

### Configuración Base
- `package.json` - Dependencias Next.js, TypeScript, Tailwind, Kokonut UI
- `tsconfig.json` - TypeScript strict
- `tailwind.config.ts` - Config con design tokens
- `next.config.js` - Config Next.js
- `.eslintrc.json` - ESLint config
- `.gitignore` - Git ignore

### Estructura App Router
- `src/app/layout.tsx` - Root layout
- `src/app/page.tsx` - Landing pública (/)
- `src/app/ui/page.tsx` - Showcase componentes (dev)
- `src/app/auth/register/page.tsx` - Registro
- `src/app/auth/login/page.tsx` - Login
- `src/app/(protected)/layout.tsx` - Layout protegido con sidebar/topbar
- `src/app/(protected)/student/page.tsx` - Dashboard estudiante
- `src/app/(protected)/coach/page.tsx` - Dashboard coach
- `src/app/(protected)/admin/page.tsx` - Dashboard admin

### Helpers Supabase
- `src/lib/supabase/client.ts` - Cliente navegador (stub)
- `src/lib/supabase/server.ts` - Cliente servidor (stub)

### Helpers Auth
- `src/lib/auth/roles.ts` - Tipo Role y helpers
- `src/lib/auth/requireUser.ts` - Verificar usuario autenticado
- `src/lib/auth/requireRole.ts` - Verificar rol específico

### Middleware
- `src/middleware.ts` - Guards de rutas

### Componentes UI
- `src/components/ui/Sidebar.tsx` - Sidebar con Kokonut
- `src/components/ui/Topbar.tsx` - Topbar con Kokonut
- `src/components/ui/NavLinks.tsx` - Links de navegación por rol

### Design Tokens
- `src/styles/tokens.css` - Variables CSS para Earth & Ocean (opcional, o en tailwind.config)

## Pasos de Implementación

1. Inicializar proyecto Next.js con TypeScript
2. Configurar Tailwind CSS
3. Instalar Kokonut UI
4. Crear estructura de carpetas
5. Configurar design tokens en Tailwind
6. Crear helpers Supabase (stubs)
7. Crear helpers auth/roles
8. Crear middleware con guards
9. Crear layout root
10. Crear rutas públicas
11. Crear layout protegido con sidebar/topbar
12. Crear rutas protegidas
13. Crear página /ui con ejemplos

## Pasos para Probar Local

1. `npm install` - Instalar dependencias
2. `npm run dev` - Iniciar servidor dev
3. Visitar rutas:
   - `http://localhost:3000` - Landing pública
   - `http://localhost:3000/auth/login` - Login
   - `http://localhost:3000/auth/register` - Registro
   - `http://localhost:3000/ui` - Showcase componentes
   - `http://localhost:3000/student` - Debe redirigir a /auth/login (sin auth)
   - `http://localhost:3000/coach` - Debe redirigir a /auth/login (sin auth)
   - `http://localhost:3000/admin` - Debe redirigir a /auth/login (sin auth)
4. Verificar que TypeScript compila: `npm run build` (debe pasar)
5. Verificar imports: buscar `shadcn`, `@mui`, `chakra` - no debe existir
