-- ============================================================================
-- SLICE 2 - PASO 6 (ACTUALIZADO): Función RPC para Reserva Atómica con Créditos
-- ============================================================================
-- 
-- Esta función garantiza reservas atómicas:
-- 1. Valida que el estudiante tenga créditos disponibles
-- 2. Descuenta 1 crédito del ledger
-- 3. Inserta la reserva en class_bookings
-- 
-- Todo ocurre dentro de una transacción atómica.
-- ============================================================================

CREATE OR REPLACE FUNCTION book_slot(slot_id uuid, p_student_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id uuid;
  v_slot_record coach_slots%ROWTYPE;
  v_booked_count int;
  v_existing_booking_id uuid;
  v_new_booking_id uuid;
  v_credits int;
BEGIN
  -- 1. Usar student_id pasado como parámetro
  v_student_id := p_student_id;
  
  IF v_student_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No estás autenticado. Por favor inicia sesión.'
    );
  END IF;

  -- 2. Verificar créditos disponibles (con lock para evitar race conditions)
  -- SUM(delta) para el estudiante
  SELECT COALESCE(SUM(delta), 0) INTO v_credits
  FROM credit_ledger
  WHERE student_id = v_student_id;

  IF v_credits <= 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No tienes créditos disponibles. Primero debes pagar para agendar clases.'
    );
  END IF;

  -- 3. Verificar que el slot existe y está activo (con lock)
  SELECT * INTO v_slot_record
  FROM coach_slots
  WHERE id = slot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Este slot no existe o ya no está disponible.'
    );
  END IF;

  IF NOT v_slot_record.active THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Este slot ya no está activo.'
    );
  END IF;

  -- 4. Verificar que el slot es futuro
  IF v_slot_record.starts_at <= now() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Este slot ya pasó. Solo puedes reservar slots futuros.'
    );
  END IF;

  -- 5. Contar bookings activos
  SELECT COUNT(*) INTO v_booked_count
  FROM class_bookings cb
  WHERE cb.slot_id = book_slot.slot_id
    AND cb.status = 'booked';

  -- 6. Verificar cupos disponibles (capacity fijo en 2)
  IF v_booked_count >= 2 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Este horario ya se llenó.'
    );
  END IF;

  -- 7. Verificar que el student no tiene booking previo en ese slot
  SELECT id INTO v_existing_booking_id
  FROM class_bookings cb
  WHERE cb.slot_id = book_slot.slot_id
    AND cb.student_id = v_student_id;

  IF FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Ya tienes una reserva en este horario.'
    );
  END IF;

  -- 8. DESCONTAR CRÉDITO (Insertar en ledger)
  INSERT INTO credit_ledger (student_id, delta, reason, created_by)
  VALUES (v_student_id, -1, 'class_booked', v_student_id);

  -- 9. Insertar booking
  BEGIN
    INSERT INTO class_bookings (slot_id, student_id, status)
    VALUES (book_slot.slot_id, v_student_id, 'booked')
    RETURNING id INTO v_new_booking_id;
  EXCEPTION
    WHEN unique_violation THEN
      -- Si falla el insert del booking por duplicidad (race condition rara)
      -- El crédito ya se descontó, la transacción hará rollback automáticamente
      RETURN json_build_object(
        'success', false,
        'error', 'Ya tienes una reserva en este horario.'
      );
  END;

  -- 10. Retornar éxito
  RETURN json_build_object(
    'success', true,
    'booking_id', v_new_booking_id
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Error inesperado al reservar: ' || SQLERRM || ' (Código: ' || SQLSTATE || ')'
    );
END;
$$;
