'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
  CreateSessionRequest,
  SubmitAnswerRequest,
  AssessmentSession,
  AssessmentAnswer,
  AssessmentAnswerWithQuestion,
  GenerateSessionQuestionsRequest,
} from '@/types/assessment';
import type { QuestionWithHierarchy, QuestionOption } from '@/types/questions';

interface AssessmentResults {
  session: AssessmentSession;
  answers: AssessmentAnswerWithQuestion[];
  stats: { total: number; correct: number; precision: number };
}

// Create Assessment Session
export async function createAssessmentSession(
  request: CreateSessionRequest
): Promise<{ success: true; data: AssessmentSession } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  if (!request.selected_items || request.selected_items.length === 0) {
    return { success: false, error: 'Debe seleccionar al menos un elemento para evaluar' };
  }

  if (request.questions_count < 1) {
    return { success: false, error: 'Debe tener al menos 1 pregunta' };
  }

  const { data, error } = await supabase
    .from('assessment_sessions')
    .insert({
      user_id: user.id,
      time_per_question: request.time_per_question,
      time_per_question_enabled: request.time_per_question_enabled,
      questions_count: request.questions_count,
      metacognition_enabled: request.metacognition_enabled,
      interleaving_enabled: request.interleaving_enabled,
      feynman_enabled: request.feynman_enabled,
      selected_items: request.selected_items,
      status: 'in_progress',
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || 'Error al crear sesión de evaluación' };
  }

  return { success: true, data: data as AssessmentSession };
}

// Generate Questions for Session
export async function generateSessionQuestions(
  request: GenerateSessionQuestionsRequest
): Promise<{ success: true; data: QuestionWithHierarchy[] } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  // Build query based on selected items
  let query = supabase
    .from('questions')
    .select(`
      *,
      route:study_routes(id, title),
      topic:study_topics(id, name),
      subtopic:study_subtopics(id, name),
      subsubtopic:study_subsubtopics(id, name)
    `)
    .eq('user_id', user.id);

  // Apply filters based on selected items
  const routeIds: string[] = [];
  const topicIds: string[] = [];
  const subtopicIds: string[] = [];
  const subsubtopicIds: string[] = [];

  request.selected_items.forEach((item) => {
    switch (item.type) {
      case 'route':
        routeIds.push(item.id);
        break;
      case 'topic':
        topicIds.push(item.id);
        break;
      case 'subtopic':
        subtopicIds.push(item.id);
        break;
      case 'subsubtopic':
        subsubtopicIds.push(item.id);
        break;
    }
  });

  // Build OR conditions for Supabase
  const orConditions: string[] = [];
  if (routeIds.length > 0) {
    orConditions.push(`route_id.in.(${routeIds.join(',')})`);
  }
  if (topicIds.length > 0) {
    orConditions.push(`topic_id.in.(${topicIds.join(',')})`);
  }
  if (subtopicIds.length > 0) {
    orConditions.push(`subtopic_id.in.(${subtopicIds.join(',')})`);
  }
  if (subsubtopicIds.length > 0) {
    orConditions.push(`subsubtopic_id.in.(${subsubtopicIds.join(',')})`);
  }

  if (orConditions.length === 0) {
    return { success: false, error: 'No se encontraron preguntas para los elementos seleccionados' };
  }

  // Apply OR filter - Supabase uses comma-separated conditions
  query = query.or(orConditions.join(','));

  const { data: questions, error } = await query;

  if (error) {
    return { success: false, error: error.message || 'Error al obtener preguntas' };
  }

  if (!questions || questions.length === 0) {
    return { success: false, error: 'No se encontraron preguntas para los elementos seleccionados' };
  }

  // Parse options for each question
  const parsedQuestions: QuestionWithHierarchy[] = questions.map((q) => {
    const rawOptions = q.options as QuestionOption[] | string | null;
    let options: QuestionOption[] = [];
    if (typeof rawOptions === 'string') {
      try {
        options = JSON.parse(rawOptions);
      } catch {
        options = [];
      }
    } else if (Array.isArray(rawOptions)) {
      options = rawOptions;
    }

    const raw = q as typeof q & {
      route: { id: string; title: string } | null;
      topic: { id: string; name: string } | null;
      subtopic: { id: string; name: string } | null;
      subsubtopic: { id: string; name: string } | null;
    };

    return {
      ...q,
      options,
      route: raw.route ? { id: raw.route.id, title: raw.route.title } : undefined,
      topic: raw.topic ? { id: raw.topic.id, name: raw.topic.name } : undefined,
      subtopic: raw.subtopic ? { id: raw.subtopic.id, name: raw.subtopic.name } : undefined,
      subsubtopic: raw.subsubtopic ? { id: raw.subsubtopic.id, name: raw.subsubtopic.name } : undefined,
    } as QuestionWithHierarchy;
  });

  // Apply interleaving if enabled (shuffle questions using Fisher-Yates)
  let finalQuestions = parsedQuestions;
  if (request.interleaving_enabled) {
    finalQuestions = [...parsedQuestions];
    for (let i = finalQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [finalQuestions[i], finalQuestions[j]] = [finalQuestions[j], finalQuestions[i]];
    }
  }

  // Limit to requested count
  finalQuestions = finalQuestions.slice(0, request.questions_count);

  return { success: true, data: finalQuestions };
}

