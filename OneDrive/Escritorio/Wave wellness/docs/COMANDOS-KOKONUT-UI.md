# Comandos para Integración Kokonut UI

## Comandos Ejecutados

### 1. Eliminar dependencia @kokonut/ui
```bash
# Ya eliminado de package.json
```

### 2. Inicializar shadcn
```bash
npx shadcn@latest init --yes
```
**Nota**: Se creó `components.json` manualmente debido a problemas de permisos.

### 3. Configurar components.json con registry Kokonut
Archivo `components.json` creado con:
```json
{
  "registries": {
    "@kokonutui": "https://kokonutui.com/r/{name}.json"
  }
}
```

### 4. Instalar utils de Kokonut
```bash
npx shadcn@latest add https://kokonutui.com/r/utils.json --yes
```
**Nota**: Se creó `src/lib/utils.ts` manualmente debido a problemas de permisos.

### 5. Instalar componentes Kokonut
```bash
# Componentes instalados manualmente:
# - Button: src/components/ui/button.tsx
# - Card: src/components/ui/card.tsx
# - Input: src/components/ui/input.tsx
```

**Comandos alternativos (si funcionan):**
```bash
npx shadcn@latest add @kokonutui/button --yes
npx shadcn@latest add @kokonutui/card --yes
npx shadcn@latest add @kokonutui/input --yes
```

### 6. Instalar dependencias npm
```bash
npm install
```

## Archivos Creados/Modificados

### Creados:
- `components.json` - Configuración shadcn con registry Kokonut
- `src/lib/utils.ts` - Utilidades para className merging
- `src/components/ui/button.tsx` - Componente Button de Kokonut
- `src/components/ui/card.tsx` - Componente Card de Kokonut
- `src/components/ui/input.tsx` - Componente Input de Kokonut

### Modificados:
- `package.json` - Eliminado `@kokonut/ui`, agregado `clsx` y `tailwind-merge`
- `src/app/ui/page.tsx` - Actualizado para usar componentes reales

## Verificación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Verificar que compila:**
   ```bash
   npm run build
   ```

3. **Iniciar servidor:**
   ```bash
   npm run dev
   ```

4. **Visitar:**
   - `http://localhost:3000/ui` - Debe mostrar componentes Kokonut funcionando

## Notas

- Los componentes fueron creados manualmente siguiendo la estructura de Kokonut UI
- Usan los design tokens "Earth & Ocean" definidos en `tailwind.config.ts`
- Los componentes están listos para usar en toda la aplicación
- Para instalar más componentes, usar: `npx shadcn@latest add @kokonutui/<component-name>`
