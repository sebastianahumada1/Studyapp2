'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRoutesWithTree } from '@/hooks/useKnowledgeHub';
import { useQuestion } from '@/hooks/useQuestions';
import { updateQuestion } from '@/app/actions/questions';
import { useRouter } from 'next/navigation';
import type { QuestionFormData, QuestionDifficulty } from '@/types/questions';

interface EditQuestionModalProps {
  questionId: string;
  onClose: () => void;
}

type HierarchyLevel = 'route' | 'topic' | 'subtopic' | 'subsubtopic';

export function EditQuestionModal({ questionId, onClose }: EditQuestionModalProps) {
  const [mounted, setMounted] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<Array<{ text: string; isCorrect: boolean }>>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('media');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Selected IDs
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [selectedSubtopicId, setSelectedSubtopicId] = useState<string>('');
  const [selectedSubsubtopicId, setSelectedSubsubtopicId] = useState<string>('');

  const { data: routes, isLoading: routesLoading } = useRoutesWithTree();
  const { data: question, isLoading: questionLoading } = useQuestion(questionId);

  // Initialize form with question data
  useEffect(() => {
    if (question) {
      setQuestionText(question.question_text);
      setOptions(question.options.length > 0 ? question.options : [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ]);
      setDifficulty(question.difficulty);
      setExplanation(question.explanation || '');
      setSelectedRouteId(question.route_id || '');
      setSelectedTopicId(question.topic_id || '');
      setSelectedSubtopicId(question.subtopic_id || '');
      setSelectedSubsubtopicId(question.subsubtopic_id || '');
    }
  }, [question]);

  // Determine hierarchy level from question
  const hierarchyLevel = useMemo<HierarchyLevel>(() => {
    if (question?.subsubtopic_id) return 'subsubtopic';
    if (question?.subtopic_id) return 'subtopic';
    if (question?.topic_id) return 'topic';
    return 'route';
  }, [question]);

  useEffect(() => {
    setMounted(true);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }

    const updateViewportSize = () => {
      if (typeof window !== 'undefined') {
        setViewportSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };

    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);

    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'unset';
      }
      window.removeEventListener('resize', updateViewportSize);
    };
  }, []);

  const handleAddOption = () => {
    if (options.length < 4) {
      setOptions([...options, { text: '', isCorrect: false }]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      // Ensure at least one is correct
      if (newOptions.every((opt) => !opt.isCorrect) && newOptions.length > 0) {
        newOptions[0].isCorrect = true;
      }
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const handleCorrectAnswerChange = (index: number) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!questionText.trim()) {
      alert('Por favor ingresa el texto de la pregunta');
      return;
    }

    const filteredOptions = options.filter((opt) => opt.text.trim() !== '');
    if (filteredOptions.length < 2) {
      alert('Debes tener al menos 2 opciones de respuesta');
      return;
    }

    const correctIndex = filteredOptions.findIndex((opt) => opt.isCorrect);
    if (correctIndex === -1) {
      alert('Por favor selecciona la opción correcta');
      return;
    }

    const formData: Partial<QuestionFormData> = {
      question_text: questionText,
      options: filteredOptions,
      correct_answer_index: correctIndex,
      difficulty,
      explanation: explanation.trim() || null,
      route_id: selectedRouteId || null,
      topic_id: selectedTopicId || null,
      subtopic_id: selectedSubtopicId || null,
      subsubtopic_id: selectedSubsubtopicId || null,
    };

    setLoading(true);
    try {
      const result = await updateQuestion(questionId, formData);
      if (result.success) {
        router.refresh();
        onClose();
      } else {
        alert(result.error || 'Error al actualizar pregunta');
      }
    } catch (error) {
      alert('Error al actualizar pregunta');
    } finally {
      setLoading(false);
    }
  };

  // Get available routes
  const getAvailableRoutes = () => routes || [];

  // Get current route, topic, subtopic for cascading selects
  const currentRoute = useMemo(() => {
    return routes?.find((r) => r.id === selectedRouteId);
  }, [routes, selectedRouteId]);

  const currentTopic = useMemo(() => {
    return currentRoute?.topics.find((t) => t.id === selectedTopicId);
  }, [currentRoute, selectedTopicId]);

  const currentSubtopic = useMemo(() => {
    return currentTopic?.subtopics.find((st) => st.id === selectedSubtopicId);
  }, [currentTopic, selectedSubtopicId]);

  if (!mounted || typeof document === 'undefined' || !document.body) {
    return null;
  }

  const overlayStyle: React.CSSProperties = {
    animation: 'fadeIn 0.2s ease-out',
    WebkitBackdropFilter: 'blur(12px)',
    backdropFilter: 'blur(12px)',
    position: 'fixed',
    top: 0,
    left: 0,
    padding: '1rem',
    boxSizing: 'border-box',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflowY: 'auto',
    WebkitTransform: 'translateZ(0)',
    transform: 'translateZ(0)',
  };

  if (viewportSize.width > 0 && viewportSize.height > 0) {
    overlayStyle.width = `${viewportSize.width}px`;
    overlayStyle.height = `${viewportSize.height}px`;
  } else {
    overlayStyle.width = '100%';
    overlayStyle.height = '100%';
  }

  const modalMaxHeight = viewportSize.height > 0
    ? `${Math.floor(viewportSize.height * 0.9)}px`
    : '90vh';

  if (questionLoading) {
    return createPortal(
      <div className="bg-black/80" onClick={onClose} style={overlayStyle}>
        <div
          className="bg-surface-dark border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          style={{
            animation: 'zoomIn95 0.2s ease-out',
            width: '90%',
            maxWidth: '62.5rem',
            maxHeight: modalMaxHeight,
            margin: 'auto',
          }}
        >
          <div className="text-white text-center py-12">Cargando pregunta...</div>
        </div>
      </div>,
      document.body
    );
  }

  if (!question) {
    return createPortal(
      <div className="bg-black/80" onClick={onClose} style={overlayStyle}>
        <div
          className="bg-surface-dark border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          style={{
            animation: 'zoomIn95 0.2s ease-out',
            width: '90%',
            maxWidth: '62.5rem',
            maxHeight: modalMaxHeight,
            margin: 'auto',
          }}
        >
          <div className="text-white text-center py-12">Pregunta no encontrada</div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div
      className="bg-black/80"
      onClick={onClose}
      style={overlayStyle}
    >
      <div
        className="bg-surface-dark border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'zoomIn95 0.2s ease-out',
          WebkitTransform: 'translateZ(0)',
          transform: 'translateZ(0)',
          width: '90%',
          maxWidth: '62.5rem',
          maxHeight: modalMaxHeight,
          margin: 'auto',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="relative z-10">
          <button
            onClick={onClose}
            className="absolute top-0 right-0 text-text-muted hover:text-white transition-colors z-20 p-2 rounded-lg hover:bg-white/5"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
          <div className="flex items-start gap-4 mb-6 pr-10">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-600/20 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_20px_rgba(13,242,242,0.15)] flex-shrink-0">
              <span className="material-symbols-outlined text-[32px]">edit</span>
            </div>
            <div className="flex-1">
              <h2 className="text-white text-3xl font-display font-bold tracking-tight mb-1">
                Editar Pregunta
              </h2>
              <p className="text-text-muted max-w-2xl text-sm md:text-base">
                Modifica el contenido de la pregunta, opciones de respuesta y su asociación jerárquica.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Hierarchy Selection - Cascading Selectors */}
            <div className="flex flex-col gap-4">
              {/* Route Selector */}
              {(hierarchyLevel === 'topic' || hierarchyLevel === 'subtopic' || hierarchyLevel === 'subsubtopic' || hierarchyLevel === 'route') && (
                <div className="flex flex-col gap-3">
                  <label className="text-white font-semibold flex items-center gap-2 text-base">
                    <div className="size-8 rounded-lg bg-[#231e3d] flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[18px]">route</span>
                    </div>
                    Seleccionar Ruta
                  </label>
                  <div className="ml-10">
                    {routesLoading ? (
                      <div className="text-text-muted text-sm">Cargando opciones...</div>
                    ) : (
                      <select
                        value={selectedRouteId}
                        onChange={(e) => {
                          setSelectedRouteId(e.target.value);
                          setSelectedTopicId('');
                          setSelectedSubtopicId('');
                          setSelectedSubsubtopicId('');
                        }}
                        className="w-full bg-background-dark border border-white/10 rounded-xl p-3 pl-4 pr-10 text-white appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm cursor-pointer hover:bg-[#231e3d] transition-colors"
                      >
                        <option value="">Selecciona una ruta...</option>
                        {getAvailableRoutes().map((route) => (
                          <option key={route.id} value={route.id}>
                            {route.title}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              )}

              {/* Topic Selector */}
              {(hierarchyLevel === 'topic' || hierarchyLevel === 'subtopic' || hierarchyLevel === 'subsubtopic') && (
                <div className="flex flex-col gap-3">
                  <label className="text-white font-semibold flex items-center gap-2 text-base">
                    <div className="size-8 rounded-lg bg-[#231e3d] flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[18px]">menu_book</span>
                    </div>
                    Seleccionar Tema
                  </label>
                  <div className="ml-10">
                    {routesLoading || !selectedRouteId ? (
                      <div className="text-text-muted text-sm">
                        {!selectedRouteId ? 'Primero selecciona una ruta' : 'Cargando opciones...'}
                      </div>
                    ) : (
                      <select
                        value={selectedTopicId}
                        onChange={(e) => {
                          setSelectedTopicId(e.target.value);
                          setSelectedSubtopicId('');
                          setSelectedSubsubtopicId('');
                        }}
                        className="w-full bg-background-dark border border-white/10 rounded-xl p-3 pl-4 pr-10 text-white appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm cursor-pointer hover:bg-[#231e3d] transition-colors"
                        disabled={!selectedRouteId}
                      >
                        <option value="">Selecciona un tema...</option>
                        {currentRoute?.topics.map((topic) => (
                          <option key={topic.id} value={topic.id}>
                            {topic.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              )}

              {/* Subtopic Selector */}
              {(hierarchyLevel === 'subtopic' || hierarchyLevel === 'subsubtopic') && (
                <div className="flex flex-col gap-3">
                  <label className="text-white font-semibold flex items-center gap-2 text-base">
                    <div className="size-8 rounded-lg bg-[#231e3d] flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[18px]">folder</span>
                    </div>
                    Seleccionar Subtema
                  </label>
                  <div className="ml-10">
                    {routesLoading || !selectedRouteId || !selectedTopicId ? (
                      <div className="text-text-muted text-sm">
                        {!selectedRouteId
                          ? 'Primero selecciona una ruta'
                          : !selectedTopicId
                          ? 'Primero selecciona un tema'
                          : 'Cargando opciones...'}
                      </div>
                    ) : (
                      <select
                        value={selectedSubtopicId}
                        onChange={(e) => {
                          setSelectedSubtopicId(e.target.value);
                          setSelectedSubsubtopicId('');
                        }}
                        className="w-full bg-background-dark border border-white/10 rounded-xl p-3 pl-4 pr-10 text-white appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm cursor-pointer hover:bg-[#231e3d] transition-colors"
                        disabled={!selectedRouteId || !selectedTopicId}
                      >
                        <option value="">Selecciona un subtema...</option>
                        {currentTopic?.subtopics.map((subtopic) => (
                          <option key={subtopic.id} value={subtopic.id}>
                            {subtopic.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              )}

              {/* Subsubtopic Selector */}
              {hierarchyLevel === 'subsubtopic' && (
                <div className="flex flex-col gap-3">
                  <label className="text-white font-semibold flex items-center gap-2 text-base">
                    <div className="size-8 rounded-lg bg-[#231e3d] flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[18px]">description</span>
                    </div>
                    Seleccionar Sub-Subtema
                  </label>
                  <div className="ml-10">
                    {routesLoading || !selectedRouteId || !selectedTopicId || !selectedSubtopicId ? (
                      <div className="text-text-muted text-sm">
                        {!selectedRouteId
                          ? 'Primero selecciona una ruta'
                          : !selectedTopicId
                          ? 'Primero selecciona un tema'
                          : !selectedSubtopicId
                          ? 'Primero selecciona un subtema'
                          : 'Cargando opciones...'}
                      </div>
                    ) : (
                      <select
                        value={selectedSubsubtopicId}
                        onChange={(e) => setSelectedSubsubtopicId(e.target.value)}
                        className="w-full bg-background-dark border border-white/10 rounded-xl p-3 pl-4 pr-10 text-white appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm cursor-pointer hover:bg-[#231e3d] transition-colors"
                        disabled={!selectedRouteId || !selectedTopicId || !selectedSubtopicId}
                      >
                        <option value="">Selecciona un sub-subtema...</option>
                        {currentSubtopic?.subsubtopics.map((subsubtopic) => (
                          <option key={subsubtopic.id} value={subsubtopic.id}>
                            {subsubtopic.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Question Content */}
            <div className="flex flex-col gap-3">
              <label className="text-white font-semibold flex items-center gap-2 text-base">
                <div className="size-8 rounded-lg bg-[#231e3d] flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">help</span>
                </div>
                Pregunta
              </label>
              <div className="ml-10">
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full bg-background-dark border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none text-sm leading-relaxed"
                  placeholder="Escribe el contenido de la pregunta aquí..."
                  rows={4}
                  required
                />
              </div>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3">
              <label className="text-white font-semibold flex items-center gap-2 text-base">
                <div className="size-8 rounded-lg bg-[#231e3d] flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">list</span>
                </div>
                Opciones de Respuesta (marca la correcta)
              </label>
              <div className="ml-10 space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="correct-answer"
                      checked={option.isCorrect}
                      onChange={() => handleCorrectAnswerChange(index)}
                      className="size-5 text-primary focus:ring-primary cursor-pointer"
                    />
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Opción ${index + 1}`}
                      className="flex-1 bg-background-dark border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                      required={index < 2}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="p-2 text-text-muted hover:text-red-400 transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    )}
                  </div>
                ))}
                {options.length < 4 && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="w-full px-4 py-2 border border-dashed border-white/20 rounded-xl text-text-muted hover:text-white hover:border-primary/50 transition-colors text-sm"
                  >
                    + Agregar Opción
                  </button>
                )}
              </div>
            </div>

            {/* Explanation */}
            <div className="flex flex-col gap-3">
              <label className="text-white font-semibold flex items-center gap-2 text-base">
                <div className="size-8 rounded-lg bg-[#231e3d] flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                </div>
                Explicación
              </label>
              <div className="ml-10">
                <p className="text-xs text-text-muted mb-3">
                  Justifica por qué la respuesta correcta es correcta. Esta explicación ayudará a los estudiantes a comprender mejor el concepto.
                </p>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full bg-background-dark border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none text-sm leading-relaxed"
                  placeholder="Explica por qué la respuesta correcta es la correcta..."
                  rows={4}
                />
              </div>
            </div>

            {/* Difficulty */}
            <div className="flex flex-col gap-3">
              <label className="text-white font-semibold flex items-center gap-2 text-base">
                <div className="size-8 rounded-lg bg-[#231e3d] flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">signal_cellular_alt</span>
                </div>
                Dificultad
              </label>
              <div className="ml-10">
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
                  className="w-full bg-background-dark border border-white/10 rounded-xl p-3 pl-4 pr-10 text-white appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm cursor-pointer hover:bg-[#231e3d] transition-colors"
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/5">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl border border-white/10 text-text-muted hover:text-white hover:bg-white/5 transition-colors font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-bold shadow-[0_0_20px_rgba(13,242,242,0.4)] hover:shadow-[0_0_30px_rgba(13,242,242,0.6)] transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
