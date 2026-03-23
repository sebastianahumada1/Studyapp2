'use client';

interface HubMainContentProps {
  onCreateManual?: () => void;
  onCreateCSV?: () => void;
  onCreateAI?: () => void;
}

export function HubMainContent({ onCreateManual, onCreateCSV, onCreateAI }: HubMainContentProps) {
  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-px w-8 bg-primary"></span>
            <span className="text-primary text-xs font-bold uppercase tracking-widest">
              Rutas de Estudio
            </span>
          </div>
          <h2 className="text-white text-3xl md:text-4xl font-display font-bold tracking-tight mb-2">
            Crear Nuevas Rutas
          </h2>
          <p className="text-text-muted max-w-2xl">
            Crea rutas de estudio manualmente, importa desde CSV o deja que nuestra IA genere rutas
            personalizadas basadas en tus objetivos de aprendizaje.
          </p>
        </div>
      </div>

      {/* Creation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Manual Creation */}
        <div
          className="group relative bg-surface-dark rounded-2xl p-6 border border-white/5 hover:border-primary/30 transition-all cursor-pointer hover:-translate-y-1 shadow-lg"
          onClick={onCreateManual}
        >
          <div className="size-12 rounded-xl bg-[#231e3d] flex items-center justify-center text-text-muted group-hover:text-primary group-hover:bg-primary/10 mb-4 transition-colors">
            <span className="material-symbols-outlined text-[28px]">edit_document</span>
          </div>
          <h3 className="text-white text-lg font-display font-bold mb-1 group-hover:text-primary transition-colors">
            Crear Manualmente
          </h3>
          <p className="text-text-muted text-sm">
            Diseña tu ruta tema por tema seleccionando los contenidos.
          </p>
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-primary/20">arrow_forward</span>
          </div>
        </div>

        {/* CSV Import */}
        <div
          className="group relative bg-surface-dark rounded-2xl p-6 border border-white/5 hover:border-primary/30 transition-all cursor-pointer hover:-translate-y-1 shadow-lg"
          onClick={onCreateCSV}
        >
          <div className="size-12 rounded-xl bg-[#231e3d] flex items-center justify-center text-text-muted group-hover:text-primary group-hover:bg-primary/10 mb-4 transition-colors">
            <span className="material-symbols-outlined text-[28px]">upload_file</span>
          </div>
          <h3 className="text-white text-lg font-display font-bold mb-1 group-hover:text-primary transition-colors">
            Importar desde CSV
          </h3>
          <p className="text-text-muted text-sm">
            Carga planes de estudio masivos desde hojas de cálculo.
          </p>
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-primary/20">arrow_forward</span>
          </div>
        </div>

        {/* AI Generate */}
        <div
          className="group relative bg-surface-dark rounded-2xl p-6 border border-primary/30 hover:border-primary transition-all cursor-pointer hover:-translate-y-1 shadow-[0_0_20px_rgba(13,242,242,0.15)] overflow-hidden"
          onClick={onCreateAI}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute -top-10 -right-10 size-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none"></div>
          <div className="flex items-start justify-between relative z-10">
            <div className="size-12 rounded-xl bg-gradient-to-br from-primary/20 to-blue-600/20 flex items-center justify-center text-primary mb-4 border border-primary/20 shadow-[0_0_10px_rgba(13,242,242,0.2)]">
              <span className="material-symbols-outlined text-[28px]">auto_awesome</span>
            </div>
            <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
              Recomendado
            </span>
          </div>
          <h3 className="text-white text-lg font-display font-bold mb-1 flex items-center gap-2 relative z-10">
            Generar con IA
          </h3>
          <p className="text-primary/70 text-sm relative z-10">
            Nuestra IA analiza tus objetivos y crea una ruta optimizada automáticamente.
          </p>
        </div>
      </div>
    </div>
  );
}

