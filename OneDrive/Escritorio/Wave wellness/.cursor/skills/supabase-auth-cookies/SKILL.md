# supabase-auth-cookies

## Cuando usar

Al implementar autenticación con Supabase en Next.js App Router. Obligatorio cuando hay problemas de sincronización de cookies entre cliente y servidor.

## Objetivo

Manejar correctamente las cookies de autenticación de Supabase para que se sincronicen entre cliente y servidor en Next.js App Router.

## Inputs obligatorios

- `/src/lib/supabase/client.ts` - Cliente del navegador
- `/src/lib/supabase/server.ts` - Cliente del servidor
- `@supabase/ssr` versión 0.5.0 o superior

## Procedimiento

### 1. Cliente del Navegador (client.ts)

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  // createBrowserClient maneja cookies automáticamente
  // NO configures cookies manualmente aquí
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
```

**IMPORTANTE:**
- NO uses `'use client'` en este archivo (se importa en componentes client)
- NO configures cookies manualmente
- `createBrowserClient` ya maneja las cookies automáticamente

### 2. Cliente del Servidor (server.ts)

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Ignore errors during static generation
        }
      },
    },
  })
}
```

**IMPORTANTE:**
- Siempre usa `await cookies()` (es async en Next.js 15+)
- `getAll()` debe retornar todas las cookies
- `setAll()` debe manejar errores silenciosamente

### 3. Login en Client Component

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = async (email: string, password: string) => {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // IMPORTANTE: Después del login, forzar recarga completa
    // Esto asegura que las cookies se sincronicen con el servidor
    window.location.href = '/dashboard'
    // O usar router.refresh() + router.push() si prefieres SPA
  }
}
```

**IMPORTANTE:**
- Después de `signInWithPassword()`, las cookies se establecen automáticamente
- Usa `window.location.href` para forzar recarga completa (recomendado)
- O usa `router.refresh()` + `router.push()` para SPA (puede tener problemas de sincronización)

### 4. Verificar Sesión en Server Component

```typescript
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedPage() {
  const supabase = await createClient()
  
  // Usar getSession() primero (más confiable que getUser())
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error || !session) {
    redirect('/auth/login')
  }

  // O usar getUser() si necesitas el user directamente
  const { data: { user } } = await supabase.auth.getUser()
  
  return <div>Welcome {user.email}</div>
}
```

**IMPORTANTE:**
- `getSession()` es más confiable que `getUser()` para verificar sesión
- `getUser()` hace una llamada al servidor, `getSession()` lee de cookies
- Si `getSession()` retorna `null`, las cookies no se están leyendo correctamente

### 5. Middleware (opcional pero recomendado)

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith('/protected')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}
```

## Problemas Comunes y Soluciones

### Problema: Cookies presentes pero `getSession()` retorna `null`

**Causa:** Las cookies no se están parseando correctamente

**Solución:**
1. Verifica que `@supabase/ssr` esté en versión 0.5.0 o superior
2. Asegúrate de que `getAll()` retorna todas las cookies (no solo las de Supabase)
3. Verifica que las cookies tienen el formato correcto (no deberían ser JSON)

### Problema: Cookies no se establecen después del login

**Causa:** `createBrowserClient` no está configurado correctamente

**Solución:**
- NO configures cookies manualmente en `createBrowserClient`
- Deja que `@supabase/ssr` maneje las cookies automáticamente
- Usa `window.location.href` después del login para forzar recarga

### Problema: Sesión se pierde al navegar

**Causa:** Las cookies no se están leyendo en cada request

**Solución:**
- Asegúrate de que `createServerClient` se llama en cada Server Component
- No caches el cliente de Supabase (crea uno nuevo en cada request)
- Verifica que `getAll()` retorna todas las cookies, no solo un subconjunto

## Checks

- [ ] `@supabase/ssr` versión 0.5.0 o superior
- [ ] `createBrowserClient` NO configura cookies manualmente
- [ ] `createServerClient` usa `await cookies()` correctamente
- [ ] `getAll()` retorna todas las cookies
- [ ] `setAll()` maneja errores silenciosamente
- [ ] Después del login, se usa `window.location.href` o `router.refresh()`
- [ ] `getSession()` se usa antes de `getUser()` cuando es posible
- [ ] No se cachea el cliente de Supabase entre requests

## Output obligatorio

**Archivos tocados:**
- `src/lib/supabase/client.ts` - Cliente del navegador
- `src/lib/supabase/server.ts` - Cliente del servidor
- Componentes que usan autenticación

**Pasos para probar:**
1. Login → verificar cookies en DevTools
2. Navegar a página protegida → verificar que sesión persiste
3. Recargar página → verificar que sesión persiste
4. Cerrar y abrir navegador → verificar que sesión persiste (si no expiró)
