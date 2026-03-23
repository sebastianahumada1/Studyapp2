-- Create Assessment Sessions Table
CREATE TABLE IF NOT EXISTS assessment_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Session Configuration
  time_per_question INTEGER,
  time_per_question_enabled BOOLEAN DEFAULT true,
  questions_count INTEGER NOT NULL,
  metacognition_enabled BOOLEAN DEFAULT false,
  interleaving_enabled BOOLEAN DEFAULT false,
  feynman_enabled BOOLEAN DEFAULT false,
  
  -- Selected Items (stored as JSONB for flexibility)
  selected_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Session Status
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Assessment Answers Table
CREATE TABLE IF NOT EXISTS assessment_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Answer Data
  selected_answer_index INTEGER,
  is_correct BOOLEAN,
  time_spent_seconds INTEGER,
  
  -- Feynman Method
  feynman_reasoning TEXT,
  feynman_feedback TEXT, -- AI-generated feedback
  
  -- Order in session
  question_order INTEGER NOT NULL,
  
  -- Timestamps
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_assessment_sessions_user_id ON assessment_sessions(user_id);
CREATE INDEX idx_assessment_sessions_status ON assessment_sessions(status);
CREATE INDEX idx_assessment_answers_session_id ON assessment_answers(session_id);
CREATE INDEX idx_assessment_answers_question_id ON assessment_answers(question_id);
CREATE INDEX idx_assessment_answers_user_id ON assessment_answers(user_id);

-- Function to update updated_at timestamp
CREATE TRIGGER update_assessment_sessions_updated_at
  BEFORE UPDATE ON assessment_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers ENABLE ROW LEVEL SECURITY;

-- Policies for assessment_sessions
CREATE POLICY "Users can view their own assessment sessions"
  ON assessment_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessment sessions"
  ON assessment_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessment sessions"
  ON assessment_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assessment sessions"
  ON assessment_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for assessment_answers
CREATE POLICY "Users can view their own assessment answers"
  ON assessment_answers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessment answers"
  ON assessment_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessment answers"
  ON assessment_answers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assessment answers"
  ON assessment_answers FOR DELETE
  USING (auth.uid() = user_id);
