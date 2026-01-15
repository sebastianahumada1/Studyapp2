'use client';

import { useState, useEffect, useRef } from 'react';
import { MentorMessage } from './MentorMessage';
import { MentorInput } from './MentorInput';
import { useTutorSession, useTutorMessages, useSendTutorMessage, useDeleteTutorSession } from '@/hooks/useTutor';
import type { TutorMessage as TutorMessageType } from '@/types/tutor';

interface MentorChatAreaProps {
  session: {
    id: string;
    objective: string;
    tutor_role: string;
    subtopic_name?: string | null;
    topic_name?: string | null;
    route_title?: string | null;
  } | null;
  onSessionDeleted?: () => void;
}

export function MentorChatArea({ session, onSessionDeleted }: MentorChatAreaProps) {
  const [isTyping, setIsTyping] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendMessage = useSendTutorMessage();
  const deleteSession = useDeleteTutorSession();

  const { data: sessionData } = useTutorSession(session?.id || null);
  const { data: messages = [], isLoading } = useTutorMessages(session?.id || null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string) => {
    if (!session?.id) return;

    setIsTyping(true);

    try {
      // Build conversation history
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      await sendMessage.mutateAsync({
        sessionId: session.id,
        message: content,
        conversationHistory,
      });
    } catch (error: any) {
      alert(error.message || 'Error al enviar mensaje');
    } finally {
      setIsTyping(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!session?.id) return;

    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      await deleteSession.mutateAsync(session.id);
      setShowDeleteConfirm(false);
      if (onSessionDeleted) {
        onSessionDeleted();
      }
    } catch (error: any) {
      alert(error.message || 'Error al eliminar sesión');
      setShowDeleteConfirm(false);
    }
  };

  // Format messages for display
  const formattedMessages: Array<{
    id: string;
    role: 'tutor' | 'user';
    content: string;
    timestamp: string;
    isTyping?: boolean;
  }> = messages.map((msg) => ({
    id: msg.id,
    role: msg.role === 'assistant' ? 'tutor' : 'user',
    content: msg.content,
    timestamp: new Date(msg.created_at).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  }));

  if (isTyping) {
    formattedMessages.push({
      id: 'typing',
      role: 'tutor',
      content: '',
      timestamp: '',
      isTyping: true,
    });
  }

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background-dark">
        <p className="text-text-muted">Selecciona una sesión para comenzar</p>
      </div>
    );
  }

  const tutorTopic =
    session.subtopic_name || session.topic_name || session.route_title || 'IA';
  const tutorSpecialty = session.subtopic_name
    ? `${session.topic_name || ''} - ${session.subtopic_name}`
    : session.topic_name || session.route_title || 'Especialista en múltiples temas';

  return (
    <main className="flex-1 flex flex-col relative bg-background-dark">
      {/* Grid Pattern Background */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(13, 242, 242, 0.05) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Header */}
      <header className="h-20 bg-background-dark/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 z-10">
        <div className="flex items-center gap-4">
          <div className="size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-xl">smart_toy</span>
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-white leading-tight">
              Tutor {tutorTopic}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="size-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
              <span className="text-xs text-primary font-medium tracking-wide">
                {tutorSpecialty}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[11px] items-center gap-2">
            <span className="text-primary font-bold">OBJETIVO:</span>
            <span className="text-text-muted uppercase tracking-widest">
              {session.objective.substring(0, 30)}
              {session.objective.length > 30 ? '...' : ''}
            </span>
          </div>
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-text-muted hover:text-white hover:bg-white/10 transition-all text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteSession}
                disabled={deleteSession.isPending}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteSession.isPending ? 'Eliminando...' : 'Confirmar'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleDeleteSession}
              className="p-2 rounded-lg bg-white/5 text-text-muted hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all"
              title="Eliminar sesión"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          )}
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 flex flex-col gap-6 z-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-text-muted">Cargando mensajes...</p>
          </div>
        ) : formattedMessages.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-text-muted">No hay mensajes aún. Comienza la conversación.</p>
          </div>
        ) : (
          <>
            {formattedMessages.map((message) => (
              <MentorMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Footer */}
      <MentorInput onSendMessage={handleSendMessage} />
    </main>
  );
}
