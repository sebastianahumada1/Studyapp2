'use server';

import { createClient } from '@/lib/supabase/server';

interface ErrorData {
  id: string;
  question_id: string;
  question_text: string;
  question_options: Array<{ text: string }>;
  selected_answer_index: number;
  correct_answer_index: number;
  route_title: string | null;
  topic_name: string | null;
  subtopic_name: string | null;
  subsubtopic_name: string | null;
  error_conclusion: string;
  error_type: 'concepto' | 'analisis' | 'atencion' | null;
  conclusion: string | null;
  answered_at: string;
  time_spent_seconds: number | null;
  feynman_reasoning: string | null;
  feynman_feedback: string | null;
}

interface ErrorFilters {
  startDate?: string;
  endDate?: string;
  route?: string;
  topic?: string;
  errorType?: string;
}

export async function getErrors(
  filters: ErrorFilters = {}
): Promise<{ success: true; data: ErrorData[] } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  // Get ONLY incorrect answers (is_correct = FALSE) with question and hierarchy information
  // This ensures we only show errors, not correct answers
  let query = supabase
    .from('assessment_answers')
    .select(`
      id,
      question_id,
      selected_answer_index,
      time_spent_seconds,
      error_type,
      conclusion,
      answered_at,
      feynman_reasoning,
      feynman_feedback,
      question:questions(
        id,
        question_text,
        options,
        correct_answer_index,
        difficulty,
        route_id,
        topic_id,
        subtopic_id,
        subsubtopic_id,
        route:study_routes(id, title),
        topic:study_topics(id, name),
        subtopic:study_subtopics(id, name),
        subsubtopic:study_subsubtopics(id, name)
      )
    `)
    .eq('user_id', user.id)
    .eq('is_correct', false) // Only get incorrect answers
    .order('answered_at', { ascending: false })
    .limit(500);

  // Apply date range filters
  if (filters.startDate) {
    const startDate = new Date(filters.startDate);
    startDate.setHours(0, 0, 0, 0);
    query = query.gte('answered_at', startDate.toISOString());
  }
  
  if (filters.endDate) {
    const endDate = new Date(filters.endDate);
    endDate.setHours(23, 59, 59, 999);
    query = query.lte('answered_at', endDate.toISOString());
  }

  // Apply error_type filter
  if (filters.errorType) {
    if (filters.errorType === 'null') {
      query = query.is('error_type', null);
    } else {
      query = query.eq('error_type', filters.errorType);
    }
  }

  // Note: Filters for route, topic, subtopic, and subsubtopic need to be applied after fetching
  // because Supabase doesn't support nested filtering on joined tables easily

  const { data, error } = await query;

  if (error) {
    return { success: false, error: error.message };
  }

  // Transform data to match ErrorData interface and apply filters
  let filteredData = data || [];
  
  // Apply route filter
  if (filters.route) {
    filteredData = filteredData.filter((answer: any) => {
      const question = answer.question;
      if (!question) return false;
      const route = Array.isArray(question.route) ? question.route[0] : question.route;
      return route?.id === filters.route || question.route_id === filters.route;
    });
  }
  
  // Apply topic filter
  if (filters.topic) {
    filteredData = filteredData.filter((answer: any) => {
      const question = answer.question;
      if (!question) return false;
      const topic = Array.isArray(question.topic) ? question.topic[0] : question.topic;
      return topic?.id === filters.topic || question.topic_id === filters.topic;
    });
  }

  const errors: ErrorData[] = filteredData.map((answer: any) => {
    const question = answer.question;
    if (!question) {
      // Skip if question is missing
      return null;
    }
    
    const route = Array.isArray(question.route) ? question.route[0] : question.route;
    const topic = Array.isArray(question.topic) ? question.topic[0] : question.topic;
    const subtopic = Array.isArray(question.subtopic) ? question.subtopic[0] : question.subtopic;
    const subsubtopic = Array.isArray(question.subsubtopic)
      ? question.subsubtopic[0]
      : question.subsubtopic;

    // Use conclusion from database if available, otherwise generate from Feynman feedback
    let errorConclusion = answer.conclusion || 'Error en la respuesta. Revisar concepto.';
    
    // If no conclusion in database, try to generate from Feynman feedback
    if (!answer.conclusion && answer.feynman_feedback) {
      try {
        const feedback = typeof answer.feynman_feedback === 'string'
          ? JSON.parse(answer.feynman_feedback)
          : answer.feynman_feedback;
        if (feedback?.resumen) {
          errorConclusion = feedback.resumen.substring(0, 150);
        } else if (feedback?.tecnica2) {
          // Use técnica 2 (Reverse Engineering) as conclusion if resumen not available
          errorConclusion = feedback.tecnica2.substring(0, 150);
        } else if (feedback?.tecnica1) {
          // Fallback to técnica 1
          errorConclusion = feedback.tecnica1.substring(0, 150);
        }
      } catch {
        // Use default if parsing fails
      }
    }

    // Use the error_type from database if available, otherwise infer from feedback
    let errorType: 'concepto' | 'analisis' | 'atencion' | null = answer.error_type || null;
    
    // If no error_type in database, try to infer from Feynman feedback content
    if (!errorType && answer.feynman_feedback) {
      try {
        const feedback = typeof answer.feynman_feedback === 'string'
          ? JSON.parse(answer.feynman_feedback)
          : answer.feynman_feedback;
        const feedbackText = JSON.stringify(feedback).toLowerCase();
        
        if (feedbackText.includes('concepto') || feedbackText.includes('principio') || feedbackText.includes('fundamento')) {
          errorType = 'concepto';
        } else if (feedbackText.includes('análisis') || feedbackText.includes('analisis') || feedbackText.includes('razonamiento')) {
          errorType = 'analisis';
        } else if (feedbackText.includes('atención') || feedbackText.includes('atencion') || feedbackText.includes('descuido')) {
          errorType = 'atencion';
        }
      } catch {
        // Keep null if parsing fails
      }
    }

    // Parse options
    let options: Array<{ text: string }> = [];
    if (question.options) {
      try {
        const parsedOptions = typeof question.options === 'string' 
          ? JSON.parse(question.options) 
          : question.options;
        if (Array.isArray(parsedOptions)) {
          options = parsedOptions;
        }
      } catch {
        // Keep empty array if parsing fails
      }
    }

    return {
      id: answer.id,
      question_id: question.id,
      question_text: question.question_text,
      question_options: options,
      selected_answer_index: answer.selected_answer_index ?? -1,
      correct_answer_index: question.correct_answer_index ?? -1,
      route_title: route?.title || null,
      topic_name: topic?.name || null,
      subtopic_name: subtopic?.name || null,
      subsubtopic_name: subsubtopic?.name || null,
      error_conclusion: errorConclusion,
      error_type: errorType,
      conclusion: answer.conclusion || null,
      answered_at: answer.answered_at,
      time_spent_seconds: answer.time_spent_seconds,
      feynman_reasoning: answer.feynman_reasoning,
      feynman_feedback: answer.feynman_feedback,
    };
  }).filter((error): error is ErrorData => error !== null);

  return { success: true, data: errors };
}

// Update error type and conclusion
export async function updateErrorDetails(
  answerId: string,
  errorType: 'concepto' | 'analisis' | 'atencion' | null,
  conclusion: string | null
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  // Verify the answer belongs to the user
  const { data: answer, error: checkError } = await supabase
    .from('assessment_answers')
    .select('id, user_id')
    .eq('id', answerId)
    .eq('user_id', user.id)
    .single();

  if (checkError || !answer) {
    return { success: false, error: 'Respuesta no encontrada o no autorizada' };
  }

  // Update the error type and conclusion
  const { error: updateError } = await supabase
    .from('assessment_answers')
    .update({
      error_type: errorType,
      conclusion: conclusion || null,
    })
    .eq('id', answerId)
    .eq('user_id', user.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  return { success: true };
}
