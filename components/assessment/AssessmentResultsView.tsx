'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAssessmentResults } from '@/app/actions/assessment';
import { PageHeader } from '@/components/PageHeader';

interface AssessmentResultsViewProps {
  sessionId: string;
}

export function AssessmentResultsView({ sessionId }: AssessmentResultsViewProps) {
  const router = useRouter();
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    const loadResults = async () => {
      setIsLoading(true);
      try {
        const result = await getAssessmentResults(sessionId);
        if (!result.success) {
          alert(result.error || 'Error al cargar resultados');
          router.push('/assessment');
          return;
        }
        setResults(result.data);
      } catch (error) {
        console.error('Error loading results:', error);
        alert('Error al cargar resultados');
        router.push('/assessment');
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [sessionId, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted">Cargando resultados...</div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted">No se encontraron resultados</div>
      </div>
    );
  }

  const { session, answers, stats } = results;
  
  // Filter answers with feedback
  const answersWithFeedback = answers.filter((a: any) => a.feynman_feedback);
  const totalQuestionsWithFeedback = answersWithFeedback.length;
  const currentAnswer = answersWithFeedback[currentQuestionIndex];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto relative bg-background-dark">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 249, 249, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 249, 249, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Header */}
      <PageHeader title="Reporte de respuestas " />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-surface-dark/70 backdrop-blur-xl rounded-2xl p-6 border border-primary/10">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stats.total}</div>
                <div className="text-sm text-text-muted uppercase tracking-wider">Total</div>
              </div>
            </div>
            <div className="bg-surface-dark/70 backdrop-blur-xl rounded-2xl p-6 border border-primary/10">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stats.correct}</div>
                <div className="text-sm text-text-muted uppercase tracking-wider">Correctas</div>
              </div>
            </div>
            <div className="bg-surface-dark/70 backdrop-blur-xl rounded-2xl p-6 border border-primary/10">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stats.precision}%</div>
                <div className="text-sm text-text-muted uppercase tracking-wider">Precisión</div>
              </div>
            </div>
          </div>

          {/* Feedback Section */}
          {session.feynman_enabled && totalQuestionsWithFeedback > 0 && currentAnswer && (
            <div className="bg-surface-dark/70 backdrop-blur-xl rounded-2xl p-8 border border-primary/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-2xl">psychology</span>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white">Feedback metacognición extendida</h2>
                    <p className="text-sm text-text-muted mt-1">Análisis de tu razonamiento usando técnicas avanzadas de estudio</p>
                  </div>
                </div>
                <div className="text-sm text-text-muted">
                  {currentQuestionIndex + 1} / {totalQuestionsWithFeedback}
                </div>
              </div>

              {/* Question Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-bold text-white">Pregunta {answers.findIndex((a: any) => a.id === currentAnswer.id) + 1}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    currentAnswer.is_correct
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {currentAnswer.is_correct ? '✓ Correcta' : '✗ Incorrecta'}
                  </span>
                </div>
                <p className="text-lg text-slate-200 mb-4">{currentAnswer.question.question_text}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-xs text-text-muted uppercase tracking-wider block mb-1">Tu respuesta</span>
                    <span className="text-white font-medium">
                      {String.fromCharCode(65 + currentAnswer.selected_answer_index)}. {currentAnswer.question.options[currentAnswer.selected_answer_index]?.text}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-text-muted uppercase tracking-wider block mb-1">Respuesta correcta</span>
                    <span className="text-primary font-medium">
                      {String.fromCharCode(65 + currentAnswer.question.correct_answer_index)}. {currentAnswer.question.options[currentAnswer.question.correct_answer_index]?.text}
                    </span>
                  </div>
                </div>
                {currentAnswer.feynman_reasoning && (
                  <div className="bg-background-dark/40 rounded-xl p-4 border border-primary/10">
                    <span className="text-xs text-text-muted uppercase tracking-wider block mb-2">Tu razonamiento</span>
                    <p className="text-slate-300">{currentAnswer.feynman_reasoning}</p>
                  </div>
                )}
              </div>

              {/* Feedback Content */}
              {currentAnswer.feynman_feedback && (() => {
                let feedbackData: any;
                try {
                  feedbackData = typeof currentAnswer.feynman_feedback === 'string' 
                    ? JSON.parse(currentAnswer.feynman_feedback) 
                    : currentAnswer.feynman_feedback;
                } catch {
                  feedbackData = { tecnica1: currentAnswer.feynman_feedback, tecnica2: '', resumen: '' };
                }

                return (
                  <div className="space-y-6">
                    {/* Técnica 1 */}
                    {feedbackData.tecnica1 && (
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg">science</span>
                          Técnica 1: Descarte de Primeros Principios
                        </h4>
                        <div className="bg-background-dark/40 rounded-xl p-5 border border-primary/10">
                          <p className="text-slate-200 leading-relaxed">{feedbackData.tecnica1}</p>
                        </div>
                      </div>
                    )}

                    {/* Técnica 2 */}
                    {feedbackData.tecnica2 && (
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg">build</span>
                          Técnica 2: Reverse Engineering del Error
                        </h4>
                        <div className="bg-background-dark/40 rounded-xl p-5 border border-primary/10">
                          <p className="text-slate-200 leading-relaxed">{feedbackData.tecnica2}</p>
                        </div>
                      </div>
                    )}

                    {/* Resumen */}
                    {feedbackData.resumen && (
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg">summarize</span>
                          Resumen y Recomendaciones
                        </h4>
                        <div className="bg-background-dark/40 rounded-xl p-5 border border-primary/10">
                          <p className="text-slate-200 leading-relaxed">{feedbackData.resumen}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Navigation Buttons */}
              {totalQuestionsWithFeedback > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-white/10">
                  <button
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="size-10 flex items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white hover:border-white/50 hover:bg-white/15 active:bg-white/20 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5 disabled:hover:border-white/20"
                  >
                    <span className="material-symbols-outlined text-2xl pointer-events-none">chevron_left</span>
                  </button>
                  <span className="text-sm text-text-muted">
                    {currentQuestionIndex + 1} / {totalQuestionsWithFeedback}
                  </span>
                  <button
                    onClick={() => setCurrentQuestionIndex(Math.min(totalQuestionsWithFeedback - 1, currentQuestionIndex + 1))}
                    disabled={currentQuestionIndex === totalQuestionsWithFeedback - 1}
                    className="size-10 flex items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white hover:border-white/50 hover:bg-white/15 active:bg-white/20 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5 disabled:hover:border-white/20"
                  >
                    <span className="material-symbols-outlined text-2xl pointer-events-none">chevron_right</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
