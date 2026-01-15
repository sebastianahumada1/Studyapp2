'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { useQuestions } from '@/hooks/useQuestions';
import type { QuestionWithHierarchy } from '@/types/questions';

export type SelectionType = 'route' | 'topic' | 'subtopic' | 'subsubtopic';

export interface SelectedItem {
  type: SelectionType;
  id: string;
  name: string;
}

interface QuestionBankSidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedItems: SelectedItem[];
  onAddItem: (item: SelectedItem) => void;
  onRemoveItem: (index: number) => void;
}

// Group questions by hierarchy - extracted types for better type inference
interface SubsubtopicData {
  subsubtopicId: string;
  subsubtopicName: string;
  questions: QuestionWithHierarchy[];
}

interface SubtopicData {
  subtopicId: string;
  subtopicName: string;
  subsubtopics: Map<string, SubsubtopicData>;
  questions: QuestionWithHierarchy[];
}

interface TopicData {
  topicId: string;
  topicName: string;
  subtopics: Map<string, SubtopicData>;
  questions: QuestionWithHierarchy[];
}

interface GroupedHierarchy {
  routeId: string;
  routeTitle: string;
  topics: Map<string, TopicData>;
  questions: QuestionWithHierarchy[];
}

// Route Node Component
function RouteNode({ 
  routeData,
  searchQuery,
  selectedItems,
  onAddItem 
}: { 
  routeData: GroupedHierarchy;
  searchQuery: string;
  selectedItems: SelectedItem[];
  onAddItem: (item: SelectedItem) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isSelected = selectedItems.some(item => item.type === 'route' && item.id === routeData.routeId);
  const questionCount = routeData.questions.length + 
    Array.from(routeData.topics.values()).reduce((acc, topic) => {
      return acc + topic.questions.length + 
        Array.from(topic.subtopics.values()).reduce((subAcc, subtopic) => {
          return subAcc + subtopic.questions.length +
            Array.from(subtopic.subsubtopics.values() as IterableIterator<SubsubtopicData>).reduce((ssAcc, subsubtopic) => {
              return ssAcc + subsubtopic.questions.length;
            }, 0);
        }, 0);
    }, 0);

  const filteredTopics = useMemo(() => {
    if (!searchQuery) return Array.from(routeData.topics.values());
    const query = searchQuery.toLowerCase();
    return Array.from(routeData.topics.values()).filter(topic => 
      topic.topicName.toLowerCase().includes(query) ||
      Array.from(topic.subtopics.values()).some(subtopic =>
        subtopic.subtopicName.toLowerCase().includes(query) ||
        Array.from(subtopic.subsubtopics.values()).some(subsubtopic =>
          subsubtopic.subsubtopicName.toLowerCase().includes(query) ||
          subsubtopic.questions.some(q => q.question_text.toLowerCase().includes(query))
        ) ||
        subtopic.questions.some(q => q.question_text.toLowerCase().includes(query))
      ) ||
      topic.questions.some(q => q.question_text.toLowerCase().includes(query))
    );
  }, [routeData.topics, searchQuery]);

  if (filteredTopics.length === 0 && routeData.questions.length === 0) return null;

  return (
    <div className="mb-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex-1 flex items-center justify-start gap-2 p-3 rounded-lg transition-all group border text-left ${
            isSelected || isExpanded
              ? 'bg-primary/15 border-primary/40 shadow-[0_0_8px_rgba(13,242,242,0.2)]'
              : 'border-transparent hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <span className={`text-sm font-bold transition-colors ${
            isSelected || isExpanded
              ? 'text-primary' 
              : 'text-slate-700 dark:text-white'
          }`}>
            {routeData.routeTitle}
          </span>
          <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold ml-auto">
            {questionCount}
          </span>
          <span className={`material-symbols-outlined text-sm transition-all ${
            isSelected || isExpanded
              ? 'text-primary' 
              : 'text-slate-400 dark:text-slate-500'
          } ${isExpanded ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddItem({
              type: 'route',
              id: routeData.routeId,
              name: routeData.routeTitle,
            });
          }}
          className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all flex-shrink-0 ${
            isSelected 
              ? 'text-primary bg-primary/10' 
              : 'text-slate-400 hover:text-primary hover:bg-primary/5'
          }`}
          title={isSelected ? 'Ya seleccionado' : 'Seleccionar ruta completa'}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isSelected ? 'check_circle' : 'add_circle'}
          </span>
        </button>
      </div>
      {isExpanded && (
        <div className="mt-1 space-y-1">
          {filteredTopics.map((topic, index) => (
            <TopicNode
              key={topic.topicId}
              topic={topic}
              index={index + 1}
              searchQuery={searchQuery}
              selectedItems={selectedItems}
              onAddItem={onAddItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Topic Node Component
function TopicNode({ 
  topic,
  index,
  searchQuery,
  selectedItems,
  onAddItem 
}: { 
  topic: {
    topicId: string;
    topicName: string;
    subtopics: Map<string, any>;
    questions: QuestionWithHierarchy[];
  };
  index: number;
  searchQuery: string;
  selectedItems: SelectedItem[];
  onAddItem: (item: SelectedItem) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubtopics = topic.subtopics.size > 0;
  const isSelected = selectedItems.some(item => item.type === 'topic' && item.id === topic.topicId);
  const questionCount = topic.questions.length + 
    Array.from(topic.subtopics.values()).reduce((acc, subtopic) => {
      return acc + subtopic.questions.length +
        Array.from(subtopic.subsubtopics.values() as IterableIterator<SubsubtopicData>).reduce((ssAcc, subsubtopic) => {
          return ssAcc + subsubtopic.questions.length;
        }, 0);
    }, 0);

  const filteredSubtopics = useMemo(() => {
    if (!searchQuery) return Array.from(topic.subtopics.values());
    const query = searchQuery.toLowerCase();
    return Array.from(topic.subtopics.values()).filter(subtopic =>
      subtopic.subtopicName.toLowerCase().includes(query) ||
      Array.from(subtopic.subsubtopics.values() as IterableIterator<SubsubtopicData>).some((subsubtopic) =>
        subsubtopic.subsubtopicName.toLowerCase().includes(query) ||
        subsubtopic.questions.some(q => q.question_text.toLowerCase().includes(query))
      ) ||
      subtopic.questions.some(q => q.question_text.toLowerCase().includes(query))
    );
  }, [topic.subtopics, searchQuery]);

  if (filteredSubtopics.length === 0 && topic.questions.length === 0 && searchQuery && !topic.topicName.toLowerCase().includes(searchQuery.toLowerCase())) {
    return null;
  }

  return (
    <div className="group">
      <div className="flex items-center gap-2">
        <button
          className={`flex items-start gap-3 p-3 rounded-lg transition-all text-left flex-1 min-w-0 border ${
            isSelected || isExpanded
              ? 'bg-primary/10 border-primary/20'
              : 'border-transparent hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
          onClick={() => hasSubtopics && setIsExpanded(!isExpanded)}
        >
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`size-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border transition-all ${
              isSelected || isExpanded
                ? 'border-primary bg-primary/20'
                : 'border-slate-300 dark:border-slate-600'
            }`}>
              <span className={`text-xs transition-colors ${
                isSelected || isExpanded ? 'text-primary' : 'text-slate-500 dark:text-slate-400'
              }`}>
                {index}
              </span>
            </div>
            <span className={`text-sm break-words leading-snug font-medium transition-colors ${
              isSelected || isExpanded
                ? 'text-primary'
                : 'text-slate-700 dark:text-slate-300'
            }`}>
              {index}. {topic.topicName}
            </span>
            <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold ml-auto">
              {questionCount}
            </span>
          </div>
        </button>
        <div className="flex items-center gap-1">
          {hasSubtopics && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex-shrink-0 ${
                isExpanded ? 'text-primary' : 'text-slate-400 hover:text-primary'
              }`}
              title={isExpanded ? 'Colapsar' : 'Expandir'}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isExpanded ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddItem({
                type: 'topic',
                id: topic.topicId,
                name: topic.topicName,
              });
            }}
            className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex-shrink-0 ${
              isSelected ? 'text-primary' : 'text-slate-400 hover:text-primary'
            }`}
            title={isSelected ? 'Ya seleccionado' : 'Seleccionar tema completo'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isSelected ? 'check_circle' : 'add_circle'}
            </span>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="pl-5 pr-2 py-2 space-y-1">
          {filteredSubtopics.map((subtopic, subIndex) => (
            <SubtopicNode
              key={subtopic.subtopicId}
              subtopic={subtopic}
              index={subIndex + 1}
              parentIndex={index}
              searchQuery={searchQuery}
              selectedItems={selectedItems}
              onAddItem={onAddItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Subtopic Node Component
function SubtopicNode({ 
  subtopic, 
  index,
  parentIndex,
  searchQuery,
  selectedItems,
  onAddItem 
}: { 
  subtopic: {
    subtopicId: string;
    subtopicName: string;
    subsubtopics: Map<string, any>;
    questions: QuestionWithHierarchy[];
  };
  index: number;
  parentIndex: number;
  searchQuery: string;
  selectedItems: SelectedItem[];
  onAddItem: (item: SelectedItem) => void;
}) {
  const hasSubsubtopics = subtopic.subsubtopics.size > 0;
  const [isExpanded, setIsExpanded] = useState(false);
  const isSelected = selectedItems.some(item => item.type === 'subtopic' && item.id === subtopic.subtopicId);
  const questionCount = subtopic.questions.length +
    Array.from(subtopic.subsubtopics.values() as IterableIterator<SubsubtopicData>).reduce((acc, subsubtopic) => {
      return acc + subsubtopic.questions.length;
    }, 0);

  const filteredSubsubtopics = useMemo(() => {
    if (!searchQuery) return Array.from(subtopic.subsubtopics.values());
    const query = searchQuery.toLowerCase();
    return Array.from(subtopic.subsubtopics.values() as IterableIterator<SubsubtopicData>).filter((subsubtopic) =>
      subsubtopic.subsubtopicName.toLowerCase().includes(query) ||
      subsubtopic.questions.some(q => q.question_text.toLowerCase().includes(query))
    );
  }, [subtopic.subsubtopics, searchQuery]);

  if (filteredSubsubtopics.length === 0 && subtopic.questions.length === 0 && searchQuery && !subtopic.subtopicName.toLowerCase().includes(searchQuery.toLowerCase())) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <a
          className={`flex items-start gap-3 p-2 rounded-lg transition-all flex-1 min-w-0 border ${
            isSelected || isExpanded
              ? 'bg-primary/5 border-primary/10 text-primary'
              : 'border-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'
          }`}
          href="#"
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          <div className={`w-[1px] h-4 mt-0.5 flex-shrink-0 transition-colors ${isSelected || isExpanded ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
          <span className={`text-xs break-words leading-snug flex-1 min-w-0 transition-colors ${isSelected || isExpanded ? 'font-bold text-primary' : ''}`}>
            {parentIndex}.{index} {subtopic.subtopicName}
          </span>
          <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold ml-auto">
            {questionCount}
          </span>
        </a>
        <div className="flex items-center gap-1">
          {hasSubsubtopics && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex-shrink-0 ${
                isExpanded ? 'text-primary' : 'text-slate-400 hover:text-primary'
              }`}
              title={isExpanded ? 'Colapsar' : 'Expandir'}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isExpanded ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddItem({
                type: 'subtopic',
                id: subtopic.subtopicId,
                name: subtopic.subtopicName,
              });
            }}
            className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex-shrink-0 ${
              isSelected ? 'text-primary' : 'text-slate-400 hover:text-primary'
            }`}
            title={isSelected ? 'Ya seleccionado' : 'Seleccionar subtema completo'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isSelected ? 'check_circle' : 'add_circle'}
            </span>
          </button>
        </div>
      </div>

      {isExpanded && hasSubsubtopics && (
        <div className="pl-8 pr-2 py-1 space-y-1">
          {filteredSubsubtopics.map((subsubtopic, subsubIndex) => (
            <SubsubtopicNode
              key={subsubtopic.subsubtopicId}
              subsubtopic={subsubtopic}
              index={subsubIndex + 1}
              parentIndex={parentIndex}
              grandparentIndex={index}
              selectedItems={selectedItems}
              onAddItem={onAddItem}
            />
          ))}
        </div>
      )}
    </>
  );
}

// Subsubtopic Node Component
function SubsubtopicNode({ 
  subsubtopic, 
  index,
  parentIndex,
  grandparentIndex,
  selectedItems,
  onAddItem 
}: { 
  subsubtopic: {
    subsubtopicId: string;
    subsubtopicName: string;
    questions: QuestionWithHierarchy[];
  };
  index: number;
  parentIndex: number;
  grandparentIndex: number;
  selectedItems: SelectedItem[];
  onAddItem: (item: SelectedItem) => void;
}) {
  const isSelected = selectedItems.some(item => item.type === 'subsubtopic' && item.id === subsubtopic.subsubtopicId);
  const questionCount = subsubtopic.questions.length;

  return (
    <a
      className={`flex items-start gap-3 p-2 rounded-lg transition-colors flex-1 min-w-0 ${
        isSelected
          ? 'bg-primary/5 border border-primary/10 text-primary'
          : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'
      }`}
      href="#"
      onClick={(e) => {
        e.preventDefault();
        if (!isSelected) {
          onAddItem({
            type: 'subsubtopic',
            id: subsubtopic.subsubtopicId,
            name: subsubtopic.subsubtopicName,
          });
        }
      }}
    >
      <div className={`w-[1px] h-4 mt-0.5 flex-shrink-0 ${isSelected ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
      <span className={`text-xs break-words leading-snug flex-1 min-w-0 ${isSelected ? 'font-bold' : ''}`}>
        {parentIndex}.{grandparentIndex}.{index} {subsubtopic.subsubtopicName}
      </span>
      <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold ml-auto">
        {questionCount}
      </span>
      <span
        className={`ml-auto material-symbols-outlined text-[14px] flex-shrink-0 cursor-pointer ${
          isSelected
            ? 'text-primary'
            : 'text-slate-400 hover:text-primary'
        }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isSelected) {
            onAddItem({
              type: 'subsubtopic',
              id: subsubtopic.subsubtopicId,
              name: subsubtopic.subsubtopicName,
            });
          }
        }}
        title={isSelected ? 'Ya seleccionado' : 'Agregar a selección'}
      >
        {isSelected ? 'check_circle' : 'add_circle'}
      </span>
    </a>
  );
}

export function QuestionBankSidebar({
  searchQuery,
  onSearchChange,
  selectedItems,
  onAddItem,
  onRemoveItem,
}: QuestionBankSidebarProps) {
  const { data: questions, isLoading } = useQuestions();

  // Group questions by hierarchy
  const groupedHierarchy = useMemo(() => {
    if (!questions || questions.length === 0) return new Map<string, GroupedHierarchy>();

    const hierarchy = new Map<string, GroupedHierarchy>();

    questions.forEach((question) => {
      const routeId = question.route_id || 'no-route';
      const routeTitle = question.route?.title || 'Sin Ruta';

      if (!hierarchy.has(routeId)) {
        hierarchy.set(routeId, {
          routeId,
          routeTitle,
          topics: new Map(),
          questions: [],
        });
      }

      const route = hierarchy.get(routeId)!;

      // Question at route level
      if (!question.topic_id && !question.subtopic_id && !question.subsubtopic_id) {
        route.questions.push(question);
        return;
      }

      // Question at topic level or below
      if (question.topic_id && question.topic) {
        const topicId = question.topic_id;
        const topicName = question.topic.name;

        if (!route.topics.has(topicId)) {
          route.topics.set(topicId, {
            topicId,
            topicName,
            subtopics: new Map(),
            questions: [],
          });
        }

        const topic = route.topics.get(topicId)!;

        // Question at topic level
        if (!question.subtopic_id && !question.subsubtopic_id) {
          topic.questions.push(question);
          return;
        }

        // Question at subtopic level or below
        if (question.subtopic_id && question.subtopic) {
          const subtopicId = question.subtopic_id;
          const subtopicName = question.subtopic.name;

          if (!topic.subtopics.has(subtopicId)) {
            topic.subtopics.set(subtopicId, {
              subtopicId,
              subtopicName,
              subsubtopics: new Map(),
              questions: [],
            });
          }

          const subtopic = topic.subtopics.get(subtopicId)!;

          // Question at subtopic level
          if (!question.subsubtopic_id) {
            subtopic.questions.push(question);
            return;
          }

          // Question at subsubtopic level
          if (question.subsubtopic_id && question.subsubtopic) {
            const subsubtopicId = question.subsubtopic_id;
            const subsubtopicName = question.subsubtopic.name;

            if (!subtopic.subsubtopics.has(subsubtopicId)) {
              subtopic.subsubtopics.set(subsubtopicId, {
                subsubtopicId,
                subsubtopicName,
                questions: [],
              });
            }

            subtopic.subsubtopics.get(subsubtopicId)!.questions.push(question);
          }
        }
      }
    });

    return hierarchy;
  }, [questions]);

  const filteredRoutes = useMemo(() => {
    if (!searchQuery) return Array.from(groupedHierarchy.values());
    const query = searchQuery.toLowerCase();
    return Array.from(groupedHierarchy.values()).filter(route =>
      route.routeTitle.toLowerCase().includes(query) ||
      Array.from(route.topics.values()).some(topic =>
        topic.topicName.toLowerCase().includes(query) ||
        Array.from(topic.subtopics.values()).some(subtopic =>
          subtopic.subtopicName.toLowerCase().includes(query) ||
          Array.from(subtopic.subsubtopics.values()).some(subsubtopic =>
            subsubtopic.subsubtopicName.toLowerCase().includes(query) ||
            subsubtopic.questions.some(q => q.question_text.toLowerCase().includes(query))
          ) ||
          subtopic.questions.some(q => q.question_text.toLowerCase().includes(query))
        ) ||
        topic.questions.some(q => q.question_text.toLowerCase().includes(query))
      ) ||
      route.questions.some(q => q.question_text.toLowerCase().includes(query))
    );
  }, [groupedHierarchy, searchQuery]);

  return (
    <div className="w-96 min-w-[384px] max-w-[480px] border-r border-slate-200 dark:border-white/5 bg-white/50 dark:bg-surface-dark/50 backdrop-blur-sm shrink-0 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">
              Banco de Preguntas
            </h3>
          </div>
          <div className="relative mb-4">
            <Input
              className="w-full bg-white dark:bg-black/30 border-slate-200 dark:border-white/10 rounded-lg py-2 pl-10 text-xs focus:ring-primary focus:border-primary"
              placeholder="Buscar por pregunta..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm pointer-events-none">
              search
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {isLoading ? (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
                Cargando preguntas...
              </div>
            ) : filteredRoutes.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
                {searchQuery ? 'No se encontraron resultados' : 'No hay preguntas disponibles'}
              </div>
            ) : (
              filteredRoutes.map((route) => (
                <RouteNode
                  key={route.routeId}
                  routeData={route}
                  searchQuery={searchQuery}
                  selectedItems={selectedItems}
                  onAddItem={onAddItem}
                />
              ))
            )}
          </div>
        </div>
      </div>
      <div className="shrink-0 p-4 bg-slate-50 dark:bg-black/20 border-t border-slate-200 dark:border-white/5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Seleccionados</p>
          <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold">
            {selectedItems.length} ITEMS
          </span>
        </div>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {selectedItems.length === 0 ? (
            <div className="w-full p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-sm mt-0.5">info</span>
              <div className="flex-1">
                <p className="text-xs font-medium text-primary mb-1">Selecciona contenido para evaluar</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Expande las rutas y selecciona los temas, subtemas o sub-subtemas sobre los que deseas ser evaluado. Puedes seleccionar rutas completas, temas completos o elementos individuales.
                </p>
              </div>
            </div>
          ) : (
            selectedItems.map((item, index) => (
              <span 
                key={`${item.type}-${item.id}-${index}`}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-surface-dark border border-primary/20 text-[10px] flex items-center gap-1 text-slate-700 dark:text-white"
              >
                <span className="material-symbols-outlined text-[10px] text-primary">
                  {item.type === 'route' ? 'route' : item.type === 'topic' ? 'menu_book' : item.type === 'subtopic' ? 'folder' : 'description'}
                </span>
                {item.name}
                <button 
                  className="material-symbols-outlined text-[10px] hover:text-primary transition-colors"
                  onClick={() => onRemoveItem(index)}
                >
                  close
                </button>
              </span>
            ))
          )}
        </div>
        <Link
          href="/questions"
          className="w-full mt-4 px-4 py-2.5 rounded-lg bg-background-dark/80 border border-primary/50 hover:border-primary text-primary text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 hover:bg-background-dark"
        >
          IR AL BANCO DE PREGUNTAS
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}
