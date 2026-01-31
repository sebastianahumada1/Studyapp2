# Pruebas: Supabase Helpers + getCurrentProfile()

## Setup Inicial

### 1. Configurar Variables de Entorno

Asegúrate de tener `.env.local` con:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### 2. Crear Usuario de Prueba en Supabase

1. Ve a Supabase Dashboard → Authentication → Users
2. Crea un usuario manualmente o usa el flujo de registro
3. Anota el `user_id` (UUID) del usuario creado

### 3. Crear Profile en la Base de Datos

Ejecuta en Supabase SQL Editor:

```sql
-- Reemplaza 'USER_ID_AQUI' con el UUID del usuario creado
INSERT INTO profiles (id, full_name, phone, role)
VALUES (
  'USER_ID_AQUI',
  'Usuario de Prueba',
  '1234567890',
  'student'
);
```

---

## Prueba 1: Confirmar que hay sesión

### Objetivo
Verificar que el cliente de Supabase puede detectar la sesión del usuario.

### Pasos

1. **Iniciar sesión:**
   - Ve a `/auth/login` (o implementa el login si no existe)
   - Inicia sesión con el usuario de prueba

2. **Verificar cookies en DevTools:**
   - Abre DevTools (F12) → Application/Storage → Cookies
   - Busca cookies que empiecen con `sb-` (Supabase)
   - Deberías ver cookies como `sb-<project-ref>-auth-token`

3. **Verificar en consola del navegador:**
   ```typescript
   // En la consola del navegador (client-side)
   import { createClient } from '@/lib/supabase/client'
   const supabase = createClient()
   const { data: { user } } = await supabase.auth.getUser()
   console.log('Usuario autenticado:', user)
   ```
   - Deberías ver el objeto `user` con `id`, `email`, etc.

4. **Verificar en Server Component:**
   - Crea una página de prueba temporal:
   ```typescript
   // src/app/test-auth/page.tsx
   import { createClient } from '@/lib/supabase/server'
   
   export default async function TestAuthPage() {
     const supabase = await createClient()
     const { data: { user } } = await supabase.auth.getUser()
     
     return (
       <div>
         <h1>Test Auth</h1>
         <pre>{JSON.stringify(user, null, 2)}</pre>
       </div>
     )
   }
   ```
   - Visita `/test-auth`
   - Deberías ver el objeto `user` renderizado

### Resultado Esperado
- ✅ Cookies de Supabase presentes en el navegador
- ✅ `getUser()` retorna el usuario autenticado en client y server
- ✅ No hay errores en la consola

---

## Prueba 2: Confirmar que getCurrentProfile() devuelve datos

### Objetivo
Verificar que `getCurrentProfile()` retorna el perfil correcto del usuario.

### Pasos

1. **Crear página de prueba:**
   ```typescript
   // src/app/test-profile/page.tsx
   import { getCurrentProfile } from '@/lib/auth/getCurrentProfile'
   
   export default async function TestProfilePage() {
     const profile = await getCurrentProfile()
     
     return (
       <div className="p-8">
         <h1 className="text-2xl font-bold mb-4">Test Profile</h1>
         {profile ? (
           <div>
             <p><strong>ID:</strong> {profile.id}</p>
             <p><strong>Nombre:</strong> {profile.full_name}</p>
             <p><strong>Teléfono:</strong> {profile.phone}</p>
             <p><strong>Role:</strong> {profile.role}</p>
             <p><strong>Created At:</strong> {profile.created_at}</p>
           </div>
         ) : (
           <p className="text-red-500">No hay perfil (usuario no autenticado o sin profile)</p>
         )}
       </div>
     )
   }
   ```

2. **Visitar la página:**
   - Asegúrate de estar autenticado
   - Visita `/test-profile`
   - Deberías ver todos los datos del perfil

3. **Verificar en layout protegido:**
   - Visita cualquier ruta bajo `/(protected)/` (ej: `/student`)
   - El layout debería renderizar correctamente con el role del usuario
   - Verifica que el Sidebar muestra los links correctos según el role

4. **Verificar en consola del servidor:**
   - Agrega un `console.log` temporal en `getCurrentProfile()`:
   ```typescript
   console.log('getCurrentProfile - profile:', profile)
   ```
   - Revisa los logs del servidor (terminal donde corre `npm run dev`)
   - Deberías ver el objeto profile en los logs

### Resultado Esperado
- ✅ `getCurrentProfile()` retorna objeto con `id`, `full_name`, `phone`, `role`
- ✅ El layout protegido usa el role correcto
- ✅ No hay errores en la consola del servidor

---

## Prueba 3: Probar caso sin profile

### Objetivo
Verificar que `getCurrentProfile()` maneja correctamente el caso de usuario sin profile.

### Pasos

1. **Crear usuario sin profile:**
   - Crea un nuevo usuario en Supabase Auth
   - **NO** crees un registro en la tabla `profiles` para este usuario

