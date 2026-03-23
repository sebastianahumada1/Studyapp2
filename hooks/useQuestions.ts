import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Question, QuestionWithHierarchy, QuestionFormData } from '@/types/questions';

// Fetch all questions for the user with hierarchy
export function useQuestions() {
  return useQuery({
    queryKey: ['questions'],
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('No autenticado');

      // Fetch questions with related hierarchy data
      const { data: questions, error } = await supabase
        .from('questions')
        .select(`
          *,
          route:study_routes(id, title),
          topic:study_topics(id, name),
          subtopic:study_subtopics(id, name),
          subsubtopic:study_subsubtopics(id, name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match QuestionWithHierarchy interface
      return (questions || []).map((q: any) => {
        // Parse options if it's a string
        let options = q.options;
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

        return {
          ...q,
          options,
          route: q.route ? { id: q.route.id, title: q.route.title } : undefined,
          topic: q.topic ? { id: q.topic.id, name: q.topic.name } : undefined,
          subtopic: q.subtopic ? { id: q.subtopic.id, name: q.subtopic.name } : undefined,
          subsubtopic: q.subsubtopic ? { id: q.subsubtopic.id, name: q.subsubtopic.name } : undefined,
        } as QuestionWithHierarchy;
      });
    },
  });
}

// Fetch a single question by ID
export function useQuestion(questionId: string) {
  return useQuery({
    queryKey: ['question', questionId],
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('No autenticado');

      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          route:study_routes(id, title),
          topic:study_topics(id, name),
          subtopic:study_subtopics(id, name),
          subsubtopic:study_subsubtopics(id, name)
        `)
        .eq('id', questionId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Parse options if it's a string
      let options = data.options;
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

      return {
        ...data,
        options,
        route: data.route ? { id: data.route.id, title: data.route.title } : undefined,
        topic: data.topic ? { id: data.topic.id, name: data.topic.name } : undefined,
        subtopic: data.subtopic ? { id: data.subtopic.id, name: data.subtopic.name } : undefined,
        subsubtopic: data.subsubtopic ? { id: data.subsubtopic.id, name: data.subsubtopic.name } : undefined,
      } as QuestionWithHierarchy;
    },
    enabled: !!questionId,
  });
}
