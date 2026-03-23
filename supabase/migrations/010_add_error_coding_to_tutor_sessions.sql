-- Add error coding fields to tutor_sessions
ALTER TABLE tutor_sessions
ADD COLUMN IF NOT EXISTS error_coding_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS error_type TEXT CHECK (error_type IN ('concepto', 'analisis', 'atencion'));
