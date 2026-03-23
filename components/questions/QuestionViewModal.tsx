'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { QuestionWithHierarchy } from '@/types/questions';
import { useQuestion } from '@/hooks/useQuestions';
import { deleteQuestion } from '@/app/actions/questions';
import { useRouter } from 'next/navigation';

interface QuestionViewModalProps {
  questionId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (question: QuestionWithHierarchy) => void;
}

export function QuestionViewModal({
  questionId,
  isOpen,
  onClose,
  onEdit,
}: QuestionViewModalProps) {
  const router = useRouter();
  const { data: question, isLoading } = useQuestion(questionId || '');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!questionId || !confirm('¿Estás seguro de que deseas eliminar esta pregunta?')) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteQuestion(questionId);
    setIsDeleting(false);

    if (result.success) {
      router.refresh();
      onClose();
    } else {
      alert(result.error || 'Error al eliminar la pregunta');
    }
  };

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


  if (!isOpen || !questionId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-surface-dark border-white/5">
        <DialogHeader>
          <DialogTitle className="text-white font-display text-2xl">
            {isLoading
              ? 'Cargando pregunta...'
              : !question
              ? 'Pregunta no encontrada'
              : 'Visualización de Pregunta'}
          </DialogTitle>
          {question && (
            <DialogDescription className="text-text-muted">
              ID: {question.id}
            </DialogDescription>
          )}
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-text-muted">Cargando pregunta...</div>
          </div>
        ) : !question ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-text-muted">Pregunta no encontrada</div>
          </div>
        ) : (
          <>

            <div className="space-y-6">
              {/* Hierarchy Path */}
              <div className="bg-background-dark/50 border border-white/5 rounded-xl p-4">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
                  Ubicación en la Jerarquía
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {question.route && (
                    <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 font-medium">
                      Ruta: {question.route.title}
                    </span>
                  )}
                  {question.topic && (
                    <span className="px-3 py-1.5 rounded-lg bg-surface-dark text-text-muted border border-white/5 font-medium">
                      Tema: {question.topic.name}
                    </span>
                  )}
                  {question.subtopic && (
                    <span className="px-3 py-1.5 rounded-lg bg-surface-dark text-text-muted border border-white/5 font-medium">
                      Subtema: {question.subtopic.name}
                    </span>
                  )}
                  {question.subsubtopic && (
                    <span className="px-3 py-1.5 rounded-lg bg-surface-dark text-text-muted border border-white/5 font-medium">
                      Sub-subtema: {question.subsubtopic.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="bg-background-dark/50 border border-white/5 rounded-xl p-6">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
                  Pregunta
                </h3>
                <p className="text-white text-lg font-medium leading-relaxed">
                  {question.question_text}
                </p>
              </div>

              {/* Options */}
              <div className="bg-background-dark/50 border border-white/5 rounded-xl p-6">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">
                  Opciones de Respuesta
                </h3>
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-4 rounded-lg border ${
                        option.isCorrect
                          ? 'bg-green-900/20 border-green-800 text-green-100'
                          : 'bg-surface-dark border-white/5 text-white'
                      }`}
                    >
                      <div
                        className={`size-6 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs ${
                          option.isCorrect
                            ? 'bg-green-500 text-white'
                            : 'bg-white/10 text-text-muted'
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed">{option.text}</p>
                        {option.isCorrect && (
                          <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-green-400 uppercase">
                            <span className="material-symbols-outlined text-xs">check_circle</span>
                            Respuesta Correcta
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              {question.explanation && (
                <div className="bg-gradient-to-br from-primary/5 to-blue-600/5 border border-primary/20 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary text-xl">lightbulb</span>
                    <h3 className="text-xs font-bold text-primary uppercase tracking-wider">
                      Explicación
                    </h3>
                  </div>
                  <p className="text-white text-sm leading-relaxed">
                    {question.explanation}
                  </p>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background-dark/50 border border-white/5 rounded-xl p-4">
                  <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Dificultad
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">{getDifficultyBars(question.difficulty)}</div>
                    <span className="text-sm font-medium text-white capitalize">
                      {question.difficulty}
                    </span>
                  </div>
                </div>

                <div className="bg-background-dark/50 border border-white/5 rounded-xl p-4">
                  <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Origen
                  </div>
                  <span
                    className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${
                      question.origin === 'ai'
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : question.origin === 'csv'
                        ? 'bg-blue-900/30 text-blue-400 border border-blue-800'
                        : 'bg-surface-dark text-text-muted border border-white/5'
                    }`}
                  >
                    {question.origin === 'ai'
                      ? 'AI Generated'
                      : question.origin === 'csv'
                      ? 'CSV Import'
                      : 'Manual'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-white/5 text-text-muted hover:text-white"
                >
                  Cerrar
                </Button>
                {onEdit && (
                  <Button
                    onClick={() => {
                      onEdit(question);
                      onClose();
                    }}
                    className="bg-primary text-background-dark hover:bg-primary/90"
                  >
                    <span className="material-symbols-outlined text-sm mr-2">edit</span>
                    Editar
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-900/30 text-red-400 border border-red-800 hover:bg-red-900/50"
                >
                  <span className="material-symbols-outlined text-sm mr-2">delete</span>
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
