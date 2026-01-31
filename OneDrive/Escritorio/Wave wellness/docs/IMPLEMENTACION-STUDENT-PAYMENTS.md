# Implementación: Student Pagos - Crear Payment + Subir Comprobante (PASO 9)

## Resumen

Se implementó el flujo completo de pagos para estudiantes, incluyendo listado de packages activos, creación de payments con snapshot, y upload directo de comprobantes a Supabase Storage. La UI usa shadcn/ui base y está optimizada para mobile-first y usuarios +60 años.

## Archivos Creados/Modificados

### Archivos Creados:
- `src/lib/validations/payments.ts` - Validación de archivos para upload
- `docs/plan-student-payments.md` - Plan con DoD
- `docs/PRUEBAS-STUDENT-PAYMENTS.md` - Guía de pruebas
- `docs/IMPLEMENTACION-STUDENT-PAYMENTS.md` - Este documento

### Archivos Modificados:
- `src/app/(protected)/student/payments/page.tsx` - Implementación completa
- `src/app/(protected)/student/page.tsx` - Agregado mensaje sobre créditos para agendar

## Funcionalidades Implementadas

### 1. Listar Packages Activos

**Query:**
```typescript
supabase
  .from('packages')
  .select('*')
  .eq('active', true)
  .order('price', { ascending: true })
```

**UI:**
- Cards grandes mobile-friendly
- Muestra: name, credits (o "Ilimitado"), price
- Botón "Pagar este plan" grande (h-14)
- Empty state si no hay packages activos

### 2. Crear Payment Pending con Snapshot

**Al click "Pagar este plan":**
```typescript
const { data: payment } = await supabase
  .from('payments')
  .insert({
    student_id: user.id,
    package_id: pkg.id,
    package_name: pkg.name,        // SNAPSHOT
    package_credits: pkg.credits,   // SNAPSHOT
    amount: pkg.price,              // SNAPSHOT
    status: 'pending',
  })
```

**Características:**
- Snapshot guarda valores del package al momento de crear
- No se lee del package actual al aprobar
- Dialog para subir comprobante se abre automáticamente

### 3. Upload Comprobante Directo a Storage

**Validación:**
- Tipos permitidos: JPG, JPEG, PNG, WEBP, PDF
- Tamaño máximo: 5MB
- Validación antes de upload

**Upload:**
```typescript
const path = `payments/${userId}/${paymentId}.${ext}`

// Upload directo
const { data } = await supabase.storage
  .from('payment-proofs')
  .upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

// Update proof_path
await supabase
  .from('payments')
  .update({ proof_path: path })
  .eq('id', paymentId)
```

**Path:**
- Formato: `payments/{auth.uid()}/{payment_id}.{ext}`
- Cumple con RLS de storage
- Se guarda en `payments.proof_path`

### 4. Lista de Pagos del Student

**Query:**
```typescript
supabase
  .from('payments')
  .select('id, package_name, amount, status, proof_path, created_at')
  .eq('student_id', user.id)
  .order('created_at', { ascending: false })
```

**UI:**
- Desktop: Tabla completa
- Mobile: Cards verticales
- Columnas: Plan, Monto, Estado, Comprobante, Fecha, Acciones
- Badges de estado: Pending (amarillo), Approved (verde), Rejected (rojo)
- Indicator de comprobante: "✓ Subido" o "Pendiente"
- CTA "Subir comprobante" solo si `status = 'pending'` y `proof_path = null`

## Componentes UI Usados (shadcn/ui base)

**Componentes de `@/components/ui/base/`:**
- `Button` - Botones con altura h-12/h-14
- `Input` - Input para file
- `Label` - Labels para formularios
- `Card` - Cards para packages y payments
- `Table` - Tabla para desktop
- `Dialog` - Dialog para subir comprobante
- `Toast` - Notificaciones

**Iconos:**
- `lucide-react` - Package, CreditCard, Upload, CheckCircle2, XCircle, Clock

## Validación de Archivos

### Tipos Permitidos
- `image/jpeg`, `image/jpg`
- `image/png`
- `image/webp`
- `application/pdf`

### Tamaño Máximo
- 5MB (5 * 1024 * 1024 bytes)

