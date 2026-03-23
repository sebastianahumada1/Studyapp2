'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { QuestionFormData, Question } from '@/types/questions';

// Create Question
export async function createQuestion(
  formData: QuestionFormData
): Promise<{ success: true; data: Question } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  // Validate that at least one hierarchical association is provided
  if (!formData.route_id && !formData.topic_id && !formData.subtopic_id && !formData.subsubtopic_id) {
    return { success: false, error: 'Debe asociar la pregunta a una ruta, tema, subtema o sub-subtema' };
  }

  // Validate options
  if (!formData.options || formData.options.length < 2 || formData.options.length > 4) {
    return { success: false, error: 'La pregunta debe tener entre 2 y 4 opciones' };
  }

  // Validate correct answer index
  if (formData.correct_answer_index < 0 || formData.correct_answer_index >= formData.options.length) {
    return { success: false, error: 'Índice de respuesta correcta inválido' };
  }

  const { data, error } = await supabase
    .from('questions')
    .insert({
      user_id: user.id,
      question_text: formData.question_text,
      options: formData.options,
      correct_answer_index: formData.correct_answer_index,
      difficulty: formData.difficulty,
      origin: formData.origin,
      explanation: formData.explanation || null,
      route_id: formData.route_id || null,
      topic_id: formData.topic_id || null,
      subtopic_id: formData.subtopic_id || null,
      subsubtopic_id: formData.subsubtopic_id || null,
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || 'Error al crear pregunta' };
  }

  revalidatePath('/questions');
  return { success: true, data: data as Question };
}

// Update Question
export async function updateQuestion(
  questionId: string,
  formData: Partial<QuestionFormData>
): Promise<{ success: true; data: Question } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  // Validate options if provided
  if (formData.options) {
    if (formData.options.length < 2 || formData.options.length > 4) {
      return { success: false, error: 'La pregunta debe tener entre 2 y 4 opciones' };
    }
    if (
      formData.correct_answer_index !== undefined &&
      (formData.correct_answer_index < 0 || formData.correct_answer_index >= formData.options.length)
    ) {
      return { success: false, error: 'Índice de respuesta correcta inválido' };
    }
  }

  const updateData: any = {};
  if (formData.question_text !== undefined) updateData.question_text = formData.question_text;
  if (formData.options !== undefined) updateData.options = formData.options;
  if (formData.correct_answer_index !== undefined) updateData.correct_answer_index = formData.correct_answer_index;
  if (formData.difficulty !== undefined) updateData.difficulty = formData.difficulty;
  if (formData.origin !== undefined) updateData.origin = formData.origin;
  if (formData.explanation !== undefined) updateData.explanation = formData.explanation || null;
  if (formData.route_id !== undefined) updateData.route_id = formData.route_id || null;
  if (formData.topic_id !== undefined) updateData.topic_id = formData.topic_id || null;
  if (formData.subtopic_id !== undefined) updateData.subtopic_id = formData.subtopic_id || null;
  if (formData.subsubtopic_id !== undefined) updateData.subsubtopic_id = formData.subsubtopic_id || null;

  const { data, error } = await supabase
    .from('questions')
    .update(updateData)
    .eq('id', questionId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || 'Error al actualizar pregunta' };
  }

  revalidatePath('/questions');
  return { success: true, data: data as Question };
}

// Delete Question
export async function deleteQuestion(
  questionId: string
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message || 'Error al eliminar pregunta' };
  }

  revalidatePath('/questions');
  return { success: true };
}

// Generate Questions with AI
export interface AIGenerateQuestionsRequest {
  hierarchyLevel: 'route' | 'topic' | 'subtopic' | 'subsubtopic';
  routeId?: string;
  topicId?: string;
  subtopicId?: string;
  subsubtopicId?: string;
  specificContent: string;
  questionObjective: string;
  questionCount: number;
  difficulties: Array<'baja' | 'media' | 'alta'>;
}

