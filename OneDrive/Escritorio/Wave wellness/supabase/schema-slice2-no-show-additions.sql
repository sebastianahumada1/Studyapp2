-- ============================================================================
-- SLICE 2 - HARDENING: Agregar 'class_no_show' al enum ledger_reason
-- ============================================================================
-- 
-- Este script agrega el valor 'class_no_show' al enum ledger_reason
-- para permitir registrar descuentos de créditos cuando un estudiante
-- no asiste a una clase (no-show).
-- 
-- CÓMO APLICAR:
-- 1. Abre Supabase Dashboard → SQL Editor
-- 2. Copia y pega este script
-- 3. Ejecuta (Run o Ctrl+Enter)
-- 
-- NOTA: PostgreSQL no permite eliminar valores de enums, así que solo agregamos.
-- Si el valor ya existe, el script no fallará.
-- ============================================================================

-- Agregar 'class_no_show' al enum ledger_reason
-- Verificar si el valor ya existe antes de agregarlo
DO $$
BEGIN
  -- Verificar si el valor ya existe
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_enum 
    WHERE enumlabel = 'class_no_show' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ledger_reason')
  ) THEN
    -- Agregar el valor solo si no existe
    ALTER TYPE ledger_reason ADD VALUE 'class_no_show';
    RAISE NOTICE 'Valor ''class_no_show'' agregado al enum ledger_reason.';
  ELSE
    RAISE NOTICE 'El valor ''class_no_show'' ya existe en el enum ledger_reason.';
  END IF;
END $$;

-- ============================================================================
-- Verificación (opcional, ejecutar después para confirmar):
-- 
-- SELECT unnest(enum_range(NULL::ledger_reason));
-- 
-- Debería mostrar:
-- - payment_approved
-- - manual_adjustment
-- - class_attended
-- - class_no_show
-- ============================================================================