### Validación
```typescript
function validateFile(file: File): FileValidationResult {
  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'Archivo demasiado grande' }
  }
  
  // Validar tipo MIME
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Tipo no permitido' }
  }
  
  // Validar extensión
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: 'Extensión no permitida' }
  }
  
  return { valid: true }
}
```

## Flujo Completo

```
Student selecciona plan
  ↓
Crear payment pending con snapshot
  ↓
Dialog para subir comprobante se abre
  ↓
Student selecciona archivo
  ↓
Validar archivo (tipo, tamaño)
  ↓
Upload directo a Supabase Storage
  Path: payments/{user_id}/{payment_id}.{ext}
  ↓
Update payments.proof_path en DB
  ↓
Toast de éxito
  ↓
Lista de pagos actualizada
```

## Características UX (Usuarios +60, Mobile-First)

### ✅ Tamaños Implementados
- Botones: h-12 (48px) por defecto, h-14 (56px) para CTAs
- Inputs: h-12 (48px)
- Tap targets: >= 44px

### ✅ Texto Legible
- Texto base: 16px (text-base)
- Títulos: text-3xl (30px) o text-2xl (24px)
- Labels: text-base (16px)

### ✅ Focus Visible
- Ring de 2px en todos los componentes interactivos
- Ring offset de 2px

### ✅ Labels Reales
- Todos los inputs tienen labels visibles
- Instrucciones claras sobre formatos permitidos

### ✅ Spacing Generoso
- Espaciado entre secciones: space-y-6
- Padding en cards: p-6
- Gap en grids: gap-4

### ✅ Responsive
- Desktop: Tabla completa
- Mobile: Cards verticales
- Breakpoint: md (768px)

## Formato de Precio y Fecha

**Precio:**
```typescript
new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
}).format(price)
```

**Fecha:**
```typescript
new Date(dateString).toLocaleDateString('es-MX', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})
```

## Manejo de Errores

### Errores de Upload
- Archivo muy grande → "El archivo es demasiado grande"
- Tipo inválido → "Tipo de archivo no permitido"
- Error de Storage → Mensaje de Supabase
- Error al actualizar DB → "El archivo se subió pero no se pudo actualizar el registro"

### Errores de Creación de Payment
- Error de RLS → Mensaje de Supabase
- Error inesperado → Mensaje genérico

## Integración con RLS

**Policies (ya implementadas en PASO 3):**
- `payments_select_own` - Student puede ver solo sus payments
- `payments_insert_own` - Student puede crear payments solo para sí mismo
- `payments_update_own` - Student puede actualizar proof_path (pero no status)

**Storage Policies (ya implementadas en PASO 3):**
- `payment_proofs_insert_own` - Student puede subir solo a `payments/{auth.uid()}/%`
- Path validado por RLS

## Próximos Pasos

1. **Probar flujo completo** (ver `docs/PRUEBAS-STUDENT-PAYMENTS.md`)
2. **Verificar que el snapshot funciona correctamente**
3. **Verificar que el upload funciona con RLS**
4. **Continuar con funcionalidad de admin para aprobar payments**

## Notas Importantes

- ✅ No se inventan columnas fuera de schema.sql
- ✅ Snapshot guarda valores al momento de crear payment
- ✅ Upload directo a Supabase Storage (no pasa por Next.js)
- ✅ Path correcto: `payments/{auth.uid()}/{payment_id}.{ext}`
- ✅ RLS respetado
- ✅ UI usa shadcn/ui base (no Kokonut)
- ✅ Validación de archivos implementada
- ✅ UX optimizada para usuarios +60 años
- ✅ Mobile-first design
- ✅ Estados: loading/error/empty/success

## Casos Especiales

### Package Ilimitado
- Si `credits = null` → mostrar "Créditos ilimitados"
- Snapshot guarda `package_credits = null`

### Payment Sin Comprobante
- Si `proof_path = null` y `status = 'pending'` → mostrar CTA "Subir comprobante"
- Si `proof_path` existe → mostrar "✓ Subido"

### Error de Upload
- Si el upload falla, no se actualiza `proof_path`
- Si el upload funciona pero el update falla, mostrar error pero el archivo está en Storage
