-- Create Questions Table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL CHECK (jsonb_array_length(options) >= 2 AND jsonb_array_length(options) <= 4),
  correct_answer_index INTEGER NOT NULL CHECK (correct_answer_index >= 0 AND correct_answer_index < 4),
  difficulty TEXT NOT NULL DEFAULT 'media' CHECK (difficulty IN ('baja', 'media', 'alta')),
  origin TEXT NOT NULL DEFAULT 'manual' CHECK (origin IN ('ai', 'manual', 'csv')),
  status TEXT NOT NULL DEFAULT 'review' CHECK (status IN ('validated', 'review', 'observed')),
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT,
  
  -- Hierarchical associations (all optional, but at least one should be set)
  route_id UUID REFERENCES study_routes(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES study_topics(id) ON DELETE CASCADE,
  subtopic_id UUID REFERENCES study_subtopics(id) ON DELETE CASCADE,
  subsubtopic_id UUID REFERENCES study_subsubtopics(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_questions_user_id ON questions(user_id);
CREATE INDEX idx_questions_route_id ON questions(route_id);
CREATE INDEX idx_questions_topic_id ON questions(topic_id);
CREATE INDEX idx_questions_subtopic_id ON questions(subtopic_id);
CREATE INDEX idx_questions_subsubtopic_id ON questions(subsubtopic_id);
CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_origin ON questions(origin);

-- Function to update updated_at timestamp
CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Policies for questions
CREATE POLICY "Users can view their own questions"
  ON questions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own questions"
  ON questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questions"
  ON questions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own questions"
  ON questions FOR DELETE
  USING (auth.uid() = user_id);

-- Constraint: At least one hierarchical association must be set
ALTER TABLE questions ADD CONSTRAINT check_hierarchical_association
  CHECK (
    route_id IS NOT NULL OR
    topic_id IS NOT NULL OR
    subtopic_id IS NOT NULL OR
    subsubtopic_id IS NOT NULL
  );
