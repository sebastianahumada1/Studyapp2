'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
  CreateTutorSessionRequest,
  TutorSession,
  TutorMessage,
  TutorSessionWithLastMessage,
} from '@/types/tutor';
import { buildTutorRole } from '@/lib/tutor';

// Create Tutor Session
export async function createTutorSession(
  request: CreateTutorSessionRequest
): Promise<{ success: true; data: TutorSession } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  if (!request.tutor_role || !request.user_role || !request.context || !request.objective) {
    return { success: false, error: 'Todos los campos son requeridos' };
  }

  // Get hierarchy names for tutor role if not provided
  let tutorRole = request.tutor_role;
  if (!tutorRole || tutorRole.trim() === '') {
    let routeTitle: string | null = null;
    let topicName: string | null = null;
    let subtopicName: string | null = null;

    if (request.route_id) {
      const { data: route } = await supabase
        .from('study_routes')
        .select('title')
        .eq('id', request.route_id)
        .single();
      routeTitle = route?.title || null;
    }

    if (request.topic_id) {
      const { data: topic } = await supabase
        .from('study_topics')
        .select('name')
        .eq('id', request.topic_id)
        .single();
      topicName = topic?.name || null;
    }

    if (request.subtopic_id) {
      const { data: subtopic } = await supabase
        .from('study_subtopics')
        .select('name')
        .eq('id', request.subtopic_id)
        .single();
      subtopicName = subtopic?.name || null;
    }

    tutorRole = buildTutorRole(routeTitle, topicName, subtopicName);
  }

  const { data, error } = await supabase
    .from('tutor_sessions')
    .insert({
      user_id: user.id,
      route_id: request.route_id || null,
      topic_id: request.topic_id || null,
      subtopic_id: request.subtopic_id || null,
      tutor_role: tutorRole,
      user_role: request.user_role,
      context: request.context,
      objective: request.objective,
      status: 'created',
      error_coding_enabled: request.error_coding_enabled || false,
      error_type: request.error_type || null,
      selected_error_ids: request.selected_error_ids ? JSON.stringify(request.selected_error_ids) : '[]',
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || 'Error al crear sesión' };
  }

  revalidatePath('/mentor');
  return { success: true, data: data as TutorSession };
}

// Get all tutor sessions for the user
export async function getTutorSessions(): Promise<
  { success: true; data: TutorSessionWithLastMessage[] } | { success: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  // Get all sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from('tutor_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (sessionsError) {
    return { success: false, error: sessionsError.message };
  }

  if (!sessions || sessions.length === 0) {
    return { success: true, data: [] };
  }

  // Get last message for each session
  const sessionIds = sessions.map((s) => s.id);
  const { data: lastMessages, error: messagesError } = await supabase
    .from('tutor_messages')
    .select('session_id, content, created_at')
    .in('session_id', sessionIds)
    .order('created_at', { ascending: false });

  if (messagesError) {
    return { success: false, error: messagesError.message };
  }

  // Get hierarchy names
  const routeIds = sessions.filter((s) => s.route_id).map((s) => s.route_id!);
  const topicIds = sessions.filter((s) => s.topic_id).map((s) => s.topic_id!);
  const subtopicIds = sessions.filter((s) => s.subtopic_id).map((s) => s.subtopic_id!);

  const { data: routes } = await supabase
    .from('study_routes')
    .select('id, title')
    .in('id', routeIds);

  const { data: topics } = await supabase
    .from('study_topics')
    .select('id, name')
    .in('id', topicIds);

  const { data: subtopics } = await supabase
    .from('study_subtopics')
    .select('id, name')
    .in('id', subtopicIds);

  // Combine data
  const sessionsWithLastMessage: TutorSessionWithLastMessage[] = sessions.map((session) => {
    const lastMessage = lastMessages?.find((m) => m.session_id === session.id);
    const route = routes?.find((r) => r.id === session.route_id);
    const topic = topics?.find((t) => t.id === session.topic_id);
    const subtopic = subtopics?.find((s) => s.id === session.subtopic_id);

    return {
      ...session,
      route_title: route?.title || null,
      topic_name: topic?.name || null,
      subtopic_name: subtopic?.name || null,
      last_message: lastMessage?.content || null,
      last_message_at: lastMessage?.created_at || null,
    } as TutorSessionWithLastMessage;
  });

  return { success: true, data: sessionsWithLastMessage };
}

