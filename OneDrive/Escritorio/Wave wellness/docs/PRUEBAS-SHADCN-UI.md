# Pruebas: shadcn/ui Base UI

## Rutas a Visitar

### 1. Página de Showcase: `/ui`

Visita `http://localhost:3000/ui` para ver ambos sistemas de diseño.

---

## Validaciones en `/ui`

### Sección A: Base UI (shadcn/ui)

#### 1. Button
- [ ] **Tamaño**: Botones tienen altura mínima de 48px (h-12)
- [ ] **CTA Principal**: Botón "Large" tiene altura de 56px (h-14)
- [ ] **Variantes**: Se muestran todas las variantes (default, secondary, destructive, outline, ghost, link)
- [ ] **Estados**: Botón "Disabled" está deshabilitado
- [ ] **Focus**: Al hacer Tab, el botón muestra ring de focus visible
- [ ] **Texto**: Texto es legible (16px base)

#### 2. Input
- [ ] **Tamaño**: Inputs tienen altura mínima de 48px (h-12)
- [ ] **Labels**: Cada input tiene un label real (no solo placeholder)
- [ ] **Focus**: Al hacer Tab, el input muestra ring de focus visible
- [ ] **Estados**: 
  - Input normal funciona
  - Input "Disabled" está deshabilitado
  - Input "Error State" muestra borde rojo y mensaje de error
- [ ] **Texto**: Texto es legible (16px base)

#### 3. Card
- [ ] **Estructura**: Cards muestran header, content y footer
- [ ] **Texto**: Texto dentro de cards es legible (16px base)
- [ ] **Spacing**: Spacing es generoso entre elementos

#### 4. Table
- [ ] **Estructura**: Tabla muestra header y body correctamente
- [ ] **Datos**: Tabla con datos muestra 3 filas
- [ ] **Empty State**: Tabla vacía muestra mensaje "No hay datos disponibles"
- [ ] **Texto**: Texto en tabla es legible (16px base)

#### 5. Dialog
- [ ] **Apertura**: Click en "Abrir Dialog" abre el modal
- [ ] **Contenido**: Modal muestra título, descripción y botones
- [ ] **Cierre**: Botones "Cancelar" y "Eliminar" cierran el modal
- [ ] **Focus**: Al abrir, el focus está en el primer botón
- [ ] **Overlay**: Fondo oscuro aparece al abrir

#### 6. Toast
- [ ] **Éxito**: Click en "Mostrar Toast de Éxito" muestra notificación
- [ ] **Error**: Click en "Mostrar Toast de Error" muestra notificación roja
- [ ] **Posición**: Toasts aparecen en la esquina superior derecha
- [ ] **Auto-close**: Toasts se cierran automáticamente después de unos segundos
- [ ] **Texto**: Texto en toasts es legible (16px base)

### Sección B: Kokonut UI (Opcional/Decorativo)

#### 1. Etiquetado
- [ ] **Advertencia**: Se muestra claramente "⚠️ NO usar para pantallas funcionales"
- [ ] **Descripción**: Indica que es solo para decorativo/marketing
- [ ] **Separación**: Sección está claramente separada de Base UI

#### 2. Componentes Kokonut
- [ ] **Button**: Se muestran botones de Kokonut
- [ ] **Card**: Se muestra card de Kokonut
- [ ] **Nota**: Cada componente tiene nota indicando que es decorativo

---

## Validaciones de Accesibilidad

### Focus Visible
1. Abre `/ui`
2. Presiona `Tab` repetidamente
3. Verifica que:
   - [ ] Cada elemento enfocado muestra un ring visible
   - [ ] El ring tiene buen contraste
   - [ ] El ring es suficientemente grueso (2px mínimo)

### Tamaños de Tap Targets
1. Abre `/ui` en un dispositivo móvil (o DevTools mobile view)
2. Verifica que:
   - [ ] Botones tienen área táctil >= 44px
   - [ ] Inputs tienen área táctil >= 44px
   - [ ] Links tienen área táctil >= 44px

### Tamaño de Texto
1. Abre `/ui`
2. Verifica que:
   - [ ] Texto base es >= 16px
   - [ ] Labels son legibles
   - [ ] Placeholders son legibles (aunque no se usan como única fuente de info)

---

## Validaciones de Consistencia

### No Mezclar Sistemas
- [ ] En la página `/ui`, las secciones están claramente separadas
- [ ] No hay componentes de ambos sistemas mezclados en la misma sección
- [ ] Cada sección tiene su etiqueta clara

### Imports Correctos
- [ ] Componentes base usan: `@/components/ui/base/*`
- [ ] Componentes Kokonut usan: `@/components/ui/*` (sin `/base`)

---

## Checklist Final

- [ ] `/ui` carga sin errores
- [ ] Sección A muestra todos los componentes base
- [ ] Sección B muestra componentes Kokonut etiquetados como decorativos
- [ ] Botones tienen altura >= 48px
- [ ] Inputs tienen altura >= 48px
- [ ] Focus ring es visible al hacer Tab
- [ ] Texto es legible (16-18px)
- [ ] No hay errores en consola del navegador
- [ ] No hay errores en consola del servidor
- [ ] Toasts funcionan correctamente
- [ ] Dialog funciona correctamente
- [ ] Tabla muestra datos y estado vacío

---

## Notas Adicionales

### Para Probar en Móvil

1. Abre DevTools (F12)
2. Activa modo móvil (Ctrl+Shift+M)
3. Selecciona un dispositivo móvil (ej: iPhone 12)
4. Visita `/ui`
5. Verifica que:
   - Los botones son fáciles de tocar
   - El texto es legible sin zoom
   - Los inputs son fáciles de usar

### Para Probar Accesibilidad

1. Usa solo el teclado (Tab, Enter, Esc)
2. Verifica que puedes navegar toda la página
3. Verifica que el focus es siempre visible
4. Verifica que puedes interactuar con todos los elementos
