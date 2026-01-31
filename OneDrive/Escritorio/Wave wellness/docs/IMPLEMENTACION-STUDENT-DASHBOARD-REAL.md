# Implementación: Student Dashboard REAL (PASO 11)

## Archivos Creados/Modificados

### Archivos Creados:
1. `docs/plan-student-dashboard-real.md` - Plan y DoD
2. `docs/PRUEBAS-STUDENT-DASHBOARD-REAL.md` - 12 pruebas detalladas
3. `docs/IMPLEMENTACION-STUDENT-DASHBOARD-REAL.md` - Este archivo

### Archivos Modificados:
1. `src/app/(protected)/student/page.tsx` - Implementación completa con datos reales

## Detalles de Implementación

### 1. Server Component

La página es un **Server Component** que:
- Obtiene el profile del usuario autenticado
- Hace queries a Supabase server-side
- Renderiza datos directamente sin client-side fetching

### 2. Balance de Créditos

**Query:**
```typescript
const { data: ledgerEntries } = await supabase
  .from('credit_ledger')
  .select('delta')
  .eq('student_id', profile.id)

const balance = ledgerEntries?.reduce((sum, entry) => sum + entry.delta, 0) || 0
```

**Lógica:**
- Suma todos los `delta` del ledger del student
- Si no hay entries, balance = 0

**UI:**
- Si balance <= 0:
  - Muestra "0" en texto muted
  - Mensaje "No tienes créditos disponibles"
  - CTA grande "Comprar Plan" -> /student/payments
- Si balance > 0:
  - Muestra balance en texto grande y destacado (text-5xl, text-primary)
  - Mensaje informativo

### 3. Últimos Movimientos

**Query:**
```typescript
const { data: movements } = await supabase
  .from('credit_ledger')
  .select('id, delta, reason, created_at, ref_payment_id')
  .eq('student_id', profile.id)
  .order('created_at', { ascending: false })
  .limit(10)
```

**Humanización de Reasons:**
- `'payment_approved'` → "Pago aprobado"
- `'manual_adjustment'` → "Ajuste manual"

**UI:**
- Lista de cards con:
  - Reason humanizado
  - Fecha formateada
  - Delta (+N o -N) con color (verde si positivo, rojo si negativo)
- Empty state si no hay movimientos

### 4. Últimos Pagos

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
- Lista de cards con:
  - package_name
  - amount (formateado como moneda)
  - status badge (pending/approved/rejected)
  - created_at (formateado)
  - Si status = 'pending' y proof_path = NULL: botón "Subir Comprobante"
- Empty state si no hay pagos
- Botón "Ver Todos los Pagos" al final

**CTA Condicional:**
- Si hay pagos pending sin comprobante: muestra card "Acción Requerida" al final con CTA "Subir Comprobante"

### 5. Banner de Flujo

**Contenido:**
- "Paso 1: Pagas y subes comprobante"
- "Paso 2: Admin aprueba tu pago"
- "Paso 3: Con créditos aprobados podrás agendar"

**UI:**
- Card con borde primary/20 y fondo primary/5
- Lista numerada (ol)
- Estilo informativo (no intrusivo)

### 6. Formateo de Datos

**Fechas:**
```typescript
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
```

**Precios:**
```typescript
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(price)
}
```

**Status Badges:**
- pending: badge amarillo con icono Clock
- approved: badge verde con icono CheckCircle2
- rejected: badge rojo con icono XCircle

## Seguridad y RLS

### RLS (Row Level Security)
- Student solo puede ver su propio ledger (policy `credit_ledger_select_own`)
- Student solo puede ver sus propios payments (policy `payments_select_own`)
- Queries usan `.eq('student_id', profile.id)` para asegurar filtrado

### Validaciones
- Verifica que profile existe antes de hacer queries
- Redirige a login si no hay profile

## UX para +60

- **Texto base:** >= 16px (text-base)
- **Botones:** >= 48px altura (h-12, h-14)
- **Títulos:** text-3xl, text-5xl para balance
- **Spacing:** space-y-6, space-y-4 generoso
- **Labels:** claros y descriptivos
- **Empty states:** mensajes informativos
- **Mobile-first:** grid responsive (1 col mobile, 2 cols desktop)

## Layout

```
┌─────────────────────────────────────┐
│ Header (Dashboard)                   │
├─────────────────────────────────────┤
│ Banner de Flujo                      │
├─────────────────────────────────────┤
│ Balance de Créditos (card grande)    │
├─────────────────────────────────────┤
│ ┌─────────────┬─────────────┐      │
│ │ Movimientos │ Últimos Pagos│      │
│ │ (últimos 10)│ (últimos 5)  │      │
│ └─────────────┴─────────────┘      │
├─────────────────────────────────────┤
│ CTA "Acción Requerida" (condicional) │
└─────────────────────────────────────┘
```

## Flujo de Datos

1. **Server Component renderiza:**
   - Obtiene profile
   - Hace queries a Supabase
   - Calcula balance
   - Formatea datos
   - Renderiza UI

2. **No hay client-side fetching:**
   - Todo se hace server-side
   - Datos frescos en cada carga
   - No hay estados de loading en cliente

## Notas Técnicas

### Balance Calculation
- Se calcula sumando todos los `delta` del ledger
- No se usa función SQL SUM() para mantener simplicidad
- Si no hay entries, balance = 0

### Limitaciones
- Últimos movimientos: 10 registros
- Últimos pagos: 5 registros
- Para ver más, usar página `/student/payments`

### Performance
- Queries son eficientes (usando índices)
- RLS filtra automáticamente
- Server Component = menos JavaScript en cliente

## Próximos Pasos (Slice 2+)

- Agregar gráfico de balance histórico
- Agregar filtros de fecha para movimientos
- Agregar paginación para movimientos/pagos
- Agregar notificaciones cuando se aprueba pago
- Integrar con agenda (cuando esté implementada)
