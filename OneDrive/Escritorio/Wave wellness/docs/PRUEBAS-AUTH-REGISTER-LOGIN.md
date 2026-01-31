# Pruebas: Registro + Login + Logout (PASO 6)

## Rutas a Visitar

### 1. Registro: `/auth/register`
### 2. Login: `/auth/login`
### 3. Logout: Desde cualquier ruta protegida (botón en Topbar)

---

## Prueba 1: Registro - Crear Cuenta

### Objetivo
Verificar que el registro crea usuario en Supabase Auth y profile en `public.profiles`.

### Pasos

1. **Visitar `/auth/register`**
   - Deberías ver el formulario con campos: Nombre Completo, Teléfono, Email, Contraseña
   - Todos los campos tienen labels reales (no solo placeholder)
   - Botón "Crear Cuenta" tiene altura >= 48px (h-12 o h-14)

2. **Completar formulario:**
   - Nombre Completo: `Juan Pérez`
   - Teléfono: `1234567890`
   - Email: `juan@example.com` (usa un email único)
   - Contraseña: `password123` (mínimo 6 caracteres)

3. **Validación en tiempo real:**
   - Dejar campo vacío y hacer blur → debería mostrar error
   - Email inválido → debería mostrar "Email inválido"
   - Contraseña < 6 caracteres → debería mostrar error

4. **Submit del formulario:**
   - Click en "Crear Cuenta"
   - Botón debería mostrar "Creando cuenta..." (loading state)
   - Debería aparecer toast de éxito: "¡Cuenta creada exitosamente!"
   - Después de 2 segundos, debería redirigir a `/auth/login`

### Verificaciones en Supabase

5. **Verificar usuario en Auth:**
   - Ve a Supabase Dashboard → Authentication → Users
   - Deberías ver el usuario con email `juan@example.com`
   - Anota el `User UID` (UUID)

6. **Verificar profile en DB:**
   - Ve a Supabase Dashboard → SQL Editor
   - Ejecuta:
   ```sql
   SELECT * FROM profiles WHERE email = 'juan@example.com';
   ```
   - O mejor:
   ```sql
   SELECT p.*, u.email 
   FROM profiles p
   JOIN auth.users u ON u.id = p.id
   WHERE u.email = 'juan@example.com';
   ```
   - Deberías ver:
     - `id`: UUID del usuario
     - `full_name`: `Juan Pérez`
     - `phone`: `1234567890`
     - `role`: `student`

### Resultado Esperado
- ✅ Usuario creado en Supabase Auth
- ✅ Profile creado en `public.profiles` con role `student`
- ✅ Toast de éxito mostrado
- ✅ Redirect a `/auth/login`

---

## Prueba 2: Registro - Error al Crear Profile

### Objetivo
Verificar que si falla crear profile, se muestra error claro.

### Pasos

1. **Simular error:**
   - Opción A: Temporalmente deshabilitar RLS en `profiles` y luego intentar insertar con datos inválidos
   - Opción B: Usar un email que ya existe (debería fallar en Auth primero)

2. **Si falla crear profile:**
   - Debería mostrar toast de error: "Error al crear perfil"
   - Mensaje: "Tu cuenta fue creada pero no se pudo completar tu perfil. Por favor contacta a soporte."
   - Aún así debería redirigir a `/auth/login`

### Resultado Esperado
- ✅ Error claro mostrado al usuario
- ✅ Usuario puede intentar iniciar sesión (admin puede crear profile manualmente)

---

## Prueba 3: Login - Credenciales Correctas

### Objetivo
Verificar que el login funciona y redirige al home correcto según el rol.

### Pasos

1. **Visitar `/auth/login`**
   - Deberías ver el formulario con campos: Email, Contraseña
   - Ambos campos tienen labels reales
   - Botón "Iniciar Sesión" tiene altura >= 48px

2. **Login con usuario registrado:**
   - Email: `juan@example.com` (el que creaste en Prueba 1)
   - Contraseña: `password123`

3. **Submit:**
   - Click en "Iniciar Sesión"
   - Botón debería mostrar "Iniciando sesión..." (loading state)
   - Debería aparecer toast de éxito: "¡Bienvenido!"
   - Debería redirigir a `/student` (porque role = 'student')

4. **Verificar redirect:**
   - Deberías ver el dashboard de student
   - Sidebar debería mostrar links de student
   - Topbar debería tener botón "Cerrar Sesión"

### Resultado Esperado
- ✅ Login exitoso
- ✅ Toast de éxito mostrado
- ✅ Redirect a `/student` (home del rol)

---

## Prueba 4: Login - Credenciales Incorrectas

### Objetivo
Verificar que se manejan correctamente los errores de credenciales.

### Pasos

1. **Visitar `/auth/login`**

2. **Intentar login con credenciales incorrectas:**
   - Email: `juan@example.com`
   - Contraseña: `wrongpassword`

3. **Submit:**
   - Debería mostrar toast de error
   - Título: "Error al iniciar sesión"
   - Descripción: "Email o contraseña incorrectos"

### Resultado Esperado
- ✅ Error claro mostrado
- ✅ No hay redirect
- ✅ Usuario puede intentar de nuevo

---

## Prueba 5: Login - Redirect por Rol (Student)

### Pasos

1. **Crear usuario student** (si no existe)
   - Usar `/auth/register` o crear manualmente en Supabase
   - Asegurar que `role = 'student'` en `profiles`

2. **Login:**
   - Iniciar sesión con usuario student
   - Verificar redirect a `/student`

### Resultado Esperado
- ✅ Redirect a `/student`

---

