# Verificación Rápida: Supabase Helpers

## 🚀 Pasos Rápidos para Verificar

### 1. Verificar Variables de Entorno

Asegúrate de tener `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

**Verificar:**
```bash
# En PowerShell
Get-Content .env.local
```

O simplemente reinicia el servidor de desarrollo después de crear/editar `.env.local`.

---

### 2. Usar la Página de Prueba

Visita: **`http://localhost:3000/test-helpers`**

Esta página te mostrará:
- ✅ Si hay sesión activa
- ✅ Si `getCurrentProfile()` funciona
- ✅ Si las variables de entorno están configuradas

---

### 3. Crear Usuario y Profile de Prueba

#### Opción A: Desde Supabase Dashboard

1. **Crear usuario:**
   - Ve a Supabase Dashboard → Authentication → Users
   - Click en "Add user" → "Create new user"
   - Ingresa email y password
   - Anota el `User UID` (UUID)

2. **Crear profile:**
   - Ve a Supabase Dashboard → SQL Editor
   - Ejecuta este SQL (reemplaza `USER_ID_AQUI` con el UUID del usuario):

```sql
INSERT INTO profiles (id, full_name, phone, role)
VALUES (
  'USER_ID_AQUI',  -- Reemplaza con el UUID del usuario
  'Usuario de Prueba',
  '1234567890',
  'student'
);
```

#### Opción B: SQL Completo (crear usuario + profile)

```sql
-- 1. Crear usuario en auth (esto normalmente se hace desde el frontend)
-- Pero para pruebas, puedes usar Supabase Dashboard → Authentication → Users

-- 2. Una vez creado el usuario, obtener su ID y ejecutar:
INSERT INTO profiles (id, full_name, phone, role)
VALUES (
  'TU_USER_ID_AQUI',  -- Reemplaza con el UUID real
  'Test User',
  '1234567890',
  'student'
)
ON CONFLICT (id) DO NOTHING;
```

---

### 4. Iniciar Sesión

**Si ya tienes página de login:**
- Ve a `/auth/login` e inicia sesión con el usuario creado

**Si NO tienes página de login aún:**
- Puedes usar Supabase Dashboard → Authentication → Users
- Click en el usuario → "Send magic link" o usar el password que configuraste
- O crear una página de login temporal (ver abajo)

---

### 5. Verificar Resultados

Después de iniciar sesión:

1. **Visita `/test-helpers`**
   - Deberías ver:
     - ✅ Usuario autenticado (con ID y email)
     - ✅ Profile encontrado (con todos los datos)
     - ✅ Variables de entorno configuradas

2. **Visita cualquier ruta protegida:**
   - `/student` o `/coach` o `/admin`
   - Deberías ver el layout con Sidebar (no redirección a login)

3. **Verifica en consola del servidor:**
   - Abre la terminal donde corre `npm run dev`
   - No deberías ver errores relacionados con Supabase

---

## 🔍 Verificación Manual (Sin Página de Prueba)

### Verificar en Consola del Navegador

1. Abre DevTools (F12) → Console
2. Ejecuta:

```javascript
// Verificar que el cliente funciona
const { createClient } = await import('/src/lib/supabase/client.ts')
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
console.log('Usuario:', user)
```

### Verificar Cookies

1. DevTools → Application/Storage → Cookies
2. Busca cookies que empiecen con `sb-`
3. Deberías ver: `sb-<project-ref>-auth-token`

### Verificar en Server Component

Crea un archivo temporal:

```typescript
// src/app/test/page.tsx
import { getCurrentProfile } from '@/lib/auth/getCurrentProfile'

export default async function TestPage() {
  const profile = await getCurrentProfile()
  return <pre>{JSON.stringify(profile, null, 2)}</pre>
}
```

Visita `/test` y deberías ver el objeto profile o `null`.

---

## ❌ Solución de Problemas Comunes

### Error: "Missing Supabase environment variables"

**Solución:**
1. Verifica que `.env.local` existe en la raíz del proyecto
2. Verifica que tiene `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Reinicia el servidor de desarrollo (`npm run dev`)

### Error: "new row violates row-level security policy"

**Solución:**
1. Verifica que ejecutaste `supabase/rls.sql` en Supabase SQL Editor
2. Verifica que el usuario tiene permisos para leer su propio profile
3. Verifica que el `id` en `profiles` coincide con `auth.uid()`

### getCurrentProfile() retorna `null` pero hay sesión

**Causas posibles:**
1. **No hay profile en la tabla:**
   - Crea el profile con el SQL de arriba
   
2. **RLS bloqueando:**
   - Verifica que ejecutaste `supabase/rls.sql`
   - Verifica que la policy `profiles_select_own` existe

3. **ID no coincide:**
   - Verifica que el `id` en `profiles` es exactamente el mismo que `auth.uid()`

**Verificar:**
```sql
-- En Supabase SQL Editor
SELECT * FROM profiles WHERE id = auth.uid();
```

---

## ✅ Checklist de Verificación

- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Servidor de desarrollo reiniciado después de agregar env vars
- [ ] Usuario creado en Supabase Auth
- [ ] Profile creado en la tabla `profiles` con el mismo `id` que el usuario
- [ ] RLS policies aplicadas (`supabase/rls.sql` ejecutado)
- [ ] Sesión iniciada (cookies presentes en DevTools)
- [ ] `/test-helpers` muestra usuario autenticado
- [ ] `/test-helpers` muestra profile encontrado
- [ ] Rutas protegidas (`/student`, `/coach`, `/admin`) funcionan sin redirección
- [ ] No hay errores en consola del navegador
- [ ] No hay errores en consola del servidor

---

## 🎯 Resultado Esperado

Cuando todo funciona correctamente:

1. **Página `/test-helpers`:**
   ```
   ✅ Usuario autenticado
   ✅ Profile encontrado
   ✅ Variables de entorno configuradas
   ```

2. **Rutas protegidas:**
   - No redirigen a login
   - Muestran el layout con Sidebar
   - El Sidebar muestra los links correctos según el role

3. **Consolas:**
   - Sin errores de TypeScript
   - Sin errores de Supabase
   - Sin warnings de React

---

## 📝 Nota Final

Si después de seguir estos pasos algo no funciona, comparte:
1. El error exacto (de consola o pantalla)
2. Qué muestra `/test-helpers`
3. Si las variables de entorno están configuradas
4. Si el profile existe en la base de datos
