'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
  RouteFormData,
  TopicFormData,
  SubtopicFormData,
  SubsubtopicFormData,
  AIGenerateRequest,
  AIGeneratedRoute,
  Difficulty,
  StudyRoute,
} from '@/types/knowledge-hub';

// Create Route
export async function createRoute(formData: RouteFormData): Promise<
  { success: true; data: any } | { success: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const { data, error } = await supabase
    .from('study_routes')
    .insert({
      user_id: user.id,
      title: formData.title,
      description: formData.description || null,
      category: formData.category || null,
      status: formData.status || 'pendiente',
      cover_image_url: formData.cover_image_url || null,
      is_ai_generated: false,
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || 'Error al crear ruta' };
  }

  revalidatePath('/hub');
  return { success: true, data };
}

// Update Route
export async function updateRoute(routeId: string, formData: Partial<RouteFormData>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado' };
  }

  const { data, error } = await supabase
    .from('study_routes')
    .update({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      status: formData.status,
      cover_image_url: formData.cover_image_url,
    })
    .eq('id', routeId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/hub');
  revalidatePath(`/hub/${routeId}`);
  return { success: true, data };
}

// Delete Route
export async function deleteRoute(routeId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado' };
  }

  const { error } = await supabase
    .from('study_routes')
    .delete()
    .eq('id', routeId)
    .eq('user_id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/hub');
  return { success: true };
}

// Toggle Topic Completion
export async function toggleTopicCompletion(topicId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado' };
  }

  // Get current state
  const { data: topic, error: fetchError } = await supabase
    .from('study_topics')
    .select('*, study_routes!inner(user_id)')
    .eq('id', topicId)
    .single();

  if (fetchError || !topic || (topic.study_routes as any).user_id !== user.id) {
    return { error: 'No autorizado' };
  }

  // Check if topic has subtopics
  const { data: subtopics } = await supabase
    .from('study_subtopics')
    .select('id, is_completed')
    .eq('topic_id', topicId);

  const hasSubtopics = subtopics && subtopics.length > 0;
  const allSubtopicsCompleted = subtopics?.every((s) => s.is_completed) ?? true;

  // If trying to mark as completed, verify all subtopics are completed
  if (!topic.is_completed && hasSubtopics && !allSubtopicsCompleted) {
    return { error: 'Todos los subtemas deben estar completados antes de marcar el tema como completado' };
  }

  const { data, error } = await supabase
    .from('study_topics')
    .update({ is_completed: !topic.is_completed })
    .eq('id', topicId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Recalculate progress
  await calculateRouteProgress(topic.route_id);

  revalidatePath(`/hub/${topic.route_id}`);
  return { success: true, data };
}

// Toggle Subtopic Completion
export async function toggleSubtopicCompletion(subtopicId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado' };
  }

  // Get current state and route_id
  const { data: subtopic, error: fetchError } = await supabase
    .from('study_subtopics')
    .select('*, study_topics!inner(id, route_id, study_routes!inner(user_id))')
    .eq('id', subtopicId)
    .single();

  if (
    fetchError ||
    !subtopic ||
    (subtopic.study_topics as any).study_routes.user_id !== user.id
  ) {
    return { error: 'No autorizado' };
  }

  const topicId = (subtopic.study_topics as any).id;
  const routeId = (subtopic.study_topics as any).route_id;
  const newCompletionState = !subtopic.is_completed;

  const { data, error } = await supabase
    .from('study_subtopics')
    .update({ is_completed: newCompletionState })
    .eq('id', subtopicId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Check if all subtopics of the parent topic are completed
  const { data: allSubtopics } = await supabase
    .from('study_subtopics')
    .select('id, is_completed')
    .eq('topic_id', topicId);

  const allSubtopicsCompleted = allSubtopics?.every((s) => s.is_completed) ?? false;
  const hasSubtopics = allSubtopics && allSubtopics.length > 0;

  // Get current topic state
  const { data: topic } = await supabase
    .from('study_topics')
    .select('is_completed')
    .eq('id', topicId)
    .single();

  // Auto-complete topic if all subtopics are completed
  // Auto-uncomplete topic if a subtopic is uncompleted
  if (hasSubtopics && topic) {
    if (allSubtopicsCompleted && !topic.is_completed) {
      // All subtopics completed, mark topic as completed
      await supabase
        .from('study_topics')
        .update({ is_completed: true })
        .eq('id', topicId);
    } else if (!allSubtopicsCompleted && topic.is_completed) {
      // A subtopic was uncompleted, uncomplete the topic
      await supabase
        .from('study_topics')
        .update({ is_completed: false })
        .eq('id', topicId);
    }
  }

  await calculateRouteProgress(routeId);

  revalidatePath(`/hub/${routeId}`);
  return { success: true, data };
}

