'use client';

import { useMemo } from 'react';
import { useQuestions } from '@/hooks/useQuestions';

export function PerformanceMetrics() {
  const { data: questions = [], isLoading } = useQuestions();

  const metrics = useMemo(() => {
    if (!questions || questions.length === 0) {
      return {
        total: 0,
        difficulty: { alta: 0, media: 0, baja: 0 },
        difficultyPercentages: { alta: 0, media: 0, baja: 0 },
        origin: { ai: 0, manual: 0, csv: 0 },
      };
    }

    const difficultyCount = { alta: 0, media: 0, baja: 0 };
    const originCount = { ai: 0, manual: 0, csv: 0 };

    questions.forEach((question) => {
      // Count difficulty
      if (question.difficulty === 'alta') difficultyCount.alta++;
      else if (question.difficulty === 'media') difficultyCount.media++;
      else if (question.difficulty === 'baja') difficultyCount.baja++;

      // Count origin
      if (question.origin === 'ai') originCount.ai++;
      else if (question.origin === 'manual') originCount.manual++;
      else if (question.origin === 'csv') originCount.csv++;
    });

    const total = questions.length;
    const difficultyPercentages = {
      alta: total > 0 ? Math.round((difficultyCount.alta / total) * 100) : 0,
      media: total > 0 ? Math.round((difficultyCount.media / total) * 100) : 0,
      baja: total > 0 ? Math.round((difficultyCount.baja / total) * 100) : 0,
    };

    return {
      total,
      difficulty: difficultyCount,
      difficultyPercentages,
      origin: originCount,
    };
  }, [questions]);

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-primary">monitoring</span>
          <h3 className="text-xl font-display font-bold text-white">Métricas de Rendimiento</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-surface-dark border border-white/5 p-5 rounded-2xl">
            <div className="text-text-muted text-sm">Cargando métricas...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-primary">monitoring</span>
        <h3 className="text-xl font-display font-bold text-white">Métricas de Rendimiento</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Preguntas */}
        <div className="bg-surface-dark border border-white/5 p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-text-muted text-xs font-bold uppercase tracking-wider">Total Preguntas</span>
            <span className="material-symbols-outlined text-primary/40 text-xl">database</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display font-bold text-white tracking-tighter">
              {metrics.total.toLocaleString()}
            </span>
          </div>
          <div className="mt-4 flex gap-1 h-1.5 w-full bg-background-dark rounded-full overflow-hidden">
            {metrics.total > 0 && (
              <>
                <div
                  className="bg-primary rounded-full"
                  style={{ width: `${metrics.difficultyPercentages.media}%` }}
                ></div>
                <div
                  className="bg-primary/40 rounded-full"
                  style={{ width: `${metrics.difficultyPercentages.alta}%` }}
                ></div>
                <div
                  className="bg-primary/10 rounded-full"
                  style={{ width: `${metrics.difficultyPercentages.baja}%` }}
                ></div>
              </>
            )}
          </div>
        </div>

        {/* Dificultad Promedio */}
        <div className="bg-surface-dark border border-white/5 p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-text-muted text-xs font-bold uppercase tracking-wider">Dificultad Promedio</span>
            <span className="material-symbols-outlined text-primary/40 text-xl">signal_cellular_alt</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] text-text-muted uppercase">
              <span>Alta</span>
              <span className="text-white">{metrics.difficultyPercentages.alta}%</span>
            </div>
            <div className="w-full bg-background-dark h-1 rounded-full">
              <div
                className="bg-red-400 h-full rounded-full"
                style={{ width: `${metrics.difficultyPercentages.alta}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-text-muted uppercase mt-1">
              <span>Media</span>
              <span className="text-white">{metrics.difficultyPercentages.media}%</span>
            </div>
            <div className="w-full bg-background-dark h-1 rounded-full">
              <div
                className="bg-primary h-full rounded-full"
                style={{ width: `${metrics.difficultyPercentages.media}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Origen de Datos */}
        <div className="bg-surface-dark border border-white/5 p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-text-muted text-xs font-bold uppercase tracking-wider">Origen de Datos</span>
            <span className="material-symbols-outlined text-primary/40 text-xl">auto_awesome</span>
          </div>
          <div className="flex items-center gap-6 mt-1">
            <div className="flex flex-col">
              <span className="text-2xl font-display font-bold text-white">
                {metrics.origin.ai.toLocaleString()}
              </span>
              <span className="text-[10px] text-primary font-bold uppercase">AI Generated</span>
            </div>
            <div className="w-[1px] h-10 bg-white/5"></div>
            <div className="flex flex-col">
              <span className="text-2xl font-display font-bold text-white">
                {metrics.origin.manual.toLocaleString()}
              </span>
              <span className="text-[10px] text-text-muted font-bold uppercase">Manual</span>
            </div>
            {metrics.origin.csv > 0 && (
              <>
                <div className="w-[1px] h-10 bg-white/5"></div>
                <div className="flex flex-col">
                  <span className="text-2xl font-display font-bold text-white">
                    {metrics.origin.csv.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-text-muted font-bold uppercase">CSV</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
