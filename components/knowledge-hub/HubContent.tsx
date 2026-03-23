'use client';

import { useState } from 'react';
import { useRoutes } from '@/hooks/useKnowledgeHub';
import { RouteCard } from './RouteCard';
import { CreateRouteModal } from './CreateRouteModal';
import { CSVImportModal } from './CSVImportModal';
import { AIGenerateModal } from './AIGenerateModal';
import { HubMainContent } from './HubMainContent';
import { PageHeader } from '@/components/PageHeader';

export function HubContent() {
  const [showManualModal, setShowManualModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const { data: routes, isLoading } = useRoutes();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Background Effect */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Header */}
      <PageHeader
        title="Rutas de Estudio"
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          <HubMainContent
            onCreateManual={() => setShowManualModal(true)}
            onCreateCSV={() => setShowCSVModal(true)}
            onCreateAI={() => setShowAIModal(true)}
          />
          
          {/* Existing Routes */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-white font-bold text-xl flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">folder_open</span>
                Rutas de Estudio Existentes
              </h3>
              <div className="flex gap-2">
                <button className="p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  <span className="material-symbols-outlined">filter_list</span>
                </button>
                <button className="p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  <span className="material-symbols-outlined">grid_view</span>
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="text-text-muted text-center py-12">Cargando rutas...</div>
            ) : routes && routes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {routes.map((route) => (
                  <RouteCard key={route.id} route={route} />
                ))}
              </div>
            ) : (
              <div className="text-text-muted text-center py-12">
                No tienes rutas de estudio aún. Crea una nueva para comenzar.
              </div>
            )}

            {routes && routes.length > 6 && (
              <div className="flex justify-center mt-4">
                <button className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors">
                  Ver todas las rutas
                  <span className="material-symbols-outlined text-lg">expand_more</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {showManualModal && (
        <CreateRouteModal onClose={() => setShowManualModal(false)} />
      )}
      {showCSVModal && <CSVImportModal onClose={() => setShowCSVModal(false)} />}
      {showAIModal && <AIGenerateModal onClose={() => setShowAIModal(false)} />}
    </div>
  );
}
