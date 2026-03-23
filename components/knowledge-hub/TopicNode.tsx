'use client';

import { useState } from 'react';
import type { TopicWithChildren } from '@/types/knowledge-hub';
import { SubtopicNode } from './SubtopicNode';
import { useToggleTopicCompletion } from '@/hooks/useKnowledgeHub';

interface TopicNodeProps {
  topic: TopicWithChildren;
  index: number;
  isActive: boolean;
  activeSubtopicId?: string;
  activeSubsubtopicId?: string;
  onTopicClick?: (topicId: string) => void;
  onSubtopicClick?: (subtopicId: string) => void;
  onSubsubtopicClick?: (subsubtopicId: string) => void;
  onAddSubtopic?: (topicId: string) => void;
  onAddSubsubtopic?: (subtopicId: string) => void;
}

export function TopicNode({
  topic,
  index,
  isActive,
  activeSubtopicId,
  activeSubsubtopicId,
  onTopicClick,
  onSubtopicClick,
  onSubsubtopicClick,
  onAddSubtopic,
  onAddSubsubtopic,
}: TopicNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleCompletion = useToggleTopicCompletion();

  const allSubtopicsCompleted = topic.subtopics.every((s) => s.is_completed);
  const hasSubtopics = topic.subtopics.length > 0;
  const isFullyCompleted = topic.is_completed && (!hasSubtopics || allSubtopicsCompleted);
  const canToggle = !hasSubtopics || allSubtopicsCompleted || topic.is_completed;

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // Prevent toggling to completed if not all subtopics are completed
    if (!canToggle && !topic.is_completed) {
      // Show a message or prevent action if trying to complete without all subtopics done
      return;
    }
    await toggleCompletion.mutateAsync(topic.id);
  };

  return (
    <div className="group">
      <div className="flex items-center gap-2">
        <button
          className={`flex items-start gap-3 p-3 rounded-lg transition-colors text-left flex-1 min-w-0 ${
            isActive
              ? 'bg-primary/10 border border-primary/20'
              : 'hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
          onClick={() => {
            onTopicClick?.(topic.id);
          }}
        >
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={`size-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isFullyCompleted
                  ? 'bg-green-500/20 text-green-400'
                  : isActive
                    ? 'bg-primary/20 text-primary animate-pulse'
                    : !canToggle && !topic.is_completed
                      ? 'border border-slate-300 dark:border-slate-600 opacity-50 cursor-not-allowed'
                      : 'border border-slate-300 dark:border-slate-600'
              }`}
              onClick={handleToggle}
              title={!canToggle && !topic.is_completed ? 'Completa todos los subtemas primero' : ''}
            >
              {isFullyCompleted ? (
                <span className="material-symbols-outlined text-[16px]">check</span>
              ) : isActive ? (
                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {index}
                </span>
              )}
            </div>
            <span
              className={`text-sm break-words leading-snug ${
                isActive
                  ? 'text-slate-900 dark:text-white font-bold'
                  : 'text-slate-700 dark:text-slate-300 font-medium'
              }`}
            >
              {index}. {topic.name}
            </span>
          </div>
        </button>
        {hasSubtopics && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-primary transition-colors flex-shrink-0"
            title={isExpanded ? 'Colapsar' : 'Expandir'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isExpanded ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="pl-5 pr-2 py-2 space-y-1">
          {topic.subtopics.map((subtopic, subIndex) => (
            <SubtopicNode
              key={subtopic.id}
              subtopic={subtopic}
              index={subIndex + 1}
              parentIndex={index}
              isActive={activeSubtopicId === subtopic.id}
              activeSubsubtopicId={activeSubsubtopicId}
              onSubtopicClick={onSubtopicClick}
              onSubsubtopicClick={onSubsubtopicClick}
              onAddSubsubtopic={onAddSubsubtopic}
            />
          ))}
          {onAddSubtopic && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddSubtopic(topic.id);
              }}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-xs"
            >
              <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-600"></div>
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Agregar subtema</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