## Prueba 6: Login - Redirect por Rol (Coach)

### Pasos

1. **Crear usuario coach:**
   - Crear usuario en Supabase Auth
   - Crear profile con `role = 'coach'`:
   ```sql
   INSERT INTO profiles (id, full_name, phone, role)
   VALUES ('COACH_USER_ID', 'Coach Test', '2222222222', 'coach');
   ```

2. **Login:**
   - Iniciar sesión con usuario coach
   - Verificar redirect a `/coach`

### Resultado Esperado
- ✅ Redirect a `/coach`

---

## Prueba 7: Login - Redirect por Rol (Admin)

### Pasos

1. **Crear usuario admin:**
   - Crear usuario en Supabase Auth
   - Crear profile con `role = 'admin'`:
   ```sql
   INSERT INTO profiles (id, full_name, phone, role)
   VALUES ('ADMIN_USER_ID', 'Admin Test', '3333333333', 'admin');
   ```

2. **Login:**
   - Iniciar sesión con usuario admin
   - Verificar redirect a `/admin`

### Resultado Esperado
- ✅ Redirect a `/admin`

---

## Prueba 8: Logout

### Objetivo
Verificar que el logout funciona y bloquea rutas protegidas.

### Pasos

1. **Estar logueado:**
   - Iniciar sesión con cualquier usuario
   - Deberías estar en una ruta protegida (ej: `/student`)

2. **Cerrar sesión:**
   - Click en botón "Cerrar Sesión" en el Topbar
   - Debería aparecer toast: "Sesión cerrada"
   - Debería redirigir a `/auth/login`

3. **Verificar que rutas protegidas están bloqueadas:**
   - Intentar acceder directamente a `/student` (escribir en barra de direcciones)
   - Debería redirigir a `/auth/login`
   - Intentar acceder a `/coach`
   - Debería redirigir a `/auth/login`
   - Intentar acceder a `/admin`
   - Debería redirigir a `/auth/login`

### Resultado Esperado
- ✅ Logout exitoso
- ✅ Toast de confirmación
- ✅ Redirect a `/auth/login`
- ✅ Rutas protegidas bloqueadas después de logout

---

## Prueba 9: Validación de Formularios

### Registro

1. **Campo vacío:**
   - Dejar "Nombre Completo" vacío y hacer blur
   - Debería mostrar: "El nombre debe tener al menos 2 caracteres"

2. **Email inválido:**
   - Escribir `invalid-email` en campo email
   - Debería mostrar: "Email inválido"

3. **Contraseña corta:**
   - Escribir `123` en campo contraseña
   - Debería mostrar: "La contraseña debe tener al menos 6 caracteres"

### Login

1. **Email vacío:**
   - Dejar email vacío y hacer blur
   - Debería mostrar: "El email es requerido"

2. **Contraseña vacía:**
   - Dejar contraseña vacía y hacer blur
   - Debería mostrar: "La contraseña es requerida"

---

## Prueba 10: Accesibilidad (Focus Visible)

### Pasos

1. **Abrir `/auth/register` o `/auth/login`**

2. **Navegar con Tab:**
   - Presionar Tab repetidamente
   - Verificar que:
     - [ ] Cada campo muestra ring de focus visible
     - [ ] El ring es claro y visible (2px mínimo)
     - [ ] Puedes navegar todo el formulario con Tab
     - [ ] Puedes enviar el form con Enter

3. **Verificar labels:**
   - [ ] Cada input tiene un label asociado
   - [ ] Los labels son visibles y legibles (16px mínimo)

---

## Checklist Final

### Registro
- [ ] Formulario muestra todos los campos con labels
- [ ] Validación funciona en tiempo real
- [ ] Submit crea usuario en Supabase Auth
- [ ] Submit crea profile en `public.profiles` con role 'student'
- [ ] Toast de éxito mostrado
- [ ] Redirect a `/auth/login` después de éxito
- [ ] Error claro si falla crear profile

### Login
- [ ] Formulario muestra campos con labels
- [ ] Login exitoso redirige según rol:
  - [ ] student → `/student`
  - [ ] coach → `/coach`
  - [ ] admin → `/admin`
- [ ] Errores manejados correctamente:
  - [ ] Credenciales incorrectas
  - [ ] Email no confirmado (si aplica)
- [ ] Toast de éxito mostrado

### Logout
- [ ] Botón "Cerrar Sesión" visible en Topbar
- [ ] Logout redirige a `/auth/login`
- [ ] Rutas protegidas bloqueadas después de logout
- [ ] Toast de confirmación mostrado

### UI/UX
- [ ] Componentes usan shadcn/ui base (no Kokonut)
- [ ] Botones tienen altura >= 48px
- [ ] Inputs tienen altura >= 48px
- [ ] Texto es legible (16px mínimo)
- [ ] Focus ring visible al hacer Tab
- [ ] Labels reales (no solo placeholder)
- [ ] Spacing generoso

---

## Notas Adicionales

### Si el registro falla al crear profile:

1. El usuario puede intentar iniciar sesión
2. El admin puede crear el profile manualmente:
   ```sql
   INSERT INTO profiles (id, full_name, phone, role)
   VALUES ('USER_ID', 'Nombre', 'Teléfono', 'student');
   ```

### Si el login no redirige correctamente:

1. Verificar que el profile existe en la base de datos
2. Verificar que el role es correcto
3. Verificar que `getCurrentProfile()` funciona (ya probado en PASO 4)

### Debugging

- Revisar consola del navegador para errores
- Revisar consola del servidor para errores
- Verificar cookies de Supabase en DevTools
- Verificar que las variables de entorno están configuradas
