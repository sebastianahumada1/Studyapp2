# Pruebas: Guards por Rol (PASO 5)

## Matriz de Pruebas (9 casos)

| Usuario Role | Ruta Intentada | Resultado Esperado | Redirect a |
|-------------|----------------|-------------------|------------|
| student     | `/student`     | ✅ Acceso permitido | - |
| student     | `/coach`       | ❌ Acceso denegado | `/student` |
| student     | `/admin`       | ❌ Acceso denegado | `/student` |
| coach       | `/student`     | ❌ Acceso denegado | `/coach` |
| coach       | `/coach`       | ✅ Acceso permitido | - |
| coach       | `/admin`       | ❌ Acceso denegado | `/coach` |
| admin       | `/student`     | ❌ Acceso denegado | `/admin` |
| admin       | `/coach`       | ❌ Acceso denegado | `/admin` |
| admin       | `/admin`       | ✅ Acceso permitido | - |

## Setup Inicial

### 1. Crear Usuarios de Prueba

Ejecuta en Supabase SQL Editor para crear 3 usuarios con diferentes roles:

```sql
-- Nota: Primero crea los usuarios en Supabase Dashboard → Authentication → Users
-- Luego ejecuta esto reemplazando los UUIDs con los IDs reales de los usuarios

-- Usuario Student
INSERT INTO profiles (id, full_name, phone, role)
VALUES (
  'STUDENT_USER_ID',  -- Reemplaza con UUID del usuario student
  'Student Test',
  '1111111111',
  'student'
)
ON CONFLICT (id) DO UPDATE SET role = 'student';

-- Usuario Coach
INSERT INTO profiles (id, full_name, phone, role)
VALUES (
  'COACH_USER_ID',  -- Reemplaza con UUID del usuario coach
  'Coach Test',
  '2222222222',
  'coach'
)
ON CONFLICT (id) DO UPDATE SET role = 'coach';

-- Usuario Admin
INSERT INTO profiles (id, full_name, phone, role)
VALUES (
  'ADMIN_USER_ID',  -- Reemplaza con UUID del usuario admin
  'Admin Test',
  '3333333333',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### 2. Anotar Credenciales

Anota las credenciales de cada usuario:
- **Student**: email y password
- **Coach**: email y password
- **Admin**: email y password

---

## Prueba 1: Student accede a /student

### Pasos:
1. Cerrar sesión si hay una activa
2. Ir a `/auth/login`
3. Iniciar sesión como **Student**
4. Intentar acceder a `/student`

### Resultado Esperado:
- ✅ Acceso permitido
- ✅ Se muestra el dashboard de student
- ✅ Sidebar muestra links de student

---

## Prueba 2: Student intenta acceder a /coach

### Pasos:
1. Estar logueado como **Student**
2. Intentar acceder directamente a `/coach` (escribir en la barra de direcciones)

### Resultado Esperado:
- ❌ Redirect automático a `/student`
- ✅ No se muestra el dashboard de coach
- ✅ Se muestra el dashboard de student

---

## Prueba 3: Student intenta acceder a /admin

### Pasos:
1. Estar logueado como **Student**
2. Intentar acceder directamente a `/admin` (escribir en la barra de direcciones)

### Resultado Esperado:
- ❌ Redirect automático a `/student`
- ✅ No se muestra el dashboard de admin
- ✅ Se muestra el dashboard de student

---

## Prueba 4: Coach intenta acceder a /student

### Pasos:
1. Cerrar sesión
2. Iniciar sesión como **Coach**
3. Intentar acceder directamente a `/student`

### Resultado Esperado:
- ❌ Redirect automático a `/coach`
- ✅ No se muestra el dashboard de student
- ✅ Se muestra el dashboard de coach

---

## Prueba 5: Coach accede a /coach

### Pasos:
1. Estar logueado como **Coach**
2. Acceder a `/coach`

### Resultado Esperado:
- ✅ Acceso permitido
- ✅ Se muestra el dashboard de coach
- ✅ Sidebar muestra links de coach

---

## Prueba 6: Coach intenta acceder a /admin

### Pasos:
1. Estar logueado como **Coach**
2. Intentar acceder directamente a `/admin`

### Resultado Esperado:
- ❌ Redirect automático a `/coach`
- ✅ No se muestra el dashboard de admin
- ✅ Se muestra el dashboard de coach

---

## Prueba 7: Admin intenta acceder a /student

### Pasos:
1. Cerrar sesión
2. Iniciar sesión como **Admin**
3. Intentar acceder directamente a `/student`

### Resultado Esperado:
- ❌ Redirect automático a `/admin`
- ✅ No se muestra el dashboard de student
- ✅ Se muestra el dashboard de admin

---

## Prueba 8: Admin intenta acceder a /coach

### Pasos:
1. Estar logueado como **Admin**
2. Intentar acceder directamente a `/coach`

### Resultado Esperado:
- ❌ Redirect automático a `/admin`
- ✅ No se muestra el dashboard de coach
- ✅ Se muestra el dashboard de admin

---

## Prueba 9: Admin accede a /admin

### Pasos:
1. Estar logueado como **Admin**
2. Acceder a `/admin`

### Resultado Esperado:
- ✅ Acceso permitido
- ✅ Se muestra el dashboard de admin
- ✅ Sidebar muestra links de admin

---

## Prueba 10: Usuario sin sesión intenta acceder a ruta protegida

### Pasos:
1. Cerrar sesión (o abrir ventana de incógnito)
2. Intentar acceder directamente a `/student`, `/coach`, o `/admin`

### Resultado Esperado:
- ❌ Redirect automático a `/auth/login`
- ✅ No se muestra ningún dashboard
- ✅ Se muestra la página de login

---

## Prueba 11: Verificar que /auth/* no está bloqueado

### Pasos:
1. Cerrar sesión
2. Acceder a `/auth/login`
3. Acceder a `/auth/register` (si existe)

### Resultado Esperado:
- ✅ Acceso permitido sin redirect
- ✅ Se muestran las páginas de auth correctamente

---

## Verificación de Sidebar

### Student
- ✅ Muestra link "Dashboard" → `/student`
- ✅ Muestra link "Pagos" → `/student/pagos` (si existe)
- ❌ NO muestra links de coach o admin

### Coach
- ✅ Muestra link "Dashboard" → `/coach`
- ❌ NO muestra links de student o admin

### Admin
- ✅ Muestra link "Paquetes" → `/admin`
- ✅ Muestra link "Pagos" → `/admin/pagos` (si existe)
- ❌ NO muestra links de student o coach

---

## Checklist de Validación

- [ ] Prueba 1: Student → `/student` ✅
- [ ] Prueba 2: Student → `/coach` ❌ (redirect a `/student`)
- [ ] Prueba 3: Student → `/admin` ❌ (redirect a `/student`)
- [ ] Prueba 4: Coach → `/student` ❌ (redirect a `/coach`)
- [ ] Prueba 5: Coach → `/coach` ✅
- [ ] Prueba 6: Coach → `/admin` ❌ (redirect a `/coach`)
- [ ] Prueba 7: Admin → `/student` ❌ (redirect a `/admin`)
- [ ] Prueba 8: Admin → `/coach` ❌ (redirect a `/admin`)
- [ ] Prueba 9: Admin → `/admin` ✅
- [ ] Prueba 10: Sin sesión → ruta protegida ❌ (redirect a `/auth/login`)
- [ ] Prueba 11: Sin sesión → `/auth/*` ✅ (sin redirect)
- [ ] Sidebar muestra links correctos según role
- [ ] No hay loops de redirect infinitos

---

## Debugging

### Si hay loops de redirect:

1. Verifica que el guard no redirija si el usuario ya está en su home correcto
2. Verifica que el pathname se esté leyendo correctamente desde el header
3. Revisa la consola del navegador para ver los redirects

### Si el redirect no funciona:

1. Verifica que `getCurrentProfile()` retorna el profile correcto
2. Verifica que el role en la base de datos es correcto
3. Verifica que el middleware está estableciendo el header `x-pathname`

### Si el sidebar muestra links incorrectos:

1. Verifica que `NavLinks` recibe el `role` correcto
2. Verifica que los links en `NavLinks.tsx` están configurados correctamente

---

## Notas Adicionales

- Los redirects deben ser instantáneos (no deberías ver la página incorrecta)
- El sidebar debe actualizarse automáticamente según el role
- No debería haber errores en la consola del navegador
- No debería haber errores en la consola del servidor