// Toggle Subsubtopic Completion
export async function toggleSubsubtopicCompletion(subsubtopicId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado' };
  }

  // Get current state and route_id
  const { data: subsubtopic, error: fetchError } = await supabase
    .from('study_subsubtopics')
    .select(
      '*, study_subtopics!inner(id, topic_id, study_topics!inner(route_id, study_routes!inner(user_id)))'
    )
    .eq('id', subsubtopicId)
    .single();

  if (
    fetchError ||
    !subsubtopic ||
    (subsubtopic.study_subtopics as any).study_topics.study_routes.user_id !== user.id
  ) {
    return { error: 'No autorizado' };
  }

  const subtopicId = (subsubtopic.study_subtopics as any).id;
  const routeId = (subsubtopic.study_subtopics as any).study_topics.route_id;
  const newCompletionState = !subsubtopic.is_completed;

  const { data, error } = await supabase
    .from('study_subsubtopics')
    .update({ is_completed: newCompletionState })
    .eq('id', subsubtopicId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Check if all subsubtopics of the parent subtopic are completed
  const { data: allSubsubtopics } = await supabase
    .from('study_subsubtopics')
    .select('id, is_completed')
    .eq('subtopic_id', subtopicId);

  const allSubsubtopicsCompleted = allSubsubtopics?.every((s) => s.is_completed) ?? false;
  const hasSubsubtopics = allSubsubtopics && allSubsubtopics.length > 0;

  // Get current subtopic state
  const { data: subtopic } = await supabase
    .from('study_subtopics')
    .select('is_completed')
    .eq('id', subtopicId)
    .single();

  // Auto-complete subtopic if all subsubtopics are completed
  // Auto-uncomplete subtopic if a subsubtopic is uncompleted
  if (hasSubsubtopics && subtopic) {
    if (allSubsubtopicsCompleted && !subtopic.is_completed) {
      // All subsubtopics completed, mark subtopic as completed
      await supabase
        .from('study_subtopics')
        .update({ is_completed: true })
        .eq('id', subtopicId);
      
      // After marking subtopic as completed, check if all subtopics of the parent topic are completed
      const topicId = (subsubtopic.study_subtopics as any).topic_id;
      const { data: allSubtopics } = await supabase
        .from('study_subtopics')
        .select('id, is_completed')
        .eq('topic_id', topicId);
      
      const allSubtopicsCompleted = allSubtopics?.every((s) => s.is_completed) ?? false;
      const hasSubtopics = allSubtopics && allSubtopics.length > 0;
      
      if (hasSubtopics) {
        const { data: topic } = await supabase
          .from('study_topics')
          .select('is_completed')
          .eq('id', topicId)
          .single();
        
        if (allSubtopicsCompleted && topic && !topic.is_completed) {
          // All subtopics completed, mark topic as completed
          await supabase
            .from('study_topics')
            .update({ is_completed: true })
            .eq('id', topicId);
        } else if (!allSubtopicsCompleted && topic && topic.is_completed) {
          // A subtopic was uncompleted, uncomplete the topic
          await supabase
            .from('study_topics')
            .update({ is_completed: false })
            .eq('id', topicId);
        }
      }
    } else if (!allSubsubtopicsCompleted && subtopic.is_completed) {
      // A subsubtopic was uncompleted, uncomplete the subtopic
      await supabase
        .from('study_subtopics')
        .update({ is_completed: false })
        .eq('id', subtopicId);
      
      // Also uncomplete the parent topic if it was completed
      const topicId = (subsubtopic.study_subtopics as any).topic_id;
      const { data: topic } = await supabase
        .from('study_topics')
        .select('is_completed')
        .eq('id', topicId)
        .single();
      
      if (topic && topic.is_completed) {
        await supabase
          .from('study_topics')
          .update({ is_completed: false })
          .eq('id', topicId);
      }
    }
  }

  await calculateRouteProgress(routeId);

  revalidatePath(`/hub/${routeId}`);
  return { success: true, data };
}

// Create Topic
export async function createTopic(
  routeId: string,
  formData: TopicFormData
): Promise<{ success: true; data: any } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  // Verify route ownership
  const { data: route, error: routeError } = await supabase
    .from('study_routes')
    .select('id')
    .eq('id', routeId)
    .eq('user_id', user.id)
    .single();

  if (routeError || !route) {
    return { success: false, error: 'Ruta no encontrada o no autorizada' };
  }

  // Get current max order_index
  const { data: existingTopics } = await supabase
    .from('study_topics')
    .select('order_index')
    .eq('route_id', routeId)
    .order('order_index', { ascending: false })
    .limit(1);

  const nextOrderIndex = existingTopics && existingTopics.length > 0
    ? existingTopics[0].order_index + 1
    : 0;

  const { data, error } = await supabase
    .from('study_topics')
    .insert({
      route_id: routeId,
      name: formData.name,
      description: formData.description || null,
      content: formData.content || null,
      estimated_time_minutes: formData.estimated_time_minutes || 60,
      difficulty: formData.difficulty || 'medio',
      order_index: formData.order_index ?? nextOrderIndex,
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || 'Error al crear tema' };
  }

  // Recalculate progress
  await calculateRouteProgress(routeId);

  revalidatePath(`/hub/${routeId}`);
  return { success: true, data };
}

