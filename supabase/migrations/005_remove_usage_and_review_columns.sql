-- Remove usage_count, last_reviewed_at, and reviewed_by columns from questions table
-- This migration removes columns related to usage tracking and review information

-- Drop the columns
ALTER TABLE questions 
  DROP COLUMN IF EXISTS usage_count,
  DROP COLUMN IF EXISTS last_reviewed_at,
  DROP COLUMN IF EXISTS reviewed_by;
