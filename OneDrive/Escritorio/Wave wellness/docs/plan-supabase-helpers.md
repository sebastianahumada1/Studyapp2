# Plan: Supabase Helpers + getCurrentProfile() (PASO 4)

## Definition of Done (DoD)

- [ ] `src/lib/supabase/server.ts` implementado correctamente con cookies
- [ ] `src/lib/supabase/client.ts` implementado correctamente para browser
- [ ] `src/lib/auth/getCurrentProfile.ts` creado con función `getCurrentProfile()`
- [ ] Tipo `Profile` definido según schema.sql (id, full_name, phone, role)
- [ ] `getCurrentProfile()` retorna `Profile | null` (no lanza redirect)
- [ ] `getCurrentProfile()` maneja caso de usuario sin profile (retorna null)
- [ ] TypeScript estricto (sin `any`, tipos explícitos)
- [ ] Solo usa columnas que existen en `profiles` (id, full_name, phone, role, created_at)
- [ ] Ejemplo de uso en `/(protected)/layout.tsx`
- [ ] Pasos de prueba documentados

## Lista de Archivos a Crear/Modificar

### Archivos a Modificar:
- `src/lib/supabase/server.ts` - Implementar helper server-side con cookies
- `src/lib/supabase/client.ts` - Implementar helper client-side
- `src/lib/auth/requireUser.ts` - Actualizar para usar getCurrentProfile (opcional)
- `src/lib/auth/requireRole.ts` - Actualizar para usar getCurrentProfile
- `src/app/(protected)/layout.tsx` - Ejemplo de uso de getCurrentProfile

### Archivos a Crear:
- `src/lib/auth/getCurrentProfile.ts` - Helper para obtener profile del usuario actual

## Estructura de Implementación

### 1. Tipos TypeScript

```typescript
// src/lib/auth/roles.ts (ya existe, solo agregar Profile)
export type Profile = {
  id: string
  full_name: string
  phone: string
  role: Role
  created_at?: string // opcional, no necesario para la mayoría de casos
}
```

### 2. getCurrentProfile()

**Ubicación:** `src/lib/auth/getCurrentProfile.ts`

**Comportamiento:**
- Obtiene usuario autenticado con `supabase.auth.getUser()`
- Si no hay sesión → retorna `null`
- Consulta `public.profiles` por `id = auth.uid()`
- Si no existe profile → retorna `null` (usuario sin profile)
- Retorna `Profile | null`

**Nota sobre usuario sin profile:**
- Retornar `null` y dejar que el guard decida qué hacer
- Documentar que el usuario debe completar su perfil

### 3. server.ts

**Requisitos:**
- Usar `createServerClient` de `@supabase/ssr`
- Manejar cookies correctamente con `cookies()` de Next.js
- Usar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- NO usar `SUPABASE_SERVICE_ROLE_KEY`

### 4. client.ts

**Requisitos:**
- Usar `createBrowserClient` de `@supabase/ssr`
- Usar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- NO usar `SUPABASE_SERVICE_ROLE_KEY`

### 5. Ejemplo de Uso

**En `/(protected)/layout.tsx`:**
```typescript
import { getCurrentProfile } from '@/lib/auth/getCurrentProfile'
import { redirect } from 'next/navigation'

export default async function ProtectedLayout({ children }) {
  const profile = await getCurrentProfile()
  
  if (!profile) {
    redirect('/auth/login')
  }
  
  // Usar profile.role para Sidebar
  return <Sidebar role={profile.role} />
}
```

## Pasos de Implementación

1. Actualizar tipos en `roles.ts` (agregar `Profile`)
2. Implementar `server.ts` con cookies
3. Implementar `client.ts` para browser
4. Crear `getCurrentProfile.ts` con lógica completa
5. Actualizar `requireRole.ts` para usar `getCurrentProfile()`
6. Actualizar `/(protected)/layout.tsx` con ejemplo de uso
7. Documentar pasos de prueba

## Testing

### Pasos para Probar:

1. **Confirmar que hay sesión:**
   - Login en `/auth/login`
   - Verificar cookies en DevTools
   - Verificar que `getCurrentProfile()` retorna profile

2. **Confirmar que getCurrentProfile devuelve datos:**
   - Usar en server component
   - Loggear resultado
   - Verificar que tiene id, full_name, phone, role

3. **Probar caso sin profile:**
   - Usuario autenticado pero sin profile en DB
   - Verificar que retorna `null`

4. **Probar caso sin sesión:**
   - Cerrar sesión
   - Verificar que retorna `null`
