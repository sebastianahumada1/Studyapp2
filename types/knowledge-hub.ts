export type RouteStatus = 'en_curso' | 'completado' | 'pendiente' | 'en_pausa';
export type Difficulty = 'facil' | 'medio' | 'dificil';
export type StudyLevel = 'principiante' | 'intermedio' | 'avanzado' | 'experto';
export type PreferredFormat = 'lecturas' | 'videos' | 'cuestionarios' | 'practicas';

export interface StudyRoute {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  status: RouteStatus;
  progress: number;
  cover_image_url: string | null;
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudyTopic {
  id: string;
  route_id: string;
  name: string;
  estimated_time_minutes: number;
  difficulty: Difficulty;
  description: string | null;
  content: string | null;
  order_index: number;
  is_completed: boolean;
  created_at: string;
}

export interface StudySubtopic {
  id: string;
  topic_id: string;
  name: string;
  estimated_time_minutes: number;
  difficulty: Difficulty;
  description: string | null;
  content: string | null;
  order_index: number;
  is_completed: boolean;
  created_at: string;
}

export interface StudySubsubtopic {
  id: string;
  subtopic_id: string;
  name: string;
  estimated_time_minutes: number;
  difficulty: Difficulty;
  description: string | null;
  content: string | null;
  order_index: number;
  is_completed: boolean;
  created_at: string;
}

export interface TopicWithChildren extends StudyTopic {
  subtopics: SubtopicWithChildren[];
}

export interface SubtopicWithChildren extends StudySubtopic {
  subsubtopics: StudySubsubtopic[];
}

export interface RouteWithTree extends StudyRoute {
  topics: TopicWithChildren[];
}

export interface RouteWithProgress extends StudyRoute {
  total_items: number;
  completed_items: number;
  calculated_progress: number;
}

export interface RouteFormData {
  title: string;
  description?: string;
  category?: string;
  status?: RouteStatus;
  cover_image_url?: string;
}

export interface TopicFormData {
  name: string;
  estimated_time_minutes: number;
  difficulty: Difficulty;
  description?: string;
  content?: string;
  order_index?: number;
}

export interface SubtopicFormData {
  name: string;
  estimated_time_minutes: number;
  difficulty: Difficulty;
  description?: string;
  content?: string;
  order_index?: number;
}

export interface SubsubtopicFormData {
  name: string;
  estimated_time_minutes: number;
  difficulty: Difficulty;
  description?: string;
  content?: string;
  order_index?: number;
}

export interface AIGenerateRequest {
  objective: string;
  topics: string[];
  level: StudyLevel;
  weeklyHours: number;
  preferredFormats?: PreferredFormat[];
}

export interface AIGeneratedRoute {
  title: string;
  description: string;
  category: string;
  topics: AIGeneratedTopic[];
}

export interface AIGeneratedTopic {
  name: string;
  content?: string;
  estimated_time_minutes: number;
  difficulty: Difficulty;
  subtopics: AIGeneratedSubtopic[];
}

export interface AIGeneratedSubtopic {
  name: string;
  content?: string;
  estimated_time_minutes: number;
  difficulty: Difficulty;
  subsubtopics: AIGeneratedSubsubtopic[];
}

export interface AIGeneratedSubsubtopic {
  name: string;
  content?: string;
  estimated_time_minutes: number;
  difficulty: Difficulty;
}

