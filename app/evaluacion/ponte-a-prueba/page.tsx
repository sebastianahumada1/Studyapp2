'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Container } from '@/components/layout/Container';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormField } from '@/components/forms/FormField';
import { FormGroup } from '@/components/forms/FormGroup';
import { useRoutes } from '@/hooks/useKnowledgeHub';
import type { StudyRoute } from '@/types/knowledge-hub';

type EvaluationMode = 'subtopics' | 'topics' | 'full_route';

export default function PonteAPruebaPage() {
  const { data: routes, isLoading: routesLoading } = useRoutes();
  const [evaluationMode, setEvaluationMode] = useState<EvaluationMode>('subtopics');
  const [timePerQuestion, setTimePerQuestion] = useState(60);
  const [questionsPerSubtopic, setQuestionsPerSubtopic] = useState(4);
  const [metacognitionEnabled, setMetacognitionEnabled] = useState(true);
  const [interleavingEnabled, setInterleavingEnabled] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');

  const handleTimeChange = (delta: number) => {
    setTimePerQuestion((prev) => Math.max(0, prev + delta));
  };

  const handleQuestionsChange = (delta: number) => {
    setQuestionsPerSubtopic((prev) => Math.max(0, prev + delta));
  };

  const handleStartSimulation = () => {
    // TODO: Implement simulation start logic
    console.log('Starting simulation with:', {
      evaluationMode,
      timePerQuestion,
      questionsPerSubtopic,
      metacognitionEnabled,
      interleavingEnabled,
      selectedRouteId,
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />

      <main className="flex-1 h-full overflow-y-auto relative bg-background-dark bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-background-dark to-background-dark">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[size:40px_40px] bg-grid-pattern opacity-[0.05]"></div>
          <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px]"></div>
        </div>

        <header 
          className="w-full px-6 py-5 md:px-8 border-b border-border-dark/50 bg-[#0b1717]/80 backdrop-blur-md sticky top-0 z-30"
          style={{
            WebkitBackdropFilter: 'blur(12px)',
            backdropFilter: 'blur(12px)',
            WebkitTransform: 'translateZ(0)',
            transform: 'translateZ(0)',
            isolation: 'isolate' as const,
          }}
        >
          <Container maxWidth="full" className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-text-muted text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
                <span className="opacity-60">Evaluación</span>
                <span className="material-symbols-outlined text-[10px] opacity-40">chevron_right</span>
                <span className="text-primary drop-shadow-[0_0_5px_rgba(13,242,242,0.5)]">
                  Configuración de Simulacro
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight font-display flex items-center gap-3">
                Configuración de Simulacro
                <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20 tracking-wider align-middle mt-1">
                  V.2.0
                </span>
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-dark border border-border-dark text-[10px] font-mono text-text-muted shadow-inner">
                <span className="material-symbols-outlined text-[14px] text-primary">memory</span>
                <span>SYSTEM: READY</span>
              </div>
            </div>
          </Container>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth relative z-10 flex flex-col xl:flex-row gap-6 max-w-[1600px] mx-auto w-full">
          <div className="xl:flex-1 h-full min-h-0 flex flex-col">
            <div className="rounded-2xl border border-white/5 bg-[#0b1717] h-full relative group shadow-card-depth flex flex-col overflow-hidden">
              <div className="flex-1 flex flex-col relative overflow-y-auto">
                <div className="p-8 pb-4">
                  <h2 className="text-3xl font-bold text-white mb-4 font-display text-center">
                    Configura tu Simulacro
                  </h2>
                  <div className="flex items-start gap-5">
                    <div className="size-14 shrink-0 rounded-2xl bg-[#122a2a] border border-[#204a4a] flex items-center justify-center shadow-[0_0_15px_rgba(13,242,242,0.15)]">
                      <span className="material-symbols-outlined text-primary text-3xl">smart_toy</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xl font-bold text-white font-display">Ponte a Prueba</h3>
                      <p className="text-sm text-text-muted leading-relaxed font-light">
                        Selecciona el modo de evaluación y personaliza tu experiencia con las opciones
                        avanzadas de IA.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-8 pb-8 flex flex-col gap-6">
                  {/* Evaluation Mode */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm animate-spin-slow">
                        target
                      </span>
                      <label className="text-white text-xs font-bold uppercase tracking-wider">
                        Modo de Evaluación
                      </label>
                    </div>
                    <RadioGroup
                      value={evaluationMode}
                      onValueChange={(value) => setEvaluationMode(value as EvaluationMode)}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      <label className="relative cursor-pointer group h-full">
                        <RadioGroupItem value="subtopics" className="sr-only" />
                        <div
                          className={`h-full p-6 rounded-xl border transition-all duration-300 flex flex-col gap-3 ${
                            evaluationMode === 'subtopics'
                              ? 'border-primary bg-[#0f2222] shadow-[0_0_10px_rgba(13,242,242,0.1)]'
                              : 'border-border-dark bg-surface-lighter/20 hover:border-primary/50'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span
                              className={`material-symbols-outlined text-3xl ${
                                evaluationMode === 'subtopics' ? 'text-primary' : 'text-text-muted'
                              }`}
                            >
                              layers
                            </span>
                            {evaluationMode === 'subtopics' && (
                              <div className="size-3 rounded-full bg-primary shadow-[0_0_8px_#0df2f2]"></div>
                            )}
                          </div>
                          <h4
                            className={`font-bold text-lg font-display ${
                              evaluationMode === 'subtopics' ? 'text-primary' : 'text-text-muted group-hover:text-white'
                            }`}
                          >
                            Por Subtemas
                          </h4>
                          <p className="text-xs text-text-muted leading-relaxed">
                            Evalúa subtemas específicos en profundidad basándose en tu selección del panel
                            izquierdo.
                          </p>
                        </div>
                      </label>

                      <label className="relative cursor-pointer group h-full">
                        <RadioGroupItem value="topics" className="sr-only" />
                        <div
                          className={`h-full p-6 rounded-xl border transition-all duration-300 flex flex-col gap-3 ${
                            evaluationMode === 'topics'
                              ? 'border-primary bg-[#0f2222] shadow-[0_0_10px_rgba(13,242,242,0.1)]'
                              : 'border-border-dark bg-surface-lighter/20 hover:border-primary/50'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span
                              className={`material-symbols-outlined text-3xl ${
                                evaluationMode === 'topics' ? 'text-primary' : 'text-text-muted'
                              }`}
                            >
                              library_books
                            </span>
                            {evaluationMode === 'topics' && (
                              <div className="size-3 rounded-full bg-primary shadow-[0_0_8px_#0df2f2]"></div>
                            )}
                          </div>
                          <h4
                            className={`font-bold text-lg font-display ${
                              evaluationMode === 'topics' ? 'text-primary' : 'text-text-muted group-hover:text-white'
                            }`}
                          >
                            Por Temas
                          </h4>
                          <p className="text-xs text-text-muted leading-relaxed">
                            Evalúa temas completos de forma general ignorando la granularidad de subtemas.
                          </p>
                        </div>
                      </label>

                      <label className="relative cursor-pointer group h-full">
                        <RadioGroupItem value="full_route" className="sr-only" />
                        <div
                          className={`h-full p-6 rounded-xl border transition-all duration-300 flex flex-col gap-3 ${
                            evaluationMode === 'full_route'
                              ? 'border-primary bg-[#0f2222] shadow-[0_0_10px_rgba(13,242,242,0.1)]'
                              : 'border-border-dark bg-surface-lighter/20 hover:border-primary/50'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span
                              className={`material-symbols-outlined text-3xl ${
                                evaluationMode === 'full_route' ? 'text-primary' : 'text-text-muted'
                              }`}
                            >
                              map
                            </span>
                            {evaluationMode === 'full_route' && (
                              <div className="size-3 rounded-full bg-primary shadow-[0_0_8px_#0df2f2]"></div>
                            )}
                          </div>
                          <h4
                            className={`font-bold text-lg font-display ${
                              evaluationMode === 'full_route'
                                ? 'text-primary'
                                : 'text-text-muted group-hover:text-white'
                            }`}
                          >
                            Ruta Completa
                          </h4>
                          <p className="text-xs text-text-muted leading-relaxed">
                            Evalúa toda la ruta de aprendizaje activa en tu perfil de estudiante.
                          </p>
                        </div>
                      </label>
                    </RadioGroup>
                  </div>

                  {/* Configuration Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-border-dark bg-surface-lighter/10 flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-text-muted uppercase text-[11px] font-bold tracking-wider">
                        <span className="material-symbols-outlined text-sm">timer</span>
                        Tiempo por pregunta (seg)
                      </div>
                      <div 
                        className="relative bg-surface-dark border border-border-dark rounded-lg flex items-center h-12 px-4 group hover:border-primary/50 transition-colors"
                        style={{
                          backgroundColor: 'hsl(var(--surface-dark))',
                          borderColor: 'hsl(var(--border))',
                        }}
                      >
                        <Input
                          type="number"
                          value={timePerQuestion}
                          onChange={(e) => setTimePerQuestion(parseInt(e.target.value) || 0)}
                          className="w-full bg-transparent border-none text-white text-xl font-display font-medium text-center focus:ring-0 p-0 custom-number-input"
                          style={{
                            backgroundColor: 'transparent',
                            color: 'white',
                          }}
                        />
                        <div className="absolute right-2 top-0 bottom-0 flex flex-col justify-center gap-1">
                          <button
                            className="text-text-muted hover:text-primary transition-colors h-4 flex items-center"
                            onClick={() => handleTimeChange(1)}
                            type="button"
                          >
                            <span className="material-symbols-outlined text-lg">expand_less</span>
                          </button>
                          <button
                            className="text-text-muted hover:text-primary transition-colors h-4 flex items-center"
                            onClick={() => handleTimeChange(-1)}
                            type="button"
                          >
                            <span className="material-symbols-outlined text-lg">expand_more</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-border-dark bg-surface-lighter/10 flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-text-muted uppercase text-[11px] font-bold tracking-wider">
                        <span className="material-symbols-outlined text-sm">list_alt</span>
                        Preguntas por subtema
                      </div>
                      <div 
                        className="relative bg-surface-dark border border-border-dark rounded-lg flex items-center h-12 px-4 group hover:border-primary/50 transition-colors"
                        style={{
                          backgroundColor: 'hsl(var(--surface-dark))',
                          borderColor: 'hsl(var(--border))',
                        }}
                      >
                        <Input
                          type="number"
                          value={questionsPerSubtopic}
                          onChange={(e) => setQuestionsPerSubtopic(parseInt(e.target.value) || 0)}
                          className="w-full bg-transparent border-none text-white text-xl font-display font-medium text-center focus:ring-0 p-0 custom-number-input"
                          style={{
                            backgroundColor: 'transparent',
                            color: 'white',
                          }}
                        />
                        <div className="absolute right-2 top-0 bottom-0 flex flex-col justify-center gap-1">
                          <button
                            className="text-text-muted hover:text-primary transition-colors h-4 flex items-center"
                            onClick={() => handleQuestionsChange(1)}
                            type="button"
                          >
                            <span className="material-symbols-outlined text-lg">expand_less</span>
                          </button>
                          <button
                            className="text-text-muted hover:text-primary transition-colors h-4 flex items-center"
                            onClick={() => handleQuestionsChange(-1)}
                            type="button"
                          >
                            <span className="material-symbols-outlined text-lg">expand_more</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div
                    className={`rounded-xl p-5 flex items-center justify-between gap-6 shadow-sm ${
                      metacognitionEnabled
                        ? 'bg-primary/10 border border-primary/20'
                        : 'bg-surface-lighter/20 border border-border-dark hover:border-border-dark/80'
                    } transition-all`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-1 p-1.5 rounded-lg ${
                          metacognitionEnabled ? 'bg-primary/20 text-primary' : 'bg-surface-lighter text-text-muted'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xl">psychology</span>
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm font-display mb-1">
                          Metacognición Extendida
                        </h4>
                        <p className="text-[11px] text-text-muted leading-relaxed max-w-md">
                          Explica tu razonamiento para cada pregunta y recibe feedback de IA basado en
                          técnicas de estudio avanzadas.
                        </p>
                      </div>
                    </div>
                    <Switch checked={metacognitionEnabled} onCheckedChange={setMetacognitionEnabled} />
                  </div>

                  <div
                    className={`rounded-xl p-5 flex items-center justify-between gap-6 shadow-sm ${
                      interleavingEnabled
                        ? 'bg-primary/10 border border-primary/20'
                        : 'bg-surface-lighter/20 border border-border-dark hover:border-border-dark/80'
                    } transition-all`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-1 p-1.5 rounded-lg ${
                          interleavingEnabled ? 'bg-primary/20 text-primary' : 'bg-surface-lighter text-text-muted'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xl">shuffle</span>
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm font-display mb-1">Interleaving</h4>
                        <p className="text-[11px] text-text-muted leading-relaxed max-w-md">
                          Mezcla las preguntas intercalando temas diferentes para mejorar el aprendizaje y
                          la retención a largo plazo.
                        </p>
                      </div>
                    </div>
                    <Switch checked={interleavingEnabled} onCheckedChange={setInterleavingEnabled} />
                  </div>

                  {/* Route Selector */}
                  <FormField label="Ruta de Estudio *" required>
                    <Select value={selectedRouteId} onValueChange={setSelectedRouteId}>
                      <SelectTrigger 
                        className="w-full bg-surface-lighter/20 border border-border-dark rounded-lg py-3 pl-4 pr-10 text-white text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface-lighter/40 appearance-none cursor-pointer group hover:border-primary/30 transition-all font-body"
                        style={{
                          backgroundColor: 'hsl(var(--surface-dark))',
                          borderColor: 'hsl(var(--border))',
                          color: 'white',
                        }}
                      >
                        <SelectValue placeholder="Selecciona una ruta..." />
                      </SelectTrigger>
                      <SelectContent>
                        {routesLoading ? (
                          <SelectItem value="loading" disabled>
                            Cargando rutas...
                          </SelectItem>
                        ) : routes && routes.length > 0 ? (
                          routes.map((route) => (
                            <SelectItem key={route.id} value={route.id}>
                              {route.title}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-routes" disabled>
                            No hay rutas disponibles
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormField>

                  {/* Start Button */}
                  <Button
                    onClick={handleStartSimulation}
                    disabled={!selectedRouteId}
                    className="mt-4 w-full py-4 rounded-xl bg-primary text-background-dark font-display font-bold text-base uppercase tracking-widest flex items-center justify-center relative overflow-hidden group hover:shadow-[0_0_20px_rgba(13,242,242,0.6)] hover:-translate-y-0.5 transition-all duration-300 transform active:scale-[0.99] active:translate-y-0 shadow-[0_0_10px_rgba(13,242,242,0.3)]"
                  >
                    <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                    <span className="material-symbols-outlined mr-2 text-xl group-hover:rotate-45 transition-transform duration-500">
                      rocket_launch
                    </span>
                    <span className="relative z-10">Iniciar Simulacro</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </main>
    </div>
  );
}

