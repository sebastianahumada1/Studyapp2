'use client';

import { useState } from 'react';
import { useRoutes } from '@/hooks/useKnowledgeHub';
import { RouteCard } from './RouteCard';
import { CreateRouteModal } from './CreateRouteModal';
import { CSVImportModal } from './CSVImportModal';
import { AIGenerateModal } from './AIGenerateModal';

export function HubMainContent() {
  const { data: routes, isLoading } = useRoutes();
  const [showManualModal, setShowManualModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-px w-8 bg-accent"></span>
            <span className="text-accent text-xs font-bold uppercase tracking-widest">
              Estudio Personalizado
            </span>
          </div>
          <h2 className="text-white text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Hub de Conocimiento
          </h2>
          <p className="text-text-secondary max-w-2xl">
            Gestiona tus rutas de aprendizaje, importa nuevo material o deja que nuestra IA
            diseñe tu plan de estudio óptimo.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-background-dark font-bold hover:bg-cyan-50 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <span className="material-symbols-outlined">calendar_month</span>
            <span>Ver Planificador</span>
          </button>
        </div>
      </div>

      {/* Creation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Manual Creation */}
        <div
          className="group relative bg-card-dark rounded-2xl p-6 border border-white/5 hover:border-white/20 transition-all cursor-pointer hover:-translate-y-1 shadow-lg"
          onClick={() => setShowManualModal(true)}
        >
          <div className="size-12 rounded-xl bg-[#231e3d] flex items-center justify-center text-text-secondary group-hover:text-white group-hover:bg-[#2d284a] mb-4 transition-colors">
            <span className="material-symbols-outlined text-[28px]">edit_document</span>
          </div>
          <h3 className="text-white text-lg font-bold mb-1 group-hover:text-accent transition-colors">
            Crear Manualmente
          </h3>
          <p className="text-text-secondary text-sm">
            Diseña tu ruta tema por tema seleccionando los contenidos.
          </p>
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-white/20">arrow_forward</span>
          </div>
        </div>

        {/* CSV Import */}
        <div
          className="group relative bg-card-dark rounded-2xl p-6 border border-white/5 hover:border-white/20 transition-all cursor-pointer hover:-translate-y-1 shadow-lg"
          onClick={() => setShowCSVModal(true)}
        >
          <div className="size-12 rounded-xl bg-[#231e3d] flex items-center justify-center text-text-secondary group-hover:text-white group-hover:bg-[#2d284a] mb-4 transition-colors">
            <span className="material-symbols-outlined text-[28px]">upload_file</span>
          </div>
          <h3 className="text-white text-lg font-bold mb-1 group-hover:text-accent transition-colors">
            Importar desde CSV
          </h3>
          <p className="text-text-secondary text-sm">
            Carga planes de estudio masivos desde hojas de cálculo.
          </p>
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-white/20">arrow_forward</span>
          </div>
        </div>

        {/* AI Generate */}
        <div
          className="group relative bg-card-dark rounded-2xl p-6 border border-indigo-500/30 hover:border-accent transition-all cursor-pointer hover:-translate-y-1 shadow-[0_0_20px_rgba(99,102,241,0.15)] overflow-hidden"
          onClick={() => setShowAIModal(true)}
        >
          <div className="absolute inset-0 bg-gradient-ai opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
          <div className="absolute -top-10 -right-10 size-32 bg-accent/20 blur-[60px] rounded-full pointer-events-none"></div>
          <div className="flex items-start justify-between relative z-10">
            <div className="size-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-accent/20 flex items-center justify-center text-accent mb-4 border border-indigo-500/20 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              <span className="material-symbols-outlined text-[28px]">auto_awesome</span>
            </div>
            <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Recomendado
            </span>
          </div>
          <h3 className="text-white text-lg font-bold mb-1 flex items-center gap-2 relative z-10">
            Generar con IA
          </h3>
          <p className="text-indigo-200/70 text-sm relative z-10">
            Nuestra IA analiza tus objetivos y crea una ruta optimizada automáticamente.
          </p>
        </div>
      </div>

      {/* Existing Routes */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-white font-bold text-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-accent">folder_open</span>
            Rutas de Estudio Existentes
          </h3>
          <div className="flex gap-2">
            <button className="p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
            <button className="p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <span className="material-symbols-outlined">grid_view</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-text-secondary text-center py-12">Cargando rutas...</div>
        ) : routes && routes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </div>
        ) : (
          <div className="text-text-secondary text-center py-12">
            No tienes rutas de estudio aún. Crea una nueva para comenzar.
          </div>
        )}

        {routes && routes.length > 6 && (
          <div className="flex justify-center mt-4">
            <button className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors">
              Ver todas las rutas
              <span className="material-symbols-outlined text-lg">expand_more</span>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showManualModal && (
        <CreateRouteModal onClose={() => setShowManualModal(false)} />
      )}
      {showCSVModal && <CSVImportModal onClose={() => setShowCSVModal(false)} />}
      {showAIModal && <AIGenerateModal onClose={() => setShowAIModal(false)} />}
    </div>
  );
}

