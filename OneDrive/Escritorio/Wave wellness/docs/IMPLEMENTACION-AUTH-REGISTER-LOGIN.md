# Implementación: Registro + Login + Logout + Redirect por Rol (PASO 6)

## Resumen

Se implementó autenticación completa con Supabase Auth, incluyendo registro, login, logout y redirect por rol. Todas las pantallas de autenticación usan shadcn/ui base (no Kokonut) y están optimizadas para mobile-first y usuarios +60 años.

## Archivos Creados/Modificados

### Archivos Creados:
- `src/lib/validations/auth.ts` - Schemas de validación con zod
- `docs/plan-auth-register-login.md` - Plan con DoD
- `docs/PRUEBAS-AUTH-REGISTER-LOGIN.md` - Guía de pruebas completa
- `docs/IMPLEMENTACION-AUTH-REGISTER-LOGIN.md` - Este documento

### Archivos Modificados:
- `src/app/auth/register/page.tsx` - Implementación completa de registro
- `src/app/auth/login/page.tsx` - Actualizado con shadcn/ui y redirect por rol
- `src/components/ui/Topbar.tsx` - Agregado botón de logout
- `package.json` - Agregadas dependencias: zod, @hookform/resolvers, react-hook-form

## Funcionalidades Implementadas

### 1. Registro (`/auth/register`)

**Formulario:**
- Campos: full_name, phone, email, password
- Validación con zod en tiempo real
- Labels reales (no solo placeholder)
- Estados: loading, error, success

**Flujo:**
1. Validar form con zod
2. Crear usuario en Supabase Auth (`signUp`)
3. Si éxito, insertar profile en `public.profiles`:
   - `id` = auth user id
   - `full_name`, `phone` del form
   - `role` = 'student' (por defecto)
4. Mostrar toast de éxito
5. Redirect a `/auth/login`

**Manejo de errores:**
- Si falla crear usuario: mostrar error de Supabase
- Si falla crear profile: mostrar error claro y sugerir contactar soporte
- Aún así redirigir a login (admin puede crear profile manualmente)

### 2. Login (`/auth/login`)

**Formulario:**
- Campos: email, password
- Validación con zod
- Labels reales

**Flujo:**
1. Validar form con zod
2. Login con Supabase Auth (`signInWithPassword`)
3. Si éxito:
   - Refrescar sesión
   - Obtener profile desde `public.profiles`
   - Redirect por rol:
     - `student` → `/student`
     - `coach` → `/coach`
     - `admin` → `/admin`
4. Mostrar toast de éxito

**Manejo de errores:**
- Credenciales incorrectas → "Email o contraseña incorrectos"
- Email no confirmado → "Por favor confirma tu email antes de iniciar sesión"
- Otros errores de Supabase → mostrar mensaje original

### 3. Logout

**Ubicación:** `src/components/ui/Topbar.tsx`

**Flujo:**
1. Botón "Cerrar Sesión" en Topbar
2. Al click: llamar `supabase.auth.signOut()`
3. Mostrar toast de confirmación
4. Redirect a `/auth/login`
5. Forzar recarga para limpiar estado

**Verificación:**
- Rutas protegidas quedan bloqueadas después de logout
- Redirect automático a `/auth/login` si intenta acceder a ruta protegida

## Componentes UI Usados (shadcn/ui base)

**Componentes de `@/components/ui/base/`:**
- `Button` - Botones con altura h-12/h-14
- `Input` - Inputs con altura h-12 (48px)
- `Label` - Labels para formularios
- `Card` - Contenedor del formulario
- `Toast` - Notificaciones de éxito/error

**NO se usan componentes de Kokonut:**
- `@/components/ui/button` - NO usado
- `@/components/ui/input` - NO usado

## Validación con Zod

### Schema de Registro

```typescript
const registerSchema = z.object({
  full_name: z.string().min(2).max(100),
  phone: z.string().min(10).max(20).regex(/^[0-9+\-\s()]+$/),
  email: z.string().email().min(5).max(255),
  password: z.string().min(6).max(100),
})
```

### Schema de Login

```typescript
const loginSchema = z.object({
  email: z.string().email().min(1),
  password: z.string().min(1),
})
```

## Características UX (Usuarios +60, Mobile-First)

