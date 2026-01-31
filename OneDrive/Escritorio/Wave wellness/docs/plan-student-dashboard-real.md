# Plan: Student Dashboard REAL (PASO 11)

## Definition of Done (DoD)

- [ ] Balance de créditos calculado desde credit_ledger (SUM(delta))
- [ ] Card grande "Créditos disponibles" con balance
- [ ] Si balance <= 0: estado "Sin créditos" + CTA "Comprar plan" -> /student/payments
- [ ] Últimos movimientos: últimos 10 registros de credit_ledger
- [ ] Movimientos muestran: fecha, reason humanizado, delta (+N)
- [ ] Empty state si no hay movimientos
- [ ] Últimos pagos: últimos 5 pagos del student
- [ ] Pagos muestran: package_name, amount, status badge, created_at
- [ ] Si hay pending sin proof_path: CTA "Subir comprobante" -> /student/payments
- [ ] Banner de flujo: "Paso 1: Pagas...", "Paso 2: Admin aprueba...", "Paso 3: Agendas..."
- [ ] Mobile-first, texto grande, botones altos, spacing generoso
- [ ] No mezclar Kokonut con shadcn
- [ ] RLS respetado (student solo ve lo suyo)
- [ ] No usar service role

## Lista de Archivos a Crear/Modificar

### Archivos a Modificar:
- `src/app/(protected)/student/page.tsx` - Implementación completa con datos reales

### Archivos a Crear:
- `docs/plan-student-dashboard-real.md` - Este archivo
- `docs/PRUEBAS-STUDENT-DASHBOARD-REAL.md` - Pasos de prueba

## Estructura de Implementación

### 1. Balance de Créditos

**Query:**
```typescript
const { data: balanceData } = await supabase
  .from('credit_ledger')
  .select('delta')
  .eq('student_id', profile.id)

const balance = balanceData?.reduce((sum, entry) => sum + entry.delta, 0) || 0
```

**UI:**
- Card grande con balance
- Si balance <= 0: mensaje "Sin créditos" + CTA grande "Comprar plan"
- Si balance > 0: mostrar balance destacado

### 2. Últimos Movimientos

**Query:**
```typescript
const { data: movements } = await supabase
  .from('credit_ledger')
  .select('id, delta, reason, created_at, ref_payment_id')
  .eq('student_id', profile.id)
  .order('created_at', { ascending: false })
  .limit(10)
```

**Humanizar reason:**
- 'payment_approved' → "Pago aprobado"
- 'manual_adjustment' → "Ajuste manual"

**UI:**
- Lista con fecha, reason, delta (+N o -N)
- Empty state si no hay movimientos

### 3. Últimos Pagos

**Query:**
```typescript
const { data: payments } = await supabase
  .from('payments')
  .select('id, package_name, amount, status, proof_path, created_at')
  .eq('student_id', profile.id)
  .order('created_at', { ascending: false })
  .limit(5)
```

**UI:**
- Lista con package_name, amount, status badge, fecha
- Si hay pending sin proof_path: CTA "Subir comprobante"

### 4. Banner de Flujo

**Contenido:**
- "Paso 1: Pagas y subes comprobante"
- "Paso 2: Admin aprueba"
- "Paso 3: Con créditos aprobados podrás agendar"

**UI:**
- Banner simple con lista numerada
- Estilo informativo (no intrusivo)

## Componentes UI (shadcn/ui base)

**Usar:**
- `@/components/ui/base/card`
- `@/components/ui/base/button`
- `@/components/ui/base/badge` (si existe, o crear simple)
- No usar Kokonut

## Pasos de Implementación

1. Convertir página a Server Component (o usar Client Component con useEffect)
2. Implementar query de balance
3. Implementar query de movimientos
4. Implementar query de pagos
5. Crear UI para balance
6. Crear UI para movimientos
7. Crear UI para pagos
8. Agregar banner de flujo
9. Agregar estados de loading/empty
10. Probar con datos reales

## Testing

### Prueba 1: Student Sin Ledger
- Verificar balance = 0
- Verificar mensaje "Sin créditos"
- Verificar CTA "Comprar plan"

### Prueba 2: Student Con Pago Aprobado
- Crear payment y aprobar como admin
- Verificar balance > 0
- Verificar movimientos muestran "Pago aprobado"
- Verificar pagos muestran status "Aprobado"

### Prueba 3: Student Con Pago Pending Sin Comprobante
- Crear payment sin subir comprobante
- Verificar que aparece en últimos pagos
- Verificar CTA "Subir comprobante"
