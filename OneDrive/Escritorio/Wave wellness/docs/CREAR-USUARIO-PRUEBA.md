# Cómo Crear Usuario y Profile para Pruebas

## Opción 1: Desde Supabase Dashboard (Recomendado)

### Paso 1: Crear Usuario en Auth

1. Ve a **Supabase Dashboard** → Tu proyecto
2. Ve a **Authentication** → **Users** (menú lateral)
3. Click en **"Add user"** → **"Create new user"**
4. Completa:
   - **Email:** `test@example.com` (o el que prefieras)
   - **Password:** `test123456` (o el que prefieras, mínimo 6 caracteres)
   - **Auto Confirm User:** ✅ Marca esta casilla (importante para pruebas)
5. Click en **"Create user"**
6. **Anota el User UID** (UUID) que aparece en la lista de usuarios

### Paso 2: Crear Profile en la Base de Datos

1. Ve a **SQL Editor** en Supabase Dashboard
2. Crea un nuevo query
3. Copia y pega este SQL (reemplaza `TU_USER_ID_AQUI` con el UUID del paso anterior):

```sql
INSERT INTO profiles (id, full_name, phone, role)
VALUES (
  'TU_USER_ID_AQUI',  -- Reemplaza con el UUID del usuario creado
  'Usuario de Prueba',
  '1234567890',
  'student'
);
```

4. Click en **"Run"** o presiona `Ctrl+Enter`
5. Deberías ver: `Success. No rows returned`

### Paso 3: Verificar que se Creó Correctamente

Ejecuta este SQL para verificar:

```sql
SELECT 
  p.id,
  p.full_name,
  p.phone,
  p.role,
  u.email
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.id = 'TU_USER_ID_AQUI';  -- Reemplaza con tu UUID
```

Deberías ver una fila con todos los datos.

---

## Opción 2: Usar el Formulario de Registro (Si Existe)

Si ya tienes una página de registro implementada:

1. Ve a `/auth/register`
2. Completa el formulario
3. El sistema debería crear automáticamente el usuario y profile

**Nota:** Si el registro no crea el profile automáticamente, tendrás que crearlo manualmente con el SQL de arriba.

---

## Opción 3: Crear Usuario con SQL (Solo para Desarrollo)

⚠️ **ADVERTENCIA:** Esto solo funciona si tienes acceso al service role key. No lo uses en producción.

```sql
-- 1. Crear usuario en auth.users (requiere permisos especiales)
-- Normalmente esto se hace desde el frontend o dashboard

-- 2. Una vez creado el usuario, crear profile:
INSERT INTO profiles (id, full_name, phone, role)
VALUES (
  gen_random_uuid(),  -- O usa el UUID del usuario creado
  'Test User',
  '1234567890',
  'student'
);
```

---

## Iniciar Sesión

Una vez creado el usuario y profile:

1. Ve a `/auth/login`
2. Ingresa el email y password que usaste al crear el usuario
3. Click en "Iniciar Sesión"
4. Deberías ser redirigido y ver tu sesión activa

---

## Verificar que Todo Funciona

1. **Visita `/test-helpers`**
   - Deberías ver:
     - ✅ Usuario autenticado
     - ✅ Profile encontrado

2. **Verifica cookies:**
   - DevTools (F12) → Application → Cookies
   - Deberías ver cookies que empiezan con `sb-`

3. **Prueba rutas protegidas:**
   - Visita `/student` o `/coach` o `/admin`
   - Deberías ver el layout (no redirección a login)

---

## Solución de Problemas

### Error: "Invalid login credentials"

**Causa:** Email o password incorrectos

**Solución:**
- Verifica que el email y password sean exactamente los que usaste al crear el usuario
- Si olvidaste el password, puedes resetearlo desde Supabase Dashboard → Authentication → Users → Click en el usuario → "Reset password"

### Error: "User not found" o getCurrentProfile() retorna null

**Causa:** El profile no existe en la tabla `profiles`

**Solución:**
1. Verifica que ejecutaste el SQL para crear el profile
2. Verifica que el `id` en `profiles` coincide exactamente con el `id` del usuario en `auth.users`
3. Ejecuta este SQL para verificar:

```sql
-- Verificar si el profile existe
SELECT * FROM profiles WHERE id = 'TU_USER_ID_AQUI';

-- Verificar si el usuario existe
SELECT id, email FROM auth.users WHERE id = 'TU_USER_ID_AQUI';
```

### Error: "new row violates row-level security policy"

**Causa:** Las RLS policies no están configuradas correctamente

**Solución:**
1. Verifica que ejecutaste `supabase/rls.sql` en Supabase SQL Editor
2. Verifica que la policy `profiles_select_own` existe:

```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

---

## Checklist Rápido

- [ ] Usuario creado en Supabase Auth (Authentication → Users)
- [ ] User UID anotado
- [ ] Profile creado en la tabla `profiles` con el mismo `id` que el usuario
- [ ] RLS policies aplicadas (`supabase/rls.sql` ejecutado)
- [ ] Login exitoso en `/auth/login`
- [ ] `/test-helpers` muestra usuario autenticado y profile encontrado

---

## Ejemplo Completo de SQL

```sql
-- 1. Primero crea el usuario desde Supabase Dashboard → Authentication → Users
-- Anota el UUID del usuario (ejemplo: '550e8400-e29b-41d4-a716-446655440000')

-- 2. Luego ejecuta esto (reemplaza con tu UUID real):
INSERT INTO profiles (id, full_name, phone, role)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',  -- Tu UUID aquí
  'Usuario de Prueba',
  '1234567890',
  'student'
);

-- 3. Verificar:
SELECT 
  p.id,
  p.full_name,
  p.phone,
  p.role,
  u.email
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.id = '550e8400-e29b-41d4-a716-446655440000';
```
