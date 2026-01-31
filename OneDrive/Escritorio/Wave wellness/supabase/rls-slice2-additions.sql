-- ============================================================================
-- SLICE 2 - Agregados al RLS: coach_slots y class_bookings
-- ============================================================================
-- 
-- CÓMO APLICAR ESTE ARCHIVO EN SUPABASE:
-- 
-- 1. Asegúrate de haber aplicado primero:
--    - `supabase/schema.sql` (incluye Slice 2)
--    - `supabase/rls.sql` (Slice 1)
-- 2. Abre tu proyecto en Supabase Dashboard
-- 3. Ve a "SQL Editor" en el menú lateral
-- 4. Crea un nuevo query
-- 5. Copia y pega TODO el contenido de este archivo
-- 6. Ejecuta el query (botón "Run" o Ctrl+Enter)
-- 7. Verifica que no hay errores
-- 
-- NOTA: Este archivo contiene SOLO los agregados de Slice 2.
-- Si prefieres aplicar todo el RLS de nuevo, usa `supabase/rls.sql` completo.
-- ============================================================================

-- Habilitar RLS en tablas de Slice 2
-- ============================================================================

ALTER TABLE coach_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_bookings ENABLE ROW LEVEL SECURITY;

-- Policies: coach_slots
-- ============================================================================

-- SELECT: Authenticated puede ver slots activos (para reservar)
CREATE POLICY "coach_slots_select_active"
ON coach_slots
FOR SELECT
TO authenticated
USING (active = true);

-- SELECT: Coach puede ver sus slots (activos o no)
CREATE POLICY "coach_slots_select_own"
ON coach_slots
FOR SELECT
TO authenticated
USING (coach_id = auth.uid());

-- SELECT: Admin puede ver todo
CREATE POLICY "coach_slots_select_admin"
ON coach_slots
FOR SELECT
TO authenticated
USING (is_admin());

-- INSERT: Coach solo puede insertar sus propios slots
CREATE POLICY "coach_slots_insert_own"
ON coach_slots
FOR INSERT
TO authenticated
WITH CHECK (coach_id = auth.uid());

-- INSERT: Admin puede insertar (opcional, para casos especiales)
CREATE POLICY "coach_slots_insert_admin"
ON coach_slots
FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- UPDATE: Coach solo puede actualizar sus slots
CREATE POLICY "coach_slots_update_own"
ON coach_slots
FOR UPDATE
TO authenticated
USING (coach_id = auth.uid())
WITH CHECK (coach_id = auth.uid());

-- UPDATE: Admin puede actualizar todo
CREATE POLICY "coach_slots_update_admin"
ON coach_slots
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- DELETE: Coach solo puede eliminar sus slots
CREATE POLICY "coach_slots_delete_own"
ON coach_slots
FOR DELETE
TO authenticated
USING (coach_id = auth.uid());

-- DELETE: Admin puede eliminar todo
CREATE POLICY "coach_slots_delete_admin"
ON coach_slots
FOR DELETE
TO authenticated
USING (is_admin());

-- Policies: class_bookings
-- ============================================================================

-- SELECT: Student solo ve sus bookings
CREATE POLICY "class_bookings_select_own"
ON class_bookings
FOR SELECT
TO authenticated
USING (student_id = auth.uid());

-- SELECT: Coach ve bookings de sus slots
-- Necesita verificar que el slot pertenece al coach
CREATE POLICY "class_bookings_select_coach"
ON class_bookings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM coach_slots
    WHERE coach_slots.id = class_bookings.slot_id
      AND coach_slots.coach_id = auth.uid()
  )
);

-- SELECT: Admin ve todo
CREATE POLICY "class_bookings_select_admin"
ON class_bookings
FOR SELECT
TO authenticated
USING (is_admin());

-- INSERT: Student solo puede insertar bookings con student_id = auth.uid()
CREATE POLICY "class_bookings_insert_own"
ON class_bookings
FOR INSERT
TO authenticated
WITH CHECK (student_id = auth.uid());

-- UPDATE: Student solo puede cancelar sus bookings (status -> cancelled)
-- La validación de status se hace mediante trigger, no en RLS
-- Policy permite que student actualice su booking, pero el trigger bloquea cambios de status
CREATE POLICY "class_bookings_update_own"
ON class_bookings
FOR UPDATE
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

-- UPDATE: Coach puede marcar attended/no_show solo en bookings de sus slots
-- La validación de status se hace mediante trigger, no en RLS
-- Policy permite que coach actualice bookings de sus slots, pero el trigger valida status
CREATE POLICY "class_bookings_update_coach"
ON class_bookings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM coach_slots
    WHERE coach_slots.id = class_bookings.slot_id
      AND coach_slots.coach_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM coach_slots
    WHERE coach_slots.id = class_bookings.slot_id
      AND coach_slots.coach_id = auth.uid()
  )
);

-- UPDATE: Admin puede actualizar todo
CREATE POLICY "class_bookings_update_admin"
ON class_bookings
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Trigger: Validar cambios de status en class_bookings
-- ============================================================================
-- Student solo puede cancelar (status -> 'cancelled')
-- Coach solo puede marcar attended/no_show en bookings de sus slots
CREATE OR REPLACE FUNCTION check_booking_status_change()
RETURNS trigger AS $$
BEGIN
  -- Si es student (no admin ni coach del slot), solo puede cancelar
  IF OLD.student_id = auth.uid() AND NOT is_admin() THEN
    -- Verificar si es coach del slot
    IF NOT EXISTS (
      SELECT 1
      FROM coach_slots
      WHERE coach_slots.id = OLD.slot_id
        AND coach_slots.coach_id = auth.uid()
    ) THEN
      -- Es student, solo puede cambiar a 'cancelled'
      IF OLD.status != NEW.status AND NEW.status != 'cancelled' THEN
        RAISE EXCEPTION 'Students can only cancel bookings (status -> cancelled)';
      END IF;
    END IF;
  END IF;

  -- Si es coach (no admin), solo puede cambiar a 'attended' o 'no_show'
  IF EXISTS (
    SELECT 1
    FROM coach_slots
    WHERE coach_slots.id = OLD.slot_id
      AND coach_slots.coach_id = auth.uid()
  ) AND NOT is_admin() THEN
    -- Es coach del slot, solo puede cambiar a 'attended' o 'no_show'
    IF OLD.status != NEW.status AND NEW.status NOT IN ('attended', 'no_show') THEN
      RAISE EXCEPTION 'Coaches can only mark bookings as attended or no_show';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER prevent_invalid_booking_status_change
BEFORE UPDATE ON class_bookings
FOR EACH ROW
EXECUTE FUNCTION check_booking_status_change();

-- ============================================================================
-- NOTAS IMPORTANTES:
-- 
-- 1. Student solo puede cancelar bookings (trigger valida, tiempo en app)
-- 2. Coach puede marcar attended/no_show solo en bookings de sus slots (trigger valida)
-- 3. Validación de créditos > 0 para reservar se hace en app o RPC (no en RLS)
-- 4. Coach puede ver bookings de sus slots mediante join con coach_slots
-- 5. Admin puede hacer todo (SELECT, INSERT, UPDATE, DELETE)
-- 6. Trigger check_booking_status_change() valida cambios de status en class_bookings
-- ============================================================================
