# Plan: Student Pagos - Crear Payment + Subir Comprobante (PASO 9)

## Definition of Done (DoD)

- [ ] Listar packages activos (where active=true)
- [ ] UI: lista/cards grandes mobile-friendly con name, credits, price
- [ ] Botón grande "Pagar este plan" por package
- [ ] Empty state si no hay planes activos
- [ ] Crear payment pending con snapshot al click "Pagar este plan"
- [ ] Snapshot incluye: package_name, package_credits, amount
- [ ] UI para subir comprobante después de crear payment
- [ ] Upload directo a Supabase Storage (bucket payment-proofs)
- [ ] Path correcto: `payments/${auth.uid()}/${paymentId}.${ext}`
- [ ] Update payments.proof_path después de upload
- [ ] Lista de pagos del student con tabla/lista mobile
- [ ] Mostrar: package_name, amount, status (badge), created_at, indicator de proof_path
- [ ] CTA "Subir comprobante" cuando pending y sin comprobante
- [ ] Validación de archivo: jpg/png/webp/pdf, max 5MB
- [ ] Estados: loading/error/empty/success
- [ ] Botones grandes (>=48px), labels claros
- [ ] No mezclar Kokonut con shadcn
- [ ] No inventar columnas fuera de schema.sql

## Lista de Archivos a Crear/Modificar

### Archivos a Modificar:
- `src/app/(protected)/student/payments/page.tsx` - Implementar funcionalidad completa
- `src/app/(protected)/student/page.tsx` - Agregar mensaje sobre créditos para agendar

### Archivos a Crear:
- `src/lib/validations/payments.ts` - Validación de archivos para upload

## Estructura de Implementación

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
- Mostrar: name, credits (o "Ilimitado"), price
- Botón "Pagar este plan" grande (h-14)

**Empty State:**
- "Aún no hay planes disponibles."

### 2. Crear Payment Pending

**Al click "Pagar este plan":**
```typescript
const { data: payment, error } = await supabase
  .from('payments')
  .insert({
    student_id: user.id,
    package_id: selectedPackage.id,
    package_name: selectedPackage.name, // SNAPSHOT
    package_credits: selectedPackage.credits, // SNAPSHOT
    amount: selectedPackage.price, // SNAPSHOT
    status: 'pending',
  })
  .select()
  .single()
```

**Después de crear:**
- Mostrar UI para subir comprobante
- Dialog o sección con input file

### 3. Upload Comprobante

**Validación:**
- Tipos: jpg, jpeg, png, webp, pdf
- Tamaño: max 5MB

**Upload directo:**
```typescript
const userId = user.id
const paymentId = payment.id
const ext = file.name.split('.').pop()?.toLowerCase()
const path = `payments/${userId}/${paymentId}.${ext}`

// Upload
const { data: uploadData, error: uploadError } = await supabase.storage
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
  .eq('student_id', userId)
```

### 4. Lista de Pagos

**Query:**
```typescript
supabase
  .from('payments')
  .select('*')
  .eq('student_id', user.id)
  .order('created_at', { ascending: false })
```

**UI:**
- Desktop: Tabla
- Mobile: Cards
- Columnas: package_name, amount, status (badge), created_at, proof_path indicator
- CTA "Subir comprobante" si pending y sin proof_path

### 5. Estados y UX

**Loading:**
- Spinner durante creación de payment
- Progress durante upload

**Error:**
- Toast con mensaje claro
- Errores específicos: archivo muy grande, tipo inválido, error de upload

**Success:**
- Toast de confirmación
- Actualizar lista automáticamente

## Componentes UI (shadcn/ui base)

**Usar:**
- `@/components/ui/base/button`
- `@/components/ui/base/card`
- `@/components/ui/base/table`
- `@/components/ui/base/dialog`
- `@/components/ui/base/toast`
- `@/components/ui/base/input` (para file input)

## Pasos de Implementación

1. Crear validación de archivos
2. Implementar listado de packages activos
3. Implementar creación de payment
4. Implementar upload de comprobante
5. Implementar lista de pagos
6. Agregar estados y toasts
7. Probar flujo completo

## Testing

### Prueba 1: Listar Packages
- Verificar que solo muestra activos
- Verificar empty state si no hay

### Prueba 2: Crear Payment
- Click en "Pagar este plan"
- Verificar: payment creado en DB con snapshot
- Verificar: UI para subir comprobante aparece

### Prueba 3: Upload Comprobante
- Subir archivo válido
- Verificar: archivo en Storage en path correcto
- Verificar: proof_path actualizado en DB

### Prueba 4: Lista de Pagos
- Verificar que muestra todos los payments del student
- Verificar badges de status
- Verificar CTA "Subir comprobante" cuando aplica
