'use client';

interface ErrorData {
  id: string;
  question_id: string;
  question_text: string;
  question_options: Array<{ text: string }>;
  selected_answer_index: number;
  correct_answer_index: number;
  route_title: string | null;
  topic_name: string | null;
  subtopic_name: string | null;
  subsubtopic_name: string | null;
  error_conclusion: string;
  error_type: 'concepto' | 'analisis' | 'atencion' | null;
  conclusion: string | null;
  answered_at: string;
  time_spent_seconds: number | null;
  feynman_reasoning: string | null;
  feynman_feedback: string | null;
}

interface DiagnosticCardProps {
  error: ErrorData;
  onView: (error: ErrorData) => void;
  onEdit: (error: ErrorData) => void;
}

const errorTypeColors = {
  concepto: {
    bg: 'bg-pink-500/10',
    text: 'text-pink-400',
    border: 'border-pink-500/30',
    shadow: 'shadow-[0_0_8px_rgba(236,72,153,0.1)]',
  },
  analisis: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    shadow: 'shadow-[0_0_8px_rgba(249,115,22,0.1)]',
  },
  atencion: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    shadow: 'shadow-[0_0_8px_rgba(6,182,212,0.1)]',
  },
};

const errorTypeLabels = {
  concepto: 'Concepto',
  analisis: 'Análisis',
  atencion: 'Atención',
};

export function DiagnosticCard({ error, onView, onEdit }: DiagnosticCardProps) {
  const validErrorType = error.error_type && (error.error_type === 'concepto' || error.error_type === 'analisis' || error.error_type === 'atencion') 
    ? error.error_type 
    : null;
  const colors = validErrorType ? errorTypeColors[validErrorType] : {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/30',
    shadow: 'shadow-[0_0_8px_rgba(100,100,100,0.1)]',
  };
  const routeColor = error.route_title ? getRouteColor(error.route_title) : 'bg-blue-500';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toISOString().split('T')[0],
      time: date.toTimeString().split(' ')[0].slice(0, 5) + ' GMT',
    };
  };

  const { date, time } = formatDate(error.answered_at);

  return (
    <article className="bg-surface-dark/70 backdrop-blur-xl rounded-2xl p-5 flex flex-col group border border-white/5 hover:bg-primary/5 hover:border-primary/40 transition-all duration-400 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(13,242,242,0.2)]">
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-1">
            Ruta de Estudio
          </span>
          <div className="flex items-center gap-2">
            <div className={`w-1 h-4 ${routeColor} rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]`}></div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              {error.route_title || 'Sin ruta'}
            </h3>
          </div>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold ${colors.bg} ${colors.text} ${colors.border} uppercase tracking-widest ${colors.shadow}`}
        >
          {error.error_type ? errorTypeLabels[error.error_type] : 'Sin clasificar'}
        </span>
      </div>

      <div className="space-y-3 flex-1">
        {/* Question */}
        <div>
          <span className="text-[9px] font-bold text-text-muted uppercase tracking-tighter block mb-2">
            Pregunta
          </span>
          <p className="text-sm font-medium text-white leading-relaxed">
            {error.question_text}
          </p>
        </div>

        {/* Selected Answer */}
        {error.selected_answer_index >= 0 && error.question_options[error.selected_answer_index] && (
          <div className="bg-background-dark/40 rounded-lg p-3 border border-white/5">
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-tighter block mb-2">
              Tu Respuesta
            </span>
            <p className="text-xs text-primary font-medium">
              {String.fromCharCode(65 + error.selected_answer_index)}. {error.question_options[error.selected_answer_index].text}
            </p>
          </div>
        )}

        {/* Error Conclusion */}
        {error.conclusion && (
          <div className="bg-background-dark/40 rounded-lg p-3 border border-white/5">
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-tighter block mb-2">
              Conclusión de Error
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              {error.conclusion}
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-text-muted uppercase">{date}</span>
          <span className="text-[8px] text-slate-600 uppercase">{time}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onView(error)}
            className="h-8 w-8 rounded-lg flex items-center justify-center border border-primary/30 text-primary hover:bg-primary hover:text-background-dark transition-all"
            title="Ver Detalles"
          >
            <span className="material-symbols-outlined text-lg">visibility</span>
          </button>
          <button
            onClick={() => onEdit(error)}
            className="h-8 w-8 rounded-lg flex items-center justify-center border border-accent/30 text-accent hover:bg-accent hover:text-background-dark transition-all"
            title="Editar"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
        </div>
      </div>
    </article>
  );
}

// Helper function to get route color based on route title
function getRouteColor(routeTitle: string): string {
  // Simple hash function to get consistent colors
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
  ];
  let hash = 0;
  for (let i = 0; i < routeTitle.length; i++) {
    hash = routeTitle.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
