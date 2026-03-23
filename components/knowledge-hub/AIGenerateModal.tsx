'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { generateRouteWithAI } from '@/app/actions/knowledge-hub';
import { useRouter } from 'next/navigation';
import type { StudyLevel } from '@/types/knowledge-hub';

interface AIGenerateModalProps {
  onClose: () => void;
}

export function AIGenerateModal({ onClose }: AIGenerateModalProps) {
  const [objective, setObjective] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState('');
  const [level, setLevel] = useState<StudyLevel>('intermedio');
  const [weeklyHours, setWeeklyHours] = useState(5);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  const loadingSteps = [
    { label: 'Analizando objetivo y temas...', icon: 'search' },
    { label: 'Diseñando la estructura curricular...', icon: 'account_tree' },
    { label: 'Generando contenido educativo...', icon: 'edit_note' },
    { label: 'Revisando progresión de aprendizaje...', icon: 'fact_check' },
    { label: 'Guardando en tu biblioteca...', icon: 'save' },
  ];

  useEffect(() => {
    if (!loading) {
      setLoadingStep(0);
      setLoadingProgress(0);
      return;
    }

    const totalMs = 18000;
    const stepMs = totalMs / loadingSteps.length;
    let step = 0;
    let progress = 0;

    const progressTimer = setInterval(() => {
      progress += 1;
      setLoadingProgress(Math.min(progress, 95));
    }, totalMs / 95);

    const stepTimer = setInterval(() => {
      step += 1;
      if (step < loadingSteps.length) setLoadingStep(step);
    }, stepMs);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Prevent body scroll when modal is open
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }

    // Calculate viewport size for Safari compatibility
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

  const handleAddTopic = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && topicInput.trim()) {
      e.preventDefault();
      setTopics([...topics, topicInput.trim()]);
      setTopicInput('');
    }
  };

  const handleRemoveTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-add topic from input if there's text but not in topics array
    const finalTopics = topicInput.trim() 
      ? [...topics, topicInput.trim()].filter((t, i, arr) => arr.indexOf(t) === i) // Remove duplicates
      : topics;
    
    if (!objective.trim() || finalTopics.length === 0) return;

    setLoading(true);
    try {
      const result = await generateRouteWithAI({
        objective,
        topics: finalTopics,
        level,
        weeklyHours,
      });

      if (result.success && result.routeId) {
        router.push(`/hub/${result.routeId}`);
        onClose();
      } else {
        alert(result.error || 'Error al generar ruta');
      }
    } catch (error) {
      alert('Error al generar ruta con IA');
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
        className="bg-card-dark border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl overflow-y-auto"
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
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="relative z-10">
          <button
            onClick={loading ? undefined : onClose}
            disabled={loading}
            className="absolute top-0 right-0 text-text-secondary hover:text-white transition-colors z-20 p-2 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center min-h-[340px]">
              <div className="relative mb-8">
                <div className="size-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-accent/20 flex items-center justify-center border border-accent/30">
                  <span className="material-symbols-outlined text-[40px] text-accent" style={{ animation: 'spin 2s linear infinite' }}>auto_awesome</span>
                </div>
                <div className="absolute -inset-3 rounded-2xl border border-accent/20 animate-ping" />
              </div>

              <h3 className="text-white text-xl font-bold mb-1">Generando tu ruta de estudio</h3>
              <p className="text-slate-400 text-sm mb-6">{loadingSteps[loadingStep]?.label}</p>

              <div className="w-full max-w-sm mb-2">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
              </div>
              <p className="text-slate-600 text-xs mb-8">{loadingProgress}% — puede tomar entre 15 y 25 segundos</p>

              <div className="flex flex-col gap-2.5 text-left w-full max-w-xs">
                {loadingSteps.map((step, index) => (
                  <div key={index} className={`flex items-center gap-3 text-sm transition-colors ${index <= loadingStep ? 'text-slate-300' : 'text-slate-600'}`}>
                    {index < loadingStep ? (
                      <span className="material-symbols-outlined text-emerald-400 text-base flex-shrink-0">check_circle</span>
                    ) : index === loadingStep ? (
                      <span className="material-symbols-outlined text-accent text-base flex-shrink-0" style={{ animation: 'spin 1.2s linear infinite' }}>progress_activity</span>
                    ) : (
                      <span className="size-4 rounded-full border border-slate-700 flex-shrink-0 inline-block" />
                    )}
                    {step.label}
                  </div>
                ))}
              </div>
            </div>
          ) : (
          <>
          <div className="flex items-start gap-4 mb-6 pr-10">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-accent/20 flex items-center justify-center text-accent border border-indigo-500/20 shadow-[0_0_20px_rgba(6,182,212,0.15)] flex-shrink-0">
              <span className="material-symbols-outlined text-[32px]">auto_awesome</span>
            </div>
            <div className="flex-1">
              <h2 className="text-white text-3xl font-bold tracking-tight mb-1">
                Generar Ruta con IA
              </h2>
              <p className="text-text-secondary max-w-2xl text-sm md:text-base">
                Configura los parámetros para que nuestro motor de IA diseñe tu plan de estudio
                personalizado y optimizado.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Objective */}
            <div className="flex flex-col gap-3">
              <label className="text-white font-semibold flex items-center gap-2 text-base">
                <div className="size-8 rounded-lg bg-[#231e3d] flex items-center justify-center text-accent">
                  <span className="material-symbols-outlined text-[18px]">flag</span>
                </div>
                Objetivo Principal
              </label>
              <div className="ml-10">
                <p className="text-xs text-text-secondary mb-3">
                  Describe qué quieres lograr con detalle. Sé específico para obtener un plan más
                  preciso.
                </p>
                <textarea
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="w-full bg-[#1a162e] border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none text-sm leading-relaxed"
                  placeholder="Ej: Prepararme para el examen de anatomía del sistema nervioso central enfocándome en los nervios craneales y sus funciones motoras..."
                  rows={3}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Topics */}
              <div className="flex flex-col gap-3">
                <label className="text-white font-semibold flex items-center gap-2 text-base">
                  <div className="size-8 rounded-lg bg-[#231e3d] flex items-center justify-center text-accent">
                    <span className="material-symbols-outlined text-[18px]">label</span>
                  </div>
                  Temas de Interés
                </label>
                <div className="ml-10">
                  <p className="text-xs text-text-secondary mb-3">
                    Añade palabras clave o subtemas obligatorios.
                  </p>
                  <div className="bg-[#1a162e] border border-white/10 rounded-xl p-3 flex flex-wrap gap-2 focus-within:border-accent transition-colors min-h-[56px]">
                    {topics.map((topic, index) => (
                      <span
                        key={index}
                        className="bg-indigo-500/20 text-indigo-200 px-2 py-1 rounded-lg text-xs flex items-center gap-1 border border-indigo-500/30 font-medium"
                      >
                        {topic}
                        <button
                          type="button"
                          onClick={() => handleRemoveTopic(index)}
                          className="hover:text-white flex items-center"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      onKeyDown={handleAddTopic}
                      className="bg-transparent border-none outline-none text-white text-sm flex-1 min-w-[100px] placeholder:text-gray-500 focus:placeholder:text-gray-400"
                      placeholder="Escribe y presiona Enter..."
                    />
                  </div>
                </div>
              </div>

              {/* Level */}
              <div className="flex flex-col gap-3">
                <label className="text-white font-semibold flex items-center gap-2 text-base">
                  <div className="size-8 rounded-lg bg-[#231e3d] flex items-center justify-center text-accent">
                    <span className="material-symbols-outlined text-[18px]">school</span>
                  </div>
                  Nivel Actual
                </label>
                <div className="ml-10">
                  <p className="text-xs text-text-secondary mb-3">
                    Esto ajustará la complejidad técnica del contenido generado.
                  </p>
                  <div className="relative">
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value as StudyLevel)}
                      className="w-full bg-[#1a162e] border border-white/10 rounded-xl p-3 pl-4 pr-10 text-white appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm cursor-pointer hover:bg-[#231e3d] transition-colors"
                    >
                      <option value="principiante">Principiante (Introductorio)</option>
                      <option value="intermedio">Intermedio (Universitario)</option>
                      <option value="avanzado">Avanzado (Especialización)</option>
                      <option value="experto">Experto (Investigación)</option>
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary material-symbols-outlined">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-white/5 w-full"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Weekly Hours */}
              <div className="flex flex-col gap-4">
                <label className="text-white font-semibold flex items-center gap-2 text-base">
                  <div className="size-8 rounded-lg bg-[#231e3d] flex items-center justify-center text-accent">
                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                  </div>
                  Tiempo Disponible Semanal
                </label>
                <div className="ml-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">
                      MÍNIMO: 1H
                    </span>
                    <div className="bg-accent/10 px-3 py-1 rounded-md border border-accent/20">
                      <span className="text-accent font-bold text-base">{weeklyHours} horas</span>
                    </div>
                    <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">
                      MÁXIMO: 40H
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="40"
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(Number(e.target.value))}
                    className="w-full h-2 bg-[#1a162e] rounded-lg appearance-none cursor-pointer accent-accent mb-2"
                  />
                  <p className="text-[11px] text-text-secondary italic">
                    La IA distribuirá la carga de trabajo en sesiones óptimas basándose en este
                    límite.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-4 mt-4 pt-6 border-t border-white/5">
              <button
                type="button"
                onClick={onClose}
                className="w-full md:w-auto px-6 py-3.5 rounded-xl border border-white/10 text-text-secondary hover:text-white hover:bg-white/5 transition-colors font-medium text-sm"
              >
                Cancelar configuración
              </button>
              <button
                type="submit"
                disabled={loading || !objective.trim() || (topics.length === 0 && !topicInput.trim())}
                className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-cyan-400 text-white font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all hover:scale-[1.02] flex items-center justify-center gap-2 group ring-1 ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined group-hover:animate-pulse">
                  auto_awesome
                </span>
                {loading ? 'Generando...' : 'Generar Ruta'}
              </button>
            </div>
          </form>
          </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

