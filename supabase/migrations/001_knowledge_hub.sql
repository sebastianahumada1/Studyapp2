-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Study Routes Table
CREATE TABLE study_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('en_curso', 'completado', 'pendiente', 'en_pausa')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  cover_image_url TEXT,
  is_ai_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Topics Table (Nivel 1)
CREATE TABLE study_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID NOT NULL REFERENCES study_routes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  estimated_time_minutes INTEGER NOT NULL DEFAULT 0,
  difficulty TEXT NOT NULL DEFAULT 'medio' CHECK (difficulty IN ('facil', 'medio', 'dificil')),
  description TEXT,
  content TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Subtopics Table (Nivel 2)
CREATE TABLE study_subtopics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES study_topics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  estimated_time_minutes INTEGER NOT NULL DEFAULT 0,
  difficulty TEXT NOT NULL DEFAULT 'medio' CHECK (difficulty IN ('facil', 'medio', 'dificil')),
  description TEXT,
  content TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Subsubtopics Table (Nivel 3)
CREATE TABLE study_subsubtopics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subtopic_id UUID NOT NULL REFERENCES study_subtopics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  estimated_time_minutes INTEGER NOT NULL DEFAULT 0,
  difficulty TEXT NOT NULL DEFAULT 'medio' CHECK (difficulty IN ('facil', 'medio', 'dificil')),
  description TEXT,
  content TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_study_routes_user_id ON study_routes(user_id);
CREATE INDEX idx_study_routes_status ON study_routes(status);
CREATE INDEX idx_study_topics_route_id ON study_topics(route_id);
CREATE INDEX idx_study_subtopics_topic_id ON study_subtopics(topic_id);
CREATE INDEX idx_study_subsubtopics_subtopic_id ON study_subsubtopics(subtopic_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_study_routes_updated_at
  BEFORE UPDATE ON study_routes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE study_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_subsubtopics ENABLE ROW LEVEL SECURITY;

-- Policies for study_routes
CREATE POLICY "Users can view their own routes"
  ON study_routes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own routes"
  ON study_routes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routes"
  ON study_routes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routes"
  ON study_routes FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for study_topics
CREATE POLICY "Users can view topics of their routes"
  ON study_topics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM study_routes
      WHERE study_routes.id = study_topics.route_id
      AND study_routes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert topics to their routes"
  ON study_topics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM study_routes
      WHERE study_routes.id = study_topics.route_id
      AND study_routes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update topics of their routes"
  ON study_topics FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM study_routes
      WHERE study_routes.id = study_topics.route_id
      AND study_routes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete topics of their routes"
  ON study_topics FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM study_routes
      WHERE study_routes.id = study_topics.route_id
      AND study_routes.user_id = auth.uid()
    )
  );

-- Policies for study_subtopics
CREATE POLICY "Users can view subtopics of their routes"
  ON study_subtopics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM study_topics
      JOIN study_routes ON study_routes.id = study_topics.route_id
      WHERE study_topics.id = study_subtopics.topic_id
      AND study_routes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert subtopics to their routes"
  ON study_subtopics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM study_topics
      JOIN study_routes ON study_routes.id = study_topics.route_id
      WHERE study_topics.id = study_subtopics.topic_id
      AND study_routes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update subtopics of their routes"
  ON study_subtopics FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM study_topics
      JOIN study_routes ON study_routes.id = study_topics.route_id
      WHERE study_topics.id = study_subtopics.topic_id
      AND study_routes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete subtopics of their routes"
  ON study_subtopics FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM study_topics
      JOIN study_routes ON study_routes.id = study_topics.route_id
      WHERE study_topics.id = study_subtopics.topic_id
      AND study_routes.user_id = auth.uid()
    )
  );

-- Policies for study_subsubtopics
CREATE POLICY "Users can view subsubtopics of their routes"
  ON study_subsubtopics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM study_subtopics
      JOIN study_topics ON study_topics.id = study_subtopics.topic_id
      JOIN study_routes ON study_routes.id = study_topics.route_id
      WHERE study_subtopics.id = study_subsubtopics.subtopic_id
      AND study_routes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert subsubtopics to their routes"
  ON study_subsubtopics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM study_subtopics
      JOIN study_topics ON study_topics.id = study_subtopics.topic_id
      JOIN study_routes ON study_routes.id = study_topics.route_id
      WHERE study_subtopics.id = study_subsubtopics.subtopic_id
      AND study_routes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update subsubtopics of their routes"
  ON study_subsubtopics FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM study_subtopics
      JOIN study_topics ON study_topics.id = study_subtopics.topic_id
      JOIN study_routes ON study_routes.id = study_topics.route_id
      WHERE study_subtopics.id = study_subsubtopics.subtopic_id
      AND study_routes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete subsubtopics of their routes"
  ON study_subsubtopics FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM study_subtopics
      JOIN study_topics ON study_topics.id = study_subtopics.topic_id
      JOIN study_routes ON study_routes.id = study_topics.route_id
      WHERE study_subtopics.id = study_subsubtopics.subtopic_id
      AND study_routes.user_id = auth.uid()
    )
  );

