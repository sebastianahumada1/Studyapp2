# Plan: Guards por Rol (PASO 5)

## Definition of Done (DoD)

- [ ] Guard implementado en `/(protected)/layout.tsx` que verifica autenticación y rol
- [ ] Sin sesión → redirect a `/auth/login`
- [ ] Rol incorrecto → redirect al home correcto del rol (student/coach/admin)
- [ ] Evitar loops de redirect
- [ ] Rutas `/auth/*` no quedan bloqueadas
- [ ] Sidebar muestra links correctos según role
- [ ] Middleware simplificado (solo verifica autenticación básica)
- [ ] Matriz de pruebas documentada (9 casos)
- [ ] Pasos de prueba documentados

## Estrategia Elegida: Layout Guard (Opción B)

**Justificación:**
- ✅ Más simple de mantener y entender
- ✅ Ya tenemos `getCurrentProfile()` funcionando correctamente
- ✅ No necesitamos duplicar lógica en middleware
- ✅ Suficiente para las necesidades del proyecto
- ✅ Fácil de debuggear y modificar

**Arquitectura:**
- **Middleware**: Solo verifica autenticación básica (sin sesión → login)
- **Layout Guard**: Verifica rol y redirige al home correcto si es necesario
- **Sidebar**: Muestra links según el role del usuario

## Lista de Archivos a Crear/Modificar

### Archivos a Modificar:
- `src/app/(protected)/layout.tsx` - Implementar guard de rol
- `src/middleware.ts` - Simplificar (solo autenticación básica)
- `src/components/ui/Sidebar.tsx` - Actualizar links según role
- `src/components/ui/NavLinks.tsx` - Mostrar links correctos

### Archivos a Crear:
- `docs/PRUEBAS-ROLE-GUARDS.md` - Matriz de pruebas y pasos

## Estructura de Implementación

### 1. Layout Guard (`/(protected)/layout.tsx`)

**Lógica:**
1. Obtener profile con `getCurrentProfile()`
2. Si no hay profile → redirect `/auth/login`
3. Extraer pathname de la ruta actual
4. Si pathname indica un rol específico (`/student`, `/coach`, `/admin`):
   - Verificar que el role del usuario coincide
   - Si no coincide → redirect al home correcto del rol
5. Renderizar layout con Sidebar y Topbar

**Evitar loops:**
- Solo redirigir si el pathname indica un rol específico
- No redirigir si ya está en el home correcto del rol

### 2. Middleware Simplificado

**Lógica:**
- Solo verificar autenticación básica
- Si no hay sesión → redirect `/auth/login`
- Dejar que el layout guard maneje la verificación de roles

### 3. Sidebar y NavLinks

**Links por Role:**
- **Student**: `/student` (home), `/student/payments` (futuro)
- **Coach**: `/coach` (home), `/coach/students` (futuro)
- **Admin**: `/admin` (home), `/admin/packages`, `/admin/payments` (futuro)

## Matriz de Pruebas (9 casos)

| Usuario Role | Ruta Intentada | Resultado Esperado |
|-------------|----------------|-------------------|
| student     | `/student`     | ✅ Acceso permitido |
| student     | `/coach`       | ❌ Redirect a `/student` |
| student     | `/admin`       | ❌ Redirect a `/student` |
| coach       | `/student`     | ❌ Redirect a `/coach` |
| coach       | `/coach`       | ✅ Acceso permitido |
| coach       | `/admin`       | ❌ Redirect a `/coach` |
| admin       | `/student`     | ❌ Redirect a `/admin` |
| admin       | `/coach`       | ❌ Redirect a `/admin` |
| admin       | `/admin`       | ✅ Acceso permitido |

## Pasos de Implementación

1. Simplificar middleware (solo autenticación)
2. Implementar guard en layout protegido
3. Actualizar Sidebar y NavLinks
4. Crear documentación de pruebas
5. Probar todos los casos de la matriz
