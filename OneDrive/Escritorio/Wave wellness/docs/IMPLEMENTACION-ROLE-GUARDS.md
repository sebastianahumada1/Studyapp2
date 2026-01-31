# Implementación: Guards por Rol (PASO 5)

## Resumen

Se implementaron guards por rol para proteger las rutas `/(protected)` y sus subrutas. El sistema redirige automáticamente a los usuarios al home correcto según su rol si intentan acceder a rutas que no les corresponden.

## Estrategia Implementada: Layout Guard (Opción B)

**Justificación:**
- ✅ Más simple de mantener y entender
- ✅ Ya tenemos `getCurrentProfile()` funcionando correctamente
- ✅ No necesitamos duplicar lógica en middleware
- ✅ Suficiente para las necesidades del proyecto
- ✅ Fácil de debuggear y modificar

## Arquitectura

### 1. Middleware (Simplificado)
- **Responsabilidad**: Solo verifica autenticación básica
- **Lógica**: Si no hay sesión → redirect a `/auth/login`
- **Pathname**: Establece header `x-pathname` para que el layout guard lo lea

### 2. Layout Guard (`/(protected)/layout.tsx`)
- **Responsabilidad**: Verifica rol y redirige al home correcto
- **Lógica**:
  1. Obtiene profile con `getCurrentProfile()`
  2. Si no hay profile → redirect `/auth/login`
  3. Lee pathname desde header `x-pathname`
  4. Si pathname indica un rol específico y no coincide → redirect al home correcto

### 3. Sidebar y NavLinks
- **Responsabilidad**: Mostrar links según el role del usuario
- **Links por Role**:
  - **Student**: `/student` (Dashboard), `/student/pagos` (Pagos)
  - **Coach**: `/coach` (Dashboard)
  - **Admin**: `/admin` (Paquetes), `/admin/pagos` (Pagos)

## Archivos Modificados

### 1. `src/middleware.ts`
- Simplificado para solo verificar autenticación básica
- Establece header `x-pathname` para que el layout guard lo lea
- No verifica roles (dejado al layout guard)

### 2. `src/app/(protected)/layout.tsx`
- Implementado guard de rol completo
- Lee pathname desde header `x-pathname`
- Redirige al home correcto si el rol no coincide
- Evita loops de redirect verificando que no redirija si ya está en el home correcto

### 3. `src/components/ui/NavLinks.tsx`
- Ya estaba correctamente configurado
- Muestra links según el role del usuario

## Flujo de Protección

```
Usuario intenta acceder a ruta protegida
    ↓
Middleware verifica autenticación
    ↓
¿Hay sesión?
    ├─ NO → Redirect a /auth/login
    └─ SÍ → Continúa
        ↓
Layout Guard obtiene profile
    ↓
¿Hay profile?
    ├─ NO → Redirect a /auth/login
    └─ SÍ → Continúa
        ↓
Layout Guard lee pathname
    ↓
¿Pathname indica rol específico?
    ├─ NO → Renderiza layout
    └─ SÍ → Verifica match de rol
        ├─ Match → Renderiza layout
        └─ No match → Redirect al home correcto del rol
```

## Prevención de Loops de Redirect

El guard evita loops verificando:
1. Solo redirige si el pathname indica un rol específico (`/student`, `/coach`, `/admin`)
2. Solo redirige si el rol no coincide
3. Redirige al home correcto del rol (no a `/auth/login`)

## Rutas Protegidas

- `/student` - Solo usuarios con role `student`
- `/coach` - Solo usuarios con role `coach`
- `/admin` - Solo usuarios con role `admin`

## Rutas NO Bloqueadas

- `/auth/login` - Accesible sin autenticación
- `/auth/register` - Accesible sin autenticación (si existe)
- `/` - Accesible sin autenticación
- `/test-helpers` - Accesible sin autenticación (para debugging)

## Matriz de Pruebas

Ver `docs/PRUEBAS-ROLE-GUARDS.md` para la matriz completa de 9 casos de prueba.

## Validaciones Implementadas

### ✅ Sin Sesión
- Usuario sin sesión intenta acceder a ruta protegida
- **Resultado**: Redirect a `/auth/login`

### ✅ Rol Incorrecto
- Usuario con role `student` intenta acceder a `/coach` o `/admin`
- **Resultado**: Redirect a `/student`

- Usuario con role `coach` intenta acceder a `/student` o `/admin`
- **Resultado**: Redirect a `/coach`

- Usuario con role `admin` intenta acceder a `/student` o `/coach`
- **Resultado**: Redirect a `/admin`

### ✅ Rol Correcto
- Usuario accede a su ruta correspondiente
- **Resultado**: Acceso permitido, se muestra el dashboard

## Próximos Pasos

1. **Probar todos los casos de la matriz** (ver `docs/PRUEBAS-ROLE-GUARDS.md`)
2. **Verificar que no hay loops de redirect**
3. **Verificar que el Sidebar muestra links correctos**
4. **Continuar con el desarrollo de funcionalidades específicas por rol**

## Notas Técnicas

- El pathname se pasa desde middleware mediante header `x-pathname`
- El layout guard lee el header usando `headers()` de Next.js
- Los redirects usan `redirect()` de `next/navigation` (Server Component)
- No se usan roles inventados, solo los definidos en `schema.sql`: `student`, `coach`, `admin`