// Create Subtopic
export async function createSubtopic(
  topicId: string,
  formData: SubtopicFormData
): Promise<{ success: true; data: any } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  // Verify topic ownership through route
  const { data: topic, error: topicError } = await supabase
    .from('study_topics')
    .select('id, route_id, study_routes!inner(user_id)')
    .eq('id', topicId)
    .single();

  if (topicError || !topic || (topic.study_routes as any).user_id !== user.id) {
    return { success: false, error: 'Tema no encontrado o no autorizado' };
  }

  // Get current max order_index
  const { data: existingSubtopics } = await supabase
    .from('study_subtopics')
    .select('order_index')
    .eq('topic_id', topicId)
    .order('order_index', { ascending: false })
    .limit(1);

  const nextOrderIndex = existingSubtopics && existingSubtopics.length > 0
    ? existingSubtopics[0].order_index + 1
    : 0;

  const { data, error } = await supabase
    .from('study_subtopics')
    .insert({
      topic_id: topicId,
      name: formData.name,
      description: formData.description || null,
      content: formData.content || null,
      estimated_time_minutes: formData.estimated_time_minutes || 60,
      difficulty: formData.difficulty || 'medio',
      order_index: formData.order_index ?? nextOrderIndex,
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || 'Error al crear subtema' };
  }

  // Recalculate progress
  await calculateRouteProgress(topic.route_id);

  revalidatePath(`/hub/${topic.route_id}`);
  return { success: true, data };
}

// Create Subsubtopic
export async function createSubsubtopic(
  subtopicId: string,
  formData: SubsubtopicFormData
): Promise<{ success: true; data: any } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  // Verify subtopic ownership through route
  const { data: subtopic, error: subtopicError } = await supabase
    .from('study_subtopics')
    .select('id, topic_id, study_topics!inner(route_id, study_routes!inner(user_id))')
    .eq('id', subtopicId)
    .single();

  if (
    subtopicError ||
    !subtopic ||
    (subtopic.study_topics as any).study_routes.user_id !== user.id
  ) {
    return { success: false, error: 'Subtema no encontrado o no autorizado' };
  }

  // Get current max order_index
  const { data: existingSubsubtopics } = await supabase
    .from('study_subsubtopics')
    .select('order_index')
    .eq('subtopic_id', subtopicId)
    .order('order_index', { ascending: false })
    .limit(1);

  const nextOrderIndex = existingSubsubtopics && existingSubsubtopics.length > 0
    ? existingSubsubtopics[0].order_index + 1
    : 0;

  const { data, error } = await supabase
    .from('study_subsubtopics')
    .insert({
      subtopic_id: subtopicId,
      name: formData.name,
      description: formData.description || null,
      content: formData.content || null,
      estimated_time_minutes: formData.estimated_time_minutes || 60,
      difficulty: formData.difficulty || 'medio',
      order_index: formData.order_index ?? nextOrderIndex,
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || 'Error al crear sub-subtema' };
  }

  // Recalculate progress
  const routeId = (subtopic.study_topics as any).route_id;
  await calculateRouteProgress(routeId);

  revalidatePath(`/hub/${routeId}`);
  return { success: true, data };
}

// Update Topic
export async function updateTopic(
  topicId: string,
  formData: Partial<TopicFormData>
): Promise<{ success: true; data: any } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  // Verify topic ownership through route
  const { data: topic, error: topicError } = await supabase
    .from('study_topics')
    .select('id, route_id, study_routes!inner(user_id)')
    .eq('id', topicId)
    .single();

  if (topicError || !topic || (topic.study_routes as any).user_id !== user.id) {
    return { success: false, error: 'Tema no encontrado o no autorizado' };
  }

  const updateData: any = {};
  if (formData.name !== undefined) updateData.name = formData.name;
  if (formData.description !== undefined) updateData.description = formData.description || null;
  if (formData.content !== undefined) updateData.content = formData.content || null;
  if (formData.estimated_time_minutes !== undefined) updateData.estimated_time_minutes = formData.estimated_time_minutes;
  if (formData.difficulty !== undefined) updateData.difficulty = formData.difficulty;
  if (formData.order_index !== undefined) updateData.order_index = formData.order_index;

  const { data, error } = await supabase
    .from('study_topics')
    .update(updateData)
    .eq('id', topicId)
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || 'Error al actualizar tema' };
  }

  // Recalculate progress
  await calculateRouteProgress(topic.route_id);

  revalidatePath(`/hub/${topic.route_id}`);
  return { success: true, data };
}

// Update Subtopic
export async function updateSubtopic(
  subtopicId: string,
  formData: Partial<SubtopicFormData>
): Promise<{ success: true; data: any } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  // Verify subtopic ownership through route
  const { data: subtopic, error: subtopicError } = await supabase
    .from('study_subtopics')
    .select('id, topic_id, study_topics!inner(route_id, study_routes!inner(user_id))')
    .eq('id', subtopicId)
    .single();

  if (
    subtopicError ||
    !subtopic ||
    (subtopic.study_topics as any).study_routes.user_id !== user.id
  ) {
    return { success: false, error: 'Subtema no encontrado o no autorizado' };
  }

  const updateData: any = {};
  if (formData.name !== undefined) updateData.name = formData.name;
  if (formData.description !== undefined) updateData.description = formData.description || null;
  if (formData.content !== undefined) updateData.content = formData.content || null;
  if (formData.estimated_time_minutes !== undefined) updateData.estimated_time_minutes = formData.estimated_time_minutes;
  if (formData.difficulty !== undefined) updateData.difficulty = formData.difficulty;
  if (formData.order_index !== undefined) updateData.order_index = formData.order_index;

  const { data, error } = await supabase
    .from('study_subtopics')
    .update(updateData)
    .eq('id', subtopicId)
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || 'Error al actualizar subtema' };
  }

  // Recalculate progress
  const routeId = (subtopic.study_topics as any).route_id;
  await calculateRouteProgress(routeId);

  revalidatePath(`/hub/${routeId}`);
  return { success: true, data };
}

