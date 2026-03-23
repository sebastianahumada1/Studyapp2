interface ActivityCardProps {
  type: 'video' | 'reading' | 'quiz' | 'practice';
  title: string;
  description: string;
  duration?: string;
  priority?: 'high' | 'normal';
  onClick?: () => void;
}

export function ActivityCard({
  type,
  title,
  description,
  duration,
  priority,
  onClick,
}: ActivityCardProps) {
  const typeConfig = {
    video: {
      icon: 'smart_display',
      color: 'bg-blue-500/10 text-blue-400',
      label: duration || 'Video',
    },
    reading: {
      icon: 'menu_book',
      color: 'bg-purple-500/10 text-purple-400',
      label: 'Reading',
    },
    quiz: {
      icon: 'quiz',
      color: 'bg-primary/10 text-primary',
      label: priority === 'high' ? 'High Priority' : 'Quiz',
    },
    practice: {
      icon: 'science',
      color: 'bg-emerald-500/10 text-emerald-400',
      label: 'Practice',
    },
  };

  const config = typeConfig[type];

  return (
    <div
      className={`group cursor-pointer p-5 rounded-xl bg-white dark:bg-surface-highlight border border-slate-200 dark:border-white/5 hover:border-primary/50 transition-all hover:shadow-[0_0_20px_rgba(13,242,242,0.1)] flex flex-col h-full ${
        priority === 'high' ? 'relative overflow-hidden' : ''
      }`}
      onClick={onClick}
    >
      {priority === 'high' && (
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <span className="material-symbols-outlined text-6xl">psychology</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`p-2 rounded-lg ${config.color}`}>
          <span className="material-symbols-outlined">{config.icon}</span>
        </div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded ${
            priority === 'high'
              ? 'text-primary bg-primary/10 border border-primary/20'
              : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5'
          }`}
        >
          {config.label}
        </span>
      </div>

      <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2 group-hover:text-primary transition-colors relative z-10">
        {title}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 flex-1 relative z-10">
        {description}
      </p>

      <div className="mt-auto relative z-10">
        <button
          className={`w-full py-2 rounded-lg text-slate-900 dark:text-white text-sm font-semibold transition-colors ${
            priority === 'high'
              ? 'bg-primary text-slate-900 shadow-lg shadow-primary/20'
              : 'bg-slate-100 dark:bg-white/5 group-hover:bg-primary group-hover:text-slate-900'
          }`}
        >
          {type === 'video' ? 'Watch Lesson' : type === 'reading' ? 'Read Now' : 'Start Quiz'}
        </button>
      </div>
    </div>
  );
}

