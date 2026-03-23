'use client';

import { useState } from 'react';
import { useRoute, useRouteProgress } from '@/hooks/useKnowledgeHub';
import { RouteTreeNavigator } from './RouteTreeNavigator';
import { formatEstimatedTime, getDifficultyLabel, getDifficultyColor } from '@/lib/knowledge-hub';
import { CreateTopicModal } from './CreateTopicModal';
import { CreateSubtopicModal } from './CreateSubtopicModal';
import { CreateSubsubtopicModal } from './CreateSubsubtopicModal';
import { EditContentPanel } from './EditContentPanel';

interface RouteDetailContentProps {
  routeId: string;
}

export function RouteDetailContent({ routeId }: RouteDetailContentProps) {
  const { data: route, isLoading } = useRoute(routeId);
  const { progress } = useRouteProgress(routeId);
  const [activeTopicId, setActiveTopicId] = useState<string | undefined>();
  const [activeSubtopicId, setActiveSubtopicId] = useState<string | undefined>();
  const [activeSubsubtopicId, setActiveSubsubtopicId] = useState<string | undefined>();
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showSubtopicModal, setShowSubtopicModal] = useState(false);
  const [showSubsubtopicModal, setShowSubsubtopicModal] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string | undefined>();
  const [selectedSubtopicId, setSelectedSubtopicId] = useState<string | undefined>();
  const [showEditPanel, setShowEditPanel] = useState(false);

  if (isLoading || !route) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-secondary">Cargando ruta...</div>
      </div>
    );
  }

  // Find active content - prioritize by explicit selection
  const activeTopic = activeTopicId 
    ? route.topics.find((t) => t.id === activeTopicId) 
    : route.topics[0];
  
  // Only get subtopic if explicitly selected
  const activeSubtopic = activeSubtopicId && activeTopic
    ? activeTopic.subtopics.find((s) => s.id === activeSubtopicId)
    : undefined;
  
  // Only get subsubtopic if explicitly selected
  const activeSubsubtopic = activeSubsubtopicId && activeSubtopic
    ? activeSubtopic.subsubtopics.find((s) => s.id === activeSubsubtopicId)
    : undefined;

  // Display priority: subsubtopic > subtopic > topic
  // Only show content if explicitly selected
  const displayContent = activeSubsubtopic 
    || activeSubtopic 
    || activeTopic;
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="h-full flex flex-col min-w-0 bg-background-light dark:bg-background-dark overflow-hidden relative">
      {/* Header */}
      <header 
        className="w-full flex-shrink-0 z-10"
        style={{
          backgroundColor: 'rgb(19, 28, 46)', // surface-dark
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '2rem 3rem',
        }}
      >
        <div className="max-w-[1400px] mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 
                  className="text-3xl font-bold tracking-tight"
                  style={{ color: '#ffffff' }}
                >
                  {route.title}
                </h1>
                {route.is_ai_generated && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-primary/20 to-purple-500/20 text-primary border border-primary/20">
                    Generado por IA
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 flex flex-col gap-2">
            <div className="flex justify-between items-end text-sm">
              <span style={{ color: '#94a3b8' }}>Progreso General</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-primary">{clampedProgress}%</span>
                <span style={{ color: '#94a3b8' }} className="text-xs">Completado</span>
              </div>
            </div>
            <div 
              className="h-1.5 w-full rounded-full overflow-hidden"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
            >
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full shadow-[0_0_10px_rgba(13,242,242,0.5)] transition-all duration-300"
                style={{ width: `${clampedProgress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Content Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="max-w-[1400px] mx-auto w-full flex h-full">
          {/* Tree Navigator Sidebar */}
          <RouteTreeNavigator
            route={route}
            activeTopicId={activeTopicId || activeTopic?.id}
            activeSubtopicId={activeSubtopicId || activeSubtopic?.id}
            activeSubsubtopicId={activeSubsubtopicId || activeSubsubtopic?.id}
            onTopicClick={(topicId) => {
              setActiveTopicId(topicId);
              setActiveSubtopicId(undefined);
              setActiveSubsubtopicId(undefined);
            }}
            onSubtopicClick={(subtopicId) => {
              setActiveSubtopicId(subtopicId);
              setActiveSubsubtopicId(undefined);
            }}
            onSubsubtopicClick={setActiveSubsubtopicId}
            onAddTopic={() => setShowTopicModal(true)}
            onAddSubtopic={(topicId) => {
              setSelectedTopicId(topicId);
              setShowSubtopicModal(true);
            }}
            onAddSubsubtopic={(subtopicId) => {
              setSelectedSubtopicId(subtopicId);
              setShowSubsubtopicModal(true);
            }}
          />

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto relative" style={{ padding: '2rem 3rem' }}>

            <div className="max-w-4xl mx-auto relative z-10">
              {/* Main Content Card */}
              {displayContent && (
                <div 
                  className="border rounded-2xl shadow-xl mb-6 overflow-hidden"
                  style={{
                    backgroundColor: 'rgb(28, 42, 66)', // surface-highlight
                    borderColor: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div style={{ 
                    padding: '3rem 3.5rem', 
                    position: 'relative',
                  }}>
                    {/* Edit Button - Top Right */}
                    <button 
                      type="button"
                      className="absolute inline-flex items-center px-4 py-2 rounded-lg border font-semibold transition-colors"
                      style={{ 
                        position: 'absolute',
                        top: '1.5rem',
                        right: '1.5rem',
                        WebkitAppearance: 'none',
                        appearance: 'none',
                        WebkitTapHighlightColor: 'transparent',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        color: '#cbd5e1',
                        backgroundColor: 'transparent',
                        zIndex: 10,
                      }}
                      onClick={() => setShowEditPanel(true)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <span className="material-symbols-outlined text-sm mr-2">edit</span>
                      <span>Editar</span>
                    </button>

                    <div className="flex flex-col md:flex-row">
                      <div className="hidden md:block" style={{ marginRight: '3rem', flexShrink: 0 }}>
                        <div 
                          className="rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/10 border border-primary/20 flex items-center justify-center"
                          style={{ width: '80px', height: '80px' }}
                        >
                          <span className="material-symbols-outlined text-4xl text-primary">play_lesson</span>
                        </div>
                      </div>

                      <div style={{ flex: '1 1 0%', minWidth: 0, paddingRight: '8rem' }}>
                        <div className="mb-6 flex items-center gap-3 flex-wrap">
                          <span 
                            className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold"
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              color: '#94a3b8',
                            }}
                          >
                            <span className="material-symbols-outlined text-[14px] mr-1.5">schedule</span>
                            {formatEstimatedTime(displayContent.estimated_time_minutes)}
                          </span>
                          {displayContent.difficulty && (
                            <span 
                              className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold border ${getDifficultyColor(displayContent.difficulty)}`}
                            >
                              <span className="material-symbols-outlined text-[14px] mr-1.5">trending_up</span>
                              {getDifficultyLabel(displayContent.difficulty)}
                            </span>
                          )}
                        </div>

                        <h2 
                          className="text-3xl md:text-4xl font-bold mb-6 tracking-tight break-words"
                          style={{ color: '#ffffff' }}
                        >
                          {displayContent.name}
                        </h2>

                        {/* Content Section */}
                        {displayContent.content && (
                          <div className="mt-8 pt-8 border-t border-white/5">
                            <div 
                              className="prose prose-invert max-w-none"
                              style={{ color: '#cbd5e1' }}
                              dangerouslySetInnerHTML={{ __html: displayContent.content }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showTopicModal && (
        <CreateTopicModal
          routeId={routeId}
          onClose={() => setShowTopicModal(false)}
        />
      )}
      {showSubtopicModal && selectedTopicId && (
        <CreateSubtopicModal
          topicId={selectedTopicId}
          onClose={() => {
            setShowSubtopicModal(false);
            setSelectedTopicId(undefined);
          }}
        />
      )}
      {showSubsubtopicModal && selectedSubtopicId && (
        <CreateSubsubtopicModal
          subtopicId={selectedSubtopicId}
          onClose={() => {
            setShowSubsubtopicModal(false);
            setSelectedSubtopicId(undefined);
          }}
        />
      )}

      {/* Edit Content Panel */}
      {showEditPanel && displayContent && (
        <EditContentPanel
          item={displayContent}
          itemType={
            activeSubsubtopic ? 'subsubtopic' : activeSubtopic ? 'subtopic' : 'topic'
          }
          onClose={() => setShowEditPanel(false)}
          onSave={() => {
            // Refresh data will happen automatically via query invalidation
          }}
        />
      )}
    </div>
  );
}
