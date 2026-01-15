'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuestions } from '@/hooks/useQuestions';
import { QuestionViewModal } from './QuestionViewModal';
import { EditQuestionModal } from './EditQuestionModal';
import type { QuestionWithHierarchy } from '@/types/questions';

interface QuestionsTableProps {
  filters?: {
    route: string;
    topic: string;
    subtopic: string;
    subsubtopic: string;
    difficulty: string;
    search: string;
  };
}

export function QuestionsTable({
  filters = { route: '', topic: '', subtopic: '', subsubtopic: '', difficulty: '', search: '' },
}: QuestionsTableProps) {
  const { data: allQuestions = [], isLoading } = useQuestions();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Filter questions based on filters
  const questions = useMemo(() => {
    let filtered = [...allQuestions];

    // Filter by route
    if (filters.route && filters.route !== 'all') {
      filtered = filtered.filter((q) => q.route_id === filters.route);
    }

    // Filter by topic
    if (filters.topic && filters.topic !== 'all') {
      filtered = filtered.filter((q) => q.topic_id === filters.topic);
    }

    // Filter by subtopic
    if (filters.subtopic && filters.subtopic !== 'all') {
      filtered = filtered.filter((q) => q.subtopic_id === filters.subtopic);
    }

    // Filter by subsubtopic
    if (filters.subsubtopic && filters.subsubtopic !== 'all') {
      filtered = filtered.filter((q) => q.subsubtopic_id === filters.subsubtopic);
    }

    // Filter by difficulty
    if (filters.difficulty && filters.difficulty !== 'all') {
      filtered = filtered.filter((q) => q.difficulty === filters.difficulty);
    }

    // Filter by search
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((q) =>
        q.question_text.toLowerCase().includes(searchLower) ||
        q.options.some((opt) => opt.text.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [allQuestions, filters]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const totalItems = questions.length;

  const getDifficultyBars = (difficulty: string) => {
    switch (difficulty) {
      case 'alta':
        return (
          <>
            <div className="w-1.5 h-4 bg-red-400 rounded-sm"></div>
            <div className="w-1.5 h-4 bg-red-400 rounded-sm"></div>
            <div className="w-1.5 h-4 bg-red-400 rounded-sm"></div>
          </>
        );
      case 'media':
        return (
          <>
            <div className="w-1.5 h-4 bg-primary rounded-sm"></div>
            <div className="w-1.5 h-4 bg-primary rounded-sm"></div>
            <div className="w-1.5 h-4 bg-white/5 rounded-sm"></div>
          </>
        );
      case 'baja':
        return (
          <>
            <div className="w-1.5 h-4 bg-primary rounded-sm"></div>
            <div className="w-1.5 h-4 bg-white/5 rounded-sm"></div>
            <div className="w-1.5 h-4 bg-white/5 rounded-sm"></div>
          </>
        );
      default:
        return null;
    }
  };


  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <section>
      <QuestionViewModal
        questionId={selectedQuestionId}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedQuestionId(null);
        }}
        onEdit={(question) => {
          setIsViewModalOpen(false);
          setSelectedQuestionId(null);
          setEditingQuestionId(question.id);
        }}
      />
      {editingQuestionId && (
        <EditQuestionModal
          questionId={editingQuestionId}
          onClose={() => setEditingQuestionId(null)}
        />
      )}
      <div className="rounded-2xl border border-white/5 bg-surface-dark/50 overflow-hidden relative shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-dark/80 text-[10px] uppercase text-text-muted font-bold tracking-widest border-b border-white/5">
              <tr>
                <th className="p-5 min-w-[280px]">Pregunta y Origen</th>
                <th className="p-5">Dificultad</th>
                <th className="p-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm text-white divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="p-12 text-center text-text-muted">
                    Cargando preguntas...
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-12 text-center text-text-muted">
                    No hay preguntas disponibles. Crea tu primera pregunta.
                  </td>
                </tr>
              ) : (
                questions
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((question) => {
                    const hierarchyPath = [
                      question.route?.title,
                      question.topic?.name,
                      question.subtopic?.name,
                      question.subsubtopic?.name,
                    ]
                      .filter(Boolean)
                      .join(' / ');

                    return (
                      <tr key={question.id} className="group hover:bg-primary/10 transition-colors">
                        <td className="p-5">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium line-clamp-2">{question.question_text}</span>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
                                  question.origin === 'ai'
                                    ? 'bg-primary/10 text-primary border-primary/20'
                                    : question.origin === 'csv'
                                    ? 'bg-blue-900/30 text-blue-400 border-blue-800'
                                    : 'bg-surface-dark text-text-muted border-white/5'
                                }`}
                              >
                                {question.origin === 'ai'
                                  ? 'AI Generated'
                                  : question.origin === 'csv'
                                  ? 'CSV Import'
                                  : 'Manual'}
                              </span>
                              {hierarchyPath && (
                                <span className="text-[10px] text-text-muted truncate max-w-[200px]">
                                  {hierarchyPath}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {getDifficultyBars(question.difficulty)}
                            </div>
                            <span className="text-xs font-medium capitalize">
                              {question.difficulty}
                            </span>
                          </div>
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedQuestionId(question.id);
                                setIsViewModalOpen(true);
                              }}
                              className="p-2 hover:text-primary transition-colors"
                              title="Ver pregunta"
                            >
                              <span className="material-symbols-outlined text-lg">visibility</span>
                            </button>
                            <button
                              onClick={() => {
                                setEditingQuestionId(question.id);
                              }}
                              className="p-2 hover:text-primary transition-colors"
                              title="Editar pregunta"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedQuestionId(question.id);
                                setIsViewModalOpen(true);
                              }}
                              className="p-2 hover:text-red-400 transition-colors"
                              title="Eliminar pregunta"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-surface-dark border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
            Mostrando {(currentPage - 1) * itemsPerPage + 1}-{Math.min(
              currentPage * itemsPerPage,
              totalItems
            )} de {totalItems.toLocaleString()} registros
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="size-8 flex items-center justify-center rounded-lg border border-white/5 text-text-muted hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button
              onClick={() => setCurrentPage(1)}
              className={`size-8 flex items-center justify-center rounded-lg font-bold text-xs transition-colors ${
                currentPage === 1
                  ? 'bg-primary text-background-dark'
                  : 'border border-white/5 text-text-muted hover:text-white'
              }`}
            >
              1
            </button>
            {currentPage < totalPages && (
              <>
                <button
                  onClick={() => setCurrentPage(2)}
                  className="size-8 flex items-center justify-center rounded-lg border border-white/5 text-text-muted hover:text-white text-xs"
                >
                  2
                </button>
                <button
                  onClick={() => setCurrentPage(3)}
                  className="size-8 flex items-center justify-center rounded-lg border border-white/5 text-text-muted hover:text-white text-xs"
                >
                  3
                </button>
                <span className="px-2 text-text-muted">...</span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className="size-8 flex items-center justify-center rounded-lg border border-white/5 text-text-muted hover:text-white text-xs"
                >
                  {totalPages}
                </button>
              </>
            )}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="size-8 flex items-center justify-center rounded-lg border border-white/5 text-text-muted hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