### ✅ Tamaños Implementados
- Botones: h-12 (48px) por defecto, h-14 (56px) para CTAs principales
- Inputs: h-12 (48px) mínimo
- Tap targets: >= 44px (cubierto con h-12)

### ✅ Texto Legible
- Texto base: 16px (text-base)
- Labels: 16px (text-base)
- Descripciones: 16px (text-base)

### ✅ Focus Visible
- Ring de 2px en todos los componentes interactivos
- Ring offset de 2px para mejor visibilidad
- Colores con buen contraste

### ✅ Labels Reales
- Todos los inputs tienen labels visibles
- Labels son legibles y descriptivos
- Placeholders son complementarios (no la única fuente de info)

### ✅ Spacing Generoso
- Espaciado entre campos: space-y-6
- Padding en cards: p-6
- Márgenes generosos

## Flujo de Autenticación

### Registro
```
Usuario completa form
  ↓
Validación zod (client-side)
  ↓
Crear usuario en Supabase Auth
  ↓
Crear profile en public.profiles
  ↓
Toast de éxito
  ↓
Redirect a /auth/login
```

### Login
```
Usuario completa form
  ↓
Validación zod (client-side)
  ↓
Login con Supabase Auth
  ↓
Refrescar sesión
  ↓
Obtener profile desde DB
  ↓
Determinar rol
  ↓
Redirect según rol:
  - student → /student
  - coach → /coach
  - admin → /admin
```

### Logout
```
Usuario click en "Cerrar Sesión"
  ↓
supabase.auth.signOut()
  ↓
Toast de confirmación
  ↓
Redirect a /auth/login
  ↓
Rutas protegidas bloqueadas
```

## Dependencias Agregadas

- `zod` - Validación de esquemas
- `@hookform/resolvers` - Resolver para react-hook-form
- `react-hook-form` - Manejo de formularios

## Estructura de Código

### Validación
```
src/lib/validations/auth.ts
  - registerSchema
  - loginSchema
  - Types: RegisterFormData, LoginFormData
```

### Páginas de Auth
```
src/app/auth/
  ├── register/page.tsx
  └── login/page.tsx
```

### Componentes
```
src/components/ui/
  └── Topbar.tsx (con logout)
```

## Manejo de Errores

### Registro
- **Error al crear usuario:** Mostrar mensaje de Supabase
- **Error al crear profile:** Mostrar error claro y sugerir contactar soporte
- **Error inesperado:** Mensaje genérico

### Login
- **Credenciales incorrectas:** "Email o contraseña incorrectos"
- **Email no confirmado:** "Por favor confirma tu email antes de iniciar sesión"
- **Otros errores:** Mostrar mensaje original de Supabase

### Logout
- **Error al cerrar sesión:** Mostrar toast de error
- **Error inesperado:** Mensaje genérico

## Integración con Guards (PASO 5)

El login se integra perfectamente con los guards implementados en PASO 5:

1. **Login exitoso** → Redirect a home del rol
2. **Guard en layout** → Verifica que el rol coincide con la ruta
3. **Si rol incorrecto** → Redirect al home correcto
4. **Logout** → Bloquea todas las rutas protegidas

## Próximos Pasos

1. **Probar flujo completo** (ver `docs/PRUEBAS-AUTH-REGISTER-LOGIN.md`)
2. **Verificar que el registro crea profile correctamente**
3. **Verificar que el login redirige según rol**
4. **Verificar que el logout bloquea rutas protegidas**

## Notas Importantes

- ✅ No se usa service role key
- ✅ No se inventan tablas/columnas fuera de schema.sql
- ✅ No se mezcla Kokonut y shadcn en la misma pantalla
- ✅ Todas las pantallas de auth usan shadcn/ui base
- ✅ Validación con zod en tiempo real
- ✅ Manejo de errores claro y útil
- ✅ UX optimizada para usuarios +60 años

## Casos Especiales

### Si falla crear profile después de registro:
- El usuario puede intentar iniciar sesión
- El admin puede crear el profile manualmente:
  ```sql
  INSERT INTO profiles (id, full_name, phone, role)
  VALUES ('USER_ID', 'Nombre', 'Teléfono', 'student');
  ```

### Si el usuario no tiene profile:
- El login fallará al intentar obtener el profile
- Se mostrará error: "No se pudo obtener tu perfil. Por favor contacta a soporte."
- El admin puede crear el profile manualmente
