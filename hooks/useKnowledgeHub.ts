import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type {
  StudyRoute,
  RouteWithTree,
  TopicWithChildren,
} from '@/types/knowledge-hub';
import {
  createRoute,
  updateRoute,
  deleteRoute,
  toggleTopicCompletion,
  toggleSubtopicCompletion,
  toggleSubsubtopicCompletion,
  createTopic,
  createSubtopic,
  createSubsubtopic,
  updateTopic,
  updateSubtopic,
  updateSubsubtopic,
} from '@/app/actions/knowledge-hub';
import type { TopicFormData, SubtopicFormData, SubsubtopicFormData } from '@/types/knowledge-hub';
import { buildRouteTree } from '@/lib/knowledge-hub';

// Fetch all routes for the user
export function useRoutes() {
  return useQuery({
    queryKey: ['routes'],
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('No autenticado');

      const { data, error } = await supabase
        .from('study_routes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as StudyRoute[];
    },
  });
}

// Fetch a single route with full tree
export function useRoute(routeId: string) {
  return useQuery({
    queryKey: ['route', routeId],
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('No autenticado');

      // Fetch route
      const { data: route, error: routeError } = await supabase
        .from('study_routes')
        .select('*')
        .eq('id', routeId)
        .eq('user_id', user.id)
        .single();

      if (routeError || !route) throw routeError || new Error('Ruta no encontrada');

      // Fetch topics
      const { data: topics, error: topicsError } = await supabase
        .from('study_topics')
        .select('*')
        .eq('route_id', routeId)
        .order('order_index');

      if (topicsError) throw topicsError;

      const topicIds = topics?.map((t) => t.id) || [];

      // Fetch subtopics
      const { data: subtopics, error: subtopicsError } = await supabase
        .from('study_subtopics')
        .select('*')
        .in('topic_id', topicIds)
        .order('order_index');

      if (subtopicsError) throw subtopicsError;

      const subtopicIds = subtopics?.map((s) => s.id) || [];

      // Fetch subsubtopics
      const { data: subsubtopics, error: subsubtopicsError } = await supabase
        .from('study_subsubtopics')
        .select('*')
        .in('subtopic_id', subtopicIds)
        .order('order_index');

      if (subsubtopicsError) throw subsubtopicsError;

      // Build tree
      return buildRouteTree(
        route,
        topics || [],
        subtopics || [],
        subsubtopics || []
      ) as RouteWithTree;
    },
    enabled: !!routeId,
  });
}

// Calculate route progress reactively
export function useRouteProgress(routeId: string) {
  const { data: route } = useRoute(routeId);

  if (!route) {
    return { progress: 0, totalItems: 0, completedItems: 0 };
  }

  // Flatten all items
  const allItems: Array<{ is_completed: boolean }> = [];
  route.topics.forEach((topic) => {
    allItems.push(topic);
    topic.subtopics.forEach((subtopic) => {
      allItems.push(subtopic);
      subtopic.subsubtopics.forEach((subsubtopic) => {
        allItems.push(subsubtopic);
      });
    });
  });

  const totalItems = allItems.length;
  const completedItems = allItems.filter((item) => item.is_completed).length;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return { progress, totalItems, completedItems };
}

// Mutations
export function useCreateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
}

export function useUpdateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ routeId, data }: { routeId: string; data: Parameters<typeof updateRoute>[1] }) =>
      updateRoute(routeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['route', variables.routeId] });
    },
  });
}

export function useDeleteRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
}

export function useToggleTopicCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleTopicCompletion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      // Invalidate all route queries to update progress
      queryClient.invalidateQueries({ queryKey: ['route'] });
    },
  });
}

export function useToggleSubtopicCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleSubtopicCompletion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['route'] });
    },
  });
}

export function useToggleSubsubtopicCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleSubsubtopicCompletion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['route'] });
    },
  });
}

export function useCreateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ routeId, formData }: { routeId: string; formData: TopicFormData }) =>
      createTopic(routeId, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['route', variables.routeId] });
    },
  });
}

export function useCreateSubtopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ topicId, formData }: { topicId: string; formData: SubtopicFormData }) =>
      createSubtopic(topicId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['route'] });
    },
  });
}

export function useCreateSubsubtopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subtopicId, formData }: { subtopicId: string; formData: SubsubtopicFormData }) =>
      createSubsubtopic(subtopicId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['route'] });
    },
  });
}

export function useUpdateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ topicId, formData }: { topicId: string; formData: Partial<TopicFormData> }) =>
      updateTopic(topicId, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['route'] });
    },
  });
}

export function useUpdateSubtopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subtopicId, formData }: { subtopicId: string; formData: Partial<SubtopicFormData> }) =>
      updateSubtopic(subtopicId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['route'] });
    },
  });
}

export function useUpdateSubsubtopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subsubtopicId, formData }: { subsubtopicId: string; formData: Partial<SubsubtopicFormData> }) =>
      updateSubsubtopic(subsubtopicId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['route'] });
    },
  });
}

