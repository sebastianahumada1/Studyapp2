# Implementación: Supabase Helpers + getCurrentProfile() (PASO 4)

## Resumen

Se implementaron los helpers de Supabase para Next.js App Router y la función `getCurrentProfile()` que obtiene el perfil del usuario autenticado desde la tabla `profiles`.

## Archivos Creados/Modificados

### Archivos Creados:
- `src/lib/auth/getCurrentProfile.ts` - Helper para obtener el perfil del usuario actual
- `docs/plan-supabase-helpers.md` - Plan de implementación
- `docs/PRUEBAS-SUPABASE-HELPERS.md` - Guía de pruebas
- `docs/IMPLEMENTACION-SUPABASE-HELPERS.md` - Este documento

### Archivos Modificados:
- `src/lib/supabase/server.ts` - Implementación completa con cookies
- `src/lib/supabase/client.ts` - Implementación completa para browser
- `src/lib/auth/roles.ts` - Agregado tipo `Profile`
- `src/lib/auth/requireUser.ts` - Actualizado para usar server client
- `src/lib/auth/requireRole.ts` - Actualizado para usar `getCurrentProfile()`
- `src/app/(protected)/layout.tsx` - Ejemplo de uso de `getCurrentProfile()`

## Implementación Detallada

### 1. Tipos TypeScript

**Archivo:** `src/lib/auth/roles.ts`

```typescript
export type Profile = {
  id: string
  full_name: string
  phone: string
  role: Role
  created_at?: string
}
```

El tipo `Profile` coincide exactamente con las columnas de la tabla `profiles` en `schema.sql`.

---

### 2. Helper Server-Side

**Archivo:** `src/lib/supabase/server.ts`

**Características:**
- Usa `createServerClient` de `@supabase/ssr`
- Maneja cookies automáticamente con `cookies()` de Next.js
- Valida variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- NO usa `SUPABASE_SERVICE_ROLE_KEY`
- Maneja errores de cookies en server components (static generation)

**Uso:**
```typescript
const supabase = await createClient()
const { data } = await supabase.from('profiles').select('*')
```

---

### 3. Helper Client-Side

**Archivo:** `src/lib/supabase/client.ts`

**Características:**
- Usa `createBrowserClient` de `@supabase/ssr`
- Maneja cookies automáticamente en el navegador
- Valida variables de entorno
- NO usa `SUPABASE_SERVICE_ROLE_KEY`

**Uso:**
```typescript
'use client'

const supabase = createClient()
const { data } = await supabase.from('profiles').select('*')
```

---

### 4. getCurrentProfile()

**Archivo:** `src/lib/auth/getCurrentProfile.ts`

**Comportamiento:**
1. Obtiene usuario autenticado con `supabase.auth.getUser()`
2. Si no hay sesión → retorna `null`
3. Consulta `public.profiles` por `id = auth.uid()`
4. Si no existe profile → retorna `null`
5. Valida que el role sea válido
6. Retorna `Profile | null`

**Características:**
- ✅ No lanza redirect (deja que el guard decida)
- ✅ Maneja caso de usuario sin profile
- ✅ TypeScript estricto (sin `any`)
- ✅ Solo usa columnas que existen en `schema.sql`

**Uso:**
```typescript
const profile = await getCurrentProfile()
if (!profile) {
  redirect('/auth/login')
}
// Usar profile.role, profile.full_name, etc.
```

---

### 5. requireUser()

**Archivo:** `src/lib/auth/requireUser.ts`

**Actualización:**
- Ahora usa `createClient()` de `server.ts` (no `client.ts`)
- Funciona correctamente en Server Components

**Uso:**
```typescript
try {
  const user = await requireUser()
  // Usar user.id, user.email, etc.
} catch {
  redirect('/auth/login')
}
```

---

### 6. requireRole()

**Archivo:** `src/lib/auth/requireRole.ts`

**Actualización:**
- Ahora usa `getCurrentProfile()` en lugar de consultar directamente
- Más simple y reutiliza la lógica de `getCurrentProfile()`

**Uso:**
```typescript
try {
  const profile = await requireRole('admin')
  // Usar profile.role, profile.full_name, etc.
} catch {
  redirect('/auth/login')
}
```

---

### 7. Ejemplo de Uso en Layout

**Archivo:** `src/app/(protected)/layout.tsx`

**Implementación:**
```typescript
const profile = await getCurrentProfile()

if (!profile) {
  redirect('/auth/login')
}

return <Sidebar role={profile.role} />
```

**Características:**
- Usa `getCurrentProfile()` para obtener el perfil
- Redirige a login si no hay perfil
- Pasa el role correcto al Sidebar

---

## Validaciones y Seguridad

### ✅ TypeScript Estricto
- Sin `any` en ningún lugar
- Tipos explícitos para todos los parámetros y retornos
- Tipos importados desde `roles.ts`

### ✅ Validación de Variables de Entorno
- Ambos helpers validan que existan `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Lanzan error descriptivo si faltan

### ✅ Validación de Schema
- `getCurrentProfile()` solo consulta columnas que existen en `schema.sql`
- Columnas consultadas: `id`, `full_name`, `phone`, `role`, `created_at`

### ✅ Manejo de Errores
- `getCurrentProfile()` retorna `null` en lugar de lanzar errores
- Permite que los guards decidan qué hacer con usuarios no autenticados

---

## Pruebas

Ver `docs/PRUEBAS-SUPABASE-HELPERS.md` para:
- Pasos detallados de prueba
- Casos de prueba (con sesión, sin sesión, sin profile)
- Ejemplos de código para testing
- Checklist de validación

---

## Próximos Pasos

1. **Implementar login/register:**
   - Crear páginas de autenticación que usen estos helpers
   - Crear profile automáticamente al registrar usuario

2. **Implementar guards de rutas:**
   - Usar `requireRole()` en middleware o layouts específicos
   - Proteger rutas `/admin`, `/coach`, `/student`

3. **Testing:**
   - Seguir los pasos en `docs/PRUEBAS-SUPABASE-HELPERS.md`
   - Verificar que todo funciona correctamente

---

## Notas Importantes

### Usuario sin Profile

Si un usuario está autenticado pero no tiene profile en la tabla `profiles`, `getCurrentProfile()` retorna `null`. 

**Solución:**
- Crear un flujo de "completar perfil" después del registro
- O crear el profile automáticamente con un trigger en Supabase

### Variables de Entorno

Asegúrate de tener `.env.local` con:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

**NO incluir:**
- `SUPABASE_SERVICE_ROLE_KEY` (no se usa en frontend)

---

## Checklist de Implementación

- [x] `server.ts` implementado con cookies
- [x] `client.ts` implementado para browser
- [x] `getCurrentProfile()` creado
- [x] Tipo `Profile` definido
- [x] `getCurrentProfile()` retorna `Profile | null`
- [x] Maneja caso de usuario sin profile
- [x] TypeScript estricto (sin `any`)
- [x] Solo usa columnas de `schema.sql`
- [x] Ejemplo de uso en layout
- [x] Pasos de prueba documentados
