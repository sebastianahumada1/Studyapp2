# Integración Kokonut UI vía shadcn Registry

## Contexto
- Kokonut UI no existe como paquete npm `@kokonut/ui`
- Se distribuye vía shadcn registry en `https://kokonutui.com/r/{name}.json`
- Necesitamos integrar Kokonut UI correctamente usando shadcn como registry
- ¿Qué usuario lo necesita?: Desarrolladores que usarán componentes Kokonut UI

## Requisitos

### DB
- [ ] No aplica - Solo integración de UI

### UI
- [ ] Eliminar dependencia `@kokonut/ui` de package.json (no existe)
- [ ] Inicializar shadcn: `npx shadcn@latest init`
- [ ] Configurar `components.json` con registry de Kokonut: `{"@kokonutui":"https://kokonutui.com/r/{name}.json"}`
- [ ] Instalar utils: `npx shadcn@latest add https://kokonutui.com/r/utils.json`
- [ ] Instalar 2-3 componentes Kokonut para showcase en `/ui`
- [ ] Actualizar página `/ui` para usar componentes reales de Kokonut
- [ ] PROHIBIDO: usar otras librerías UI (solo Kokonut vía shadcn registry)

### Archivos
- [ ] `package.json` - Eliminar `@kokonut/ui`
- [ ] `components.json` - Crear con registry Kokonut
- [ ] `src/app/ui/page.tsx` - Actualizar con componentes reales
- [ ] Componentes instalados en `src/components/ui/` (generados por shadcn)

## Implementación

1. Eliminar `@kokonut/ui` de package.json
2. Ejecutar `npx shadcn@latest init` (configurar Tailwind, etc.)
3. Editar `components.json` para agregar registry de Kokonut
4. Instalar utils: `npx shadcn@latest add https://kokonutui.com/r/utils.json`
5. Instalar 2-3 componentes (ej: button, card, input)
6. Actualizar `/ui` para usar componentes reales

## Testing

- [ ] `npm install` funciona sin errores
- [ ] `npm run dev` inicia correctamente
- [ ] Página `/ui` muestra componentes Kokonut reales
- [ ] No hay imports de `@kokonut/ui` (debe usar shadcn registry)
- [ ] Componentes funcionan correctamente
