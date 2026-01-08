'use client';

import type { StudySubsubtopic } from '@/types/knowledge-hub';
import { useToggleSubsubtopicCompletion } from '@/hooks/useKnowledgeHub';

interface SubsubtopicNodeProps {
  subsubtopic: StudySubsubtopic;
  index: number;
  parentIndex: number;
  grandparentIndex: number;
  isActive: boolean;
  onSubsubtopicClick?: (subsubtopicId: string) => void;
}

export function SubsubtopicNode({
  subsubtopic,
  index,
  parentIndex,
  grandparentIndex,
  isActive,
  onSubsubtopicClick,
}: SubsubtopicNodeProps) {
  const toggleCompletion = useToggleSubsubtopicCompletion();

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleCompletion.mutateAsync(subsubtopic.id);
  };

  return (
    <a
      className={`flex items-start gap-3 p-2 rounded-lg transition-colors flex-1 min-w-0 ${
        isActive
          ? 'bg-primary/5 border border-primary/10 text-primary'
          : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'
      }`}
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onSubsubtopicClick?.(subsubtopic.id);
      }}
    >
      <div className={`w-[1px] h-4 mt-0.5 flex-shrink-0 ${isActive ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
      <span className={`text-xs break-words leading-snug flex-1 min-w-0 ${isActive ? 'font-bold' : ''}`}>
        {parentIndex}.{grandparentIndex}.{index} {subsubtopic.name}
      </span>
      <span
        className={`ml-auto material-symbols-outlined text-[14px] flex-shrink-0 ${
          subsubtopic.is_completed
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
        {subsubtopic.is_completed ? 'check_circle' : isActive ? 'radio_button_checked' : 'radio_button_unchecked'}
      </span>
    </a>
  );
}

