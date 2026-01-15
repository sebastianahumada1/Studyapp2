'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRoutes } from '@/hooks/useKnowledgeHub';
import { useCreateTutorSession } from '@/hooks/useTutor';
import { buildTutorRole } from '@/lib/tutor';
import type { StudyRoute, StudyTopic, StudySubtopic } from '@/types/knowledge-hub';

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionCreated: (sessionId: string) => void;
}

export function CreateSessionModal({ isOpen, onClose, onSessionCreated }: CreateSessionModalProps) {
  const [mounted, setMounted] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  // Form state
  const [errorCodingEnabled, setErrorCodingEnabled] = useState(false);
  const [errorType, setErrorType] = useState<'concepto' | 'analisis' | 'atencion' | null>(null);
  const [selectedErrorIds, setSelectedErrorIds] = useState<string[]>([]);
  const [availableErrors, setAvailableErrors] = useState<any[]>([]);
  const [loadingErrors, setLoadingErrors] = useState(false);
  // Error coding specific route and topic
  const [errorCodingRouteId, setErrorCodingRouteId] = useState<string>('');
  const [errorCodingTopicId, setErrorCodingTopicId] = useState<string>('');
  // Normal hierarchy (only shown when error coding is disabled)
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [selectedSubtopicId, setSelectedSubtopicId] = useState<string>('');
  const [tutorRole, setTutorRole] = useState('');
  const [userRole, setUserRole] = useState('');
  const [context, setContext] = useState('');
  const [objective, setObjective] = useState('');

  // Data
  const { data: routes } = useRoutes();
  const [topics, setTopics] = useState<StudyTopic[]>([]);
  const [subtopics, setSubtopics] = useState<StudySubtopic[]>([]);
  // Error coding topics (separate from normal topics)
  const [errorCodingTopics, setErrorCodingTopics] = useState<StudyTopic[]>([]);
  const createSession = useCreateTutorSession();

  useEffect(() => {
    setMounted(true);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = isOpen ? 'hidden' : 'unset';
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
  }, [isOpen]);

  // Load topics when route is selected (normal hierarchy)
  useEffect(() => {
    if (!selectedRouteId || !routes) {
      setTopics([]);
      setSubtopics([]);
      setSelectedTopicId('');
      setSelectedSubtopicId('');
      return;
    }

    const loadTopics = async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data } = await supabase
        .from('study_topics')
        .select('*')
        .eq('route_id', selectedRouteId)
        .order('order_index');

      setTopics(data || []);
      setSubtopics([]);
      setSelectedTopicId('');
      setSelectedSubtopicId('');
    };

    loadTopics();
  }, [selectedRouteId, routes]);

  // Load topics when error coding route is selected
  useEffect(() => {
    if (!errorCodingRouteId || !routes) {
      setErrorCodingTopics([]);
      setErrorCodingTopicId('');
      return;
    }

    const loadErrorCodingTopics = async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data } = await supabase
        .from('study_topics')
        .select('*')
        .eq('route_id', errorCodingRouteId)
        .order('order_index');

      setErrorCodingTopics(data || []);
      setErrorCodingTopicId('');
    };

    loadErrorCodingTopics();
  }, [errorCodingRouteId, routes]);

  // Load subtopics when topic is selected
  useEffect(() => {
    if (!selectedTopicId) {
      setSubtopics([]);
      setSelectedSubtopicId('');
      return;
    }

    const loadSubtopics = async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data } = await supabase
        .from('study_subtopics')
        .select('*')
        .eq('topic_id', selectedTopicId)
        .order('order_index');

      setSubtopics(data || []);
      setSelectedSubtopicId('');
    };

    loadSubtopics();
  }, [selectedTopicId]);

  // Auto-complete tutor role when hierarchy is selected
  useEffect(() => {
    if (errorCodingEnabled) {
      // Use error coding hierarchy
      if (errorCodingRouteId && routes) {
        const route = routes.find((r) => r.id === errorCodingRouteId);
        const topic = errorCodingTopics.find((t) => t.id === errorCodingTopicId);

        const role = buildTutorRole(route?.title, topic?.name, undefined);
        setTutorRole(role);
      }
    } else {
      // Use normal hierarchy
      if (selectedRouteId && routes) {
        const route = routes.find((r) => r.id === selectedRouteId);
        const topic = topics.find((t) => t.id === selectedTopicId);
        const subtopic = subtopics.find((s) => s.id === selectedSubtopicId);

        const role = buildTutorRole(route?.title, topic?.name, subtopic?.name);
        setTutorRole(role);
      }
    }
  }, [
    errorCodingEnabled,
    errorCodingRouteId,
    errorCodingTopicId,
    selectedRouteId,
    selectedTopicId,
    selectedSubtopicId,
    routes,
    topics,
    subtopics,
    errorCodingTopics,
  ]);

  // Load errors when error coding is enabled, error type is selected, and topic is selected
  useEffect(() => {
    if (!errorCodingEnabled || !errorType || !errorCodingTopicId) {
      setAvailableErrors([]);
      setSelectedErrorIds([]);
      return;
    }

    const loadErrors = async () => {
      setLoadingErrors(true);
      try {
        const { getErrors } = await import('@/app/actions/errors');
        const result = await getErrors({
          errorType: errorType,
          route: errorCodingRouteId,
          topic: errorCodingTopicId,
        });

        if (result.success) {
          setAvailableErrors(result.data);
        }
      } catch (error) {
        console.error('Error loading errors:', error);
      } finally {
        setLoadingErrors(false);
      }
    };

    loadErrors();
  }, [errorCodingEnabled, errorType, errorCodingRouteId, errorCodingTopicId]);

  const toggleErrorSelection = (errorId: string) => {
    if (selectedErrorIds.includes(errorId)) {
      setSelectedErrorIds(selectedErrorIds.filter((id) => id !== errorId));
    } else {
      if (selectedErrorIds.length < 5) {
        setSelectedErrorIds([...selectedErrorIds, errorId]);
      } else {
        alert('Puedes seleccionar máximo 5 preguntas');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tutorRole || !userRole || !context || !objective) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    if (errorCodingEnabled && !errorType) {
      alert('Por favor selecciona un tipo de error');
      return;
    }

    if (errorCodingEnabled) {
      if (!errorCodingRouteId) {
        alert('Por favor selecciona una ruta de estudio');
        return;
      }
      if (!errorCodingTopicId) {
        alert('Por favor selecciona un tema');
        return;
      }
      if (selectedErrorIds.length === 0) {
        alert('Por favor selecciona al menos una pregunta');
        return;
      }
    }

    try {
      const result = await createSession.mutateAsync({
        // Use error coding hierarchy if enabled, otherwise use normal hierarchy
        route_id: errorCodingEnabled ? (errorCodingRouteId || null) : (selectedRouteId || null),
        topic_id: errorCodingEnabled ? (errorCodingTopicId || null) : (selectedTopicId || null),
        subtopic_id: errorCodingEnabled ? null : (selectedSubtopicId || null),
        tutor_role: tutorRole,
        user_role: userRole,
        context,
        objective,
        error_coding_enabled: errorCodingEnabled,
        error_type: errorCodingEnabled ? errorType : null,
        selected_error_ids: errorCodingEnabled ? selectedErrorIds : undefined,
      });

      onSessionCreated(result.id);
      onClose();
      // Reset form
      setErrorCodingEnabled(false);
      setErrorType(null);
      setErrorCodingRouteId('');
      setErrorCodingTopicId('');
      setSelectedErrorIds([]);
      setAvailableErrors([]);
      setSelectedRouteId('');
      setSelectedTopicId('');
      setSelectedSubtopicId('');
      setTutorRole('');
      setUserRole('');
      setContext('');
      setObjective('');
    } catch (error: any) {
      alert(error.message || 'Error al crear sesión');
    }
  };

  if (!mounted || !isOpen) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: viewportSize.width > 0 ? `${viewportSize.width}px` : '100%',
    height: viewportSize.height > 0 ? `${viewportSize.height}px` : '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    boxSizing: 'border-box',
  };

  return createPortal(
    <div style={overlayStyle} onClick={onClose}>
      <div
        className="bg-background-dark border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold text-white">Nueva Sesión de Tutoría</h2>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Coding Toggle */}
          <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-bold text-white uppercase tracking-wider">
                  Codificación de Errores
                </label>
                <p className="text-xs text-text-muted mt-1">
                  Enfoca la sesión en los errores del dashboard de errores
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setErrorCodingEnabled(!errorCodingEnabled);
                  if (errorCodingEnabled) {
                    setErrorType(null);
                    setErrorCodingRouteId('');
                    setErrorCodingTopicId('');
                    setSelectedErrorIds([]);
                    setAvailableErrors([]);
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  errorCodingEnabled ? 'bg-primary' : 'bg-white/10'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    errorCodingEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {errorCodingEnabled && (
              <div className="space-y-3 mt-4">
                <label className="text-sm font-bold text-text-muted uppercase tracking-wider">
                  Tipo de Error *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setErrorType('concepto')}
                    className={`px-4 py-3 rounded-xl border transition-all text-sm font-bold uppercase tracking-wider ${
                      errorType === 'concepto'
                        ? 'bg-pink-500/10 text-pink-400 border-pink-500/30 shadow-[0_0_8px_rgba(236,72,153,0.1)]'
                        : 'bg-white/5 text-text-muted border-white/10 hover:bg-white/10'
                    }`}
                  >
                    Concepto
                  </button>
                  <button
                    type="button"
                    onClick={() => setErrorType('analisis')}
                    className={`px-4 py-3 rounded-xl border transition-all text-sm font-bold uppercase tracking-wider ${
                      errorType === 'analisis'
                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/30 shadow-[0_0_8px_rgba(249,115,22,0.1)]'
                        : 'bg-white/5 text-text-muted border-white/10 hover:bg-white/10'
                    }`}
                  >
                    Análisis
                  </button>
                  <button
                    type="button"
                    onClick={() => setErrorType('atencion')}
                    className={`px-4 py-3 rounded-xl border transition-all text-sm font-bold uppercase tracking-wider ${
                      errorType === 'atencion'
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.1)]'
                        : 'bg-white/5 text-text-muted border-white/10 hover:bg-white/10'
                    }`}
                  >
                    Atención
                  </button>
                </div>
                <div className="text-xs text-text-muted mt-2 space-y-1">
                  {errorType === 'concepto' && (
                    <p>
                      El tutor reforzará directamente los conocimientos faltantes, explicará
                      conceptos claramente y proporcionará ejemplos educativos.
                    </p>
                  )}
                  {errorType === 'analisis' && (
                    <p>
                      El tutor usará preguntas socráticas exclusivamente, guiará el razonamiento
                      paso a paso y desarrollará pensamiento crítico.
                    </p>
                  )}
                  {errorType === 'atencion' && (
                    <p>
                      El tutor se enfocará en mejorar la atención y precisión en la lectura de
                      preguntas y opciones.
                    </p>
                  )}
                </div>

                {/* Error Coding Route Selection */}
                {errorType && (
                  <div className="space-y-2 mt-4">
                    <label className="text-sm font-bold text-text-muted uppercase tracking-wider">
                      Ruta de Estudio *
                    </label>
                    <select
                      value={errorCodingRouteId}
                      onChange={(e) => setErrorCodingRouteId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    >
                      <option value="">Selecciona una ruta</option>
                      {routes?.map((route) => (
                        <option key={route.id} value={route.id}>
                          {route.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Error Coding Topic Selection */}
                {errorType && errorCodingRouteId && (
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text-muted uppercase tracking-wider">
                      Tema *
                    </label>
                    <select
                      value={errorCodingTopicId}
                      onChange={(e) => setErrorCodingTopicId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    >
                      <option value="">Selecciona un tema</option>
                      {errorCodingTopics.map((topic) => (
                        <option key={topic.id} value={topic.id}>
                          {topic.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Error Selection */}
                {errorType && errorCodingTopicId && (
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-text-muted uppercase tracking-wider">
                        Selecciona Preguntas (Máximo 5)
                      </label>
                      <span className="text-xs text-text-muted">
                        {selectedErrorIds.length} / 5 seleccionadas
                      </span>
                    </div>
                    {loadingErrors ? (
                      <div className="text-center py-4">
                        <p className="text-text-muted text-sm">Cargando preguntas...</p>
                      </div>
                    ) : availableErrors.length === 0 ? (
                      <div className="text-center py-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-text-muted text-sm">
                          No hay preguntas con este tipo de error
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                        {availableErrors.map((error) => {
                          const isSelected = selectedErrorIds.includes(error.id);
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
                          const validErrorType = error.error_type && (error.error_type === 'concepto' || error.error_type === 'analisis' || error.error_type === 'atencion') 
                            ? error.error_type 
                            : null;
                          const colors = validErrorType
                            ? errorTypeColors[validErrorType]
                            : {
                                bg: 'bg-slate-500/10',
                                text: 'text-slate-400',
                                border: 'border-slate-500/30',
                              };

                          return (
                            <button
                              key={error.id}
                              type="button"
                              onClick={() => toggleErrorSelection(error.id)}
                              disabled={!isSelected && selectedErrorIds.length >= 5}
                              className={`w-full text-left p-3 rounded-xl border transition-all ${
                                isSelected
                                  ? `${colors.bg} ${colors.border} ${colors.text} border-2`
                                  : 'bg-white/5 border-white/10 hover:bg-white/10'
                              } ${!isSelected && selectedErrorIds.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`mt-1 size-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                    isSelected
                                      ? `${colors.border} ${colors.bg}`
                                      : 'border-white/20'
                                  }`}
                                >
                                  {isSelected && (
                                    <span className={`material-symbols-outlined text-sm ${colors.text}`}>
                                      check
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-white line-clamp-2">
                                    {error.question_text}
                                  </p>
                                  {error.route_title && (
                                    <p className="text-xs text-text-muted mt-1">
                                      {error.route_title}
                                      {error.topic_name && ` > ${error.topic_name}`}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Normal Hierarchy Selection (only shown when error coding is disabled) */}
          {!errorCodingEnabled && (
            <>
              {/* Route Selection */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-muted uppercase tracking-wider">
                  Ruta de Estudio (Opcional)
                </label>
                <select
                  value={selectedRouteId}
                  onChange={(e) => setSelectedRouteId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                >
                  <option value="">Ninguna ruta</option>
                  {routes?.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic Selection */}
              {selectedRouteId && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-muted uppercase tracking-wider">
                    Tema (Opcional)
                  </label>
                  <select
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="">Ningún tema</option>
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Subtopic Selection */}
              {selectedTopicId && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-muted uppercase tracking-wider">
                    Subtema (Opcional)
                  </label>
                  <select
                    value={selectedSubtopicId}
                    onChange={(e) => setSelectedSubtopicId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="">Ningún subtema</option>
                    {subtopics.map((subtopic) => (
                      <option key={subtopic.id} value={subtopic.id}>
                        {subtopic.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {/* Tutor Role */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-muted uppercase tracking-wider">
              Rol del Tutor *
            </label>
            <input
              type="text"
              value={tutorRole}
              onChange={(e) => setTutorRole(e.target.value)}
              placeholder="Ej: Especialista en Anatomía - Sistema Cardiovascular"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-text-muted focus:ring-1 focus:ring-primary focus:border-primary outline-none"
            />
          </div>

          {/* User Role */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-muted uppercase tracking-wider">
              Rol del Usuario *
            </label>
            <input
              type="text"
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              placeholder="Ej: Estudiante de medicina"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-text-muted focus:ring-1 focus:ring-primary focus:border-primary outline-none"
            />
          </div>

          {/* Context */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-muted uppercase tracking-wider">
              Contexto *
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Describe el contexto de aprendizaje..."
              required
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-text-muted focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none"
            />
          </div>

          {/* Objective */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-muted uppercase tracking-wider">
              Objetivo *
            </label>
            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Define el objetivo de la sesión..."
              required
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-text-muted focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 text-text-muted hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createSession.isPending}
              className="px-6 py-2 rounded-xl bg-primary text-background-dark font-bold hover:shadow-[0_0_20px_rgba(13,242,242,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createSession.isPending ? 'Creando...' : 'Crear Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
