-- Remove status column from questions table
-- This migration removes the status column and its associated index

-- Drop the index first
DROP INDEX IF EXISTS idx_questions_status;

-- Drop the status column
ALTER TABLE questions DROP COLUMN IF EXISTS status;
