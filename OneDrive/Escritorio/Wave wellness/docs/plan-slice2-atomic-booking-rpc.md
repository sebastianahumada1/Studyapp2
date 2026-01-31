# Plan: Slice 2 - Reserva Atómica con RPC (PASO 6)

## Definition of Done (DoD)

- [ ] Función SQL `book_slot(slot_id uuid)` creada
- [ ] Función usa transacciones seguras (SELECT FOR UPDATE o similar)
- [ ] Valida cupos booked < 2 antes de insertar
- [ ] Valida que student no tenga booking previo en ese slot
- [ ] Retorna JSON con success/error
- [ ] Respetar RLS o usar SECURITY DEFINER con validaciones estrictas
- [ ] Actualizar `reserveSlot()` para usar RPC
- [ ] Errores humanizados:
  - "Este horario ya se llenó"
  - "Ya tienes una reserva en este horario"
- [ ] Pruebas: reservar 2 cupos ok, 3er intento falla
- [ ] No inventar columnas

## Lista de Archivos a Crear/Modificar

### Archivos a Crear:
1. `supabase/rpc-book-slot.sql` - Función SQL para reserva atómica
2. `docs/plan-slice2-atomic-booking-rpc.md` - Este archivo
3. `docs/IMPLEMENTACION-SLICE2-ATOMIC-BOOKING.md` - Documentación
4. `docs/PRUEBAS-SLICE2-ATOMIC-BOOKING.md` - Checklist de pruebas

### Archivos a Modificar:
1. `supabase/schema.sql` - Agregar función (o crear archivo separado)
2. `src/app/(protected)/student/book/actions.ts` - Usar RPC en vez de insert directo

## Estructura de Implementación

### 1. Función SQL: `book_slot`

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

**Lógica:**
1. Verificar que slot existe y está activo
2. Verificar que slot es futuro (starts_at > now())
3. Lock slot para evitar race conditions (SELECT FOR UPDATE)
4. Contar bookings activos (status='booked')
5. Si booked_count >= 2, error "Este horario ya se llenó"
6. Verificar que student no tiene booking previo
7. Si ya existe, error "Ya tienes una reserva en este horario"
8. Insertar booking
9. Retornar success con booking_id

**Transacción Segura:**
- Usar `SELECT FOR UPDATE` en coach_slots para lock
- Usar `SELECT FOR UPDATE` en class_bookings para lock
- Todo dentro de una transacción

**RLS:**
- Opción 1: Usar `SECURITY DEFINER` con validaciones estrictas
- Opción 2: Respetar RLS y usar `auth.uid()` dentro de la función

**Recomendación:** Usar `SECURITY DEFINER` con validaciones estrictas para evitar problemas de RLS, pero validar que `auth.uid()` es el student que intenta reservar.

### 2. Actualizar Server Action

**Cambios en `reserveSlot()`:**
- En vez de insert directo, llamar a RPC:
  ```typescript
  const { data, error } = await supabase.rpc('book_slot', {
    slot_id: slotId
  })
  ```
- Manejar respuesta JSON
- Retornar errores humanizados

**Simplificar validaciones:**
- Algunas validaciones ya están en la función SQL
- Mantener validaciones de créditos en Server Action
- Mantener validación de slot activo/futuro (o mover a SQL)

### 3. Manejo de Errores

**Errores de RPC:**
- "Este horario ya se llenó" (booked_count >= 2)
- "Ya tienes una reserva en este horario" (booking duplicado)
- "Este slot no existe o no está disponible"
- "Este slot ya pasó" (starts_at <= now())

**Errores de Server Action:**
- "No tienes créditos disponibles" (mantener aquí)
- Errores de RPC (propagar)

## Validaciones

### En Función SQL:
1. ✅ Slot existe y está activo
2. ✅ Slot es futuro
3. ✅ Cupos disponibles (booked_count < 2)
4. ✅ Student no tiene booking previo
5. ✅ Lock para evitar race conditions

### En Server Action:
1. ✅ Usuario es student
2. ✅ Créditos disponibles > 0
3. ✅ Llamar a RPC
4. ✅ Manejar respuesta

## Transacciones Seguras

**SELECT FOR UPDATE:**
```sql
SELECT * FROM coach_slots 
WHERE id = slot_id 
FOR UPDATE;

SELECT COUNT(*) FROM class_bookings
WHERE slot_id = slot_id 
  AND status = 'booked'
FOR UPDATE;
```

**Lock Order:**
1. Lock coach_slots primero
2. Lock class_bookings después
3. Evitar deadlocks

## Pruebas de Concurrencia

**Test:**
1. Crear slot con capacidad 2
2. Simular 3 reservas simultáneas
3. Verificar que solo 2 se crean exitosamente
4. Verificar que la 3ra falla con error "Este horario ya se llenó"
