# Plan: Registro + Login + Logout + Redirect por Rol (PASO 6)

## Definition of Done (DoD)

- [ ] `/auth/register` implementado con shadcn/ui base
- [ ] Form de registro con: full_name, phone, email, password
- [ ] Validación con zod
- [ ] Al registrar: crea usuario en Supabase Auth + profile en `public.profiles`
- [ ] Manejo de errores: si falla crear profile, mostrar error claro
- [ ] UI states: loading + error + success (toast)
- [ ] `/auth/login` actualizado con shadcn/ui base
- [ ] Login correcto: redirect por rol (student/coach/admin)
- [ ] Manejo de errores: credenciales incorrectas, email no confirmado
- [ ] Logout implementado en Topbar
- [ ] Logout: redirect a `/auth/login` y bloquea rutas protegidas
- [ ] No se usa service role key
- [ ] No se inventan tablas/columnas fuera de schema.sql
- [ ] No se mezcla Kokonut y shadcn en la misma pantalla

## Lista de Archivos a Crear/Modificar

### Archivos a Modificar:
- `src/app/auth/register/page.tsx` - Implementar registro completo
- `src/app/auth/login/page.tsx` - Actualizar con shadcn/ui y redirect por rol
- `src/components/ui/Topbar.tsx` - Agregar botón de logout
- `package.json` - Agregar zod y @hookform/resolvers

### Archivos a Crear:
- `src/lib/validations/auth.ts` - Schemas de validación con zod

## Estructura de Implementación

### 1. Registro (`/auth/register`)

**Formulario:**
- full_name (text, requerido, min 2 caracteres)
- phone (text, requerido, formato válido)
- email (email, requerido, formato válido)
- password (password, requerido, min 6 caracteres)

**Validación con zod:**
```typescript
const registerSchema = z.object({
  full_name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  phone: z.string().min(10, 'Teléfono debe tener al menos 10 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
})
```

**Flujo:**
1. Validar form con zod
2. Crear usuario en Supabase Auth (`signUp`)
3. Si éxito, insertar profile en `public.profiles`:
   - id = auth user id
   - full_name, phone del form
   - role = 'student'
4. Mostrar toast de éxito
5. Redirect a `/auth/login`

**Manejo de errores:**
- Si falla crear usuario: mostrar error de Supabase
- Si falla crear profile: mostrar error claro y sugerir contactar soporte
- Mostrar loading durante el proceso

### 2. Login (`/auth/login`)

**Formulario:**
- email (email, requerido)
- password (password, requerido)

**Flujo:**
1. Validar form con zod
2. Login con Supabase Auth (`signInWithPassword`)
3. Si éxito:
   - Refrescar sesión
   - Obtener profile con `getCurrentProfile()` (client-side después de login)
   - Redirect por rol:
     - student → `/student`
     - coach → `/coach`
     - admin → `/admin`
4. Si error: mostrar mensaje claro

**Manejo de errores:**
- Credenciales incorrectas
- Email no confirmado (si aplica)
- Otros errores de Supabase

### 3. Logout

**Ubicación:** `src/components/ui/Topbar.tsx`

**Flujo:**
1. Botón "Cerrar Sesión" en Topbar
2. Al click: llamar `supabase.auth.signOut()`
3. Redirect a `/auth/login`
4. Verificar que rutas protegidas quedan bloqueadas

## Componentes UI (shadcn/ui base)

**Usar componentes de:**
- `@/components/ui/base/button`
- `@/components/ui/base/input`
- `@/components/ui/base/label`
- `@/components/ui/base/card`
- `@/components/ui/base/toast` (para mensajes)

**NO usar:**
- Componentes de `@/components/ui/button` (Kokonut)
- Componentes de `@/components/ui/input` (Kokonut)

## Pasos de Implementación

1. Instalar zod y @hookform/resolvers
2. Crear schemas de validación
3. Implementar `/auth/register` con shadcn/ui base
4. Actualizar `/auth/login` con shadcn/ui base y redirect por rol
5. Agregar logout en Topbar
6. Probar flujo completo

## Testing

### Prueba 1: Registro
1. Ir a `/auth/register`
2. Completar form
3. Submit
4. Verificar: usuario creado en Auth + profile en DB
5. Verificar: redirect a `/auth/login`

### Prueba 2: Login
1. Ir a `/auth/login`
2. Login con usuario registrado
3. Verificar: redirect al home correcto según rol

### Prueba 3: Logout
1. Estar logueado
2. Click en "Cerrar Sesión"
3. Verificar: redirect a `/auth/login`
4. Intentar acceder a `/student` (o cualquier ruta protegida)
5. Verificar: redirect a `/auth/login`
