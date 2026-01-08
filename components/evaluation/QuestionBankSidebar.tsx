'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { TopicTreeItem } from './TopicTreeItem';

interface QuestionBankSidebarProps {
  selectedItems: Set<string>;
  onToggleItem: (id: string) => void;
}

// Mock data - in production this would come from the database
const mockTopics = [
  {
    id: 'math',
    name: 'Matemáticas',
    subtopics: [
      { id: 'algebra', name: 'Álgebra Lineal' },
      { id: 'calculus', name: 'Cálculo Diferencial' },
      { id: 'geometry', name: 'Geometría Analítica' },
    ],
  },
  {
    id: 'history',
    name: 'Historia',
    subtopics: [
      { id: 'ancient', name: 'Historia Antigua' },
      { id: 'modern', name: 'Historia Moderna' },
    ],
  },
  {
    id: 'science',
    name: 'Ciencias Naturales',
    subtopics: [
      { id: 'biology', name: 'Biología' },
      { id: 'physics', name: 'Física' },
      { id: 'chemistry', name: 'Química' },
    ],
  },
];

export function QuestionBankSidebar({
  selectedItems,
  onToggleItem,
}: QuestionBankSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set(['math']));

  const toggleTopic = (topicId: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  // Filter topics based on search
  const filteredTopics = useMemo(() => {
    if (!searchQuery) return mockTopics;
    const query = searchQuery.toLowerCase();
    return mockTopics
      .map((topic) => {
        const matchingSubtopics = topic.subtopics.filter((sub) =>
          sub.name.toLowerCase().includes(query)
        );
        const topicMatches = topic.name.toLowerCase().includes(query);
        if (topicMatches || matchingSubtopics.length > 0) {
          return {
            ...topic,
            subtopics: topicMatches ? topic.subtopics : matchingSubtopics,
          };
        }
        return null;
      })
      .filter((topic): topic is typeof mockTopics[0] => topic !== null);
  }, [searchQuery]);

  // Get selected items info for display
  const selectedItemsList = useMemo(() => {
    const items: Array<{ id: string; name: string }> = [];
    mockTopics.forEach((topic) => {
      topic.subtopics.forEach((subtopic) => {
        if (selectedItems.has(subtopic.id)) {
          items.push({ id: subtopic.id, name: subtopic.name });
        }
      });
    });
    return items;
  }, [selectedItems]);

  return (
    <div className="xl:w-80 w-full shrink-0">
      <div className="flex flex-col bg-surface-dark border border-border-dark rounded-2xl p-6 h-full overflow-hidden">
        <div className="flex items-center gap-4 mb-6">
          <div className="size-12 rounded-xl bg-gradient-to-br from-surface-dark to-background-dark border border-border-dark flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-2xl text-primary">inventory_2</span>
          </div>
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-white">Banco de Preguntas</h3>
            <p className="text-text-muted text-xs">Selector de Contenido Dinámico</p>
          </div>
        </div>

        <div className="relative mb-4">
          <Input
            className="w-full p-2 pl-10 rounded-lg bg-background-dark border border-border-dark text-white text-sm focus:border-primary focus:ring-primary focus:ring-1"
            placeholder="Buscar temas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              backgroundColor: 'hsl(var(--background-dark))',
              borderColor: 'hsl(var(--border))',
              color: 'white',
            }}
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg">
            search
          </span>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          <ul className="flex flex-col gap-1">
            {filteredTopics.map((topic) => (
              <TopicTreeItem
                key={topic.id}
                topic={topic}
                isExpanded={expandedTopics.has(topic.id)}
                onToggle={toggleTopic}
                onToggleSubtopic={onToggleItem}
                selectedSubtopics={selectedItems}
                searchQuery={searchQuery}
              />
            ))}
          </ul>
        </div>

        <div className="mt-6 pt-4 border-t border-border-dark">
          <h4 className="text-text-muted text-xs font-medium uppercase tracking-widest mb-2">
            Temas Seleccionados
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedItemsList.length === 0 ? (
              <p className="text-xs text-text-muted">No hay temas seleccionados</p>
            ) : (
              selectedItemsList.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-dim text-primary text-xs font-medium"
                >
                  {item.name}
                  <button
                    className="size-4 flex items-center justify-center rounded-full hover:bg-primary/20 transition-colors"
                    onClick={() => onToggleItem(item.id)}
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

