# Design System Documentation

## Introducción

Este documento describe el sistema de diseño de la aplicación Study APP. El design system está organizado en tokens centralizados, componentes primitivos reutilizables y componentes compuestos.

## Tokens de Diseño

### Colores

Los colores están definidos como CSS variables en `app/globals.css` y se acceden a través de clases de Tailwind.

#### Colores Semánticos

- **Primary**: `#0df2f2` - Color principal de la aplicación
- **Secondary**: `#7c3aed` - Color secundario (violeta)
- **Accent**: `#06b6d4` - Color de acento (cyan)
- **Destructive**: Rojo para acciones destructivas
- **Muted**: Colores atenuados para texto secundario

#### Colores de Superficie

- **Background Dark**: `#101e22` - Fondo oscuro principal
- **Card Dark**: `#16262c` - Fondo de tarjetas
- **Surface Dark**: `#131c2e` - Superficie oscura
- **Surface Highlight**: `#1c2a42` - Superficie destacada
- **Input Dark**: `#1c2e36` - Fondo de inputs

#### Uso

```tsx
// Usando clases de Tailwind
<div className="bg-primary text-primary-foreground">
  Botón primario
</div>

// Usando tokens TypeScript
import { colors } from '@/lib/design-tokens'
const primaryColor = colors.primary.DEFAULT
```

### Espaciado

El sistema de espaciado sigue una escala consistente:

- `xs`: 0.25rem (4px)
- `sm`: 0.5rem (8px)
- `md`: 1rem (16px)
- `lg`: 1.5rem (24px)
- `xl`: 2rem (32px)
- `2xl`: 3rem (48px)
- `3xl`: 4rem (64px)

### Tipografía

#### Familias de Fuentes

- **Display**: Lexend (para títulos y encabezados)
- **Body**: Noto Sans (para texto de cuerpo)

#### Tamaños

- `xs`: 0.75rem (12px)
- `sm`: 0.875rem (14px)
- `base`: 1rem (16px)
- `lg`: 1.125rem (18px)
- `xl`: 1.25rem (20px)
- `2xl`: 1.5rem (24px)
- `3xl`: 1.875rem (30px)
- `4xl`: 2.25rem (36px)
- `5xl`: 3rem (48px)

### Border Radius

- `sm`: calc(var(--radius) - 4px)
- `md`: calc(var(--radius) - 2px)
- `lg`: var(--radius) (0.5rem)
- `xl`: calc(var(--radius) + 4px)
- `2xl`: calc(var(--radius) + 8px)
- `full`: 9999px

## Componentes Primitivos

### Button

Botón reutilizable con múltiples variantes y tamaños.

```tsx
import { Button } from '@/components/ui/button'

// Variantes
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>

// Tamaños
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>
```

**Props:**
- `variant`: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'
- `size`: 'sm' | 'default' | 'lg' | 'icon'
- `asChild`: boolean (para usar como Slot de Radix)

### Card

Tarjeta contenedora con variantes de estilo.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

<Card variant="elevated">
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción</CardDescription>
  </CardHeader>
  <CardContent>
    Contenido de la tarjeta
  </CardContent>
  <CardFooter>
    Pie de tarjeta
  </CardFooter>
</Card>
```

**Variantes:**
- `default`: Estilo por defecto con sombra suave
- `elevated`: Sombra más pronunciada
- `outlined`: Solo borde, sin sombra

### Input

Campo de entrada de texto con estados de error.

```tsx
import { Input } from '@/components/ui/input'

<Input type="text" placeholder="Nombre" />
<Input type="email" error={hasError} />
```

**Props:**
- `error`: boolean - Muestra estado de error
- Todas las props nativas de `<input>`

### Textarea

Área de texto con estados de error.

```tsx
import { Textarea } from '@/components/ui/textarea'

<Textarea placeholder="Descripción" rows={4} />
<Textarea error={hasError} />
```

### Badge

Badge para mostrar etiquetas o estados.

```tsx
import { Badge } from '@/components/ui/badge'

<Badge variant="default">Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="info">Info</Badge>
```

**Variantes:**
- `default`, `secondary`, `destructive`, `outline`, `success`, `warning`, `info`

**Tamaños:**
- `sm`, `default`, `md`

### Icon

Wrapper para iconos de Material Symbols.

```tsx
import { Icon } from '@/components/ui/icon'

<Icon name="home" size="md" />
<Icon name="settings" size={24} filled={false} weight={500} />
```

**Props:**
- `name`: string - Nombre del icono de Material Symbols
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
- `filled`: boolean - Icono relleno o outline
- `weight`: 100 | 200 | 300 | 400 | 500 | 600 | 700

### Dialog (Modal)

Modal/Dialog usando Radix UI.

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger>Abrir</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
      <DialogDescription>Descripción</DialogDescription>
    </DialogHeader>
    Contenido del modal
    <DialogFooter>
      <Button>Cerrar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Componentes de Layout

### Container

Contenedor con ancho máximo y padding consistente.

```tsx
import { Container } from '@/components/layout/Container'

