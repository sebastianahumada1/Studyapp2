# role-routing-guards

## Cuando usar

Al proteger rutas que requieren autenticación o roles específicos. Antes de crear cualquier ruta privada.

## Objetivo

Proteger rutas con guards en middleware/layout. Roles existen en schema.sql (no inventar tablas).

## Inputs obligatorios

- `/supabase/schema.sql` - Verificar tabla usuarios/roles
- Middleware/layout existente - Revisar patrones

## Procedimiento

1. Helper para verificar usuario autenticado:

```typescript
// lib/auth/requireUser.ts
import { createClient } from '@/lib/supabase/client';

export async function requireUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error('Unauthorized');
  }
  return user;
}
```

2. Helper para verificar admin (campo `role` en users):

```typescript
// lib/auth/requireAdmin.ts
import { requireUser } from './requireUser';
import { createClient } from '@/lib/supabase/client';

export async function requireAdmin() {
  const user = await requireUser();
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  if (error || data?.role !== 'admin') {
    throw new Error('Forbidden');
  }
  return user;
}
```

3. En middleware (Next.js App Router):

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireUser, requireAdmin } from '@/lib/auth/requireUser';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    try {
      await requireUser();
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  if (request.nextUrl.pathname.startsWith('/admin')) {
    try {
      await requireAdmin();
    } catch {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
  return NextResponse.next();
}
```

4. En layout server component (alternativa):

```typescript
// app/dashboard/layout.tsx
import { requireUser } from '@/lib/auth/requireUser';
import { redirect } from 'next/navigation';

export default async function DashboardLayout() {
  try {
    await requireUser();
  } catch {
    redirect('/login');
  }
  return <>{children}</>;
}
```

## Checks

- [ ] Guards en middleware o layout
- [ ] `requireUser` verifica autenticación
- [ ] `requireAdmin` verifica role (tabla/columna de schema.sql)
- [ ] No inventar tablas de roles (solo schema.sql)
- [ ] Redirecciones a `/login` o `/unauthorized`
- [ ] RLS policies protegen datos (doble capa - backup)

## Output obligatorio

**Archivos tocados:**
- `lib/auth/requireUser.ts`, `requireAdmin.ts`
- `middleware.ts` o `app/<route>/layout.tsx`

**Pasos para probar:**
1. Ruta sin auth → redirige `/login`
2. Usuario normal → accede `/dashboard`, no `/admin`
3. Admin → accede `/admin`
4. RLS bloquea queries sin auth
5. Bypass guard → RLS bloquea en DB
