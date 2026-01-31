# Implementación: Slice 2 - Reserva Atómica con RPC (PASO 6)

## Archivos Creados/Modificados

### Archivos Creados:
1. `supabase/rpc-book-slot.sql` - Función SQL para reserva atómica
2. `docs/plan-slice2-atomic-booking-rpc.md` - Plan y DoD
3. `docs/PRUEBAS-SLICE2-ATOMIC-BOOKING.md` - Checklist de pruebas
4. `docs/IMPLEMENTACION-SLICE2-ATOMIC-BOOKING.md` - Este archivo

### Archivos Modificados:
1. `supabase/schema.sql` - Agregada referencia a función RPC
2. `src/app/(protected)/student/book/actions.ts` - Actualizado para usar RPC

## Detalles de Implementación

### 1. Función SQL: `book_slot`

**Ubicación:** `supabase/rpc-book-slot.sql`

**Parámetros:**
- `slot_id uuid`

**Retorno:**
```json
{
  "success": true,
  "booking_id": "uuid"
}
```
o
```json
{
  "success": false,
  "error": "mensaje de error"
}
```

**Características:**
- `SECURITY DEFINER`: Se ejecuta con permisos del creador
- `SELECT FOR UPDATE`: Bloquea filas para evitar race conditions
- Validaciones completas en SQL
- Errores humanizados

**Lógica:**
1. Obtener `student_id = auth.uid()`
2. Verificar slot existe y está activo (con lock)
3. Verificar slot es futuro
4. Contar bookings activos (con lock)
5. Verificar cupos disponibles (booked_count < 2)
6. Verificar student no tiene booking previo
7. Insertar booking
8. Retornar éxito con booking_id

**Transacciones Seguras:**
```sql
-- Lock en coach_slots
SELECT * FROM coach_slots
WHERE id = slot_id
FOR UPDATE;

-- Lock en class_bookings
SELECT COUNT(*) FROM class_bookings
WHERE slot_id = slot_id
  AND status = 'booked'
FOR UPDATE;
```

**Lock Order:**
1. Primero `coach_slots` (tabla principal)
2. Luego `class_bookings` (tabla dependiente)
3. Evita deadlocks

### 2. Actualización de Server Action

**Antes:**
- Validaciones en TypeScript
- Insert directo a `class_bookings`
- Manejo de errores de constraint UNIQUE

**Ahora:**
- Validación de créditos en TypeScript (mantener)
- Llamada a RPC `book_slot()`
- Procesamiento de respuesta JSON
- Errores propagados desde RPC

**Código:**
```typescript
const { data: rpcResult, error: rpcError } = await supabase.rpc('book_slot', {
  slot_id: slotId,
})

const result = rpcResult as { success: boolean; booking_id?: string; error?: string }

if (!result.success) {
  return {
    success: false,
    error: result.error || 'Error al reservar el slot.',
  }
}

return { success: true, bookingId: result.booking_id }
```

### 3. Validaciones

**En Función SQL:**
1. ✅ Usuario autenticado (`auth.uid()`)
2. ✅ Slot existe
3. ✅ Slot activo
4. ✅ Slot futuro
5. ✅ Cupos disponibles (booked_count < 2)
6. ✅ Student no tiene booking previo

**En Server Action:**
1. ✅ Usuario es student
2. ✅ Créditos disponibles > 0
3. ✅ Llamar a RPC
4. ✅ Procesar respuesta

### 4. Manejo de Errores

**Errores de RPC:**
- "Este horario ya se llenó" (booked_count >= 2)
- "Ya tienes una reserva en este horario" (booking duplicado)
- "Este slot no existe o ya no está disponible" (slot no existe)
- "Este slot ya no está activo" (active = false)
- "Este slot ya pasó" (starts_at <= now())

**Errores de Server Action:**
- "No tienes créditos disponibles" (mantener aquí)
- Errores de RPC (propagar)

## Ventajas de la Implementación

### 1. Atomicidad
- Todas las validaciones y el insert están en una transacción
- `SELECT FOR UPDATE` previene race conditions
- Garantiza que solo 2 bookings se crean por slot

### 2. Seguridad
- `SECURITY DEFINER` con validaciones estrictas
- Valida `auth.uid()` para asegurar ownership
- Respetar RLS o usar permisos elevados con cuidado

### 3. Performance
- Menos round-trips (1 llamada RPC vs múltiples queries)
- Validaciones en DB (más rápido)
- Lock eficiente

### 4. Mantenibilidad
- Lógica centralizada en SQL
- Errores consistentes
- Fácil de testear

## Pruebas de Concurrencia

**Escenario:**
- Slot con capacity = 2
- 3 usuarios intentan reservar simultáneamente

**Resultado Esperado:**
- Solo 2 reservas exitosas
- 1 reserva falla con error "Este horario ya se llenó"

**Cómo Probar:**
1. Crear slot sin reservas
2. Simular 3 reservas simultáneas (scripts o manualmente)
3. Verificar en DB que solo hay 2 bookings
4. Verificar que la 3ra falla

## Notas Técnicas

### SELECT FOR UPDATE
- Bloquea filas hasta que la transacción termine
- Previene lecturas inconsistentes
- Evita race conditions

### SECURITY DEFINER
- Función se ejecuta con permisos del creador
- Permite bypass de RLS si es necesario
- Debe validar `auth.uid()` para seguridad

### Lock Order
- Siempre lock en el mismo orden para evitar deadlocks
- Orden: `coach_slots` → `class_bookings`

### Manejo de Excepciones
- `unique_violation`: Constraint UNIQUE violado
- `WHEN OTHERS`: Cualquier otro error
- Retorna JSON con error humanizado
