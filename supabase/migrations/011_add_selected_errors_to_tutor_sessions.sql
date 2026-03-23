-- Add selected_error_ids column to tutor_sessions
ALTER TABLE tutor_sessions
ADD COLUMN IF NOT EXISTS selected_error_ids JSONB DEFAULT '[]'::jsonb;
