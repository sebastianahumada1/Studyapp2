# Pruebas: Admin CRUD de Paquetes (PASO 8)

## Rutas a Visitar

### Admin:
- `/admin/packages` - CRUD de paquetes

---

## Prueba 1: Listado de Packages

### Objetivo
Verificar que el listado muestra los packages correctamente.

### Pasos

1. **Login como admin:**
   - Ir a `/auth/login`
   - Login con usuario admin
   - Debería redirigir a `/admin`

2. **Navegar a Packages:**
   - Click en "Paquetes" (sidebar o bottom nav)
   - Debería navegar a `/admin/packages`

3. **Verificar Empty State:**
   - Si no hay packages, debería mostrar:
     - [ ] Icono de package
     - [ ] Título: "No hay paquetes"
     - [ ] Descripción útil
     - [ ] CTA "Crear Primer Paquete"

4. **Verificar Listado (después de crear packages):**
   - Desktop: Tabla con columnas:
     - [ ] Nombre
     - [ ] Créditos (muestra "Ilimitado" si null)
     - [ ] Precio (formato moneda: $XXX.XX)
     - [ ] Estado (badge verde/rojo)
     - [ ] Acciones (Editar, Activar/Desactivar)
   - Mobile: Cards con información:
     - [ ] Nombre del paquete
     - [ ] Créditos y precio
     - [ ] Estado
     - [ ] Botones de acción

### Resultado Esperado
- ✅ Empty state claro si no hay packages
- ✅ Listado muestra todos los packages
- ✅ Formato de moneda correcto
- ✅ "Ilimitado" mostrado si credits es null
- ✅ Badges de estado claros

---

## Prueba 2: Crear Package

### Objetivo
Verificar que se puede crear un package correctamente.

### Pasos

1. **Abrir dialog de crear:**
   - Click en "Crear Paquete" (botón grande)
   - [ ] Dialog se abre
   - [ ] Título: "Crear Paquete"
   - [ ] Formulario con campos: name, credits, price, active

2. **Completar formulario - Package con créditos:**
   - Nombre: `Paquete Básico`
   - Créditos: `10`
   - Precio: `500.00`
   - Activo: ✅ (checked)
   - Click en "Crear Paquete"

3. **Verificar:**
   - [ ] Toast de éxito: "Paquete creado"
   - [ ] Dialog se cierra
   - [ ] Package aparece en el listado
   - [ ] Datos correctos mostrados

4. **Verificar en DB:**
   - Ir a Supabase Dashboard → Table Editor → packages
   - [ ] Package creado con datos correctos
   - [ ] `credits = 10`
   - [ ] `active = true`

5. **Crear package ilimitado:**
   - Click en "Crear Paquete"
   - Nombre: `Paquete Premium`
   - Créditos: (dejar vacío)
   - Precio: `1000.00`
   - Activo: ✅
   - Click en "Crear Paquete"

6. **Verificar:**
   - [ ] Package creado
   - [ ] En listado muestra "Ilimitado" en créditos
   - [ ] En DB: `credits = null`

### Resultado Esperado
- ✅ Package creado correctamente
- ✅ Datos guardados en DB
- ✅ Toast de éxito mostrado
- ✅ Listado actualizado
- ✅ Package ilimitado funciona (credits = null)

---

## Prueba 3: Validaciones - Crear Package

### Objetivo
Verificar que las validaciones funcionan correctamente.

### Pasos

1. **Validación de nombre:**
   - Abrir dialog de crear
   - Dejar nombre vacío y hacer blur
   - [ ] Error: "El nombre debe tener al menos 2 caracteres"
   - Escribir solo "A" y hacer blur
   - [ ] Error: "El nombre debe tener al menos 2 caracteres"

2. **Validación de precio:**
   - Precio: `0` o negativo
   - [ ] Error: "El precio debe ser mayor a 0"
   - Precio: `-100`
   - [ ] Error: "El precio debe ser mayor a 0"

