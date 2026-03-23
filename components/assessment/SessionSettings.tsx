'use client';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface SessionSettingsProps {
  timePerQuestion: number;
  onTimePerQuestionChange: (time: number) => void;
  timePerQuestionEnabled: boolean;
  onTimePerQuestionEnabledChange: (enabled: boolean) => void;
  questionsPerSubtopic: number;
  onQuestionsPerSubtopicChange: (questions: number) => void;
}

export function SessionSettings({
  timePerQuestion,
  onTimePerQuestionChange,
  timePerQuestionEnabled,
  onTimePerQuestionEnabledChange,
  questionsPerSubtopic,
  onQuestionsPerSubtopicChange,
}: SessionSettingsProps) {
  return (
    <div className="lg:col-span-6 flex flex-col gap-6">
      <div className="glass-card p-6 rounded-2xl cyber-border h-full">
        <h3 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest mb-6">
          <span className="material-symbols-outlined text-primary text-lg">settings_input_component</span>
          2. Ajustes de Sesión
        </h3>
        <div className="space-y-6 mb-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                Tiempo por pregunta (seg)
              </label>
              <Switch checked={timePerQuestionEnabled} onCheckedChange={onTimePerQuestionEnabledChange} />
            </div>
            <div className={`flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-2 group focus-within:border-primary/50 transition-colors ${
              !timePerQuestionEnabled ? 'opacity-50 pointer-events-none' : ''
            }`}>
              <button 
                className="size-10 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-muted hover:text-primary transition-colors"
                onClick={() => onTimePerQuestionChange(Math.max(10, timePerQuestion - 10))}
                disabled={!timePerQuestionEnabled}
              >
                -
              </button>
              <Input
                type="number"
                value={timePerQuestion}
                onChange={(e) => onTimePerQuestionChange(Number(e.target.value))}
                className="w-full bg-transparent border-none text-center text-lg font-display font-bold focus:ring-0"
                style={{ color: '#fff' }}
                disabled={!timePerQuestionEnabled}
              />
              <button 
                className="size-10 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-muted hover:text-primary transition-colors"
                onClick={() => onTimePerQuestionChange(timePerQuestion + 10)}
                disabled={!timePerQuestionEnabled}
              >
                +
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
              Cantidad de preguntas
            </label>
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-2 group focus-within:border-primary/50 transition-colors">
              <button 
                className="size-10 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-muted hover:text-primary transition-colors"
                onClick={() => onQuestionsPerSubtopicChange(Math.max(1, questionsPerSubtopic - 1))}
              >
                -
              </button>
              <Input
                type="number"
                value={questionsPerSubtopic}
                onChange={(e) => onQuestionsPerSubtopicChange(Number(e.target.value))}
                className="w-full bg-transparent border-none text-center text-lg font-display font-bold focus:ring-0"
                style={{ color: '#fff' }}
              />
              <button 
                className="size-10 rounded-lg hover:bg-white/5 flex items-center justify-center text-text-muted hover:text-primary transition-colors"
                onClick={() => onQuestionsPerSubtopicChange(questionsPerSubtopic + 1)}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