// Get single tutor session
export async function getTutorSession(
  sessionId: string
): Promise<{ success: true; data: TutorSession } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const { data, error } = await supabase
    .from('tutor_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || 'Sesión no encontrada' };
  }

  // Get hierarchy names
  let routeTitle: string | null = null;
  let topicName: string | null = null;
  let subtopicName: string | null = null;

  if (data.route_id) {
    const { data: route } = await supabase
      .from('study_routes')
      .select('title')
      .eq('id', data.route_id)
      .single();
    routeTitle = route?.title || null;
  }

  if (data.topic_id) {
    const { data: topic } = await supabase
      .from('study_topics')
      .select('name')
      .eq('id', data.topic_id)
      .single();
    topicName = topic?.name || null;
  }

  if (data.subtopic_id) {
    const { data: subtopic } = await supabase
      .from('study_subtopics')
      .select('name')
      .eq('id', data.subtopic_id)
      .single();
    subtopicName = subtopic?.name || null;
  }

  return {
    success: true,
    data: {
      ...data,
      route_title: routeTitle,
      topic_name: topicName,
      subtopic_name: subtopicName,
    } as TutorSession,
  };
}

// Get messages for a session
export async function getTutorMessages(
  sessionId: string
): Promise<{ success: true; data: TutorMessage[] } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  // Verify session belongs to user
  const { data: session } = await supabase
    .from('tutor_sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (!session) {
    return { success: false, error: 'Sesión no encontrada' };
  }

  const { data, error } = await supabase
    .from('tutor_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: (data || []) as TutorMessage[] };
}

// Generate initial message for a session
export async function generateInitialMessage(
  sessionId: string
): Promise<{ success: true; data: TutorMessage } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  // Get session with hierarchy
  const sessionResult = await getTutorSession(sessionId);
  if (!sessionResult.success) {
    return sessionResult;
  }

  const session = sessionResult.data;

  // Build initial prompt
  let initialPrompt = 'Hola! ';
  if (session.subtopic_name) {
    initialPrompt += `Vamos a trabajar en el subtema "${session.subtopic_name}"`;
    if (session.topic_name) {
      initialPrompt += ` del tema "${session.topic_name}"`;
    }
    if (session.route_title) {
      initialPrompt += ` de la ruta "${session.route_title}"`;
    }
  } else if (session.topic_name) {
    initialPrompt += `Vamos a trabajar en el tema "${session.topic_name}"`;
    if (session.route_title) {
      initialPrompt += ` de la ruta "${session.route_title}"`;
    }
  } else if (session.route_title) {
    initialPrompt += `Vamos a trabajar en la ruta "${session.route_title}"`;
  }

  initialPrompt += `. Mi objetivo es: ${session.objective}. `;
  initialPrompt += `Por favor, salúdame y ofréceme 2-3 temas relacionados en los que podríamos trabajar. Pregúntame si quiero trabajar en esos temas o si prefiero proponer otro.`;

  // For initial message, we'll create a simple greeting
  // The full AI-generated message will happen when user sends first message
  try {
    const greetingMessage = `¡Hola! ${initialPrompt}`;

    // Save initial assistant message
    const { data: initialMessage, error: messageError } = await supabase
      .from('tutor_messages')
      .insert({
        session_id: sessionId,
        role: 'assistant',
        content: greetingMessage,
      })
      .select()
      .single();

    if (messageError || !initialMessage) {
      return { success: false, error: 'Error al crear mensaje inicial' };
    }

    return { success: true, data: initialMessage as TutorMessage };
  } catch (error) {
    return { success: false, error: 'Error al generar mensaje inicial' };
  }
}

// Delete tutor session
export async function deleteTutorSession(
  sessionId: string
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  // Verify session belongs to user before deleting
  const { data: session, error: sessionError } = await supabase
    .from('tutor_sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (sessionError || !session) {
    return { success: false, error: 'Sesión no encontrada' };
  }

  // Delete session (messages will be deleted automatically due to CASCADE)
  const { error: deleteError } = await supabase
    .from('tutor_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', user.id);

  if (deleteError) {
    return { success: false, error: deleteError.message || 'Error al eliminar sesión' };
  }

  revalidatePath('/mentor');
  return { success: true };
}
