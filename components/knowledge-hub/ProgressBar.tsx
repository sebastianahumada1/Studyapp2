interface ProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({
  progress,
  className = '',
  showLabel = true,
  label,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-end text-sm">
          <span className="text-text-secondary">{label || 'Progreso'}</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-primary">{clampedProgress}%</span>
            {label && <span className="text-text-secondary text-xs">Completado</span>}
          </div>
        </div>
      )}
      <div className="h-1.5 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full shadow-[0_0_10px_rgba(13,185,242,0.5)] transition-all duration-300"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}

