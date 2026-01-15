'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getAssessmentSession, generateSessionQuestions, submitAnswer, generateFeynmanFeedback, updateAssessmentSessionStatus } from '@/app/actions/assessment';
import type { QuestionWithHierarchy } from '@/types/questions';
import type { AssessmentSession } from '@/types/assessment';

interface AssessmentSessionViewProps {
  sessionId: string;
}

export function AssessmentSessionView({ sessionId }: AssessmentSessionViewProps) {
  const router = useRouter();
  const [session, setSession] = useState<AssessmentSession | null>(null);
  const [questions, setQuestions] = useState<QuestionWithHierarchy[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feynmanReasoning, setFeynmanReasoning] = useState('');
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const correctCount = 0; // TODO: Calculate from submitted answers

  // Debug: Log button state
  useEffect(() => {
    console.log('Button state check:', {
      selectedAnswer,
      isSubmitting,
      feynmanEnabled: session?.feynman_enabled,
      feynmanReasoningLength: feynmanReasoning?.trim().length,
      buttonDisabled: selectedAnswer === null || 
        isSubmitting || 
        (session?.feynman_enabled && (!feynmanReasoning || feynmanReasoning.trim().length < 20))
    });
  }, [selectedAnswer, isSubmitting, session?.feynman_enabled, feynmanReasoning]);

  // Load session and questions
  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true);
      try {
        const sessionResult = await getAssessmentSession(sessionId);
        if (!sessionResult.success) {
          alert(sessionResult.error || 'Error al cargar sesión');
          router.push('/assessment');
          return;
        }

        setSession(sessionResult.data);

        // Generate questions for this session
        const questionsResult = await generateSessionQuestions({
          selected_items: sessionResult.data.selected_items,
          questions_count: sessionResult.data.questions_count,
          interleaving_enabled: sessionResult.data.interleaving_enabled,
        });

        if (!questionsResult.success) {
          alert(questionsResult.error || 'Error al generar preguntas');
          router.push('/assessment');
          return;
        }

        console.log('Questions loaded:', questionsResult.data.length);
        console.log('First question:', questionsResult.data[0]);
        setQuestions(questionsResult.data);
        setQuestionStartTime(Date.now());

        // Set timer if enabled
        if (sessionResult.data.time_per_question_enabled && sessionResult.data.time_per_question) {
          setTimeRemaining(sessionResult.data.time_per_question);
        }
      } catch (error) {
        console.error('Error loading session:', error);
        alert('Error al cargar la sesión');
        router.push('/assessment');
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [sessionId, router]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  // Time spent counter
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - questionStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [questionStartTime]);

  const handleAnswerSelect = (index: number) => {
    console.log('handleAnswerSelect called with index:', index);
    console.log('Current selectedAnswer state before update:', selectedAnswer);
    setSelectedAnswer(index);
    // Verify the state was updated
    setTimeout(() => {
      console.log('State should now be:', index);
    }, 0);
  };

  const handleNext = async () => {
    if (selectedAnswer === null) {
      alert('Por favor selecciona una respuesta');
      return;
    }

    // Validate Feynman reasoning - it's always required if enabled
    if (session?.feynman_enabled) {
      if (!feynmanReasoning || feynmanReasoning.trim().length < 20) {
        alert('Por favor escribe al menos 20 caracteres en tu razonamiento de metacognición extendida. Este campo es obligatorio.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await submitAnswer({
        session_id: sessionId,
        question_id: currentQuestion.id,
        selected_answer_index: selectedAnswer,
        time_spent_seconds: timeSpent,
        feynman_reasoning: session?.feynman_enabled ? feynmanReasoning : null,
      });

      // Move to next question or finish
      if (currentQuestionIndex < questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        console.log('Moving to next question:', nextIndex);
        setCurrentQuestionIndex(nextIndex);
        setSelectedAnswer(null);
        setFeynmanReasoning('');
        setTimeSpent(0);
        setQuestionStartTime(Date.now());
        if (session?.time_per_question_enabled && session?.time_per_question) {
          setTimeRemaining(session.time_per_question);
        }
      } else {
        // Finish assessment
        if (session?.feynman_enabled) {
          // Generate feedback
          await generateFeynmanFeedback(sessionId);
        }
        await updateAssessmentSessionStatus(sessionId, 'completed');
        router.push(`/assessment/results/${sessionId}`);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Error al guardar respuesta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = async () => {
    if (!confirm('¿Estás seguro de que deseas finalizar la evaluación? No podrás continuar después.')) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit current answer if selected
      if (selectedAnswer !== null && currentQuestion) {
        await submitAnswer({
          session_id: sessionId,
          question_id: currentQuestion.id,
          selected_answer_index: selectedAnswer,
          time_spent_seconds: timeSpent,
          feynman_reasoning: session?.feynman_enabled ? feynmanReasoning : null,
        });
      }

      // Generate feedback if Feynman enabled
      if (session?.feynman_enabled) {
        await generateFeynmanFeedback(sessionId);
      }

      await updateAssessmentSessionStatus(sessionId, 'completed');
      router.push(`/assessment/results/${sessionId}`);
    } catch (error) {
      console.error('Error finishing assessment:', error);
      alert('Error al finalizar evaluación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getHierarchyLabel = () => {
    if (!currentQuestion) return '';
    return currentQuestion.route?.title || '';
  };

  const getHierarchyTitle = () => {
    if (!currentQuestion) return '';
    if (currentQuestion.subsubtopic) {
      return `Sub-subtema: ${currentQuestion.subsubtopic.name}`;
    }
    if (currentQuestion.subtopic) {
      return `Subtema: ${currentQuestion.subtopic.name}`;
    }
    if (currentQuestion.topic) {
      return `Tema: ${currentQuestion.topic.name}`;
    }
    if (currentQuestion.route) {
      return `Ruta: ${currentQuestion.route.title}`;
    }
    return '';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted">Cargando sesión...</div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted">No hay preguntas disponibles</div>
      </div>
    );
  }

  const timerPercentage = session?.time_per_question && timeRemaining !== null
    ? (timeRemaining / session.time_per_question) * 100
    : 0;

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

      {/* Top Navigation HUD */}
      <header className="sticky top-0 w-full z-50 bg-background-dark/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-text-muted">
              <svg className="size-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z"
                  fill="currentColor"
                />
                <path
                  clipRule="evenodd"
                  d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00356 12.3152 8.00039 12.2667 8.00004 12.2612C8.00004 12.261 8 12.2607 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236ZM4.95178 15.2312L21.4543 41.6973C22.6288 43.5809 25.3712 43.5809 26.5457 41.6973L43.0534 15.223C43.0709 15.1948 43.0878 15.1662 43.104 15.1371L41.3563 14.1648C43.104 15.1371 43.1038 15.1374 43.104 15.1371L43.1051 15.135L43.1065 15.1325L43.1101 15.1261L43.1199 15.1082C43.1276 15.094 43.1377 15.0754 43.1497 15.0527C43.1738 15.0075 43.2062 14.9455 43.244 14.8701C43.319 14.7208 43.4196 14.511 43.5217 14.2683C43.6901 13.8679 44 13.0689 44 12.2609C44 10.5573 43.003 9.22254 41.8558 8.2791C40.6947 7.32427 39.1354 6.55361 37.385 5.94477C33.8654 4.72057 29.133 4 24 4C18.867 4 14.1346 4.72057 10.615 5.94478C8.86463 6.55361 7.30529 7.32428 6.14419 8.27911C4.99695 9.22255 3.99999 10.5573 3.99999 12.2609C3.99999 13.1275 4.29264 13.9078 4.49321 14.3607C4.60375 14.6102 4.71348 14.8196 4.79687 14.9689C4.83898 15.0444 4.87547 15.1065 4.9035 15.1529C4.91754 15.1762 4.92954 15.1957 4.93916 15.2111L4.94662 15.223L4.95178 15.2312ZM35.9868 18.996L24 38.22L12.0131 18.996C12.4661 19.1391 12.9179 19.2658 13.3617 19.3718C16.4281 20.1039 20.0901 20.5217 24 20.5217C27.9099 20.5217 31.5719 20.1039 34.6383 19.3718C35.082 19.2658 35.5339 19.1391 35.9868 18.996Z"
                  fill="currentColor"
                  fillRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold tracking-widest text-text-muted uppercase">
              StudyApp <span className="text-white font-light">LIVE</span>
            </h2>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/10">
          <div
            className="h-full bg-text-muted/40 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="pt-6 pb-12 px-6 max-w-[1200px] mx-auto flex gap-8 relative z-10">
        {/* Left Column: Question & Answers */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Question Panel */}
          <div className="bg-surface-dark/70 backdrop-blur-xl border border-primary/10 rounded-2xl p-[30px] relative overflow-hidden" style={{ clipPath: 'polygon(0 0, 97% 0, 100% 3%, 100% 100%, 3% 100%, 0 97%)' }}>
            <div className="absolute top-0 right-0 p-[15px] opacity-20">
              <span className="material-symbols-outlined text-[57px] text-primary">quiz</span>
            </div>
            <div className="flex flex-col gap-[7.6px] mb-[22.8px]">
              <span className="text-primary font-mono text-[13.3px] tracking-widest uppercase">
                {getHierarchyLabel()}
              </span>
              <h1 className="text-[28.5px] font-display font-bold leading-tight text-white">
                {getHierarchyTitle()}
              </h1>
            </div>
            <div className="bg-background-dark/40 p-[22.8px] rounded-xl border border-primary/10 mb-[22.8px]">
              <p className="text-[17.1px] leading-relaxed text-slate-200">
                {currentQuestion.question_text}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-[15.2px]">
              {currentQuestion.options && currentQuestion.options.length > 0 ? (
                currentQuestion.options.map((option, index) => (
                  <button
                    key={`option-${index}-${currentQuestionIndex}`}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Option button clicked:', index, 'Current selectedAnswer:', selectedAnswer);
                      handleAnswerSelect(index);
                    }}
                    className={`group flex items-center text-left p-[19px] rounded-xl border transition-all duration-300 cursor-pointer ${
                      selectedAnswer === index
                        ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(6,249,249,0.3)]'
                        : 'border-primary/20 bg-background-dark/60 hover:border-primary'
                    }`}
                  >
                    <span
                      className={`size-[30.4px] rounded-full border flex items-center justify-center font-bold mr-[15.2px] transition-colors ${
                        selectedAnswer === index
                          ? 'border-primary bg-primary text-background-dark'
                          : 'border-primary/40 text-primary group-hover:bg-primary group-hover:text-background-dark'
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span
                      className={`transition-colors ${
                        selectedAnswer === index ? 'text-white' : 'text-slate-300 group-hover:text-white'
                      }`}
                    >
                      {option.text}
                    </span>
                  </button>
                ))
              ) : (
                <div className="text-red-500 text-sm p-4">Error: Esta pregunta no tiene opciones disponibles</div>
              )}
            </div>
          </div>

          {/* Feynman Reasoning Area */}
          {session?.feynman_enabled && (
            <div className="bg-surface-dark/70 backdrop-blur-xl border-l-4 border-l-primary/60 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary">psychology</span>
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary/80">
                  Metacognición Extendida
                </h3>
              </div>
              <textarea
                value={feynmanReasoning}
                onChange={(e) => setFeynmanReasoning(e.target.value)}
                className={`w-full bg-background-dark/40 border rounded-xl p-4 text-slate-300 focus:ring-0 placeholder:text-slate-600 transition-all min-h-[120px] resize-none ${
                  feynmanReasoning.trim().length > 0 && feynmanReasoning.trim().length < 20
                    ? 'border-red-500/50 focus:border-red-500'
                    : 'border-primary/10 focus:border-primary'
                }`}
                placeholder="Explica tu razonamiento paso a paso como si se lo enseñaras a alguien más para maximizar tu puntaje de retención... (Mínimo 20 caracteres - OBLIGATORIO)"
                maxLength={500}
                required
              />
              <div className="flex justify-between items-center mt-3">
                <p className={`text-[10px] italic uppercase ${
                  feynmanReasoning.trim().length > 0 && feynmanReasoning.trim().length < 20
                    ? 'text-red-500'
                    : 'text-slate-500'
                }`}>
                  {feynmanReasoning.trim().length > 0 && feynmanReasoning.trim().length < 20
                    ? `Mínimo 20 caracteres requeridos (${feynmanReasoning.trim().length}/20)`
                    : 'La IA analizará la coherencia de tu explicación'}
                </p>
                <span className={`text-xs font-mono ${
                  feynmanReasoning.trim().length > 0 && feynmanReasoning.trim().length < 20
                    ? 'text-red-500'
                    : 'text-primary'
                }`}>
                  Caracteres: {feynmanReasoning.length} / 500
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: HUD Stats & Timer */}
        <div className="w-80 flex flex-col gap-6">
          {/* Timer Circle */}
          {session?.time_per_question_enabled && timeRemaining !== null && (
            <div className="bg-surface-dark/70 backdrop-blur-xl rounded-2xl p-8 flex flex-col items-center justify-center aspect-square text-center relative border border-primary/10">
              <svg className="size-48 transform -rotate-90" style={{ filter: 'drop-shadow(0 0 8px #06f9f9)' }}>
                <circle
                  className="text-primary/10"
                  cx="96"
                  cy="96"
                  fill="transparent"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <circle
                  className="text-primary transition-all duration-1000"
                  cx="96"
                  cy="96"
                  fill="transparent"
                  r="88"
                  stroke="currentColor"
                  strokeDasharray="552.92"
                  strokeDashoffset={552.92 - (552.92 * timerPercentage) / 100}
                  strokeWidth="6"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold tracking-tighter text-white">
                  {formatTime(timeRemaining)}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-primary font-bold mt-1">
                  Tiempo Restante
                </span>
              </div>
            </div>
          )}

          {/* Stats Card */}
          <div className="bg-surface-dark/70 backdrop-blur-xl rounded-2xl p-6 border border-primary/10">
            <div className="flex justify-between items-center border-b border-primary/10 pb-3 mb-3">
              <span className="text-xs text-slate-400 uppercase tracking-wider">Progreso</span>
              <span className="text-primary font-bold">
                {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex items-center justify-center gap-3 mt-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (currentQuestionIndex > 0) {
                    setCurrentQuestionIndex(currentQuestionIndex - 1);
                    setSelectedAnswer(null);
                    setFeynmanReasoning('');
                    setTimeSpent(0);
                    setQuestionStartTime(Date.now());
                    if (session?.time_per_question_enabled && session?.time_per_question) {
                      setTimeRemaining(session.time_per_question);
                    }
                  }
                }}
                disabled={currentQuestionIndex === 0}
                className="size-10 flex items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white hover:border-white/50 hover:bg-white/15 active:bg-white/20 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5 disabled:hover:border-white/20"
              >
                <span className="material-symbols-outlined text-2xl pointer-events-none">chevron_left</span>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Next button clicked. State:', {
                    selectedAnswer,
                    isSubmitting,
                    feynmanEnabled: session?.feynman_enabled,
                    feynmanReasoning: feynmanReasoning,
                    feynmanLength: feynmanReasoning?.trim().length
                  });
                  handleNext();
                }}
                disabled={
                  selectedAnswer === null || 
                  isSubmitting || 
                  (session?.feynman_enabled && (!feynmanReasoning || feynmanReasoning.trim().length < 20))
                }
                className={`size-10 flex items-center justify-center rounded-xl border transition-all ${
                  selectedAnswer !== null && 
                  !isSubmitting && 
                  (!session?.feynman_enabled || (feynmanReasoning && feynmanReasoning.trim().length >= 20))
                    ? 'border-primary/50 bg-primary/10 text-primary hover:border-primary hover:bg-primary/20 active:scale-95'
                    : 'border-white/20 bg-white/5 text-white hover:border-white/50 hover:bg-white/15 active:bg-white/20 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5 disabled:hover:border-white/20'
                }`}
                title={
                  selectedAnswer === null 
                    ? 'Selecciona una respuesta primero' 
                    : session?.feynman_enabled && (!feynmanReasoning || feynmanReasoning.trim().length < 20)
                    ? `Escribe al menos 20 caracteres en tu razonamiento (${feynmanReasoning?.trim().length || 0}/20)`
                    : 'Siguiente pregunta'
                }
              >
                <span className="material-symbols-outlined text-2xl pointer-events-none">chevron_right</span>
              </button>
              <button
                onClick={handleFinish}
                disabled={isSubmitting}
                className="flex-1 h-10 bg-gradient-to-r from-primary/80 to-blue-600/80 hover:from-primary hover:to-blue-600 text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center shadow-[0_0_20px_rgba(13,242,242,0.4)] hover:shadow-[0_0_30px_rgba(13,242,242,0.6)] hover:scale-[1.02] active:scale-[0.98] border border-primary/30 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Finalizar Evaluación
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
