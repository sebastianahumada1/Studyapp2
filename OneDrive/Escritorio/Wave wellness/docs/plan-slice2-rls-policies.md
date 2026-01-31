# Plan: Slice 2 - RLS para coach_slots y class_bookings (PASO 2)

## Definition of Done (DoD)

- [ ] RLS habilitado en `coach_slots` y `class_bookings`
- [ ] Policies de `coach_slots`:
  - SELECT: authenticated ve slots activos, coach ve los suyos, admin ve todo
  - INSERT/UPDATE/DELETE: solo coach sobre sus slots, admin puede todo
- [ ] Policies de `class_bookings`:
  - SELECT: student solo sus bookings, coach bookings de sus slots, admin todo
  - INSERT: student solo con student_id = auth.uid()
  - UPDATE: student solo puede cancelar, coach puede marcar attended/no_show, admin puede todo
- [ ] Todo SQL ejecutable
- [ ] Checklist de pruebas por rol
- [ ] No inventar columnas

## Lista de Archivos a Crear/Modificar

### Archivos a Modificar:
1. `supabase/rls.sql` - Agregar policies para coach_slots y class_bookings

### Archivos a Crear:
1. `docs/plan-slice2-rls-policies.md` - Este archivo
2. `docs/PRUEBAS-SLICE2-RLS.md` - Checklist de pruebas

## Estructura de Policies

### coach_slots

**SELECT:**
- `coach_slots_select_active`: authenticated puede ver slots activos
- `coach_slots_select_own`: coach puede ver sus slots (activos o no)
- `coach_slots_select_admin`: admin puede ver todo

**INSERT:**
- `coach_slots_insert_own`: coach solo puede insertar con coach_id = auth.uid()
- `coach_slots_insert_admin`: admin puede insertar (opcional)

**UPDATE:**
- `coach_slots_update_own`: coach solo puede actualizar sus slots
- `coach_slots_update_admin`: admin puede actualizar todo

**DELETE:**
- `coach_slots_delete_own`: coach solo puede eliminar sus slots
- `coach_slots_delete_admin`: admin puede eliminar todo

### class_bookings

**SELECT:**
- `class_bookings_select_own`: student solo ve sus bookings
- `class_bookings_select_coach`: coach ve bookings de sus slots
- `class_bookings_select_admin`: admin ve todo

**INSERT:**
- `class_bookings_insert_own`: student solo puede insertar con student_id = auth.uid()

**UPDATE:**
- `class_bookings_update_own_cancel`: student solo puede cancelar (status -> cancelled)
- `class_bookings_update_coach`: coach puede marcar attended/no_show en sus slots
- `class_bookings_update_admin`: admin puede actualizar todo

## Notas Importantes

- Validación de tiempo para cancelación se hace en app (no en RLS por ahora)
- Validación de créditos > 0 se hace en app o RPC (no en RLS)
- Coach puede ver bookings de sus slots (necesita join con coach_slots)
