'use client';

import { useState } from 'react';
import type { RouteWithTree } from '@/types/knowledge-hub';
import { TopicNode } from './TopicNode';

interface RouteTreeNavigatorProps {
  route: RouteWithTree;
  activeTopicId?: string;
  activeSubtopicId?: string;
  activeSubsubtopicId?: string;
  onTopicClick?: (topicId: string) => void;
  onSubtopicClick?: (subtopicId: string) => void;
  onSubsubtopicClick?: (subsubtopicId: string) => void;
  onAddTopic?: () => void;
  onAddSubtopic?: (topicId: string) => void;
  onAddSubsubtopic?: (subtopicId: string) => void;
}

export function RouteTreeNavigator({
  route,
  activeTopicId,
  activeSubtopicId,
  activeSubsubtopicId,
  onTopicClick,
  onSubtopicClick,
  onSubsubtopicClick,
  onAddTopic,
  onAddSubtopic,
  onAddSubsubtopic,
}: RouteTreeNavigatorProps) {
  return (
    <div className="w-80 min-w-[320px] max-w-[400px] border-r border-slate-200 dark:border-white/5 overflow-y-auto bg-white/50 dark:bg-surface-dark/50 backdrop-blur-sm shrink-0">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">
            Módulos del Curso
          </h3>
          {onAddTopic && (
            <button
              onClick={onAddTopic}
              className="size-6 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors"
              title="Agregar tema"
            >
              <span className="material-symbols-outlined text-sm">add</span>
            </button>
          )}
        </div>
        <div className="flex flex-col gap-1">
          {route.topics.map((topic, index) => (
            <TopicNode
              key={topic.id}
              topic={topic}
              index={index + 1}
              isActive={activeTopicId === topic.id}
              activeSubtopicId={activeSubtopicId}
              activeSubsubtopicId={activeSubsubtopicId}
              onTopicClick={onTopicClick}
              onSubtopicClick={onSubtopicClick}
              onSubsubtopicClick={onSubsubtopicClick}
              onAddSubtopic={onAddSubtopic}
              onAddSubsubtopic={onAddSubsubtopic}
            />
          ))}
          {route.topics.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              <p className="mb-2">No hay temas aún</p>
              {onAddTopic && (
                <button
                  onClick={onAddTopic}
                  className="text-primary hover:text-cyan-300 text-xs font-medium"
                >
                  Agregar primer tema
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

