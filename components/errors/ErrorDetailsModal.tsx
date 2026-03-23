'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateErrorDetails } from '@/app/actions/errors';

interface ErrorData {
  id: string;
  question_id: string;
  question_text: string;
  question_options: Array<{ text: string }>;
  selected_answer_index: number;
  correct_answer_index: number;
  route_title: string | null;
  topic_name: string | null;
  subtopic_name: string | null;
  subsubtopic_name: string | null;
  error_conclusion: string;
  error_type: 'concepto' | 'analisis' | 'atencion' | null;
  conclusion: string | null;
  answered_at: string;
  time_spent_seconds: number | null;
  feynman_reasoning: string | null;
  feynman_feedback: string | null;
}

interface ErrorDetailsModalProps {
  error: ErrorData | null;
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'edit';
}

const errorTypeColors = {
  concepto: {
    bg: 'bg-pink-500/10',
    text: 'text-pink-400',
    border: 'border-pink-500/30',
  },
  analisis: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
  },
  atencion: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
  },
};

const errorTypeLabels = {
  concepto: 'Concepto',
  analisis: 'Análisis',
  atencion: 'Atención',
};

export function ErrorDetailsModal({ error, isOpen, onClose, mode }: ErrorDetailsModalProps) {
  const [errorType, setErrorType] = useState<'concepto' | 'analisis' | 'atencion' | null>(error?.error_type || null);
  const [conclusion, setConclusion] = useState<string>(error?.conclusion || '');
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when error changes
  useEffect(() => {
    if (error) {
      setErrorType(error.error_type);
      setConclusion(error.conclusion || '');
    }
  }, [error]);

  if (!error) return null;

  const colors = errorType ? errorTypeColors[errorType] : {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/30',
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateErrorDetails(error.id, errorType, conclusion || null);
      if (result.success) {
        // Update the error object to reflect changes
        error.error_type = errorType;
        error.conclusion = conclusion || null;
        onClose();
      } else {
        alert(result.error || 'Error al guardar');
      }
    } catch (err) {
      console.error('Error saving:', err);
      alert('Error al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Parse Feynman feedback
  let feynmanFeedbackData: any = null;
  if (error.feynman_feedback) {
    try {
      feynmanFeedbackData = typeof error.feynman_feedback === 'string'
        ? JSON.parse(error.feynman_feedback)
        : error.feynman_feedback;
    } catch {
      feynmanFeedbackData = { text: error.feynman_feedback };
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-surface-dark border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">
              {mode === 'view' ? 'visibility' : 'edit'}
            </span>
            {mode === 'view' ? 'Detalles del Error' : 'Editar Error'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Route and Error Type */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <span className="text-xs text-text-muted uppercase tracking-wider block mb-1">
                Ruta de Estudio
              </span>
              <p className="text-white font-semibold">{error.route_title || 'Sin ruta'}</p>
            </div>
            {mode === 'view' ? (
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold ${colors.bg} ${colors.text} ${colors.border} uppercase tracking-widest`}
              >
                {errorType ? errorTypeLabels[errorType] : 'Sin clasificar'}
              </span>
            ) : (
              <Select
                value={errorType || ''}
                onValueChange={(value) => setErrorType(value as 'concepto' | 'analisis' | 'atencion' | null)}
              >
                <SelectTrigger className="w-[180px] bg-background-dark/40 border-white/10 text-white">
                  <SelectValue placeholder="Tipo de error" />
                </SelectTrigger>
                <SelectContent className="bg-surface-dark border-white/10">
                  <SelectItem value="concepto" className="text-white focus:bg-primary/20">
                    Concepto
                  </SelectItem>
                  <SelectItem value="analisis" className="text-white focus:bg-primary/20">
                    Análisis
                  </SelectItem>
                  <SelectItem value="atencion" className="text-white focus:bg-primary/20">
                    Atención
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Hierarchy */}
          {(error.topic_name || error.subtopic_name || error.subsubtopic_name) && (
            <div>
              <span className="text-xs text-text-muted uppercase tracking-wider block mb-2">
                Jerarquía
              </span>
              <div className="space-y-1">
                {error.topic_name && (
                  <p className="text-sm text-slate-200">📚 Tema: {error.topic_name}</p>
                )}
                {error.subtopic_name && (
                  <p className="text-sm text-slate-200 ml-4">📖 Subtema: {error.subtopic_name}</p>
                )}
                {error.subsubtopic_name && (
                  <p className="text-sm text-slate-200 ml-8">📄 Sub-subtema: {error.subsubtopic_name}</p>
                )}
              </div>
            </div>
          )}

          {/* Question */}
          <div className="bg-background-dark/40 rounded-xl p-4 border border-white/5">
            <span className="text-xs text-text-muted uppercase tracking-wider block mb-2">
              Pregunta
            </span>
            <p className="text-base text-white leading-relaxed">{error.question_text}</p>
          </div>

          {/* Options */}
          <div>
            <span className="text-xs text-text-muted uppercase tracking-wider block mb-3">
              Opciones de Respuesta
            </span>
            <div className="space-y-2">
              {error.question_options.map((option, index) => {
                const isSelected = index === error.selected_answer_index;
                const isCorrect = index === error.correct_answer_index;
                
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border transition-all ${
                      isCorrect
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : isSelected
                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                        : 'bg-background-dark/40 border-white/5 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{String.fromCharCode(65 + index)}.</span>
                      <span className="flex-1">{option.text}</span>
                      {isCorrect && (
                        <span className="text-xs font-bold uppercase">✓ Correcta</span>
                      )}
                      {isSelected && !isCorrect && (
                        <span className="text-xs font-bold uppercase">✗ Tu respuesta</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time Spent */}
          {error.time_spent_seconds !== null && (
            <div className="bg-background-dark/40 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary text-sm">schedule</span>
                <span className="text-xs text-text-muted uppercase tracking-wider">
                  Tiempo Empleado
                </span>
              </div>
              <p className="text-lg text-white font-semibold ml-6">
                {formatTime(error.time_spent_seconds)}
              </p>
            </div>
          )}

          {/* Feynman Reasoning */}
          {error.feynman_reasoning && (
            <div className="bg-background-dark/40 rounded-xl p-4 border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-lg">psychology</span>
                <span className="text-xs text-text-muted uppercase tracking-wider">
                  Tu Razonamiento (Método Feynman)
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed ml-7">
                {error.feynman_reasoning}
              </p>
            </div>
          )}

          {/* User Conclusion */}
          {mode === 'view' ? (
            error.conclusion && (
              <div className="bg-background-dark/40 rounded-xl p-4 border border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-lg">edit_note</span>
                  <span className="text-xs text-text-muted uppercase tracking-wider">
                    Tu Conclusión
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed ml-7">
                  {error.conclusion}
                </p>
              </div>
            )
          ) : (
            <div className="bg-background-dark/40 rounded-xl p-4 border border-primary/10">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-lg">edit_note</span>
                <span className="text-xs text-text-muted uppercase tracking-wider">
                  Tu Conclusión
                </span>
              </div>
              <Textarea
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                placeholder="Escribe aquí por qué crees que te equivocaste..."
                className="bg-background-dark/60 border-white/10 text-white placeholder:text-text-muted min-h-[100px] resize-none"
              />
            </div>
          )}

          {/* Feynman Feedback */}
          {feynmanFeedbackData && (
            <div className="bg-background-dark/40 rounded-xl p-4 border border-primary/10">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-lg">smart_toy</span>
                <span className="text-xs text-text-muted uppercase tracking-wider">
                  Feedback IA (Método Feynman)
                </span>
              </div>
              <div className="space-y-4 ml-7">
                {feynmanFeedbackData.tecnica1 && (
                  <div>
                    <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">science</span>
                      Técnica 1: Descarte de Primeros Principios
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {feynmanFeedbackData.tecnica1}
                    </p>
                  </div>
                )}
                {feynmanFeedbackData.tecnica2 && (
                  <div>
                    <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">build</span>
                      Técnica 2: Reverse Engineering del Error
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {feynmanFeedbackData.tecnica2}
                    </p>
                  </div>
                )}
                {feynmanFeedbackData.resumen && (
                  <div>
                    <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">summarize</span>
                      Resumen y Recomendaciones
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {feynmanFeedbackData.resumen}
                    </p>
                  </div>
                )}
                {feynmanFeedbackData.text && (
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {feynmanFeedbackData.text}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Date */}
          <div className="text-xs text-text-muted border-t border-white/5 pt-4">
            Respondida el: {formatDate(error.answered_at)}
          </div>

          {/* Save Button (only in edit mode) */}
          {mode === 'edit' && (
            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <Button
                onClick={onClose}
                variant="outline"
                className="bg-background-dark/40 border-white/10 text-white hover:bg-background-dark/60"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-primary hover:bg-primary/80 text-white"
              >
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
