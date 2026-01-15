import type { SelectedItem } from '@/components/assessment/QuestionBankSidebar';
import type { QuestionWithHierarchy } from '@/types/questions';

export interface AssessmentSession {
  id: string;
  user_id: string;
  time_per_question: number | null;
  time_per_question_enabled: boolean;
  questions_count: number;
  metacognition_enabled: boolean;
  interleaving_enabled: boolean;
  feynman_enabled: boolean;
  selected_items: SelectedItem[];
  status: 'in_progress' | 'completed' | 'abandoned';
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssessmentAnswer {
  id: string;
  session_id: string;
  question_id: string;
  user_id: string;
  selected_answer_index: number | null;
  is_correct: boolean | null;
  time_spent_seconds: number | null;
  feynman_reasoning: string | null;
  feynman_feedback: string | null;
  question_order: number;
  answered_at: string;
  created_at: string;
}

export interface AssessmentAnswerWithQuestion extends AssessmentAnswer {
  question: QuestionWithHierarchy;
}

export interface CreateSessionRequest {
  time_per_question: number | null;
  time_per_question_enabled: boolean;
  questions_count: number;
  metacognition_enabled: boolean;
  interleaving_enabled: boolean;
  feynman_enabled: boolean;
  selected_items: SelectedItem[];
}

export interface SubmitAnswerRequest {
  session_id: string;
  question_id: string;
  selected_answer_index: number;
  time_spent_seconds: number;
  feynman_reasoning?: string | null;
}

export interface GenerateSessionQuestionsRequest {
  selected_items: SelectedItem[];
  questions_count: number;
  interleaving_enabled: boolean;
}
