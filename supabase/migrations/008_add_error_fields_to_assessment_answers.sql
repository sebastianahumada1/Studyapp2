-- Add error_type and conclusion fields to assessment_answers table

-- Add error_type column
ALTER TABLE assessment_answers
ADD COLUMN IF NOT EXISTS error_type TEXT CHECK (error_type IN ('concepto', 'analisis', 'atencion'));

-- Add conclusion column (user's explanation of why they think they made the error)
ALTER TABLE assessment_answers
ADD COLUMN IF NOT EXISTS conclusion TEXT;

-- Add index for error_type for better query performance
CREATE INDEX IF NOT EXISTS idx_assessment_answers_error_type ON assessment_answers(error_type);

-- Add comment to explain the fields
COMMENT ON COLUMN assessment_answers.error_type IS 'Tipo de error: concepto (error conceptual), analisis (error de análisis), atencion (error por falta de atención)';
COMMENT ON COLUMN assessment_answers.conclusion IS 'Conclusión escrita por el usuario explicando por qué cree que se equivocó';