2. **Iniciar sesión con este usuario:**
   - Inicia sesión con el usuario sin profile

3. **Verificar getCurrentProfile():**
   - Visita `/test-profile`
   - Deberías ver el mensaje: "No hay perfil (usuario no autenticado o sin profile)"

4. **Verificar redirección:**
   - Intenta visitar `/(protected)/student`
   - Deberías ser redirigido a `/auth/login` (porque `getCurrentProfile()` retorna `null`)

### Resultado Esperado
- ✅ `getCurrentProfile()` retorna `null` para usuario sin profile
- ✅ El layout protegido redirige a login cuando no hay profile
- ✅ No hay errores en la consola

---

## Prueba 4: Probar caso sin sesión

### Objetivo
Verificar que `getCurrentProfile()` maneja correctamente el caso de usuario no autenticado.

### Pasos

1. **Cerrar sesión:**
   - Cierra sesión del usuario actual
   - O abre una ventana de incógnito

2. **Verificar getCurrentProfile():**
   - Visita `/test-profile`
   - Deberías ver el mensaje: "No hay perfil (usuario no autenticado o sin profile)"

3. **Verificar redirección:**
   - Intenta visitar `/(protected)/student`
   - Deberías ser redirigido a `/auth/login`

4. **Verificar cookies:**
   - En DevTools, verifica que no hay cookies de Supabase
   - O que las cookies están vacías/inválidas

### Resultado Esperado
- ✅ `getCurrentProfile()` retorna `null` para usuario no autenticado
- ✅ El layout protegido redirige a login
- ✅ No hay errores en la consola

---

## Prueba 5: Probar requireRole()

### Objetivo
Verificar que `requireRole()` funciona correctamente con diferentes roles.

### Pasos

1. **Crear usuarios con diferentes roles:**
   ```sql
   -- Usuario student
   INSERT INTO profiles (id, full_name, phone, role)
   VALUES ('STUDENT_USER_ID', 'Student Test', '1111111111', 'student');
   
   -- Usuario admin
   INSERT INTO profiles (id, full_name, phone, role)
   VALUES ('ADMIN_USER_ID', 'Admin Test', '2222222222', 'admin');
   ```

2. **Probar con student:**
   - Inicia sesión como student
   - Crea una página que use `requireRole('student')`:
   ```typescript
   // src/app/test-role/page.tsx
   import { requireRole } from '@/lib/auth/requireRole'
   
   export default async function TestRolePage() {
     try {
       const profile = await requireRole('student')
       return <div>Role correcto: {profile.role}</div>
     } catch {
       return <div>Forbidden</div>
     }
   }
   ```
   - Visita `/test-role` como student → debería funcionar
   - Intenta `requireRole('admin')` como student → debería fallar

3. **Probar con admin:**
   - Inicia sesión como admin
   - Visita `/test-role` con `requireRole('admin')` → debería funcionar
   - Intenta `requireRole('student')` como admin → debería fallar

### Resultado Esperado
- ✅ `requireRole('student')` funciona para usuarios con role 'student'
- ✅ `requireRole('admin')` funciona para usuarios con role 'admin'
- ✅ `requireRole()` lanza error cuando el role no coincide
- ✅ No hay errores en la consola

---

## Checklist Final

- [ ] Variables de entorno configuradas correctamente
- [ ] Usuario de prueba creado en Supabase Auth
- [ ] Profile creado en la tabla `profiles`
- [ ] Prueba 1: Sesión detectada correctamente
- [ ] Prueba 2: `getCurrentProfile()` retorna datos
- [ ] Prueba 3: Usuario sin profile retorna `null`
- [ ] Prueba 4: Usuario no autenticado retorna `null`
- [ ] Prueba 5: `requireRole()` funciona correctamente
- [ ] No hay errores de TypeScript
- [ ] No hay errores en la consola del navegador
- [ ] No hay errores en la consola del servidor

---

## Notas Adicionales

### Debugging

Si `getCurrentProfile()` retorna `null` pero el usuario está autenticado:

1. **Verificar que el profile existe:**
   ```sql
   SELECT * FROM profiles WHERE id = 'USER_ID';
   ```

2. **Verificar RLS policies:**
   - Asegúrate de que las policies de `profiles` permiten SELECT del propio perfil
   - Verifica que `auth.uid() = id` funciona correctamente

3. **Verificar logs del servidor:**
   - Revisa los logs para ver si hay errores de Supabase
   - Verifica que las queries se están ejecutando correctamente

### Errores Comunes

- **"Missing Supabase environment variables"**
  - Verifica que `.env.local` existe y tiene las variables correctas
  - Reinicia el servidor de desarrollo después de agregar variables

- **"new row violates row-level security policy"**
  - Verifica que las RLS policies están configuradas correctamente
  - Asegúrate de que el usuario tiene permisos para leer su propio profile

- **"User not found"**
  - Verifica que el usuario existe en `auth.users`
  - Verifica que el profile existe en `profiles` con el mismo `id`