interface AIGeneratedQuestion {
  question_text: string;
  options: Array<{ text: string; isCorrect: boolean }>;
  difficulty: 'baja' | 'media' | 'alta';
  explanation?: string;
}

interface AIGeneratedQuestionsResponse {
  questions: AIGeneratedQuestion[];
}

export async function generateQuestionsWithAI(
  request: AIGenerateQuestionsRequest
): Promise<{ success: true; data: { questionsCreated: number } } | { success: false; error: string }> {
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

  // Validate hierarchy selection
  if (request.hierarchyLevel === 'route' && !request.routeId) {
    return { success: false, error: 'Debe seleccionar una ruta' };
  }
  if (request.hierarchyLevel === 'topic' && (!request.routeId || !request.topicId)) {
    return { success: false, error: 'Debe seleccionar una ruta y un tema' };
  }
  if (request.hierarchyLevel === 'subtopic' && (!request.routeId || !request.topicId || !request.subtopicId)) {
    return { success: false, error: 'Debe seleccionar una ruta, tema y subtema' };
  }
  if (
    request.hierarchyLevel === 'subsubtopic' &&
    (!request.routeId || !request.topicId || !request.subtopicId || !request.subsubtopicId)
  ) {
    return { success: false, error: 'Debe seleccionar una ruta, tema, subtema y sub-subtema' };
  }

  // Get hierarchy context for the prompt
  let hierarchyContext = '';
  if (request.routeId) {
    const { data: route } = await supabase
      .from('study_routes')
      .select('title')
      .eq('id', request.routeId)
      .single();
    if (route) {
      hierarchyContext += `Ruta: ${route.title}\n`;
    }
  }
  if (request.topicId) {
    const { data: topic } = await supabase
      .from('study_topics')
      .select('name')
      .eq('id', request.topicId)
      .single();
    if (topic) {
      hierarchyContext += `Tema: ${topic.name}\n`;
    }
  }
  if (request.subtopicId) {
    const { data: subtopic } = await supabase
      .from('study_subtopics')
      .select('name')
      .eq('id', request.subtopicId)
      .single();
    if (subtopic) {
      hierarchyContext += `Subtema: ${subtopic.name}\n`;
    }
  }
  if (request.subsubtopicId) {
    const { data: subsubtopic } = await supabase
      .from('study_subsubtopics')
      .select('name')
      .eq('id', request.subsubtopicId)
      .single();
    if (subsubtopic) {
      hierarchyContext += `Sub-Subtema: ${subsubtopic.name}\n`;
    }
  }

  const difficultiesText = request.difficulties
    .map((d) => {
      const map: Record<string, string> = {
        baja: 'baja (fácil)',
        media: 'media (intermedia)',
        alta: 'alta (difícil)',
      };
      return map[d];
    })
    .join(', ');

  // Build prompt for OpenAI
  const prompt = `Eres un experto en educación y creación de preguntas de evaluación. Genera preguntas de opción múltiple en formato JSON.

Contexto de la jerarquía de estudio:
${hierarchyContext}

Contenido específico sobre el cual generar preguntas:
${request.specificContent}

Objetivo de las preguntas:
${request.questionObjective}

Requisitos:
- Genera exactamente ${request.questionCount} preguntas
- Las dificultades deben distribuirse entre: ${difficultiesText}
- Cada pregunta debe tener entre 2 y 4 opciones de respuesta
- Solo una opción debe ser correcta (isCorrect: true)
- Las preguntas deben ser claras, precisas y relevantes al contenido específico
- Las opciones incorrectas deben ser plausibles pero claramente incorrectas
- El nivel de dificultad debe corresponder al tipo de pregunta (baja: conocimiento básico, media: comprensión y aplicación, alta: análisis y síntesis)
- Cada pregunta DEBE incluir una explicación clara y educativa que justifique por qué la respuesta correcta es correcta. La explicación debe ayudar a los estudiantes a comprender el concepto subyacente.

Responde SOLO con un JSON válido en este formato exacto:
{
  "questions": [
    {
      "question_text": "Texto de la pregunta",
      "options": [
        {"text": "Opción 1", "isCorrect": true},
        {"text": "Opción 2", "isCorrect": false},
        {"text": "Opción 3", "isCorrect": false},
        {"text": "Opción 4", "isCorrect": false}
      ],
      "difficulty": "baja",
      "explanation": "Explicación clara y educativa que justifica por qué la respuesta correcta es correcta, ayudando a los estudiantes a comprender el concepto."
    }
  ]
}

IMPORTANTE: El JSON debe comenzar directamente con { y terminar con }. No incluyas markdown, explicaciones ni texto adicional.`;

  try {
    const requestBody: any = {
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Eres un asistente experto en educación. Genera preguntas de evaluación de alta calidad. Responde SOLO con JSON válido, sin markdown, sin explicaciones adicionales. El JSON debe comenzar directamente con { y terminar con }.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: `Error de OpenAI: ${error.error?.message || 'Error desconocido'}` };
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return { success: false, error: 'No se recibió respuesta de OpenAI' };
    }

    // Parse JSON response
    let aiResponse: AIGeneratedQuestionsResponse;
    try {
      aiResponse = JSON.parse(content);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Response content:', content);
      return { success: false, error: 'Error al parsear respuesta de OpenAI' };
    }

    if (!aiResponse.questions || !Array.isArray(aiResponse.questions)) {
      return { success: false, error: 'Formato de respuesta inválido: se esperaba un array de preguntas' };
    }

    // Validate and save each question
    let questionsCreated = 0;
    const errors: string[] = [];

    for (const aiQuestion of aiResponse.questions) {
      // Validate question structure
      if (!aiQuestion.question_text || !aiQuestion.options || !Array.isArray(aiQuestion.options)) {
        errors.push('Pregunta con estructura inválida');
        continue;
      }

      // Validate options
      if (aiQuestion.options.length < 2 || aiQuestion.options.length > 4) {
        errors.push(`Pregunta con número inválido de opciones: ${aiQuestion.options.length}`);
        continue;
      }

      // Validate correct answer
      const correctOptions = aiQuestion.options.filter((opt) => opt.isCorrect);
      if (correctOptions.length !== 1) {
        errors.push(`Pregunta debe tener exactamente una opción correcta, tiene: ${correctOptions.length}`);
        continue;
      }

      // Validate difficulty
      if (!['baja', 'media', 'alta'].includes(aiQuestion.difficulty)) {
        errors.push(`Dificultad inválida: ${aiQuestion.difficulty}`);
        continue;
      }

      // Find correct answer index
      const correctIndex = aiQuestion.options.findIndex((opt) => opt.isCorrect);

      // Map options to QuestionOption format
      const options: Array<{ text: string; isCorrect: boolean }> = aiQuestion.options.map((opt) => ({
        text: opt.text.trim(),
        isCorrect: opt.isCorrect,
      }));

      // Create question in database with full hierarchy
      // Always save all parent levels when creating a question
      const formData: QuestionFormData = {
        question_text: aiQuestion.question_text.trim(),
        options,
        correct_answer_index: correctIndex,
        difficulty: aiQuestion.difficulty as 'baja' | 'media' | 'alta',
        origin: 'ai',
        explanation: aiQuestion.explanation?.trim() || null,
        route_id: request.routeId || null,
        topic_id: request.topicId || null,
        subtopic_id: request.subtopicId || null,
        subsubtopic_id: request.subsubtopicId || null,
      };

      const result = await createQuestion(formData);
      if (result.success) {
        questionsCreated++;
      } else {
        errors.push(result.error || 'Error desconocido al crear pregunta');
      }
    }

    if (questionsCreated === 0) {
      return {
        success: false,
        error: `No se pudieron crear preguntas. Errores: ${errors.join('; ')}`,
      };
    }

    revalidatePath('/questions');
    return {
      success: true,
      data: {
        questionsCreated,
      },
    };
  } catch (error) {
    console.error('Error generating questions with AI:', error);
    return { success: false, error: 'Error al generar preguntas con IA' };
  }
}
