import { createClient } from '@/lib/supabase/server';
import type { TutorChatRequest, TutorChatResponse, ErrorContext } from '@/types/tutor';
import { detectCompletion, extractAnchorRecommendation } from '@/lib/tutor';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: Request): Promise<Response> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, error: 'No autenticado' } as TutorChatResponse, {
        status: 401,
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { success: false, error: 'OpenAI API key no configurada' } as TutorChatResponse,
        { status: 500 }
      );
    }

    const body: TutorChatRequest = await request.json();
    const { sessionId, message, conversationHistory, isInitialMessage } = body;

    if (!sessionId || !message) {
      return Response.json(
        { success: false, error: 'sessionId y message son requeridos' } as TutorChatResponse,
        { status: 400 }
      );
    }

    // Get session
    const { data: session, error: sessionError } = await supabase
      .from('tutor_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return Response.json(
        { success: false, error: 'Sesión no encontrada' } as TutorChatResponse,
        { status: 404 }
      );
    }

    // Get error context if error coding is enabled
    // Use errorContext from request if provided, otherwise build from session's selected_error_ids
    let errorContext: ErrorContext | undefined = body.errorContext || undefined;
    
    // Parse selected_error_ids if it's a string (JSONB)
    let selectedErrorIds: string[] = [];
    if (session.selected_error_ids) {
      if (typeof session.selected_error_ids === 'string') {
        try {
          selectedErrorIds = JSON.parse(session.selected_error_ids);
        } catch {
          selectedErrorIds = [];
        }
      } else if (Array.isArray(session.selected_error_ids)) {
        selectedErrorIds = session.selected_error_ids;
      }
    }
    
    if (!errorContext && session.error_coding_enabled && session.error_type && selectedErrorIds.length > 0) {
      // Get errors from assessment_answers using the selected_error_ids
      const { data: errorsData, error: errorsError } = await supabase
        .from('assessment_answers')
        .select(`
          id,
          question_id,
          selected_answer_index,
          question:questions(
            id,
            question_text,
            options,
            correct_answer_index,
            subtopic_id,
            subtopic:study_subtopics(id, name)
          )
        `)
        .eq('user_id', user.id)
        .in('id', selectedErrorIds);

      if (!errorsError && errorsData) {
        const errors = errorsData
          .map((answer: any) => {
            const question = answer.question;
            if (!question) return null;

            // Parse options
            let options: Array<{ text: string }> = [];
            if (question.options) {
              try {
                const parsedOptions =
                  typeof question.options === 'string'
                    ? JSON.parse(question.options)
                    : question.options;
                if (Array.isArray(parsedOptions)) {
                  options = parsedOptions;
                }
              } catch {
                // Ignore parse errors
              }
            }

            const selectedAnswer = options[answer.selected_answer_index]?.text || '';
            const correctAnswer = options[question.correct_answer_index]?.text || '';
            const subtopic = Array.isArray(question.subtopic)
              ? question.subtopic[0]
              : question.subtopic;

            return {
              question_id: question.id,
              question_text: question.question_text,
              user_answer: selectedAnswer,
              correct_answer: correctAnswer,
              subtopic_id: question.subtopic_id || undefined,
              subtopic_name: subtopic?.name || undefined,
            };
          })
          .filter((e: any): e is {
            question_id: string;
            question_text: string;
            user_answer: string;
            correct_answer: string;
            subtopic_id?: string;
            subtopic_name?: string;
          } => e !== null);

        if (errors.length > 0) {
          errorContext = {
            errorType: session.error_type as 'concepto' | 'analisis' | 'atencion',
            errors,
          };
        }
      }
    }

    // Build system prompt
    let systemPrompt = `Eres un tutor de IA experto y pedagógico. Tu rol es: ${session.tutor_role}. El estudiante es: ${session.user_role}. 

CONTEXTO DE APRENDIZAJE:
${session.context}

OBJETIVO DE LA SESIÓN:
${session.objective}

`;

    // Add content context if session is linked to subtopic/topic
    let contentContext = '';
    if (session.subtopic_id) {
      const { data: subtopicData } = await supabase
        .from('study_subtopics')
        .select('content, name')
        .eq('id', session.subtopic_id)
        .single();

      if (subtopicData?.content) {
        contentContext += `\n\nINFORMACIÓN DEL SUBTEMA "${subtopicData.name}":\n${subtopicData.content}\n\nUsa esta información como referencia, pero NO la repitas directamente. Guía al estudiante para que descubra estos conceptos por sí mismo mediante preguntas socráticas y razonamiento guiado.\n`;
      }
    } else if (session.topic_id) {
      const { data: topicData } = await supabase
        .from('study_topics')
        .select('content, name')
        .eq('id', session.topic_id)
        .single();

      if (topicData?.content) {
        contentContext += `\n\nINFORMACIÓN DEL TEMA "${topicData.name}":\n${topicData.content}\n\nUsa esta información como referencia, pero NO la repitas directamente. Guía al estudiante para que descubra estos conceptos por sí mismo mediante preguntas socráticas y razonamiento guiado.\n`;
      }
    }

    systemPrompt += contentContext;

    // Add error context if provided (from request or from session)
    const finalErrorContext = errorContext || body.errorContext;
    if (finalErrorContext) {
      const errorType = finalErrorContext.errorType;
      const isConocimiento = errorType === 'concepto';
      const isAnalisis = errorType === 'analisis';
      const isAtencion = errorType === 'atencion';

      let errorTypeInstructions = '';
      if (isConocimiento) {
        errorTypeInstructions = `
INSTRUCCIONES ESPECÍFICAS PARA ERRORES DE CONOCIMIENTO:
Tu objetivo es REFORZAR directamente los conocimientos que el estudiante no domina.
1. Explicar claramente los conceptos
2. Proporcionar ejemplos concretos
3. Sé directo y educativo - NO uses preguntas socráticas
4. Corrige los errores específicos explicando por qué estaban equivocados
`;
      } else if (isAnalisis) {
        errorTypeInstructions = `
INSTRUCCIONES ESPECÍFICAS PARA ERRORES DE ANÁLISIS:
Tu objetivo es DESARROLLAR habilidades de análisis mediante preguntas socráticas.
1. NO dar las respuestas directamente
2. Usar preguntas guiadas
3. Ayudar al estudiante a razonar paso a paso
4. Desarrollar pensamiento crítico
`;
      } else if (isAtencion) {
        errorTypeInstructions = `
INSTRUCCIONES ESPECÍFICAS PARA ERRORES DE ATENCIÓN:
Tu objetivo es mejorar la atención y precisión del estudiante.
1. Enfócate en la lectura cuidadosa de preguntas y opciones
2. Ayuda al estudiante a identificar detalles importantes que pasó por alto
3. Desarrolla técnicas para mejorar la concentración y revisión
4. Proporciona estrategias para evitar errores por descuido
`;
      }

      systemPrompt += errorTypeInstructions;

      // Add error details
      systemPrompt += `\n\nERRORES DEL ESTUDIANTE:\n`;
      finalErrorContext.errors.forEach((error, index) => {
        systemPrompt += `${index + 1}. Pregunta: ${error.question_text}\n`;
        systemPrompt += `   Respuesta del estudiante: ${error.user_answer}\n`;
        systemPrompt += `   Respuesta correcta: ${error.correct_answer}\n`;
        if (error.subtopic_name) {
          systemPrompt += `   Relacionado con: ${error.subtopic_name}\n`;
        }
        systemPrompt += `\n`;
      });
    }

    // Add study techniques
    systemPrompt += `
TÉCNICAS DE ESTUDIO A APLICAR:
- Interleaving: Mezcla conceptos relacionados para mejorar la retención
- Repetición espaciada: Refuerza conceptos clave en momentos estratégicos
- Elaboración por primeros principios: Ayuda a entender desde los fundamentos
- Codificación por errores: Identifica y corrige errores de comprensión
- Evocación activa: Haz que el estudiante recuerde y explique conceptos
- Método socrático: Haz preguntas que guíen al estudiante (${finalErrorContext?.errorType === 'concepto' ? 'NO usar en errores de conocimiento' : finalErrorContext?.errorType === 'analisis' ? 'usar especialmente en errores de análisis' : 'usar cuando sea apropiado'})

INSTRUCCIONES GENERALES:
- Sé paciente, educativo y constructivo
- Adapta tu lenguaje al nivel del estudiante
- Proporciona retroalimentación específica y útil
- Mantén las respuestas entre 3-5 oraciones cuando sea posible
- Si el estudiante ha comprendido el concepto, puedes indicarlo claramente
- Al finalizar una sesión exitosa, puedes recomendar anclajes de memoria (ej: "Te recomiendo crear un anclaje de memoria: [descripción]")
`;

    // Prepare messages for OpenAI
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history
    conversationHistory.forEach((msg) => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      });
    });

    // Add current user message
    messages.push({ role: 'user', content: message });

    // Call OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json();
      return Response.json(
        {
          success: false,
          error: `Error de OpenAI: ${error.error?.message || 'Error desconocido'}`,
        } as TutorChatResponse,
        { status: 500 }
      );
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices[0]?.message?.content;

    if (!aiResponse) {
      return Response.json(
        { success: false, error: 'No se recibió respuesta de OpenAI' } as TutorChatResponse,
        { status: 500 }
      );
    }

    // Save user message
    const { error: userMessageError } = await supabase.from('tutor_messages').insert({
      session_id: sessionId,
      role: 'user',
      content: message,
    });

    if (userMessageError) {
      return Response.json(
        { success: false, error: 'Error al guardar mensaje del usuario' } as TutorChatResponse,
        { status: 500 }
      );
    }

    // Save assistant message
    const { error: assistantMessageError } = await supabase.from('tutor_messages').insert({
      session_id: sessionId,
      role: 'assistant',
      content: aiResponse,
    });

    if (assistantMessageError) {
      return Response.json(
        { success: false, error: 'Error al guardar respuesta del tutor' } as TutorChatResponse,
        { status: 500 }
      );
    }

    // Update session status if needed
    let shouldComplete = false;
    let anchorRecommendation: string | null = null;

    if (!isInitialMessage) {
      // Detect completion
      shouldComplete = detectCompletion(aiResponse);

      // Extract anchor recommendation
      anchorRecommendation = extractAnchorRecommendation(aiResponse);

      // Update session status
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (shouldComplete && session.status !== 'completed') {
        updateData.status = 'completed';
      }

      if (anchorRecommendation) {
        updateData.anchor_recommendation = anchorRecommendation;
      }

      // Update status if it's the first user message (change from 'created' to 'in_progress')
      if (session.status === 'created') {
        updateData.status = 'in_progress';
      }

      await supabase.from('tutor_sessions').update(updateData).eq('id', sessionId);
    }

    return Response.json({
      success: true,
      response: aiResponse,
      shouldComplete,
      anchorRecommendation,
    } as TutorChatResponse);
  } catch (error) {
    console.error('Error in tutor-chat API:', error);
    return Response.json(
      { success: false, error: 'Error interno del servidor' } as TutorChatResponse,
      { status: 500 }
    );
  }
}
