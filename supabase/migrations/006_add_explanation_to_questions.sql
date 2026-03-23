-- Migration to add explanation column to questions table
-- This column will store the justification for why the correct answer is correct

-- Add explanation column to questions if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'explanation'
  ) THEN
    ALTER TABLE questions ADD COLUMN explanation TEXT;
  END IF;
END $$;
