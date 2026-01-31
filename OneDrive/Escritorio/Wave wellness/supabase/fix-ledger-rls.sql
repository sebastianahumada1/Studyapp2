-- ============================================================================
-- Wave Wellness - Actualización de RLS para Devolución de Créditos
-- ============================================================================
-- 
-- Este script permite que los estudiantes inserten registros en el ledger
-- ÚNICAMENTE cuando cancelan una clase (reason = 'class_cancelled').
-- ============================================================================

-- 1. Eliminar la policy restrictiva anterior (si existe)
DROP POLICY IF EXISTS "credit_ledger_insert_admin" ON credit_ledger;

-- 2. Crear nueva policy que permite a Admin insertar todo, 
-- y a Students insertar SOLO devoluciones por cancelación propia.
CREATE POLICY "credit_ledger_insert_policy"
ON credit_ledger
FOR INSERT
TO authenticated
WITH CHECK (
  -- Caso A: Es Admin (puede insertar cualquier movimiento)
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  OR 
  -- Caso B: Es Student cancelando su propia clase
  (
    student_id = auth.uid() -- El crédito es para sí mismo
    AND delta = 1 -- Solo puede sumarse 1 crédito
    AND reason = 'class_cancelled' -- El motivo debe ser cancelación
  )
);

-- NOTA: La seguridad adicional de las 24 horas se valida en el Server Action
-- antes de intentar este INSERT.
