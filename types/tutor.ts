export type TutorSessionStatus = 'created' | 'in_progress' | 'completed';

export interface TutorSession {
  id: string;
  user_id: string;
  route_id: string | null;
  topic_id: string | null;
  subtopic_id: string | null;
  tutor_role: string;
  user_role: string;
  context: string;
  objective: string;
  status: TutorSessionStatus;
  anchor_recommendation: string | null;
  error_coding_enabled: boolean;
  error_type: 'concepto' | 'analisis' | 'atencion' | null;
  selected_error_ids: string[] | string; // Can be array or JSON string (JSONB)
  created_at: string;
  updated_at: string;
  // Relations (optional, loaded separately)
  route_title?: string | null;
  topic_name?: string | null;
  subtopic_name?: string | null;
}

export interface TutorMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface TutorSessionWithLastMessage extends TutorSession {
  last_message?: string;
  last_message_at?: string;
}

export interface CreateTutorSessionRequest {
  route_id?: string | null;
  topic_id?: string | null;
  subtopic_id?: string | null;
  tutor_role: string;
  user_role: string;
  context: string;
  objective: string;
  error_coding_enabled?: boolean;
  error_type?: 'concepto' | 'analisis' | 'atencion' | null;
  selected_error_ids?: string[]; // IDs of selected assessment_answers (max 5)
}

export interface TutorChatRequest {
  sessionId: string;
  message: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  isInitialMessage?: boolean;
  errorContext?: ErrorContext;
}

export interface ErrorContext {
  errorType: 'concepto' | 'analisis' | 'atencion';
  errors: Array<{
    question_id: string;
    question_text: string;
    user_answer: string;
    correct_answer: string;
    subtopic_id?: string;
    subtopic_name?: string;
  }>;
}

export interface TutorChatResponse {
  success: boolean;
  response?: string;
  shouldComplete?: boolean;
  anchorRecommendation?: string | null;
  error?: string;
}