// Submit Answer
export async function submitAnswer(
  request: SubmitAnswerRequest
): Promise<{ success: true; data: AssessmentAnswer } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  // Get question to check correct answer
  const { data: question, error: questionError } = await supabase
    .from('questions')
    .select('correct_answer_index')
    .eq('id', request.question_id)
    .single();

  if (questionError || !question) {
    return { success: false, error: 'Pregunta no encontrada' };
  }

  const isCorrect = request.selected_answer_index === question.correct_answer_index;

  // Get current answer count for order
  const { count } = await supabase
    .from('assessment_answers')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', request.session_id);

  const questionOrder = (count || 0) + 1;

  const { data, error } = await supabase
    .from('assessment_answers')
    .insert({
      session_id: request.session_id,
      question_id: request.question_id,
      user_id: user.id,
      selected_answer_index: request.selected_answer_index,
      is_correct: isCorrect,
      time_spent_seconds: request.time_spent_seconds,
      feynman_reasoning: request.feynman_reasoning || null,
      question_order: questionOrder,
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || 'Error al guardar respuesta' };
  }

  return { success: true, data: data as AssessmentAnswer };
}

// Generate Feynman Feedback for Session
export async function generateFeynmanFeedback(
  sessionId: string
): Promise<{ success: true; data: { answers: Array<{ answer_id: string; feedback: string }> } } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  if (!process.env.OPENAI_API_KEY) {
    return { success: false, error: 'OpenAI API key no configurada' };
  }

  // Get session with answers and questions
  const { data: session, error: sessionError } = await supabase
    .from('assessment_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (sessionError || !session) {
    return { success: false, error: 'Sesión no encontrada' };
  }

  if (!session.feynman_enabled) {
    return { success: false, error: 'El método Feynman no está habilitado para esta sesión' };
  }

  // Get all answers with questions and feynman reasoning
  const { data: answers, error: answersError } = await supabase
    .from('assessment_answers')
    .select(`
      *,
      question:questions(*)
    `)
    .eq('session_id', sessionId)
    .order('question_order', { ascending: true });

  if (answersError || !answers) {
    return { success: false, error: 'Error al obtener respuestas' };
  }

  // Generate feedback for each answer that has feynman reasoning
  const feedbackResults: Array<{ answer_id: string; feedback: string }> = [];

  for (const answer of answers) {
    if (!answer.feynman_reasoning || answer.feynman_reasoning.trim() === '') {
      continue;
    }

    const question = answer.question as {
      question_text: string;
      options: Array<{ text: string }> | string;
      correct_answer_index: number;
    };
    let options = question.options;
    if (typeof options === 'string') {
      try {
        options = JSON.parse(options);
      } catch {
        options = [];
      }
    }
    if (!Array.isArray(options)) {
      options = [];
    }

    const correctAnswer = options[question.correct_answer_index]?.text || '';
    const selectedAnswer = options[answer.selected_answer_index]?.text || '';

    const systemPrompt = `Eres un experto tutor de medicina que utiliza técnicas avanzadas de estudio para evaluar el razonamiento de estudiantes.

Tu tarea es evaluar el razonamiento de un estudiante usando DOS técnicas específicas y proporcionar feedback estructurado.

IMPORTANTE: Debes responder SOLO con un JSON válido en este formato exacto:
{
  "tecnica1": "Texto del análisis usando la Técnica 1: El Descarte de Primeros Principios. Analiza si el estudiante consideró primero qué opciones son seguras y cuáles podrían ser peligrosas, si el razonamiento sigue un proceso lógico desde principios fundamentales, y si descartó opciones incorrectas basándose en principios básicos. (3-5 oraciones)",
  "tecnica2": "Texto del análisis usando la Técnica 2: Reverse Engineering del Error. Parte del fallo o la discrepancia, desarma la pregunta para encontrar la 'trampa', analiza qué información clave podría haber sido pasada por alto, e identifica el punto específico donde el razonamiento se desvió. (3-5 oraciones)",
  "resumen": "Resumen y recomendaciones finales. Concluye sobre la calidad del razonamiento y proporciona recomendaciones específicas para mejorar. (3-5 oraciones)"
}

REGLAS:
- Si la respuesta es CORRECTA: Usa la Técnica 1 para validar que el razonamiento siguió principios sólidos. En Técnica 2, explica qué hizo bien el estudiante.
- Si la respuesta es INCORRECTA: Usa ambas técnicas para identificar dónde falló el razonamiento.
- Sé específico y educativo en tu feedback
- Usa terminología médica apropiada
- Responde SOLO con JSON válido, sin markdown, sin explicaciones adicionales`;

    const userPrompt = `Pregunta: ${question.question_text}

Opciones:
${options.map((opt: any, idx: number) => `${String.fromCharCode(65 + idx)}. ${opt.text}${idx === question.correct_answer_index ? ' (CORRECTA)' : ''}`).join('\n')}

Respuesta seleccionada por el estudiante: ${selectedAnswer}
Respuesta correcta: ${correctAnswer}
¿Es correcta?: ${answer.is_correct ? 'Sí' : 'No'}

Razonamiento del estudiante (Método Feynman):
${answer.feynman_reasoning}

Evalúa el razonamiento del estudiante usando las técnicas especificadas y proporciona feedback educativo.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('OpenAI error:', error);
        continue;
      }

      const data = await response.json();
      const feedbackContent = data.choices[0]?.message?.content || 'No se pudo generar feedback';

      // Try to parse as JSON, if it fails, use as plain text
      let feedback: any;
      try {
        feedback = JSON.parse(feedbackContent);
      } catch {
        // If not JSON, create a structured object from plain text
        feedback = {
          tecnica1: feedbackContent,
          tecnica2: '',
          resumen: '',
        };
      }

      // Store as JSON string in database
      const feedbackJson = JSON.stringify(feedback);

      // Update answer with feedback
      await supabase
        .from('assessment_answers')
        .update({ feynman_feedback: feedbackJson })
        .eq('id', answer.id);

      feedbackResults.push({
        answer_id: answer.id,
        feedback: feedbackJson,
      });
    } catch (error) {
      console.error('Error generating feedback:', error);
      continue;
    }
  }

  // Mark session as completed
  await supabase
    .from('assessment_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', sessionId);

  revalidatePath('/assessment');
  return { success: true, data: { answers: feedbackResults } };
}

// Get Session
export async function getAssessmentSession(
  sessionId: string
): Promise<{ success: true; data: AssessmentSession } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const { data, error } = await supabase
    .from('assessment_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || 'Sesión no encontrada' };
  }

  return { success: true, data: data as AssessmentSession };
}

// Update Session Status
export async function updateAssessmentSessionStatus(
  sessionId: string,
  status: 'in_progress' | 'completed' | 'abandoned'
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const updateData: { status: typeof status; completed_at?: string } = {
    status,
  };

  if (status === 'completed' || status === 'abandoned') {
    updateData.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('assessment_sessions')
    .update(updateData)
    .eq('id', sessionId)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message || 'Error al actualizar sesión' };
  }

  revalidatePath('/assessment');
  return { success: true };
}

// Get Assessment Results with Answers and Feedback
export async function getAssessmentResults(
  sessionId: string
): Promise<{ success: true; data: AssessmentResults } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  // Get session
  const { data: session, error: sessionError } = await supabase
    .from('assessment_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (sessionError || !session) {
    return { success: false, error: 'Sesión no encontrada' };
  }

  // Get all answers with questions and feedback
  const { data: answers, error: answersError } = await supabase
    .from('assessment_answers')
    .select(`
      *,
      question:questions(*)
    `)
    .eq('session_id', sessionId)
    .order('question_order', { ascending: true });

  if (answersError) {
    return { success: false, error: answersError.message || 'Error al obtener respuestas' };
  }

  // Parse questions and calculate stats
  type RawAnswer = typeof answers extends (infer T)[] | null ? T : never;
  const parsedAnswers = (answers || []).map((answer: RawAnswer) => {
    const question = answer.question as QuestionWithHierarchy & { options: QuestionOption[] | string };
    const rawOptions = question.options;
    let options: QuestionOption[] = [];
    if (typeof rawOptions === 'string') {
      try {
        options = JSON.parse(rawOptions);
      } catch {
        options = [];
      }
    } else if (Array.isArray(rawOptions)) {
      options = rawOptions;
    }

    return {
      ...answer,
      question: {
        ...question,
        options,
      },
    } as AssessmentAnswerWithQuestion;
  });

  const totalQuestions = parsedAnswers.length;
  const correctAnswers = parsedAnswers.filter((a) => a.is_correct).length;
  const precision = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  return {
    success: true,
    data: {
      session,
      answers: parsedAnswers,
      stats: {
        total: totalQuestions,
        correct: correctAnswers,
        precision,
      },
    },
  };
}