// Update Subsubtopic
export async function updateSubsubtopic(
  subsubtopicId: string,
  formData: Partial<SubsubtopicFormData>
): Promise<{ success: true; data: any } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  // Verify subsubtopic ownership through route
  const { data: subsubtopic, error: subsubtopicError } = await supabase
    .from('study_subsubtopics')
    .select('id, subtopic_id, study_subtopics!inner(topic_id, study_topics!inner(route_id, study_routes!inner(user_id)))')
    .eq('id', subsubtopicId)
    .single();

  if (
    subsubtopicError ||
    !subsubtopic ||
    (subsubtopic.study_subtopics as any).study_topics.study_routes.user_id !== user.id
  ) {
    return { success: false, error: 'Sub-subtema no encontrado o no autorizado' };
  }

  const updateData: any = {};
  if (formData.name !== undefined) updateData.name = formData.name;
  if (formData.description !== undefined) updateData.description = formData.description || null;
  if (formData.content !== undefined) updateData.content = formData.content || null;
  if (formData.estimated_time_minutes !== undefined) updateData.estimated_time_minutes = formData.estimated_time_minutes;
  if (formData.difficulty !== undefined) updateData.difficulty = formData.difficulty;
  if (formData.order_index !== undefined) updateData.order_index = formData.order_index;

  const { data, error } = await supabase
    .from('study_subsubtopics')
    .update(updateData)
    .eq('id', subsubtopicId)
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || 'Error al actualizar sub-subtema' };
  }

  // Recalculate progress
  const routeId = (subsubtopic.study_subtopics as any).study_topics.route_id;
  await calculateRouteProgress(routeId);

  revalidatePath(`/hub/${routeId}`);
  return { success: true, data };
}

// Calculate Route Progress
export async function calculateRouteProgress(routeId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado' };
  }

  // Get all items (topics, subtopics, subsubtopics)
  const { data: topics } = await supabase
    .from('study_topics')
    .select('id, is_completed')
    .eq('route_id', routeId);

  const topicIds = topics?.map((t) => t.id) || [];
  const { data: subtopics } = await supabase
    .from('study_subtopics')
    .select('id, is_completed')
    .in('topic_id', topicIds);

  const subtopicIds = subtopics?.map((s) => s.id) || [];
  const { data: subsubtopics } = await supabase
    .from('study_subsubtopics')
    .select('id, is_completed')
    .in('subtopic_id', subtopicIds);

  // Calculate total and completed
  const totalItems =
    (topics?.length || 0) + (subtopics?.length || 0) + (subsubtopics?.length || 0);
  const completedItems =
    (topics?.filter((t) => t.is_completed).length || 0) +
    (subtopics?.filter((s) => s.is_completed).length || 0) +
    (subsubtopics?.filter((s) => s.is_completed).length || 0);

  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Update route progress
  await supabase
    .from('study_routes')
    .update({ progress })
    .eq('id', routeId)
    .eq('user_id', user.id);

  return { success: true, progress };
}

