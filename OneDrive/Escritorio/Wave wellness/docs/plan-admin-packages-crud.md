# Plan: Admin CRUD de Paquetes/Precios (PASO 8)

## Definition of Done (DoD)

- [ ] Listado de packages implementado (tabla mobile-friendly)
- [ ] Crear package (dialog con validación zod)
- [ ] Editar package (dialog con validación zod)
- [ ] Activar/Desactivar package (toggle)
- [ ] Validaciones zod: name min 2, price > 0, credits null o int > 0
- [ ] UI usa shadcn/ui base (no Kokonut)
- [ ] Mobile-first +60: inputs altos, labels claros, botones grandes
- [ ] Loading states y toasts implementados
- [ ] Empty state si no hay packages
- [ ] RLS respetado: solo admin puede crear/editar/desactivar
- [ ] No se inventan columnas fuera de schema.sql
- [ ] Formato de moneda simple para price
- [ ] Muestra "Ilimitado" si credits es null

## Lista de Archivos a Crear/Modificar

### Archivos a Modificar:
- `src/app/(protected)/admin/packages/page.tsx` - Implementar CRUD completo

### Archivos a Crear:
- `src/lib/validations/packages.ts` - Schema de validación zod para packages

## Estructura de Implementación

### 1. Listado de Packages

**Tabla Mobile-Friendly:**
- Desktop: Tabla completa con todas las columnas
- Mobile: Cards o lista vertical
- Columnas:
  - name
  - credits (mostrar "Ilimitado" si null)
  - price (formato moneda: $XXX.XX)
  - active (badge verde/rojo)
  - acciones: Edit, Toggle active

**Empty State:**
- Si no hay packages, mostrar mensaje claro
- CTA "Crear primer paquete"

### 2. Crear Package (Dialog)

**Campos:**
- name (string, requerido, min 2)
- credits (number, opcional; si vacío => null)
- price (number, requerido, > 0)
- active (boolean, default true)

**Validación zod:**
```typescript
const packageSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  credits: z.number().int().positive().nullable().optional().transform(val => val === undefined || val === null ? null : val),
  price: z.number().positive('El precio debe ser mayor a 0'),
  active: z.boolean().default(true),
})
```

**UX:**
- Labels reales (no solo placeholders)
- Inputs altura h-12 (48px)
- Botón "Crear" grande (h-14)
- Loading state durante creación
- Toast de éxito/error

### 3. Editar Package (Dialog)

**Similar a crear:**
- Pre-llenar campos con datos existentes
- Validación igual
- Botón "Guardar" en lugar de "Crear"
- Toast de éxito/error

### 4. Activar/Desactivar

**Toggle:**
- Botón o switch para cambiar active
- Confirmación opcional (o directo)
- Toast de confirmación
- Actualizar UI inmediatamente

### 5. Persistencia

**Supabase:**
- Usar `createClient()` de `@/lib/supabase/client` (client-side)
- Queries:
  - SELECT: `supabase.from('packages').select('*').order('created_at', { ascending: false })`
  - INSERT: `supabase.from('packages').insert({ name, credits, price, active })`
  - UPDATE: `supabase.from('packages').update({ ... }).eq('id', id)`
  - UPDATE active: `supabase.from('packages').update({ active: !active }).eq('id', id)`

**RLS:**
- Si no es admin, RLS bloqueará las operaciones
- Mostrar error claro si falla por RLS

## Componentes UI (shadcn/ui base)

**Usar:**
- `@/components/ui/base/button`
- `@/components/ui/base/input`
- `@/components/ui/base/label`
- `@/components/ui/base/card`
- `@/components/ui/base/table` (desktop)
- `@/components/ui/base/dialog`
- `@/components/ui/base/toast`

**Badge:**
- Crear componente simple o usar className con colores

## Pasos de Implementación

1. Crear schema de validación zod
2. Implementar listado (tabla/cards)
3. Implementar dialog de crear
4. Implementar dialog de editar
5. Implementar toggle activar/desactivar
6. Agregar loading states y toasts
7. Probar CRUD completo

## Testing

### Prueba 1: Crear Package
- Click en "Crear paquete"
- Completar form
- Verificar: package creado en DB
- Verificar: aparece en listado

### Prueba 2: Editar Package
- Click en "Editar"
- Modificar campos
- Verificar: cambios guardados en DB
- Verificar: listado actualizado

### Prueba 3: Activar/Desactivar
- Click en toggle
- Verificar: active cambia en DB
- Verificar: badge actualizado

### Prueba 4: RLS
- Intentar crear/editar como student (debería fallar o redirigir)
- Verificar: error claro mostrado
