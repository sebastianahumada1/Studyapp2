import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import {
  createTutorSession,
  getTutorSessions,
  getTutorSession,
  getTutorMessages,
  generateInitialMessage,
  deleteTutorSession,
} from '@/app/actions/tutor';
import type {
  CreateTutorSessionRequest,
  TutorSession,
  TutorMessage,
  TutorSessionWithLastMessage,
  TutorChatRequest,
  TutorChatResponse,
} from '@/types/tutor';

// Fetch all tutor sessions
export function useTutorSessions() {
  return useQuery({
    queryKey: ['tutor-sessions'],
    queryFn: async () => {
      const result = await getTutorSessions();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}

// Fetch single tutor session
export function useTutorSession(sessionId: string | null) {
  return useQuery({
    queryKey: ['tutor-session', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const result = await getTutorSession(sessionId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!sessionId,
  });
}

// Fetch messages for a session
export function useTutorMessages(sessionId: string | null) {
  return useQuery({
    queryKey: ['tutor-messages', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const result = await getTutorMessages(sessionId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!sessionId,
  });
}

// Create tutor session mutation
export function useCreateTutorSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateTutorSessionRequest) => {
      const result = await createTutorSession(request);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: async (data) => {
      // Invalidate sessions list
      await queryClient.invalidateQueries({ queryKey: ['tutor-sessions'] });

      // Generate initial message
      const initialMessageResult = await generateInitialMessage(data.id);
      if (initialMessageResult.success) {
        // Invalidate messages for this session
        await queryClient.invalidateQueries({ queryKey: ['tutor-messages', data.id] });
        await queryClient.invalidateQueries({ queryKey: ['tutor-session', data.id] });
      }
    },
  });
}

// Send tutor message mutation
export function useSendTutorMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: TutorChatRequest): Promise<TutorChatResponse> => {
      const response = await fetch('/api/ai/tutor-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al enviar mensaje');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate messages for this session
      queryClient.invalidateQueries({ queryKey: ['tutor-messages', variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['tutor-session', variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['tutor-sessions'] });
    },
  });
}

// Delete tutor session mutation
export function useDeleteTutorSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const result = await deleteTutorSession(sessionId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      // Invalidate all tutor-related queries
      queryClient.invalidateQueries({ queryKey: ['tutor-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['tutor-session'] });
      queryClient.invalidateQueries({ queryKey: ['tutor-messages'] });
    },
  });
}
