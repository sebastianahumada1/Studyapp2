'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { QuestionBankSidebar } from '@/components/evaluation/QuestionBankSidebar';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/FormField';

export default function BancoPreguntasPage() {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set(['algebra', 'calculus']));

  const handleToggleItem = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />

      <main className="flex-1 h-full overflow-y-auto relative bg-background-dark">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[size:40px_40px] bg-grid-pattern opacity-[0.03] bg-grid-mask"></div>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]"></div>
        </div>

        <header 
          className="w-full px-6 py-6 md:px-10 border-b border-border-dark bg-[#102323]/90 backdrop-blur-sm sticky top-0 z-10"
          style={{
            WebkitBackdropFilter: 'blur(4px)',
            backdropFilter: 'blur(4px)',
            WebkitTransform: 'translateZ(0)',
            transform: 'translateZ(0)',
            isolation: 'isolate' as const,
          }}
        >
          <Container maxWidth="full" className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-text-muted text-xs font-medium uppercase tracking-widest mb-1">
                <span>Evaluación</span>
                <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                <span className="text-primary">Centro de Diagnóstico</span>
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Centro de Diagnóstico</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-dark border border-border-dark text-xs text-text-muted">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                IA System Online
              </div>
            </div>
          </Container>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth relative z-10 flex flex-col xl:flex-row gap-6 xl:gap-8">
          <QuestionBankSidebar selectedItems={selectedItems} onToggleItem={handleToggleItem} />

          <div className="xl:flex-1">
            <Card className="group relative flex flex-col bg-surface-dark border border-border-dark rounded-2xl p-1 tech-card-clip transition-all duration-500 hover:border-primary hover:shadow-neon hover:-translate-y-1 h-full">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[150px] text-primary -rotate-12">quiz</span>
              </div>
              <div 
                className="flex-1 bg-background-dark/50 rounded-xl p-8 flex flex-col gap-6 backdrop-blur-sm h-full tech-card-clip"
                style={{
                  WebkitBackdropFilter: 'blur(4px)',
                  backdropFilter: 'blur(4px)',
                  WebkitTransform: 'translateZ(0)',
                  transform: 'translateZ(0)',
                }}
              >
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-surface-dark to-background-dark border border-border-dark flex items-center justify-center shadow-lg group-hover:shadow-neon-sm transition-all group-hover:border-primary/50">
                  <span className="material-symbols-outlined text-4xl text-primary">smart_toy</span>
                </div>
                <div className="flex-col gap-2">
                  <h3 className="text-3xl font-bold text-white group-hover:text-primary transition-colors">
                    Ponte a Prueba
                  </h3>
                  <div className="h-1 w-16 bg-border-dark rounded-full mt-2 group-hover:bg-primary group-hover:w-32 transition-all duration-500"></div>
                </div>
                <p className="text-text-muted font-body leading-relaxed text-lg max-w-2xl">
                  Inicia tu simulación de diagnóstico. Configura la prueba a tu medida, selecciona temas,
                  niveles de dificultad y recibe retroalimentación en tiempo real.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <FormField label="Seleccionar Tópico">
                    <Select>
                      <SelectTrigger 
                        className="w-full p-3 rounded-lg bg-surface-dark border border-border-dark text-white text-sm focus:border-primary focus:ring-primary focus:ring-1 appearance-none pr-8 cursor-pointer"
                        style={{
                          backgroundColor: 'hsl(var(--surface-dark))',
                          borderColor: 'hsl(var(--border))',
                          color: 'white',
                        }}
                      >
                        <SelectValue placeholder={`Todos los tópicos (${selectedItems.size} seleccionados)`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los tópicos ({selectedItems.size} seleccionados)</SelectItem>
                        <SelectItem value="math">Matemáticas</SelectItem>
                        <SelectItem value="history">Historia</SelectItem>
                        <SelectItem value="science">Ciencias</SelectItem>
                        <SelectItem value="language">Lenguaje</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Nivel de Dificultad">
                    <Select>
                      <SelectTrigger 
                        className="w-full p-3 rounded-lg bg-surface-dark border border-border-dark text-white text-sm focus:border-primary focus:ring-primary focus:ring-1 appearance-none pr-8 cursor-pointer"
                        style={{
                          backgroundColor: 'hsl(var(--surface-dark))',
                          borderColor: 'hsl(var(--border))',
                          color: 'white',
                        }}
                      >
                        <SelectValue placeholder="Adaptativo (IA)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Adaptativo (IA)</SelectItem>
                        <SelectItem value="easy">Fácil</SelectItem>
                        <SelectItem value="medium">Medio</SelectItem>
                        <SelectItem value="hard">Difícil</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <FormField label="Número de Preguntas">
                    <Input
                      type="number"
                      min="5"
                      max="50"
                      defaultValue="10"
                      className="w-full p-3 rounded-lg bg-surface-dark border border-border-dark text-white text-sm focus:border-primary focus:ring-primary focus:ring-1"
                      style={{
                        backgroundColor: 'hsl(var(--surface-dark))',
                        borderColor: 'hsl(var(--border))',
                        color: 'white',
                      }}
                    />
                  </FormField>
                  <FormField label="Límite de Tiempo (min)">
                    <Input
                      type="number"
                      min="5"
                      max="180"
                      defaultValue="30"
                      className="w-full p-3 rounded-lg bg-surface-dark border border-border-dark text-white text-sm focus:border-primary focus:ring-primary focus:ring-1"
                      style={{
                        backgroundColor: 'hsl(var(--surface-dark))',
                        borderColor: 'hsl(var(--border))',
                        color: 'white',
                      }}
                    />
                  </FormField>
                </div>
                <div className="mt-6">
                  <h4 className="text-text-muted text-sm font-medium mb-2">Métricas en Tiempo Real</h4>
                  <div className="bg-background-dark/70 border border-border-dark rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-lg">timer</span>
                      <span className="text-white font-medium">Tiempo Restante:</span>
                      <span className="text-primary font-bold">--:--</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-lg">question_mark</span>
                      <span className="text-white font-medium">Preguntas Completadas:</span>
                      <span className="text-primary font-bold">0 / 10</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-lg">data_usage</span>
                      <span className="text-white font-medium">Progreso en Tema:</span>
                      <span className="text-primary font-bold">0%</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full py-4 px-6 rounded-lg bg-gradient-to-r from-primary/80 to-primary text-background-dark font-bold uppercase tracking-wider text-sm flex items-center justify-center hover:shadow-neon hover:brightness-110 transition-all duration-300 mt-auto">
                  <span className="material-symbols-outlined mr-2">play_arrow</span>
                  <span>Iniciar Diagnóstico</span>
                </Button>
              </div>
            </Card>
          </div>
        </main>
      </main>
    </div>
  );
}

