# spec-first

## Cuando usar

Antes de escribir código para cualquier feature nueva. Obligatorio para cambios que toquen DB, UI, o uploads.

## Objetivo

Crear SPEC en `/docs/specs/<slug>.md` que valide contra schema.sql y evite inventar tablas/columnas/UI/upload patterns.

## Inputs obligatorios

- `/supabase/schema.sql` - Verificar que todas las tablas/columnas mencionadas existan
- `/docs/specs/*.md` - Revisar formato de specs existentes
- Cualquier componente Kokonut UI usado - Verificar que existe en el design system

## Procedimiento

1. Crear `/docs/specs/<slug>.md` con esta plantilla:

```markdown
# <Feature Name>

## Contexto
- ¿Qué problema resuelve?
- ¿Qué usuario lo necesita?

## Requisitos

### DB
- [ ] Tabla: `<table>` (verificar en schema.sql)
- [ ] Columnas: `<col1>`, `<col2>` (verificar en schema.sql)
- [ ] RLS: Policies necesarias para `<table>`
- [ ] Si no existe en schema.sql: **BLOCKER: falta en schema.sql**

### UI
- [ ] Componentes Kokonut UI: `<Button>`, `<Input>` (listar exactos)
- [ ] PROHIBIDO: sugerir librerías UI nuevas
- [ ] Layout: estructura de página/ruta

### Uploads (si aplica)
- [ ] PROHIBIDO: Server Actions / Route Handlers para upload
- [ ] Upload directo a Supabase Storage desde cliente
- [ ] Validaciones: size/mime type

### Pagos (si aplica)
- [ ] Snapshot de package al crear payment
- [ ] Ledger usa snapshot, no package actual

## Implementación

1. Paso 1: ...
2. Paso 2: ...

## Testing

- [ ] RLS funciona
- [ ] UI usa solo Kokonut
- [ ] Upload directo (sin handlers)
```

2. Reemplazar `<table>`, `<col1>`, etc. SOLO con entidades de schema.sql
3. Si algo no existe en schema.sql, escribir "BLOCKER: falta en schema.sql" y no continuar
4. Validar que todos los componentes UI mencionados son de Kokonut

## Checks

- [ ] SPEC existe en `/docs/specs/<slug>.md`
- [ ] Todas las tablas/columnas verificadas en schema.sql
- [ ] No se mencionan librerías UI fuera de Kokonut
- [ ] Uploads especifican "directo desde cliente" (no handlers)
- [ ] Pagos incluyen snapshot en la spec
- [ ] No hay referencias a "Slice 1" ni slices
- [ ] SPEC tiene checklist de DB/UI/Uploads

## Output obligatorio

**Archivos tocados:**
- `/docs/specs/<slug>.md` (creado)

**Pasos para probar:**
1. Leer schema.sql y verificar que todas las entidades DB de la spec existen
2. Buscar en codebase los componentes Kokonut mencionados
3. Si algo falta, marcar BLOCKER y no implementar hasta resolver
