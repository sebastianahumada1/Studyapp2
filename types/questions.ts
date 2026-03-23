export type QuestionDifficulty = 'baja' | 'media' | 'alta';
export type QuestionOrigin = 'ai' | 'manual' | 'csv';

export interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  user_id: string;
  question_text: string;
  options: QuestionOption[];
  correct_answer_index: number;
  difficulty: QuestionDifficulty;
  origin: QuestionOrigin;
  explanation: string | null;
  route_id: string | null;
  topic_id: string | null;
  subtopic_id: string | null;
  subsubtopic_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuestionWithHierarchy extends Question {
  route?: {
    id: string;
    title: string;
  };
  topic?: {
    id: string;
    name: string;
  };
  subtopic?: {
    id: string;
    name: string;
  };
  subsubtopic?: {
    id: string;
    name: string;
  };
}

export interface QuestionFormData {
  question_text: string;
  options: QuestionOption[];
  correct_answer_index: number;
  difficulty: QuestionDifficulty;
  origin: QuestionOrigin;
  explanation?: string | null;
  route_id?: string | null;
  topic_id?: string | null;
  subtopic_id?: string | null;
  subsubtopic_id?: string | null;
}
