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
        const errors: Array<{
          question_id: string;
          question_text: string;
          user_answer: string;
          correct_answer: string;
          subtopic_id?: string;
          subtopic_name?: string;
        }> = [];

        for (const answer of errorsData) {
          // Supabase may return question as array or object
          const questionData = Array.isArray(answer.question) 
            ? answer.question[0] 
            : answer.question;
          
          if (!questionData) continue;

          // Parse options
          let options: Array<{ text: string }> = [];
          if (questionData.options) {
            try {
              const parsedOptions =
                typeof questionData.options === 'string'
                  ? JSON.parse(questionData.options)
                  : questionData.options;
              if (Array.isArray(parsedOptions)) {
                options = parsedOptions;
              }
            } catch {
              // Ignore parse errors
            }
          }

          const selectedAnswer = options[answer.selected_answer_index]?.text || '';
          const correctAnswer = options[questionData.correct_answer_index]?.text || '';
          const subtopic = Array.isArray(questionData.subtopic)
            ? questionData.subtopic[0]
            : questionData.subtopic;

          errors.push({
            question_id: questionData.id,
            question_text: questionData.question_text,
            user_answer: selectedAnswer,
            correct_answer: correctAnswer,
            subtopic_id: questionData.subtopic_id || undefined,
            subtopic_name: subtopic?.name || undefined,
          });
        }

        if (errors.length > 0) {
          errorContext = {
            errorType: session.error_type as 'concepto' | 'analisis' | 'atencion',
            errors,
          };
        }
      }
    }

    // Build system prompt
    let systemPrompt = `Eres un tutor de IA experto y pedagógico, diseñado bajo los principios de LearnLM y la ciencia del aprendizaje. Tu objetivo es ser extremadamente exacto, eficiente y equilibrar la teoría profunda con la aplicación práctica.

Tu rol es: ${session.tutor_role}. El estudiante es: ${session.user_role}. 

PRINCIPIOS PEDAGÓGICOS (Inspirados en LearnLM):
1. INSPIRAR APRENDIZAJE ACTIVO: No des respuestas directas. Guía al estudiante para que construya su propio conocimiento.
2. GESTIONAR CARGA COGNITIVA: Divide conceptos complejos en partes digeribles. No abrumes con demasiada información a la vez.
3. ADAPTARSE AL ESTUDIANTE: Ajusta tu tono y profundidad según las respuestas del usuario.
4. FOMENTAR LA CURIOSIDAD: Relaciona la teoría con aplicaciones prácticas del mundo real para mantener el interés.
5. VERIFICAR COMPRENSIÓN: Antes de avanzar, asegúrate de que el estudiante realmente ha entendido el concepto mediante preguntas de validación.

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
        contentContext += `\n\nCONTENIDO TEÓRICO DE REFERENCIA ("${subtopicData.name}"):
${subtopicData.content}

INSTRUCCIÓN DE USO: Usa este contenido para fundamentar tus explicaciones teóricas, pero SIEMPRE acompáñalo de un ejemplo práctico o un ejercicio rápido de aplicación. No repitas el texto; sintetízalo y hazlo accionable.
`;
      }
    } else if (session.topic_id) {
      const { data: topicData } = await supabase
        .from('study_topics')
        .select('content, name')
        .eq('id', session.topic_id)
        .single();

      if (topicData?.content) {
        contentContext += `\n\nCONTENIDO TEÓRICO DE REFERENCIA ("${topicData.name}"):
${topicData.content}

