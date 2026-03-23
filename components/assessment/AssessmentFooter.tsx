'use client';

export function AssessmentFooter() {
  return (
    <footer className="relative z-20 shrink-0 bg-surface-dark border-t border-white/5 px-6 py-2 flex justify-between items-center">
      <div className="flex items-center gap-4 text-[10px] font-mono text-text-muted">
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></span>
          SERVIDOR: ONLINE
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-primary shadow-[0_0_5px_#0df2f2]"></span>
          IA: LISTA
        </div>
      </div>
      <div className="text-[10px] text-text-muted/50 font-mono tracking-tighter">
        V.2.0.4-STABLE // ENCRIPTACIÓN DE DATOS ACTIVA
      </div>
    </footer>
  );
}
