'use client';

import { useState } from 'react';
import type { SubtopicWithChildren } from '@/types/knowledge-hub';
import { SubsubtopicNode } from './SubsubtopicNode';
import { useToggleSubtopicCompletion } from '@/hooks/useKnowledgeHub';

interface SubtopicNodeProps {
  subtopic: SubtopicWithChildren;
  index: number;
  parentIndex: number;
  isActive: boolean;
  activeSubsubtopicId?: string;
  onSubtopicClick?: (subtopicId: string) => void;
  onSubsubtopicClick?: (subsubtopicId: string) => void;
  onAddSubsubtopic?: (subtopicId: string) => void;
}

export function SubtopicNode({
  subtopic,
  index,
  parentIndex,
  isActive,
  activeSubsubtopicId,
  onSubtopicClick,
  onSubsubtopicClick,
  onAddSubsubtopic,
}: SubtopicNodeProps) {
  const hasSubsubtopics = subtopic.subsubtopics.length > 0;
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleCompletion = useToggleSubtopicCompletion();

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleCompletion.mutateAsync(subtopic.id);
  };

  const allSubsubtopicsCompleted = subtopic.subsubtopics.every((s) => s.is_completed);
  const isFullyCompleted = subtopic.is_completed && (!hasSubsubtopics || allSubsubtopicsCompleted);

  return (
    <>
      <div className="flex items-center gap-2">
        <a
          className={`flex items-start gap-3 p-2 rounded-lg transition-colors flex-1 min-w-0 ${
            isActive
              ? 'bg-primary/5 border border-primary/10 text-primary'
              : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'
          }`}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSubtopicClick?.(subtopic.id);
          }}
        >
          <div className={`w-[1px] h-4 mt-0.5 flex-shrink-0 ${isActive ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
          <span className={`text-xs break-words leading-snug flex-1 min-w-0 ${isActive ? 'font-bold' : ''}`}>
            {parentIndex}.{index} {subtopic.name}
          </span>
          <span
            className={`ml-auto material-symbols-outlined text-[14px] flex-shrink-0 ${
              isFullyCompleted
                ? 'text-green-400'
                : isActive
                  ? 'text-primary'
                  : 'text-slate-400'
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleToggle(e);
            }}
          >
            {isFullyCompleted
              ? 'check_circle'
              : isActive
                ? 'radio_button_checked'
                : 'radio_button_unchecked'}
          </span>
        </a>
        {hasSubsubtopics && (
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

      {isExpanded && hasSubsubtopics && (
        <div className="pl-8 pr-2 py-1 space-y-1">
          {subtopic.subsubtopics.map((subsubtopic, subsubIndex) => (
            <SubsubtopicNode
              key={subsubtopic.id}
              subsubtopic={subsubtopic}
              index={subsubIndex + 1}
              parentIndex={parentIndex}
              grandparentIndex={index}
              isActive={activeSubsubtopicId === subsubtopic.id}
              onSubsubtopicClick={onSubsubtopicClick}
            />
          ))}
          {onAddSubsubtopic && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddSubsubtopic(subtopic.id);
              }}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-xs"
            >
              <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-600"></div>
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Agregar sub-subtema</span>
            </button>
          )}
        </div>
      )}
    </>
  );
}