3. **Validación de créditos:**
   - Créditos: `0` o negativo
   - [ ] Error: "Los créditos deben ser mayores a 0"
   - Créditos: `-5`
   - [ ] Error: "Los créditos deben ser mayores a 0"
   - Créditos: `10.5` (decimal)
   - [ ] Error: "Los créditos deben ser un número entero"

4. **Formulario válido:**
   - Completar todos los campos correctamente
   - [ ] No hay errores
   - [ ] Botón "Crear Paquete" habilitado

### Resultado Esperado
- ✅ Validaciones funcionan en tiempo real
- ✅ Mensajes de error claros
- ✅ Formulario no se envía si hay errores

---

## Prueba 4: Editar Package

### Objetivo
Verificar que se puede editar un package correctamente.

### Pasos

1. **Abrir dialog de edición:**
   - Click en "Editar" en cualquier package
   - [ ] Dialog se abre
   - [ ] Título: "Editar Paquete"
   - [ ] Campos pre-llenados con datos del package

2. **Modificar datos:**
   - Cambiar nombre: `Paquete Básico Actualizado`
   - Cambiar precio: `600.00`
   - Cambiar créditos: `15`
   - Click en "Guardar Cambios"

3. **Verificar:**
   - [ ] Toast de éxito: "Paquete actualizado"
   - [ ] Dialog se cierra
   - [ ] Listado actualizado con nuevos datos
   - [ ] En DB: cambios guardados

4. **Editar package ilimitado:**
   - Editar package con credits = null
   - [ ] Campo créditos está vacío
   - Agregar créditos: `20`
   - Guardar
   - [ ] Package ahora tiene 20 créditos (no ilimitado)

5. **Convertir a ilimitado:**
   - Editar package con créditos
   - Borrar campo créditos (dejar vacío)
   - Guardar
   - [ ] Package ahora es ilimitado (credits = null)

### Resultado Esperado
- ✅ Package editado correctamente
- ✅ Datos guardados en DB
- ✅ Toast de éxito mostrado
- ✅ Listado actualizado
- ✅ Conversión entre limitado e ilimitado funciona

---

## Prueba 5: Activar/Desactivar Package

### Objetivo
Verificar que se puede activar/desactivar un package.

### Pasos

1. **Desactivar package:**
   - Click en "Desactivar" en un package activo
   - [ ] Toast: "Estado actualizado - El paquete ha sido desactivado"
   - [ ] Badge cambia a "Inactivo" (gris)
   - [ ] En DB: `active = false`

2. **Activar package:**
   - Click en "Activar" en un package inactivo
   - [ ] Toast: "Estado actualizado - El paquete ha sido activado"
   - [ ] Badge cambia a "Activo" (verde)
   - [ ] En DB: `active = true`

3. **Verificar UI:**
   - [ ] Botón cambia de "Desactivar" a "Activar"
   - [ ] Badge se actualiza inmediatamente
   - [ ] Listado se actualiza sin recargar

### Resultado Esperado
- ✅ Toggle funciona correctamente
- ✅ Estado guardado en DB
- ✅ UI actualizada inmediatamente
- ✅ Toast de confirmación mostrado

---

## Prueba 6: RLS - Student No Puede Acceder

### Objetivo
Verificar que RLS bloquea acceso de estudiantes.

### Pasos

1. **Login como student:**
   - Login con usuario student
   - Debería redirigir a `/student`

2. **Intentar acceder directamente:**
   - Escribir `/admin/packages` en la barra de direcciones
   - [ ] Debería redirigir a `/student` (guard por rol)

3. **Verificar en consola (opcional):**
   - Abrir DevTools → Console
   - Intentar hacer query desde código (si hay)
   - [ ] Error de RLS si intenta crear/editar

### Resultado Esperado
- ✅ Student no puede acceder a `/admin/packages`
- ✅ Redirige al home correcto del rol
- ✅ RLS bloquea operaciones si se intentan

---

## Prueba 7: Mobile-Friendly

### Objetivo
Verificar que la UI funciona bien en mobile.

### Pasos