// Generate Route with AI
export async function generateRouteWithAI(request: AIGenerateRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado' };
  }

  if (!process.env.OPENAI_API_KEY) {
    return { error: 'OpenAI API key no configurada' };
  }

  // Build prompt for OpenAI
  const levelMap = {
    principiante: 'introductorio y básico',
    intermedio: 'universitario y de nivel medio',
    avanzado: 'de especialización y avanzado',
    experto: 'de investigación y nivel experto',
  };

  const formatsText = request.preferredFormats && request.preferredFormats.length > 0
    ? request.preferredFormats
        .map((f) => {
          const map: Record<string, string> = {
            lecturas: 'lecturas y textos',
            videos: 'videos y contenido multimedia',
            cuestionarios: 'cuestionarios y evaluaciones',
            practicas: 'ejercicios prácticos',
          };
          return map[f];
        })
        .join(', ')
    : 'todos los formatos disponibles';

  const prompt = `Eres un experto en diseño de planes de estudio. Genera una ruta de aprendizaje estructurada en formato JSON.

Objetivo del estudiante: ${request.objective}
Temas de interés: ${request.topics.join(', ')}
Nivel: ${levelMap[request.level]}
Tiempo disponible semanal: ${request.weeklyHours} horas
${request.preferredFormats && request.preferredFormats.length > 0 ? `Formatos preferidos: ${formatsText}` : ''}

Genera una estructura jerárquica con:
- Título de la ruta (relevante al objetivo)
- Descripción breve de la ruta
- Categoría (ej: Matemáticas, Ciencias, Medicina, etc.)
- Temas (nivel 1): cada tema debe tener nombre, contenido educativo detallado en HTML, tiempo estimado en minutos (distribuir el tiempo total), dificultad (facil, medio, dificil)
- Subtemas (nivel 2): cada subtema debe tener nombre, contenido educativo detallado en HTML, tiempo estimado, dificultad
- 2do Subtemas (nivel 3): cada 2do subtema debe tener nombre, contenido educativo detallado en HTML, tiempo estimado, dificultad

IMPORTANTE: El campo "content" debe contener contenido educativo detallado y completo en formato HTML (puedes usar párrafos <p>, listas <ul>/<ol>, encabezados <h2>/<h3>, etc.) que explique qué se estudia en ese tema/subtema. No debe estar vacío. Este es el contenido principal que el estudiante verá.

La estructura debe ser completa y educativa. Distribuye el tiempo total de manera realista.

Responde SOLO con un JSON válido en este formato exacto:
{
  "title": "Título de la ruta",
  "description": "Descripción de la ruta",
  "category": "Categoría",
  "topics": [
    {
      "name": "Nombre del tema",
      "content": "<p>Contenido educativo detallado en HTML que explique qué se estudia en este tema. Puedes usar párrafos, listas, encabezados, etc.</p>",
      "estimated_time_minutes": 120,
      "difficulty": "medio",
      "subtopics": [
        {
          "name": "Nombre del subtema",
          "content": "<p>Contenido educativo detallado en HTML que explique qué se estudia en este subtema.</p>",
          "estimated_time_minutes": 60,
          "difficulty": "facil",
          "subsubtopics": [
            {
              "name": "Nombre del 2do subtema",
              "content": "<p>Contenido educativo detallado en HTML que explique qué se estudia en este 2do subtema.</p>",
              "estimated_time_minutes": 30,
              "difficulty": "facil"
            }
          ]
        }
      ]
    }
  ]
}`;

  try {
    // Try with a model that supports json_object
    const requestBody: any = {
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Eres un asistente experto en educación. Genera planes de estudio estructurados y educativos. Responde SOLO con JSON válido, sin markdown, sin explicaciones adicionales. El JSON debe comenzar directamente con { y terminar con }.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    };

    // Only add response_format for models that support it
    // Models that support json_object: gpt-4o, gpt-4-turbo, gpt-3.5-turbo-1106, gpt-4-1106-preview
    if (requestBody.model === 'gpt-4o' || requestBody.model === 'gpt-4-turbo' || requestBody.model === 'gpt-4-1106-preview') {
      requestBody.response_format = { type: 'json_object' };
    }

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
      return { error: `Error de OpenAI: ${error.error?.message || 'Error desconocido'}` };
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return { error: 'No se recibió respuesta de OpenAI' };
    }

    // Parse JSON response
    let aiRoute: AIGeneratedRoute;
    try {
      aiRoute = JSON.parse(content);
    } catch (parseError) {
      return { error: 'Error al parsear respuesta de OpenAI' };
    }

    // Create route in database
    const { data: route, error: routeError } = await supabase
      .from('study_routes')
      .insert({
        user_id: user.id,
        title: aiRoute.title,
        description: aiRoute.description,
        category: aiRoute.category,
        status: 'pendiente',
        is_ai_generated: true,
      })
      .select()
      .single();

    if (routeError || !route) {
      return { error: routeError?.message || 'Error al crear ruta' };
    }

    // Create topics, subtopics, and subsubtopics
    for (let topicIndex = 0; topicIndex < aiRoute.topics.length; topicIndex++) {
      const aiTopic = aiRoute.topics[topicIndex];

      const { data: topic, error: topicError } = await supabase
        .from('study_topics')
        .insert({
          route_id: route.id,
          name: aiTopic.name,
          content: aiTopic.content || null,
          estimated_time_minutes: aiTopic.estimated_time_minutes,
          difficulty: aiTopic.difficulty,
          order_index: topicIndex,
        })
        .select()
        .single();

      if (topicError || !topic) continue;

      // Create subtopics
      for (let subtopicIndex = 0; subtopicIndex < aiTopic.subtopics.length; subtopicIndex++) {
        const aiSubtopic = aiTopic.subtopics[subtopicIndex];

        const { data: subtopic, error: subtopicError } = await supabase
          .from('study_subtopics')
          .insert({
            topic_id: topic.id,
            name: aiSubtopic.name,
            content: aiSubtopic.content || null,
            estimated_time_minutes: aiSubtopic.estimated_time_minutes,
            difficulty: aiSubtopic.difficulty,
            order_index: subtopicIndex,
          })
          .select()
          .single();

        if (subtopicError || !subtopic) continue;

        // Create subsubtopics
        for (
          let subsubtopicIndex = 0;
          subsubtopicIndex < aiSubtopic.subsubtopics.length;
          subsubtopicIndex++
        ) {
          const aiSubsubtopic = aiSubtopic.subsubtopics[subsubtopicIndex];

          await supabase.from('study_subsubtopics').insert({
            subtopic_id: subtopic.id,
            name: aiSubsubtopic.name,
            content: aiSubsubtopic.content || null,
            estimated_time_minutes: aiSubsubtopic.estimated_time_minutes,
            difficulty: aiSubsubtopic.difficulty,
            order_index: subsubtopicIndex,
          });
        }
      }
    }

    // Calculate initial progress
    await calculateRouteProgress(route.id);

    revalidatePath('/hub');
    return { success: true, routeId: route.id };
  } catch (error) {
    console.error('Error generating route with AI:', error);
    return { error: 'Error al generar ruta con IA' };
  }
}

