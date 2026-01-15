'use client';

import { useState } from 'react';
import { formatRelativeTime } from '@/lib/tutor';
import type { TutorSessionWithLastMessage } from '@/types/tutor';

interface MentorSessionsSidebarProps {
  sessions: TutorSessionWithLastMessage[];
  selectedSession: string | null;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: () => void;
  isLoading?: boolean;
}

export function MentorSessionsSidebar({
  sessions,
  selectedSession,
  onSelectSession,
  onCreateSession,
  isLoading,
}: MentorSessionsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter((session) => {
    const searchLower = searchQuery.toLowerCase();
    const title = session.objective.toLowerCase();
    const lastMessage = session.last_message?.toLowerCase() || '';
    return title.includes(searchLower) || lastMessage.includes(searchLower);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-green-500';
      case 'created':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-slate-600';
      default:
        return 'bg-slate-600';
    }
  };

  const getIcon = (session: TutorSessionWithLastMessage) => {
    if (session.subtopic_name) return 'terminal';
    if (session.topic_name) return 'database';
    if (session.route_title) return 'school';
    return 'chat_bubble';
  };

  const getTitle = (session: TutorSessionWithLastMessage) => {
    if (session.subtopic_name) return session.subtopic_name;
    if (session.topic_name) return session.topic_name;
    if (session.route_title) return session.route_title;
    return session.objective.substring(0, 50) + (session.objective.length > 50 ? '...' : '');
  };

  return (
    <aside className="w-[30%] min-w-[320px] max-w-[400px] flex flex-col border-r border-white/5 bg-background-dark">
      <header className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-xl font-bold text-white tracking-tight">Sesiones</h1>
          <button
            onClick={onCreateSession}
            className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"
          >
            <span className="material-symbols-outlined text-lg">add_comment</span>
          </button>
        </div>
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
            search
          </span>
          <input
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all text-white placeholder:text-text-muted"
            placeholder="Buscar tutoría..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1 pb-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-text-muted">Cargando sesiones...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-text-muted text-center">
              {searchQuery ? 'No se encontraron sesiones' : 'No hay sesiones. Crea una nueva.'}
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isSelected = session.id === selectedSession;
            const icon = getIcon(session);
            const title = getTitle(session);
            const timestamp = session.last_message_at
              ? formatRelativeTime(session.last_message_at)
              : formatRelativeTime(session.created_at);

            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`group flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-primary/5 border border-primary/20 hover:bg-primary/10'
                    : 'border border-transparent hover:bg-white/5'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div
                    className={`size-12 rounded-xl flex items-center justify-center border text-primary ${
                      isSelected
                        ? 'bg-primary/20 border-primary/30'
                        : 'bg-slate-800/50 border-white/5 text-text-muted group-hover:text-primary transition-colors'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">{icon}</span>
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-background-dark ${getStatusColor(
                      session.status
                    )}`}
                  ></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3
                      className={`font-display text-sm truncate ${
                        isSelected
                          ? 'font-semibold text-white'
                          : 'font-medium text-text-muted group-hover:text-white transition-colors'
                      }`}
                    >
                      {title}
                    </h3>
                    <span className="text-[10px] text-text-muted whitespace-nowrap ml-2">
                      {timestamp}
                    </span>
                  </div>
                  <p
                    className={`text-xs truncate font-body ${
                      isSelected ? 'text-text-muted' : 'text-text-muted'
                    }`}
                  >
                    {session.last_message || 'Sin mensajes'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
