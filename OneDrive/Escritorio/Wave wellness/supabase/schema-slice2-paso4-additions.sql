-- ============================================================================
-- SLICE 2 - PASO 4: Agregar 'class_attended' al enum ledger_reason
-- ============================================================================
-- 
-- Este script agrega el valor 'class_attended' al enum ledger_reason
-- para permitir registrar descuentos de créditos cuando un estudiante
-- asiste a una clase.
-- 
-- CÓMO APLICAR:
-- 1. Abre Supabase Dashboard → SQL Editor
-- 2. Copia y pega este script
-- 3. Ejecuta (Run o Ctrl+Enter)
-- 
-- NOTA: PostgreSQL no permite eliminar valores de enums, así que solo agregamos.
-- ============================================================================

-- Agregar 'class_attended' al enum ledger_reason
ALTER TYPE ledger_reason ADD VALUE IF NOT EXISTS 'class_attended';

-- ============================================================================
-- Verificación (opcional, ejecutar después para confirmar):
-- 
-- SELECT unnest(enum_range(NULL::ledger_reason));
-- 
-- Debería mostrar:
-- - payment_approved
-- - manual_adjustment
-- - class_attended
-- ============================================================================