// Remove BOM (Byte Order Mark) if present and clean up text
function cleanCSVText(text: string): string {
  if (!text) return text;
  
  // Remove UTF-8 BOM if present (U+FEFF)
  let cleaned = text;
  if (cleaned.charCodeAt(0) === 0xFEFF) {
    cleaned = cleaned.slice(1);
  }
  
  // Remove any other BOM variants
  cleaned = cleaned.replace(/^\uFEFF/, '');
  
  return cleaned;
}

// Parse CSV data (handles quoted fields with commas or semicolons)
function parseCSV(csvText: string): any[] {
  // Clean the text (remove BOM, etc.)
  const cleanedText = cleanCSVText(csvText);
  
  // Normalize line endings
  const normalizedText = cleanedText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalizedText.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    console.log('CSV parse: Not enough lines', lines.length);
    return [];
  }

  // Detect delimiter (comma or semicolon)
  const headerLine = lines[0];
  const commaCount = (headerLine.match(/,/g) || []).length;
  const semicolonCount = (headerLine.match(/;/g) || []).length;
  const delimiter = semicolonCount > commaCount ? ';' : ',';
  console.log('Detected delimiter:', delimiter);

  // Parse header - handle both quoted and unquoted
  const headers: string[] = [];
  let currentHeader = '';
  let inQuotes = false;
  
  for (let i = 0; i < headerLine.length; i++) {
    const char = headerLine[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      // Don't apply fixEncoding to headers - they should match exactly
      headers.push(currentHeader.trim().replace(/^"|"$/g, '').toLowerCase());
      currentHeader = '';
    } else {
      currentHeader += char;
    }
  }
  // Don't apply fixEncoding to headers - they should match exactly
  headers.push(currentHeader.trim().replace(/^"|"$/g, '').toLowerCase());

  console.log('CSV headers:', headers);
  console.log('Headers normalized:', headers.map(h => h.toLowerCase()));

  // Normalize headers to lowercase for comparison
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  
  // Validate required columns
  const requiredColumns = ['ruta', 'tema'];
  const missingColumns = requiredColumns.filter(col => !normalizedHeaders.includes(col));
  if (missingColumns.length > 0) {
    console.error('Missing required columns:', missingColumns);
    console.error('Available headers:', normalizedHeaders);
    throw new Error(`Faltan columnas requeridas: ${missingColumns.join(', ')}. Columnas encontradas: ${normalizedHeaders.join(', ')}`);
  }

  // Parse rows
  const rows: any[] = [];
  for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    if (!line.trim()) continue;
    
    const values: string[] = [];
    let currentValue = '';
    inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        // Handle escaped quotes ("")
        if (i + 1 < line.length && line[i + 1] === '"' && inQuotes) {
          currentValue += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        // Don't apply any encoding fixes - trust UTF-8 from FileReader
        values.push(currentValue.trim().replace(/^"|"$/g, ''));
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    // Don't apply any encoding fixes - trust UTF-8 from FileReader
    values.push(currentValue.trim().replace(/^"|"$/g, ''));

    const row: any = {};
    headers.forEach((header, index) => {
      // Don't apply any encoding fixes - trust UTF-8 from FileReader
      const value = values[index] || '';
      // Use normalized header name for consistency
      const normalizedHeader = header.toLowerCase().trim();
      row[normalizedHeader] = value;
    });
    
    // Only add row if it has at least a route and topic
    if (row.ruta?.trim() && row.tema?.trim()) {
      rows.push(row);
    } else {
      console.log('Skipping row without route or topic:', row);
    }
  }

  console.log('CSV rows parsed:', rows.length);
  return rows;
}

