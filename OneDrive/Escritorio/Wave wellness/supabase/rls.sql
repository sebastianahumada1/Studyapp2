-- ============================================================================
-- Wave Wellness RLS (Row Level Security) Policies + Storage
-- ============================================================================
-- 
-- CÓMO APLICAR ESTE ARCHIVO EN SUPABASE:
-- 
-- 1. Asegúrate de haber ejecutado primero `/supabase/schema.sql`
-- 2. Abre tu proyecto en Supabase Dashboard
-- 3. Ve a "SQL Editor" en el menú lateral
-- 4. Crea un nuevo query
-- 5. Copia y pega TODO el contenido de este archivo
-- 6. Ejecuta el query (botón "Run" o Ctrl+Enter)
-- 7. Verifica que todas las policies se crearon correctamente
-- 
-- IMPORTANTE: Este archivo habilita RLS y crea todas las policies necesarias.
-- También configura storage privado para comprobantes de pago.
-- ============================================================================

-- Helper Function: Verificar si usuario es admin
-- ============================================================================
-- Esta función verifica si el usuario autenticado tiene role 'admin' en profiles

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Habilitar RLS en todas las tablas
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_bookings ENABLE ROW LEVEL SECURITY;

-- Policies: profiles
-- ============================================================================

-- SELECT: Usuario puede ver su propio perfil, admin puede ver todos
CREATE POLICY "profiles_select_own"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin"
ON profiles
FOR SELECT
TO authenticated
USING (is_admin());

-- UPDATE: Usuario puede actualizar su propio perfil
CREATE POLICY "profiles_update_own"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policies: packages
-- ============================================================================

-- SELECT: Todos los usuarios autenticados pueden leer packages (para ver precios)
CREATE POLICY "packages_select_authenticated"
ON packages
FOR SELECT
TO authenticated
USING (true);

-- INSERT/UPDATE/DELETE: Solo admin puede modificar packages
CREATE POLICY "packages_insert_admin"
ON packages
FOR INSERT
TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "packages_update_admin"
ON packages
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "packages_delete_admin"
ON packages
FOR DELETE
TO authenticated
USING (is_admin());

-- Policies: payments
-- ============================================================================

-- SELECT: Student puede ver solo sus payments, admin puede ver todos
CREATE POLICY "payments_select_own"
ON payments
FOR SELECT
TO authenticated
USING (student_id = auth.uid());

CREATE POLICY "payments_select_admin"
ON payments
FOR SELECT
TO authenticated
USING (is_admin());

-- INSERT: Student puede crear payments solo para sí mismo
CREATE POLICY "payments_insert_own"
ON payments
FOR INSERT
TO authenticated
WITH CHECK (student_id = auth.uid());

-- UPDATE: Student NO puede aprobar (bloquear cambio de status), admin puede actualizar todo
-- Esta policy permite que student actualice proof_path pero NO status
-- Usamos un trigger para bloquear cambio de status por students
CREATE OR REPLACE FUNCTION check_status_not_changed()
RETURNS trigger AS $$
BEGIN
  -- Verificar si el usuario es student (no admin) y es el owner del payment
  IF OLD.student_id = auth.uid() AND NOT is_admin() THEN
    IF OLD.status != NEW.status THEN
      RAISE EXCEPTION 'Students cannot change payment status';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER prevent_student_status_change
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION check_status_not_changed();

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

-- Policy que permite a student actualizar su payment (pero el trigger bloquea cambio de status)
CREATE POLICY "payments_update_own"
ON payments
FOR UPDATE
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

-- Admin puede actualizar todo (incluyendo status para aprobar/rechazar)
CREATE POLICY "payments_update_admin"
ON payments
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Policies: credit_ledger
-- ============================================================================

-- SELECT: Student puede ver solo su ledger, admin puede ver todo
CREATE POLICY "credit_ledger_select_own"
ON credit_ledger
FOR SELECT
TO authenticated
USING (student_id = auth.uid());

CREATE POLICY "credit_ledger_select_admin"
ON credit_ledger
FOR SELECT
TO authenticated
USING (is_admin());

-- INSERT: Solo admin puede insertar en credit_ledger
CREATE POLICY "credit_ledger_insert_admin"
ON credit_ledger
FOR INSERT
TO authenticated
WITH CHECK (is_admin());

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

-- Storage: payment-proofs bucket
-- ============================================================================

-- Crear bucket privado para comprobantes de pago
-- Nota: Si el bucket ya existe, este comando fallará silenciosamente
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-proofs',
  'payment-proofs',
  false,  -- PRIVADO (no público)
  5242880,  -- 5MB límite
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies: payment-proofs
-- ============================================================================

-- SELECT: Solo admin puede leer (para generar signed URLs server-side)
-- Los students NO pueden leer directamente (solo admin vía signed URL)
CREATE POLICY "payment_proofs_select_admin"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs'
  AND EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  )
);

-- INSERT: Student puede subir comprobante solo a su payment
-- Path: payments/{auth.uid()}/{payment_id}.{ext}
-- Verifica: 1) path correcto con user_id, 2) payment existe, 3) student es owner
CREATE POLICY "payment_proofs_insert_own"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-proofs'
  AND name LIKE 'payments/' || auth.uid()::text || '/%'
  AND EXISTS (
    SELECT 1
    FROM public.payments
    WHERE id::text = split_part(split_part(name, '/', 3), '.', 1)
      AND student_id = auth.uid()
  )
);

-- DELETE: Solo admin puede borrar (para mantener auditoría completa)
-- Student NO puede borrar (si subió mal, contacta admin)
CREATE POLICY "payment_proofs_delete_admin"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'payment-proofs'
  AND EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  )
);

-- ============================================================================
-- NOTAS IMPORTANTES:
-- 
-- 1. La función is_admin() usa SECURITY DEFINER para poder leer profiles
-- 2. Student NO puede aprobar payments (trigger bloquea cambio de status)
-- 3. Storage bucket es PRIVADO - solo admin puede leer vía signed URL
-- 4. Student puede subir solo a payments/{auth.uid()}/{payment_id}.{ext} donde es el owner
-- 5. Student NO puede UPDATE ni DELETE archivos (solo admin puede DELETE)
-- 6. Para generar signed URLs como admin, usar server-side:
--    supabase.storage.from('payment-proofs').createSignedUrl(path, expiresIn)
-- 7. Path en frontend: `payments/${userId}/${paymentId}.${ext}`
-- 8. El campo proof_path en payments debe almacenar el path completo del storage
-- 9. SLICE 2: coach_slots y class_bookings tienen RLS habilitado
-- 10. Student solo puede cancelar bookings (trigger valida, tiempo en app)
-- 11. Coach puede marcar attended/no_show solo en bookings de sus slots (trigger valida)
-- 12. Validación de créditos > 0 para reservar se hace en app o RPC (no en RLS)
-- 13. Trigger check_booking_status_change() valida cambios de status en class_bookings
-- ============================================================================
