# payments-ledger-accounting

## Cuando usar

Al crear sistema de pagos o al aprobar payments. Obligatorio para cualquier flujo de créditos/ledger.

## Objetivo

Al crear payment, guardar snapshot del package. Al aprobar, ledger usa SOLO el snapshot (no el package actual).

## Inputs obligatorios

- `/supabase/schema.sql` - Verificar tablas `payments`, `packages`, `ledger` (o equivalentes)
- Package actual - Leer datos del package al momento de crear payment

## Procedimiento

1. Al crear payment, leer package y guardar snapshot:

```typescript
// Leer package actual
const { data: package } = await supabase
  .from('packages')
  .select('*')
  .eq('id', packageId)
  .single();

// Crear payment con snapshot
const { data: payment } = await supabase
  .from('payments')
  .insert({
    user_id: userId,
    package_id: packageId,
    amount: package.price,
    // SNAPSHOT (obligatorio)
    snapshot: {
      package_name: package.name,
      package_credits: package.credits,
      package_price: package.price,
      snapshot_at: new Date().toISOString(),
    },
    status: 'pending',
  })
  .select()
  .single();
```

2. Al aprobar payment, usar SOLO snapshot (ignorar package actual):

```typescript
async function approvePayment(paymentId: string) {
  // Leer payment con snapshot
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single();

  if (!payment || payment.status !== 'pending') {
    throw new Error('Invalid payment');
  }

  // Usar SOLO snapshot (no leer package actual)
  const snapshot = payment.snapshot;
  
  // Crear entrada en ledger usando snapshot
  const { error } = await supabase.from('ledger').insert({
    user_id: payment.user_id,
    payment_id: paymentId,
    credits: snapshot.package_credits, // Del snapshot
    amount: snapshot.package_price, // Del snapshot
    description: `Payment: ${snapshot.package_name}`, // Del snapshot
  });

  // Actualizar payment a approved
  await supabase
    .from('payments')
    .update({ status: 'approved' })
    .eq('id', paymentId);
}
```

3. Idempotencia: verificar que payment no esté ya aprobado antes de crear ledger entry

4. UI muestra snapshot (no package actual):

```typescript
// En componente de payment
const displayName = payment.snapshot.package_name;
const displayCredits = payment.snapshot.package_credits;
```

## Checks

- [ ] Payment tiene campo `snapshot` (JSON) con: package_name, package_credits, amount
- [ ] Snapshot se guarda al crear payment (no al aprobar)
- [ ] Aprobación usa `payment.snapshot` (no lee package actual)
- [ ] Ledger entry usa valores del snapshot
- [ ] Idempotencia: verificar status antes de aprobar
- [ ] UI muestra datos del snapshot (no del package actual)

## Output obligatorio

**Archivos tocados:**
- Función que crea payment (guarda snapshot)
- Función que aprueba payment (usa snapshot)
- Componente UI que muestra payment (muestra snapshot)

**Pasos para probar:**
1. Crear payment → verificar que `snapshot` se guardó correctamente
2. Modificar package original (cambiar credits/price)
3. Aprobar payment → verificar que ledger usa valores del snapshot (no del package modificado)
4. Intentar aprobar payment ya aprobado → debe ser idempotente (no duplicar ledger)