// Import from CSV
export async function importRoutesFromCSV(csvData: string): Promise<
  { success: true; data: { routesCreated: number; routesUpdated: number } } | { success: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  try {
    // Parse CSV (preserve UTF-8 encoding for special characters)
    const rows = parseCSV(csvData);
    console.log('Parsed rows:', rows.length, 'First row:', rows[0]);
    // Verify UTF-8 encoding is preserved
    if (rows.length > 0 && rows[0].tema) {
      console.log('Sample topic name (UTF-8 check):', rows[0].tema);
    }
    
    if (rows.length === 0) {
      return { success: false, error: 'El archivo CSV está vacío o no tiene el formato correcto. Asegúrate de que tenga las columnas: ruta, tema' };
    }

    // Group by route
    const routesMap = new Map<string, any[]>();
    for (const row of rows) {
      const routeName = row.ruta?.trim();
      if (!routeName) {
        console.log('Skipping row without route name:', row);
        continue; // Skip rows without route name
      }
      if (!routesMap.has(routeName)) {
        routesMap.set(routeName, []);
      }
      routesMap.get(routeName)!.push(row);
    }

    console.log('Routes found:', routesMap.size);

    let routesCreated = 0;
    let routesUpdated = 0;

    // Process each route
    for (const [routeName, routeRows] of routesMap.entries()) {
      console.log(`Processing route: ${routeName} with ${routeRows.length} rows`);
      
      // Find or create route
      const { data: existingRoute, error: routeFetchError } = await supabase
        .from('study_routes')
        .select('id')
        .eq('user_id', user.id)
        .eq('title', routeName)
        .maybeSingle();
      
      if (routeFetchError && routeFetchError.code !== 'PGRST116') {
        console.error('Error fetching route:', routeFetchError);
        continue;
      }

      let routeId: string;

      if (existingRoute) {
        routeId = existingRoute.id;
        routesUpdated++;
        console.log(`Route exists: ${routeName}, ID: ${routeId}`);
      } else {
        const objetivoRuta = routeRows[0]?.objetivo_ruta?.trim() || null;
        const { data: newRoute, error: routeError } = await supabase
          .from('study_routes')
          .insert({
            user_id: user.id,
            title: routeName,
            description: objetivoRuta,
            status: 'pendiente',
            is_ai_generated: false,
          })
          .select()
          .single();

        if (routeError || !newRoute) {
          console.error('Error creating route:', routeError);
          continue; // Skip this route if creation failed
        }
        routeId = newRoute.id;
        routesCreated++;
        console.log(`Route created: ${routeName}, ID: ${routeId}`);
      }

      // Group by topic within route
      const topicsMap = new Map<string, any[]>();
      for (const row of routeRows) {
        const topicName = row.tema?.trim();
        if (!topicName) {
          continue; // Skip rows without topic name
        }
        if (!topicsMap.has(topicName)) {
          topicsMap.set(topicName, []);
        }
        topicsMap.get(topicName)!.push(row);
      }

      // Process each topic
      for (const [topicName, topicRows] of topicsMap.entries()) {
        // Find or create topic
        let { data: existingTopic } = await supabase
          .from('study_topics')
          .select('id')
          .eq('route_id', routeId)
          .eq('name', topicName)
          .single();

        let topicId: string;

        if (existingTopic) {
          topicId = existingTopic.id;
          // Update topic content if provided
          const firstRow = topicRows[0];
          if (firstRow.contenido_intro_tema?.trim()) {
            await supabase
              .from('study_topics')
              .update({ content: firstRow.contenido_intro_tema.trim() })
              .eq('id', topicId);
          }
        } else {
          const firstRow = topicRows[0];
          const tiempoEstimado = firstRow.tiempo_estimado 
            ? Math.max(15, Math.min(480, parseInt(firstRow.tiempo_estimado) || 60))
            : 60;
          // Map difficulty values (alta/media/baja -> dificil/medio/facil)
          const dificultadRaw = firstRow.dificultad?.toLowerCase() || '';
          let dificultad: Difficulty = 'medio';
          if (['facil', 'medio', 'dificil'].includes(dificultadRaw)) {
            dificultad = dificultadRaw as Difficulty;
          } else if (dificultadRaw === 'baja' || dificultadRaw === 'low') {
            dificultad = 'facil';
          } else if (dificultadRaw === 'media' || dificultadRaw === 'medium' || dificultadRaw === 'intermedia') {
            dificultad = 'medio';
          } else if (dificultadRaw === 'alta' || dificultadRaw === 'high') {
            dificultad = 'dificil';
          }

          // Get max order_index
          const { data: existingTopics } = await supabase
            .from('study_topics')
            .select('order_index')
            .eq('route_id', routeId)
            .order('order_index', { ascending: false })
            .limit(1);
          const nextOrderIndex = existingTopics && existingTopics.length > 0 ? existingTopics[0].order_index + 1 : 0;

          const { data: newTopic, error: topicError } = await supabase
            .from('study_topics')
            .insert({
              route_id: routeId,
              name: topicName,
              content: firstRow.contenido_intro_tema?.trim() || null,
              estimated_time_minutes: tiempoEstimado,
              difficulty: dificultad as Difficulty,
              order_index: nextOrderIndex,
            })
            .select()
            .single();

          if (topicError || !newTopic) {
            continue; // Skip this topic if creation failed
          }
          topicId = newTopic.id;
        }

        // Process subtopics
        const subtopicsMap = new Map<string, any[]>();
        for (const row of topicRows) {
          const subtopicName = row.subtema?.trim();
          if (!subtopicName) {
            continue; // Skip rows without subtopic name
          }
          if (!subtopicsMap.has(subtopicName)) {
            subtopicsMap.set(subtopicName, []);
          }
          subtopicsMap.get(subtopicName)!.push(row);
        }

        // Process each subtopic
        for (const [subtopicName, subtopicRows] of subtopicsMap.entries()) {
          // Find or create subtopic
          let { data: existingSubtopic } = await supabase
            .from('study_subtopics')
            .select('id')
            .eq('topic_id', topicId)
            .eq('name', subtopicName)
            .single();

          let subtopicId: string;

          if (existingSubtopic) {
            subtopicId = existingSubtopic.id;
            // Update subtopic content if provided
            const firstRow = subtopicRows[0];
            if (firstRow.contenido_subtema?.trim()) {
              await supabase
                .from('study_subtopics')
                .update({ content: firstRow.contenido_subtema.trim() })
                .eq('id', subtopicId);
            }
          } else {
            const firstRow = subtopicRows[0];
            const tiempoEstimado = firstRow.tiempo_estimado 
              ? Math.max(15, Math.min(480, parseInt(firstRow.tiempo_estimado) || 60))
              : 60;
            // Map difficulty values (alta/media/baja -> dificil/medio/facil)
            const dificultadRaw = firstRow.dificultad?.toLowerCase() || '';
            let dificultad: Difficulty = 'medio';
            if (['facil', 'medio', 'dificil'].includes(dificultadRaw)) {
              dificultad = dificultadRaw as Difficulty;
            } else if (dificultadRaw === 'baja' || dificultadRaw === 'low') {
              dificultad = 'facil';
            } else if (dificultadRaw === 'media' || dificultadRaw === 'medium' || dificultadRaw === 'intermedia') {
              dificultad = 'medio';
            } else if (dificultadRaw === 'alta' || dificultadRaw === 'high') {
              dificultad = 'dificil';
            }

            // Get max order_index
            const { data: existingSubtopics } = await supabase
              .from('study_subtopics')
              .select('order_index')
              .eq('topic_id', topicId)
              .order('order_index', { ascending: false })
              .limit(1);
            const nextOrderIndex = existingSubtopics && existingSubtopics.length > 0 ? existingSubtopics[0].order_index + 1 : 0;

            const { data: newSubtopic, error: subtopicError } = await supabase
              .from('study_subtopics')
              .insert({
                topic_id: topicId,
                name: subtopicName,
                content: firstRow.contenido_subtema?.trim() || null,
                estimated_time_minutes: tiempoEstimado,
                difficulty: dificultad as Difficulty,
                order_index: nextOrderIndex,
              })
              .select()
              .single();

            if (subtopicError || !newSubtopic) {
              continue; // Skip this subtopic if creation failed
            }
            subtopicId = newSubtopic.id;
          }

          // Process sub-subtopics
          for (const row of subtopicRows) {
            const subsubtopicName = row.sub_subtema?.trim();
            if (!subsubtopicName) {
              continue; // Skip rows without sub-subtopic name
            }

            // Check if sub-subtopic already exists
            const { data: existingSubsubtopic } = await supabase
              .from('study_subsubtopics')
              .select('id')
              .eq('subtopic_id', subtopicId)
              .eq('name', subsubtopicName)
              .single();

            if (existingSubsubtopic) {
              // Update content if provided
              if (row.contenido_sub_subtema?.trim()) {
                await supabase
                  .from('study_subsubtopics')
                  .update({ content: row.contenido_sub_subtema.trim() })
                  .eq('id', existingSubsubtopic.id);
              }
            } else {
              const tiempoEstimado = row.tiempo_estimado 
                ? Math.max(15, Math.min(480, parseInt(row.tiempo_estimado) || 60))
                : 60;
              // Map difficulty values (alta/media/baja -> dificil/medio/facil)
              const dificultadRaw = row.dificultad?.toLowerCase() || '';
              let dificultad: Difficulty = 'medio';
              if (['facil', 'medio', 'dificil'].includes(dificultadRaw)) {
                dificultad = dificultadRaw as Difficulty;
              } else if (dificultadRaw === 'baja' || dificultadRaw === 'low') {
                dificultad = 'facil';
              } else if (dificultadRaw === 'media' || dificultadRaw === 'medium' || dificultadRaw === 'intermedia') {
                dificultad = 'medio';
              } else if (dificultadRaw === 'alta' || dificultadRaw === 'high') {
                dificultad = 'dificil';
              }

              // Get max order_index
              const { data: existingSubsubtopics } = await supabase
                .from('study_subsubtopics')
                .select('order_index')
                .eq('subtopic_id', subtopicId)
                .order('order_index', { ascending: false })
                .limit(1);
              const nextOrderIndex = existingSubsubtopics && existingSubsubtopics.length > 0 ? existingSubsubtopics[0].order_index + 1 : 0;

              await supabase
                .from('study_subsubtopics')
                .insert({
                  subtopic_id: subtopicId,
                  name: subsubtopicName,
                  content: row.contenido_sub_subtema?.trim() || null,
                  estimated_time_minutes: tiempoEstimado,
                  difficulty: dificultad as Difficulty,
                  order_index: nextOrderIndex,
                });
            }
          }
        }
      }

      // Recalculate progress for the route
      await calculateRouteProgress(routeId);
    }

    revalidatePath('/hub');
    return { 
      success: true, 
      data: { 
        routesCreated, 
        routesUpdated 
      } 
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al procesar el archivo CSV' };
  }
}

// Plan Route in Calendar (Placeholder)
export async function planRouteInCalendar(
  routeId: string
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  // TODO: Implement calendar integration (Google Calendar, iCal, etc.)
  console.warn('Calendar integration is a placeholder and not fully implemented.');
  return { success: true };
}

// Get Route for Editing
export async function getRouteForEdit(
  routeId: string
): Promise<{ success: true; data: StudyRoute } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const { data, error } = await supabase
    .from('study_routes')
    .select('*')
    .eq('id', routeId)
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || 'Ruta no encontrada' };
  }

  return { success: true, data: data as StudyRoute };
}

