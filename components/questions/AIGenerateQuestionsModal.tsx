'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRoutesWithTree } from '@/hooks/useKnowledgeHub';
import { generateQuestionsWithAI } from '@/app/actions/questions';
import type { QuestionDifficulty } from '@/types/questions';

interface AIGenerateQuestionsModalProps {
  onClose: () => void;
}

type HierarchyLevel = 'route' | 'topic' | 'subtopic' | 'subsubtopic';

export function AIGenerateQuestionsModal({ onClose }: AIGenerateQuestionsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(false);

  // Hierarchy selection
  const [hierarchyLevel, setHierarchyLevel] = useState<HierarchyLevel>('route');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [selectedSubtopicId, setSelectedSubtopicId] = useState<string>('');
  const [selectedSubsubtopicId, setSelectedSubsubtopicId] = useState<string>('');

  // Form fields
  const [specificContent, setSpecificContent] = useState('');
  const [questionObjective, setQuestionObjective] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [selectedDifficulties, setSelectedDifficulties] = useState<QuestionDifficulty[]>(['media']);

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

  const getAvailableRoutes = () => routes || [];

  const handleDifficultyToggle = (difficulty: QuestionDifficulty) => {
    setSelectedDifficulties((prev) => {
      if (prev.includes(difficulty)) {
        // Don't allow removing the last difficulty
        if (prev.length === 1) return prev;
        return prev.filter((d) => d !== difficulty);
      }
      return [...prev, difficulty];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate hierarchy selection
    if (hierarchyLevel === 'route' && !selectedRouteId) {
      alert('Por favor selecciona una ruta');
      return;
    }
    if (hierarchyLevel === 'topic' && (!selectedRouteId || !selectedTopicId)) {
      alert('Por favor selecciona una ruta y un tema');
      return;
    }
    if (hierarchyLevel === 'subtopic' && (!selectedRouteId || !selectedTopicId || !selectedSubtopicId)) {
      alert('Por favor selecciona una ruta, tema y subtema');
      return;
    }
    if (hierarchyLevel === 'subsubtopic' && (!selectedRouteId || !selectedTopicId || !selectedSubtopicId || !selectedSubsubtopicId)) {
      alert('Por favor selecciona una ruta, tema, subtema y sub-subtema');
      return;
    }

    if (!specificContent.trim()) {
      alert('Por favor ingresa el contenido específico');
      return;
    }

    if (!questionObjective.trim()) {
      alert('Por favor ingresa el objetivo de las preguntas');
      return;
    }

    if (questionCount < 1 || questionCount > 100) {
      alert('La cantidad de preguntas debe estar entre 1 y 100');
      return;
    }

    if (selectedDifficulties.length === 0) {
      alert('Por favor selecciona al menos una dificultad');
      return;
    }

    setLoading(true);
    try {
      const result = await generateQuestionsWithAI({
        hierarchyLevel,
        routeId: selectedRouteId || undefined,
        topicId: selectedTopicId || undefined,
        subtopicId: selectedSubtopicId || undefined,
        subsubtopicId: selectedSubsubtopicId || undefined,
        specificContent,
        questionObjective,
        questionCount,
        difficulties: selectedDifficulties,
      });

      if (result.success) {
        alert(`¡Éxito! Se generaron ${result.data.questionsCreated} pregunta(s) con IA.`);
        onClose();
      } else {
        alert(result.error || 'Error al generar preguntas');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Error al generar preguntas con IA');
    } finally {
      setLoading(false);
    }
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
              <span className="material-symbols-outlined text-[32px]">auto_awesome</span>
            </div>
            <div className="flex-1">
              <h2 className="text-white text-3xl font-display font-bold tracking-tight mb-1">
                Generar Preguntas con IA
              </h2>
              <p className="text-text-muted max-w-2xl text-sm md:text-base">
                Configura los parámetros para que nuestra IA genere preguntas personalizadas basadas en tu contenido de estudio.
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
                  Selecciona a qué nivel de la jerarquía quieres asociar las preguntas generadas.
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

            {/* Specific Content */}
            <div className="flex flex-col gap-3">
              <label className="text-white font-semibold flex items-center gap-2 text-base">
                <div className="size-8 rounded-lg bg-[#231e3d] flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">article</span>
                </div>
                Contenido Específico
              </label>
              <div className="ml-10">
                <p className="text-xs text-text-muted mb-3">
                  Describe el contenido específico sobre el cual quieres que se generen las preguntas.
                </p>
                <textarea
                  value={specificContent}
                  onChange={(e) => setSpecificContent(e.target.value)}
                  className="w-full bg-background-dark border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none text-sm leading-relaxed"
                  placeholder="Ej: El sistema nervioso central, los nervios craneales y sus funciones motoras, la estructura del encéfalo..."
                  rows={4}
                  required
                />
              </div>
            </div>

            {/* Question Objective */}
            <div className="flex flex-col gap-3">
              <label className="text-white font-semibold flex items-center gap-2 text-base">
                <div className="size-8 rounded-lg bg-[#231e3d] flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">flag</span>
                </div>
                Objetivo de las Preguntas
              </label>
              <div className="ml-10">
                <p className="text-xs text-text-muted mb-3">
                  Describe qué tipo de preguntas quieres generar y qué deben evaluar.
                </p>
                <textarea
                  value={questionObjective}
                  onChange={(e) => setQuestionObjective(e.target.value)}
                  className="w-full bg-background-dark border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none text-sm leading-relaxed"
                  placeholder="Ej: Preguntas que evalúen la comprensión de las funciones de cada nervio craneal, su localización anatómica y sus aplicaciones clínicas..."
                  rows={3}
                  required
                />
              </div>
            </div>

            {/* Question Count */}
            <div className="flex flex-col gap-3">
              <label className="text-white font-semibold flex items-center gap-2 text-base">
                <div className="size-8 rounded-lg bg-[#231e3d] flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">numbers</span>
                </div>
                Cantidad de Preguntas
              </label>
              <div className="ml-10">
                <p className="text-xs text-text-muted mb-3">
                  Indica cuántas preguntas quieres generar (entre 1 y 100).
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuestionCount(Math.max(1, questionCount - 1))}
                    className="size-10 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-muted hover:text-primary transition-colors border border-white/10"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={questionCount}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value >= 1 && value <= 100) {
                        setQuestionCount(value);
                      }
                    }}
                    min={1}
                    max={100}
                    className="w-24 bg-background-dark border border-white/10 rounded-xl p-3 text-center text-lg font-display font-bold text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setQuestionCount(Math.min(100, questionCount + 1))}
                    className="size-10 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-muted hover:text-primary transition-colors border border-white/10"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Difficulties Selection */}
            <div className="flex flex-col gap-3">
              <label className="text-white font-semibold flex items-center gap-2 text-base">
                <div className="size-8 rounded-lg bg-[#231e3d] flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">signal_cellular_alt</span>
                </div>
                Dificultades
              </label>
              <div className="ml-10">
                <p className="text-xs text-text-muted mb-3">
                  Selecciona una o más dificultades para las preguntas generadas (puedes seleccionar múltiples).
                </p>
                <div className="flex flex-wrap gap-3">
                  {(['baja', 'media', 'alta'] as QuestionDifficulty[]).map((difficulty) => {
                    const isSelected = selectedDifficulties.includes(difficulty);
                    const labels = { baja: 'Baja', media: 'Media', alta: 'Alta' };
                    return (
                      <button
                        key={difficulty}
                        type="button"
                        onClick={() => handleDifficultyToggle(difficulty)}
                        className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'bg-primary/20 border-primary text-primary'
                            : 'bg-background-dark border-white/10 text-text-muted hover:border-primary/30'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-base ${
                          isSelected ? 'text-primary' : 'text-text-muted'
                        }`}>
                          {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span className="text-sm font-bold uppercase tracking-wider">
                          {labels[difficulty]}
                        </span>
                      </button>
                    );
                  })}
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
                disabled={loading || selectedDifficulties.length === 0}
                className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-bold shadow-[0_0_20px_rgba(13,242,242,0.4)] hover:shadow-[0_0_30px_rgba(13,242,242,0.6)] transition-all hover:scale-[1.02] flex items-center justify-center gap-2 group ring-1 ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined group-hover:animate-pulse">
                  auto_awesome
                </span>
                {loading ? 'Generando...' : 'Generar Preguntas'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