INSTRUCCIÓN DE USO: Usa este contenido para fundamentar tus explicaciones teóricas, pero SIEMPRE acompáñalo de un ejemplo práctico o un ejercicio rápido de aplicación. No repitas el texto; sintetízalo y hazlo accionable.
`;
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
INSTRUCCIONES ESPECÍFICAS PARA ERRORES DE CONOCIMIENTO (TEORÍA):
Tu objetivo es REFORZAR los fundamentos.
1. Explica el "por qué" detrás del concepto (Primeros Principios).
2. Proporciona una analogía clara.
3. Inmediatamente después de la explicación, pide al estudiante que aplique ese concepto a un caso pequeño.
4. Sé directo pero pedagógico.
`;
      } else if (isAnalisis) {
        errorTypeInstructions = `
INSTRUCCIONES ESPECÍFICAS PARA ERRORES DE ANÁLISIS (PRÁCTICA):
Tu objetivo es desarrollar el razonamiento lógico.
1. NO des la solución.
2. Descompón el problema en pasos lógicos.
3. Pregunta: "¿Qué pasaría si cambiamos X variable?" para forzar el análisis.
4. Guía al estudiante a través del proceso de deducción.
`;
      } else if (isAtencion) {
        errorTypeInstructions = `
INSTRUCCIONES ESPECÍFICAS PARA ERRORES DE ATENCIÓN (PRECISIÓN):
Tu objetivo es la exactitud.
1. Pide al estudiante que parafrasee la pregunta original.
2. Señala las "trampas" o palabras clave que ignoró.
3. Enseña una técnica de verificación rápida.
`;
      }

      systemPrompt += errorTypeInstructions;

      // Add error details
      systemPrompt += `\n\nCASOS DE ERROR PARA ANALIZAR:\n`;
      finalErrorContext.errors.forEach((error, index) => {
        systemPrompt += `${index + 1}. Pregunta: ${error.question_text}\n`;
        systemPrompt += `   Respuesta del estudiante: ${error.user_answer}\n`;
        systemPrompt += `   Respuesta correcta: ${error.correct_answer}\n`;
        if (error.subtopic_name) {
          systemPrompt += `   Área: ${error.subtopic_name}\n`;
        }
        systemPrompt += `\n`;
      });
    }

    // Add study techniques
    systemPrompt += `
TÉCNICAS DE ALTO IMPACTO APLICABLES:
- Interleaving: Conecta el tema actual con conceptos previos.
- Elaboración: Pide al estudiante que explique el concepto "con sus propias palabras".
- Dual Coding: Sugiere cómo visualizar la información (diagramas, mapas mentales).
- Flipped Learning: Si el estudiante domina algo, deja que él te lo "enseñe" a ti.

REGLAS DE ORO:
- EXACTITUD: Si no estás seguro de un dato técnico, prioriza la lógica general o pide al estudiante que consulte el material de referencia.
- BREVEDAD EFICIENTE: Respuestas densas en valor pero cortas en extensión (máximo 4 oraciones por bloque).
- EQUILIBRIO: 50% Teoría (fundamento) - 50% Práctica (aplicación/ejercicio).
- CIERRE ACTIVO: Termina cada mensaje con una pregunta o un pequeño reto.

ANCLAJE DE MEMORIA:
Cuando el estudiante haya demostrado comprensión real de un concepto, incluye al final del mensaje un anclaje mnémico con este formato exacto:
"💡 Anclaje: [frase corta, memorable y concreta que capture la esencia del concepto]"
Solo usa el anclaje cuando sea genuinamente útil (máximo 1 por sesión).

CIERRE DE SESIÓN:
Cuando el objetivo de la sesión esté cumplido (el estudiante ha demostrado comprensión sólida mediante sus respuestas), incluye la frase exacta: "has comprendido el concepto" en tu mensaje de cierre.
`;

    // Add initial message instructions if this is the opening of the session
    if (isInitialMessage) {
      systemPrompt += `
INSTRUCCIÓN DE APERTURA (PRIMER MENSAJE):
Este es el inicio de la sesión. Tu primer mensaje debe:
1. Presentarte brevemente en una sola oración (quién eres en el contexto de esta sesión).
2. Reformular el objetivo de la sesión en tus propias palabras para confirmar el enfoque.
3. Lanzar UNA pregunta diagnóstica abierta para evaluar el punto de partida del estudiante.
NO des teoría todavía. Primero escucha al estudiante.
`;
    }

    // Prepare messages for OpenAI
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    // Truncate conversation history to last 20 messages to avoid context overflow
    const truncatedHistory = conversationHistory.slice(-20);
    truncatedHistory.forEach((msg) => {
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
        temperature: 0.3,
        max_tokens: 1000,
        presence_penalty: 0.1,
        frequency_penalty: 0.2,
        stream: false,
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
