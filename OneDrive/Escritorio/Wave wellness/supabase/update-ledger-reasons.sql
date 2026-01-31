-- ============================================================================
-- Wave Wellness - Actualización de Enum ledger_reason
-- ============================================================================
-- 
-- Ejecuta este script en el SQL Editor de Supabase para añadir los nuevos
-- motivos de movimientos de créditos necesarios para el flujo de reservas.
-- ============================================================================

ALTER TYPE ledger_reason ADD VALUE IF NOT EXISTS 'class_booked';
ALTER TYPE ledger_reason ADD VALUE IF NOT EXISTS 'class_cancelled';
