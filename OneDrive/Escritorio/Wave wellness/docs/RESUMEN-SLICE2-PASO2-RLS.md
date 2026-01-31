# Resumen: Slice 2 - PASO 2 - RLS para coach_slots y class_bookings

## ✅ Implementación Completa

### Archivos Creados

1. **`docs/plan-slice2-rls-policies.md`**
   - Plan y Definition of Done

2. **`docs/PRUEBAS-SLICE2-RLS.md`**
   - 24 pruebas detalladas por rol

3. **`supabase/rls-slice2-additions.sql`**
   - Archivo SQL con SOLO los agregados de Slice 2
   - Listo para aplicar en Supabase

4. **`docs/RESUMEN-SLICE2-PASO2-RLS.md`**
   - Este archivo

### Archivos Modificados

1. **`supabase/rls.sql`**
   - Agregado RLS habilitado para `coach_slots` y `class_bookings`
   - Agregadas policies para `coach_slots` (SELECT, INSERT, UPDATE, DELETE)
   - Agregadas policies para `class_bookings` (SELECT, INSERT, UPDATE)

## Policies Implementadas

### coach_slots

**SELECT (3 policies):**
- `coach_slots_select_active`: Authenticated puede ver slots activos
- `coach_slots_select_own`: Coach puede ver sus slots (activos o no)
- `coach_slots_select_admin`: Admin puede ver todo

**INSERT (2 policies):**
- `coach_slots_insert_own`: Coach solo puede insertar con `coach_id = auth.uid()`
- `coach_slots_insert_admin`: Admin puede insertar

**UPDATE (2 policies):**
- `coach_slots_update_own`: Coach solo puede actualizar sus slots
- `coach_slots_update_admin`: Admin puede actualizar todo

**DELETE (2 policies):**
- `coach_slots_delete_own`: Coach solo puede eliminar sus slots
- `coach_slots_delete_admin`: Admin puede eliminar todo

### class_bookings

**SELECT (3 policies):**
- `class_bookings_select_own`: Student solo ve sus bookings
- `class_bookings_select_coach`: Coach ve bookings de sus slots (mediante join)
- `class_bookings_select_admin`: Admin ve todo

**INSERT (1 policy):**
- `class_bookings_insert_own`: Student solo puede insertar con `student_id = auth.uid()`

**UPDATE (3 policies):**
- `class_bookings_update_own_cancel`: Student solo puede cancelar (status -> 'cancelled')
- `class_bookings_update_coach`: Coach puede marcar attended/no_show en sus slots
- `class_bookings_update_admin`: Admin puede actualizar todo

## Pasos para Aplicar en Supabase

### Opción 1: Aplicar Solo los Agregados (Recomendado)

1. Abre tu proyecto en Supabase Dashboard
2. Ve a **SQL Editor**
3. Crea un nuevo query
4. Copia y pega el contenido de `supabase/rls-slice2-additions.sql`
5. Ejecuta el query (botón "Run" o Ctrl+Enter)
6. Verifica que no hay errores

### Opción 2: Aplicar RLS Completo

1. Copia todo el contenido de `supabase/rls.sql` (ya incluye Slice 2)
2. Ejecuta en SQL Editor
3. Verifica que no hay errores (puede mostrar warnings si las policies ya existen)

## Verificación

### Verificar que RLS está Habilitado

```sql
-- Verificar RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('coach_slots', 'class_bookings');
```

**Resultado esperado:**
- ✅ `coach_slots`: `rowsecurity = true`
- ✅ `class_bookings`: `rowsecurity = true`

### Verificar Policies

```sql
-- Verificar policies de coach_slots
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'coach_slots';

-- Verificar policies de class_bookings
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'class_bookings';
```

**Resultado esperado:**
- ✅ 9 policies para `coach_slots` (3 SELECT, 2 INSERT, 2 UPDATE, 2 DELETE)
- ✅ 7 policies para `class_bookings` (3 SELECT, 1 INSERT, 3 UPDATE)

## Checklist de Pruebas

Ver `docs/PRUEBAS-SLICE2-RLS.md` para pruebas detalladas.

### Resumen de Pruebas

**coach_slots:**
- [ ] Authenticated puede ver slots activos
- [ ] Coach puede ver sus slots (activos o no)
- [ ] Coach NO puede ver slots de otros
- [ ] Admin puede ver todo
- [ ] Coach puede crear/actualizar/eliminar sus slots
- [ ] Coach NO puede crear slots para otros
- [ ] Student NO puede crear slots
- [ ] Admin puede hacer todo

**class_bookings:**
- [ ] Student solo ve sus bookings
- [ ] Coach ve bookings de sus slots
- [ ] Admin ve todos los bookings
- [ ] Student puede crear booking para sí mismo
- [ ] Student NO puede crear booking para otros
- [ ] Coach NO puede crear bookings
- [ ] Student puede cancelar su booking
- [ ] Student NO puede cambiar a attended/no_show
- [ ] Coach puede marcar attended/no_show en sus slots
- [ ] Coach NO puede marcar en slots de otros
- [ ] Admin puede actualizar cualquier booking

## Notas Importantes

### Validaciones en App (No en RLS)

1. **Validación de Créditos:**
   - La validación de "créditos > 0" para reservar se hace en app o RPC
   - No está en RLS (solo estructura)

2. **Validación de Tiempo para Cancelar:**
   - La validación de tiempo (ej: cancelar solo X horas antes) se hace en app
   - RLS solo permite cambiar status a 'cancelled', no valida tiempo

3. **Validación de Capacity:**
   - La validación de "slot lleno" (capacity = 2) se hace en app
   - RLS no valida capacity

### Lógica de Policies

**Coach ve bookings de sus slots:**
- Usa `EXISTS` con join a `coach_slots`
- Verifica que `coach_slots.coach_id = auth.uid()`

**Student solo puede cancelar:**
- Policy permite cambiar status a 'cancelled'
- Bloquea cambios a otros status (attended, no_show)

**Coach puede marcar attended/no_show:**
- Solo en bookings de sus slots
- Solo puede cambiar a 'attended' o 'no_show'
- No puede cambiar a otros status

## Próximos Pasos (Slice 2)

1. **Paso 3:** Implementar UI para coaches (crear slots)
2. **Paso 4:** Implementar UI para students (reservar slots) + validación de créditos
3. **Paso 5:** Implementar triggers para descuento de créditos al marcar asistencia

## Archivos de Referencia

- `supabase/rls.sql` - RLS completo (incluye Slice 2)
- `supabase/rls-slice2-additions.sql` - Solo agregados de Slice 2
- `docs/PRUEBAS-SLICE2-RLS.md` - Checklist de pruebas detalladas
- `docs/plan-slice2-rls-policies.md` - Plan y DoD