1. **Abrir en mobile o DevTools mobile view:**
   - Visitar `/admin/packages`

2. **Verificar listado:**
   - [ ] Muestra cards (no tabla)
   - [ ] Cards tienen información completa
   - [ ] Botones tienen altura >= 48px
   - [ ] Tap targets >= 44px

3. **Verificar dialog:**
   - Click en "Crear Paquete"
   - [ ] Dialog se abre correctamente
   - [ ] Inputs tienen altura h-12 (48px)
   - [ ] Labels son claros y visibles
   - [ ] Botones son grandes y fáciles de tocar

4. **Verificar formulario:**
   - [ ] Texto es legible (16px mínimo)
   - [ ] Spacing es generoso
   - [ ] Focus visible ring claro

### Resultado Esperado
- ✅ UI funciona bien en mobile
- ✅ Tamaños adecuados para usuarios +60
- ✅ Fácil de usar en touch

---

## Prueba 8: Formato de Moneda

### Objetivo
Verificar que el precio se muestra correctamente.

### Pasos

1. **Crear package con diferentes precios:**
   - Precio: `500` → debería mostrar `$500.00`
   - Precio: `1000.5` → debería mostrar `$1,000.50`
   - Precio: `99.99` → debería mostrar `$99.99`

2. **Verificar formato:**
   - [ ] Formato mexicano (MXN)
   - [ ] Separador de miles (coma)
   - [ ] Decimales siempre mostrados (2)

### Resultado Esperado
- ✅ Precio formateado correctamente
- ✅ Formato consistente en toda la UI

---

## Prueba 9: Loading States

### Objetivo
Verificar que los loading states funcionan.

### Pasos

1. **Crear package:**
   - Completar formulario
   - Click en "Crear Paquete"
   - [ ] Botón muestra loading (o deshabilitado)
   - [ ] Dialog no se cierra hasta que termine

2. **Editar package:**
   - Click en "Editar"
   - Modificar datos
   - Click en "Guardar Cambios"
   - [ ] Botón muestra loading
   - [ ] Dialog no se cierra hasta que termine

3. **Toggle activar/desactivar:**
   - Click en toggle
   - [ ] Botón muestra loading (opcional)
   - [ ] Estado se actualiza cuando termine

### Resultado Esperado
- ✅ Loading states visibles
- ✅ UI no se congela
- ✅ Feedback claro al usuario

---

## Checklist Final

### Funcionalidad
- [ ] Listado muestra packages correctamente
- [ ] Crear package funciona
- [ ] Editar package funciona
- [ ] Activar/Desactivar funciona
- [ ] Validaciones funcionan
- [ ] RLS bloquea acceso de estudiantes

### UI/UX
- [ ] Componentes usan shadcn/ui base (no Kokonut)
- [ ] Texto >= 16px
- [ ] Botones >= 48px (CTAs >= 56px)
- [ ] Inputs >= 48px
- [ ] Labels reales (no solo placeholder)
- [ ] Focus visible ring claro
- [ ] Spacing generoso
- [ ] Mobile-friendly (cards en mobile, tabla en desktop)

### Datos
- [ ] Packages guardados en DB correctamente
- [ ] Formato de moneda correcto
- [ ] "Ilimitado" mostrado si credits = null
- [ ] Badges de estado claros

### Errores
- [ ] Errores de RLS mostrados claramente
- [ ] Errores de validación mostrados claramente
- [ ] Toasts de éxito/error funcionan

---

## Notas Adicionales

### Para Probar RLS

Si quieres probar que RLS funciona correctamente:

1. En Supabase Dashboard → Authentication → Policies
2. Verificar que `packages_insert_admin`, `packages_update_admin`, `packages_delete_admin` existen
3. Intentar crear/editar como student (debería fallar)

### Para Probar en Mobile

1. Abre DevTools (F12)
2. Activa modo móvil (Ctrl+Shift+M)
3. Selecciona un dispositivo móvil
4. Visita `/admin/packages`
5. Verifica que todo funciona correctamente
