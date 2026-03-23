-- Create tutor_sessions table
CREATE TABLE tutor_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  route_id UUID REFERENCES study_routes(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES study_topics(id) ON DELETE SET NULL,
  subtopic_id UUID REFERENCES study_subtopics(id) ON DELETE SET NULL,
  tutor_role TEXT NOT NULL,
  user_role TEXT NOT NULL,
  context TEXT NOT NULL,
  objective TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'in_progress', 'completed')),
  anchor_recommendation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tutor_messages table
CREATE TABLE tutor_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES tutor_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tutor_sessions_user_id ON tutor_sessions(user_id);
CREATE INDEX idx_tutor_sessions_status ON tutor_sessions(status);
CREATE INDEX idx_tutor_sessions_updated_at ON tutor_sessions(updated_at DESC);
CREATE INDEX idx_tutor_messages_session_id ON tutor_messages(session_id);
CREATE INDEX idx_tutor_messages_created_at ON tutor_messages(created_at ASC);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_tutor_sessions_updated_at
  BEFORE UPDATE ON tutor_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE tutor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_messages ENABLE ROW LEVEL SECURITY;

-- Policies for tutor_sessions
CREATE POLICY "Users can view their own tutor sessions"
  ON tutor_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tutor sessions"
  ON tutor_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tutor sessions"
  ON tutor_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tutor sessions"
  ON tutor_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for tutor_messages
CREATE POLICY "Users can view messages from their sessions"
  ON tutor_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tutor_sessions
      WHERE tutor_sessions.id = tutor_messages.session_id
      AND tutor_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to their sessions"
  ON tutor_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tutor_sessions
      WHERE tutor_sessions.id = tutor_messages.session_id
      AND tutor_sessions.user_id = auth.uid()
    )
  );
