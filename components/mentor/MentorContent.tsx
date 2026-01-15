'use client';

import { useState, useEffect } from 'react';
import { MentorSessionsSidebar } from './MentorSessionsSidebar';
import { MentorChatArea } from './MentorChatArea';
import { CreateSessionModal } from './CreateSessionModal';
import { useTutorSessions } from '@/hooks/useTutor';

export function MentorContent() {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: sessions, isLoading } = useTutorSessions();

  // Auto-select first session if available
  useEffect(() => {
    if (sessions && sessions.length > 0 && !selectedSession) {
      setSelectedSession(sessions[0].id);
    }
  }, [sessions, selectedSession]);

  const currentSession = sessions?.find((s) => s.id === selectedSession) || null;

  const handleSessionCreated = (sessionId: string) => {
    setSelectedSession(sessionId);
    setIsCreateModalOpen(false);
  };

  const handleSessionDeleted = () => {
    // Select first available session or null
    if (sessions && sessions.length > 1) {
      const remainingSessions = sessions.filter((s) => s.id !== selectedSession);
      setSelectedSession(remainingSessions[0]?.id || null);
    } else {
      setSelectedSession(null);
    }
  };

  return (
    <>
      <div className="flex h-full w-full">
        <MentorSessionsSidebar
          sessions={sessions || []}
          selectedSession={selectedSession}
          onSelectSession={setSelectedSession}
          onCreateSession={() => setIsCreateModalOpen(true)}
          isLoading={isLoading}
        />
        <MentorChatArea session={currentSession} onSessionDeleted={handleSessionDeleted} />
      </div>
      <CreateSessionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSessionCreated={handleSessionCreated}
      />
    </>
  );
}