<Container maxWidth="xl">
  Contenido
</Container>
```

**Props:**
- `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'

### Section

Sección con espaciado vertical consistente.

```tsx
import { Section } from '@/components/layout/Section'

<Section spacing="lg">
  Contenido de la sección
</Section>
```

**Props:**
- `spacing`: 'none' | 'sm' | 'md' | 'lg' | 'xl'

### Grid

Sistema de grid responsive.

```tsx
import { Grid } from '@/components/layout/Grid'

<Grid cols={3} gap="md">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>
```

**Props:**
- `cols`: 1 | 2 | 3 | 4 | 5 | 6 | 12
- `gap`: 'none' | 'sm' | 'md' | 'lg' | 'xl'
- `responsive`: boolean (default: true)

## Componentes de Formulario

### FormField

Campo de formulario completo con label y mensaje de error.

```tsx
import { FormField } from '@/components/forms/FormField'
import { Input } from '@/components/ui/input'

<FormField label="Nombre" error={errors.name} required>
  <Input type="text" />
</FormField>
```

**Props:**
- `label`: string
- `error`: string - Mensaje de error
- `required`: boolean
- `children`: ReactNode - Input, Textarea, Select, etc.

### FormGroup

Agrupa campos relacionados.

```tsx
import { FormGroup } from '@/components/forms/FormGroup'
import { FormField } from '@/components/forms/FormField'

<FormGroup spacing="md">
  <FormField label="Nombre">
    <Input />
  </FormField>
  <FormField label="Email">
    <Input type="email" />
  </FormField>
</FormGroup>
```

**Props:**
- `spacing`: 'none' | 'sm' | 'md' | 'lg'

## Helpers y Utilidades

### design-tokens.ts

Constantes TypeScript de todos los tokens.

```tsx
import { colors, spacing, typography } from '@/lib/design-tokens'

const primaryColor = colors.primary.DEFAULT
const mediumSpacing = spacing.md
```

### design-system.ts

Helpers type-safe para trabajar con el design system.

```tsx
import { designSystem } from '@/lib/design-system'

// Obtener color
const color = designSystem.getColor('primary.DEFAULT')

// Obtener espaciado
const space = designSystem.getSpacing('md')

// Aplicar patrones
const classes = designSystem.applyPatterns('focusRing', 'transition')
```

### utils.ts

Función `cn()` para combinar clases de Tailwind.

```tsx
import { cn } from '@/lib/utils'

<div className={cn("base-class", condition && "conditional-class")} />
```

## Mejores Prácticas

### 1. Usar Componentes Primitivos

Siempre usa los componentes primitivos en lugar de crear estilos desde cero:

```tsx
// ✅ Correcto
<Button variant="primary">Click</Button>

// ❌ Incorrecto
<button className="bg-primary text-white px-4 py-2">Click</button>
```

### 2. Usar Tokens en lugar de Valores Hardcodeados

```tsx
// ✅ Correcto
<div className="bg-card text-card-foreground">

// ❌ Incorrecto
<div className="bg-[#16262c] text-white">
```

### 3. Usar Variantes en lugar de Clases Múltiples

```tsx
// ✅ Correcto
<Card variant="elevated">

// ❌ Incorrecto
<Card className="shadow-card-lg">
```

### 4. Mantener Consistencia en Espaciado

```tsx
// ✅ Correcto
<div className="space-y-4">
  <Section spacing="md">...</Section>
</div>

// ❌ Incorrecto
<div style={{ gap: '20px' }}>
  <div style={{ padding: '15px' }}>...</div>
</div>
```

### 5. Usar FormField para Campos de Formulario

```tsx
// ✅ Correcto
<FormField label="Email" error={errors.email} required>
  <Input type="email" />
</FormField>

// ❌ Incorrecto
<div>
  <label>Email</label>
  <input type="email" />
  {errors.email && <p>{errors.email}</p>}
</div>
```

## Estructura de Archivos

```
components/
  ui/              # Componentes primitivos
    button.tsx
    card.tsx
    input.tsx
    badge.tsx
    icon.tsx
    dialog.tsx
    ...
  layout/          # Componentes de layout
    Container.tsx
    Section.tsx
    Grid.tsx
  forms/           # Componentes de formulario
    FormField.tsx
    FormGroup.tsx

lib/
  design-tokens.ts    # Tokens TypeScript
  design-system.ts    # Helpers del design system
  utils.ts            # Utilidades generales

app/
  globals.css         # Variables CSS y estilos globales

tailwind.config.ts    # Configuración de Tailwind con tokens
```

## Extensión del Sistema

Para agregar nuevos componentes o tokens:

1. **Nuevos Tokens**: Agregar en `app/globals.css` y `lib/design-tokens.ts`
2. **Nuevos Componentes Primitivos**: Crear en `components/ui/`
3. **Nuevos Componentes Compuestos**: Crear en `components/layout/` o `components/forms/`
4. **Actualizar Documentación**: Agregar ejemplos en este archivo

## Recursos

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)

