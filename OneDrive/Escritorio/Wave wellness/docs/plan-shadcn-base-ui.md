# Plan: shadcn/ui como Base UI (Sistema de Diseño Adicional)

## Definition of Done (DoD)

- [ ] shadcn/ui instalado y configurado (sin romper Kokonut UI)
- [ ] Componentes base instalados: Button, Input, Label, Card, Table, Dialog, Toast
- [ ] Wrappers creados con tamaños grandes (h-12/h-14, text-base/text-[18px])
- [ ] Focus-visible ring consistente en todos los componentes
- [ ] Variantes: primary/secondary/destructive implementadas
- [ ] Página `/ui` actualizada con:
  - Sección A: "Base UI (shadcn/ui)" con todos los componentes y estados
  - Sección B: "Kokonut UI (opcional)" etiquetada como decorativo
- [ ] README actualizado con reglas de uso
- [ ] No se borraron archivos de Kokonut
- [ ] No se rompieron imports existentes

## Estrategia

### 1. Configuración de shadcn/ui

**Problema**: `components.json` ya tiene registry de Kokonut UI

**Solución**:
- Agregar registry oficial de shadcn/ui además del de Kokonut
- Mantener ambos registries activos
- Usar `@shadcn/ui` como prefijo para componentes base

### 2. Componentes Base (shadcn/ui)

**Componentes a instalar**:
- `button` - Botones con tamaños grandes
- `input` - Inputs con altura >= 48px
- `label` - Labels para formularios
- `card` - Tarjetas
- `table` - Tablas
- `dialog` - Modales
- `toast` - Notificaciones

**Ubicación**: `src/components/ui/base/` (separado de Kokonut)

### 3. Wrappers con Tamaños Grandes

**Requisitos UX (usuarios +60, mobile-first)**:
- Texto base: `text-base` (16px) o `text-[18px]`
- Botones: `h-12` (48px) mínimo, `h-14` (56px) para CTAs principales
- Inputs: `h-12` (48px) mínimo
- Focus ring: `focus-visible:ring-2 focus-visible:ring-offset-2`
- Tap targets: mínimo 44px (ya cubierto con h-12)

**Estrategia**:
- Crear wrappers en `src/components/ui/base/` que extiendan shadcn/ui
- Aplicar tamaños grandes por defecto
- Mantener variantes de shadcn/ui (primary/secondary/destructive)

### 4. Página `/ui` Actualizada

**Estructura**:
```
Sección A: Base UI (shadcn/ui)
  - Button (con estados: default, loading, disabled)
  - Input (con label, placeholder, error)
  - Card (con contenido ejemplo)
  - Table (con datos ejemplo, estados empty)
  - Dialog (ejemplo funcional)
  - Toast (ejemplo funcional)

Sección B: Kokonut UI (opcional/decorativo)
  - 1-2 componentes Kokonut
  - Etiquetado claramente como "Solo para decorativo/marketing"
```

## Lista de Archivos a Crear/Modificar

### Archivos a Crear:
- `src/components/ui/base/button.tsx` - Wrapper de Button shadcn/ui
- `src/components/ui/base/input.tsx` - Wrapper de Input shadcn/ui
- `src/components/ui/base/label.tsx` - Wrapper de Label shadcn/ui
- `src/components/ui/base/card.tsx` - Wrapper de Card shadcn/ui
- `src/components/ui/base/table.tsx` - Wrapper de Table shadcn/ui
- `src/components/ui/base/dialog.tsx` - Wrapper de Dialog shadcn/ui
- `src/components/ui/base/toast.tsx` - Wrapper de Toast shadcn/ui
- `src/components/ui/base/toaster.tsx` - Provider de Toast

### Archivos a Modificar:
- `components.json` - Agregar registry oficial de shadcn/ui
- `src/app/ui/page.tsx` - Actualizar para mostrar ambos sistemas
- `README.md` - Documentar reglas de uso
- `tailwind.config.ts` - Verificar que tiene las variables CSS necesarias

### Archivos a NO TOCAR:
- `src/components/ui/button.tsx` (Kokonut) - NO borrar
- `src/components/ui/input.tsx` (Kokonut) - NO borrar
- `src/components/ui/card.tsx` (Kokonut) - NO borrar
- Cualquier import existente de Kokonut

## Pasos de Implementación

1. Actualizar `components.json` con registry oficial de shadcn/ui
2. Instalar componentes base de shadcn/ui usando CLI
3. Crear wrappers en `src/components/ui/base/` con tamaños grandes
4. Actualizar página `/ui` con ambas secciones
5. Actualizar README con reglas
6. Probar que todo funciona

## Testing

### Rutas a visitar:
- `/ui` - Verificar que muestra ambas secciones correctamente

### Qué validar:
- [ ] Sección A muestra componentes shadcn/ui con tamaños grandes
- [ ] Sección B muestra componentes Kokonut etiquetados como decorativos
- [ ] Botones tienen altura >= 48px
- [ ] Inputs tienen altura >= 48px
- [ ] Focus ring es visible al hacer tab
- [ ] Texto es legible (16-18px mínimo)
- [ ] No hay errores en consola
- [ ] Imports existentes de Kokonut siguen funcionando
