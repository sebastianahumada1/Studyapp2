-- Migration to add content field if it doesn't exist
-- This migration is safe to run even if the tables already exist

-- Add content column to study_topics if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'study_topics' AND column_name = 'content'
  ) THEN
    ALTER TABLE study_topics ADD COLUMN content TEXT;
  END IF;
END $$;

-- Add content column to study_subtopics if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'study_subtopics' AND column_name = 'content'
  ) THEN
    ALTER TABLE study_subtopics ADD COLUMN content TEXT;
  END IF;
END $$;

-- Add content column to study_subsubtopics if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'study_subsubtopics' AND column_name = 'content'
  ) THEN
    ALTER TABLE study_subsubtopics ADD COLUMN content TEXT;
  END IF;
END $$;

