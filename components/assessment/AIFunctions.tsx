'use client';

import { Switch } from '@/components/ui/switch';

interface AIFunctionsProps {
  metacognition: boolean;
  onMetacognitionChange: (enabled: boolean) => void;
  interleaving: boolean;
  onInterleavingChange: (enabled: boolean) => void;
}

export function AIFunctions({
  metacognition,
  onMetacognitionChange,
  interleaving,
  onInterleavingChange,
}: AIFunctionsProps) {
  return (
    <div className="lg:col-span-6 flex flex-col gap-6">
      <div className="glass-card p-6 rounded-2xl cyber-border h-full">
        <h3 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest mb-6">
          <span className="material-symbols-outlined text-primary text-lg">psychology</span>
          3. Funciones de IA
        </h3>
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white mb-1">Metacognición Extendida</h4>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Analiza tu proceso de pensamiento tras cada respuesta. La IA detectará sesgos cognitivos y lagunas de conocimiento.
              </p>
            </div>
            <Switch checked={metacognition} onCheckedChange={onMetacognitionChange} />
          </div>
          <div className="h-px bg-white/5"></div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white mb-1">Interleaving (Mezcla)</h4>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Intercala preguntas de diferentes temas para forzar a tu cerebro a diferenciar conceptos similares.
              </p>
            </div>
            <Switch checked={interleaving} onCheckedChange={onInterleavingChange} />
          </div>
        </div>
        <div className="mt-8 p-4 rounded-xl bg-primary/10 border border-primary/20 flex gap-3">
          <span className="material-symbols-outlined text-primary text-xl">info</span>
          <p className="text-[10px] text-primary/80 leading-normal italic">
            Las funciones de IA consumen créditos de sesión. Se estima un uso de 15 tokens por respuesta analizada.
          </p>
        </div>
      </div>
    </div>
  );
}
