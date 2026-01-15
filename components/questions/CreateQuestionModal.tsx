'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRoutesWithTree } from '@/hooks/useKnowledgeHub';
import { createQuestion } from '@/app/actions/questions';
import { useRouter } from 'next/navigation';
import type { QuestionFormData, QuestionDifficulty } from '@/types/questions';
import type { RouteWithTree, TopicWithChildren, SubtopicWithChildren } from '@/types/knowledge-hub';

interface CreateQuestionModalProps {
  onClose: () => void;
}

type HierarchyLevel = 'route' | 'topic' | 'subtopic' | 'subsubtopic';

export function CreateQuestionModal({ onClose }: CreateQuestionModalProps) {
  const [mounted, setMounted] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [hierarchyLevel, setHierarchyLevel] = useState<HierarchyLevel>('route');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<Array<{ text: string; isCorrect: boolean }>>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('media');
  const [origin, setOrigin] = useState<'manual' | 'ai' | 'csv'>('manual');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Selected IDs
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [selectedSubtopicId, setSelectedSubtopicId] = useState<string>('');
  const [selectedSubsubtopicId, setSelectedSubsubtopicId] = useState<string>('');

  const { data: routes, isLoading: routesLoading } = useRoutesWithTree();

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
      alert('Por favor ingresa la pregunta');
      return;
    }

    if (options.some((opt) => !opt.text.trim())) {
      alert('Todas las opciones deben tener texto');
      return;
    }

    if (!options.some((opt) => opt.isCorrect)) {
      alert('Debes seleccionar una opción correcta');
      return;
    }

    // Validate hierarchy selection
    let formData: QuestionFormData;
    const correctIndex = options.findIndex((opt) => opt.isCorrect);

    switch (hierarchyLevel) {
      case 'route':
        if (!selectedRouteId) {
          alert('Por favor selecciona una ruta');
          return;
        }
        formData = {
          question_text: questionText,
          options,
          correct_answer_index: correctIndex,
          difficulty,
          origin,
          explanation: explanation.trim() || null,
          route_id: selectedRouteId,
          topic_id: null,
          subtopic_id: null,
          subsubtopic_id: null,
        };
        break;
      case 'topic':
        if (!selectedRouteId) {
          alert('Por favor selecciona una ruta');
          return;
        }
        if (!selectedTopicId) {
          alert('Por favor selecciona un tema');
          return;
        }
        formData = {
          question_text: questionText,
          options,
          correct_answer_index: correctIndex,
          difficulty,
          origin,
          explanation: explanation.trim() || null,
          route_id: selectedRouteId, // Guardar también la ruta
          topic_id: selectedTopicId,
          subtopic_id: null,
          subsubtopic_id: null,
        };
        break;
      case 'subtopic':
        if (!selectedRouteId) {
          alert('Por favor selecciona una ruta');
          return;
        }
        if (!selectedTopicId) {
          alert('Por favor selecciona un tema');
          return;
        }
        if (!selectedSubtopicId) {
          alert('Por favor selecciona un subtema');
          return;
        }
        formData = {
          question_text: questionText,
          options,
          correct_answer_index: correctIndex,
          difficulty,
          origin,
          explanation: explanation.trim() || null,
          route_id: selectedRouteId, // Guardar también la ruta
          topic_id: selectedTopicId, // Guardar también el tema
          subtopic_id: selectedSubtopicId,
          subsubtopic_id: null,
        };
        break;
      case 'subsubtopic':
        if (!selectedRouteId) {
          alert('Por favor selecciona una ruta');
          return;
        }
        if (!selectedTopicId) {
          alert('Por favor selecciona un tema');
          return;
        }
        if (!selectedSubtopicId) {
          alert('Por favor selecciona un subtema');
          return;
        }
        if (!selectedSubsubtopicId) {
          alert('Por favor selecciona un sub-subtema');
          return;
        }
        formData = {
          question_text: questionText,
          options,
          correct_answer_index: correctIndex,
          difficulty,
          origin,
          explanation: explanation.trim() || null,
          route_id: selectedRouteId, // Guardar también la ruta
          topic_id: selectedTopicId, // Guardar también el tema
          subtopic_id: selectedSubtopicId, // Guardar también el subtema
          subsubtopic_id: selectedSubsubtopicId,
        };
        break;
    }

    setLoading(true);
    try {
      const result = await createQuestion(formData);
      if (result.success) {
        router.refresh();
        onClose();
      } else {
        alert(result.error || 'Error al crear pregunta');
      }
    } catch (error) {
      alert('Error al crear pregunta');
    } finally {
      setLoading(false);
    }
  };

  // Get available options based on hierarchy level
  const getAvailableRoutes = () => routes || [];
  const getAvailableTopics = () => {
    if (!routes) return [];
    return routes.flatMap((route) => route.topics);
  };
  const getAvailableSubtopics = () => {
    if (!routes) return [];
    return routes.flatMap((route) =>
      route.topics.flatMap((topic) => topic.subtopics)
    );
  };
  const getAvailableSubsubtopics = () => {
    if (!routes) return [];
    return routes.flatMap((route) =>
      route.topics.flatMap((topic) =>
        topic.subtopics.flatMap((subtopic) => subtopic.subsubtopics)
      )
    );
  };

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
              <span className="material-symbols-outlined text-[32px]">edit_document</span>
            </div>
            <div className="flex-1">
              <h2 className="text-white text-3xl font-display font-bold tracking-tight mb-1">
                Crear Pregunta Manualmente
              </h2>
              <p className="text-text-muted max-w-2xl text-sm md:text-base">
                Crea una pregunta personalizada con opciones de respuesta y asígnala a tu contenido de estudio.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Hierarchy Level Selection */}
            <div className="flex flex-col gap-3">
              <label className="text-white font-semibold flex items-center gap-2 text-base">
                <div className="size-8 rounded-lg bg-[#231e3d] flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">account_tree</span>
                </div>
                Nivel de Asociación
              </label>
              <div className="ml-10">
                <p className="text-xs text-text-muted mb-3">
                  Selecciona a qué nivel de la jerarquía quieres asociar esta pregunta.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(['route', 'topic', 'subtopic', 'subsubtopic'] as HierarchyLevel[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => {
                        setHierarchyLevel(level);
                        setSelectedRouteId('');
                        setSelectedTopicId('');
                        setSelectedSubtopicId('');
                        setSelectedSubsubtopicId('');
                      }}
                      className={`px-4 py-3 rounded-xl border transition-all ${
                        hierarchyLevel === level
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-background-dark border-white/10 text-text-muted hover:border-primary/30'
                      }`}
                    >
                      <div className="text-xs font-bold uppercase tracking-wider">
                        {level === 'route' ? 'Ruta' : level === 'topic' ? 'Tema' : level === 'subtopic' ? 'Subtema' : 'Sub-Subtema'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Hierarchy Selection - Cascading Selectors */}
            <div className="flex flex-col gap-4">
              {/* Route Selector - Always shown for topic, subtopic, subsubtopic */}
              {(hierarchyLevel === 'topic' || hierarchyLevel === 'subtopic' || hierarchyLevel === 'subsubtopic') && (
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
                          // Reset dependent selections
                          setSelectedTopicId('');
                          setSelectedSubtopicId('');
                          setSelectedSubsubtopicId('');
                        }}
                        className="w-full bg-background-dark border border-white/10 rounded-xl p-3 pl-4 pr-10 text-white appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm cursor-pointer hover:bg-[#231e3d] transition-colors"
                        required
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

              {/* Topic Selector - Shown for topic, subtopic, subsubtopic */}
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
                          // Reset dependent selections
                          setSelectedSubtopicId('');
                          setSelectedSubsubtopicId('');
                        }}
                        className="w-full bg-background-dark border border-white/10 rounded-xl p-3 pl-4 pr-10 text-white appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm cursor-pointer hover:bg-[#231e3d] transition-colors"
                        required
                        disabled={!selectedRouteId}
                      >
                        <option value="">Selecciona un tema...</option>
                        {routes
                          ?.find((r) => r.id === selectedRouteId)
                          ?.topics.map((topic) => (
                            <option key={topic.id} value={topic.id}>
                              {topic.name}
                            </option>
                          ))}
                      </select>
                    )}
                  </div>
                </div>
              )}

              {/* Subtopic Selector - Shown for subtopic, subsubtopic */}
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
                          // Reset dependent selections
                          setSelectedSubsubtopicId('');
                        }}
                        className="w-full bg-background-dark border border-white/10 rounded-xl p-3 pl-4 pr-10 text-white appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm cursor-pointer hover:bg-[#231e3d] transition-colors"
                        required
                        disabled={!selectedRouteId || !selectedTopicId}
                      >
                        <option value="">Selecciona un subtema...</option>
                        {routes
                          ?.find((r) => r.id === selectedRouteId)
                          ?.topics.find((t) => t.id === selectedTopicId)
                          ?.subtopics.map((subtopic) => (
                            <option key={subtopic.id} value={subtopic.id}>
                              {subtopic.name}
                            </option>
                          ))}
                      </select>
                    )}
                  </div>
                </div>
              )}

              {/* Subsubtopic Selector - Only shown for subsubtopic */}
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
                        required
                        disabled={!selectedRouteId || !selectedTopicId || !selectedSubtopicId}
                      >
                        <option value="">Selecciona un sub-subtema...</option>
                        {routes
                          ?.find((r) => r.id === selectedRouteId)
                          ?.topics.find((t) => t.id === selectedTopicId)
                          ?.subtopics.find((s) => s.id === selectedSubtopicId)
                          ?.subsubtopics.map((subsubtopic) => (
                            <option key={subsubtopic.id} value={subsubtopic.id}>
                              {subsubtopic.name}
                            </option>
                          ))}
                      </select>
                    )}
                  </div>
                </div>
              )}

              {/* Route Selector - Only shown when hierarchyLevel is 'route' */}
              {hierarchyLevel === 'route' && (
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
                        onChange={(e) => setSelectedRouteId(e.target.value)}
                        className="w-full bg-background-dark border border-white/10 rounded-xl p-3 pl-4 pr-10 text-white appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm cursor-pointer hover:bg-[#231e3d] transition-colors"
                        required
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
            </div>

            <div className="h-px bg-white/5 w-full"></div>

            {/* Question Text */}
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
                  placeholder="Escribe tu pregunta aquí..."
                  rows={3}
                  required
                />
              </div>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-white font-semibold flex items-center gap-2 text-base">
                  <div className="size-8 rounded-lg bg-[#231e3d] flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[18px]">list</span>
                  </div>
                  Opciones de Respuesta (2-4)
                </label>
                {options.length < 4 && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="px-3 py-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary text-xs font-semibold transition-colors"
                  >
                    + Agregar Opción
                  </button>
                )}
              </div>
              <div className="ml-10 space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                        placeholder={`Opción ${String.fromCharCode(65 + index)}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleCorrectAnswerChange(index)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 size-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          option.isCorrect
                            ? 'bg-primary border-primary text-white'
                            : 'border-white/20 hover:border-primary/50'
                        }`}
                        title="Marcar como respuesta correcta"
                      >
                        {option.isCorrect && (
                          <span className="material-symbols-outlined text-xs">check</span>
                        )}
                      </button>
                    </div>
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
                <p className="text-xs text-text-muted italic">
                  Haz clic en el círculo al lado de cada opción para marcarla como correcta.
                </p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

              {/* Origin */}
              <div className="flex flex-col gap-3">
                <label className="text-white font-semibold flex items-center gap-2 text-base">
                  <div className="size-8 rounded-lg bg-[#231e3d] flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[18px]">source</span>
                  </div>
                  Origen
                </label>
                <div className="ml-10">
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value as 'manual' | 'ai' | 'csv')}
                    className="w-full bg-background-dark border border-white/10 rounded-xl p-3 pl-4 pr-10 text-white appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm cursor-pointer hover:bg-[#231e3d] transition-colors"
                  >
                    <option value="manual">Manual</option>
                    <option value="ai">Generado por IA</option>
                    <option value="csv">Importación CSV</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-4 mt-4 pt-6 border-t border-white/5">
              <button
                type="button"
                onClick={onClose}
                className="w-full md:w-auto px-6 py-3.5 rounded-xl border border-white/10 text-text-muted hover:text-white hover:bg-white/5 transition-colors font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-bold shadow-[0_0_20px_rgba(13,242,242,0.4)] hover:shadow-[0_0_30px_rgba(13,242,242,0.6)] transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">add</span>
                {loading ? 'Creando...' : 'Crear Pregunta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
