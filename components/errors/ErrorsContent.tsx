'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { DiagnosticCard } from './DiagnosticCard';
import { ErrorFilters } from './ErrorFilters';
import { ErrorDetailsModal } from './ErrorDetailsModal';
import { getErrors } from '@/app/actions/errors';

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

export function ErrorsContent() {
  const [errors, setErrors] = useState<ErrorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    route: '',
    topic: '',
    errorType: '',
  });
  const [selectedError, setSelectedError] = useState<ErrorData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const itemsPerPage = 6;

  useEffect(() => {
    const loadErrors = async () => {
      setIsLoading(true);
      try {
        const result = await getErrors(filters);
        if (result.success) {
          setErrors(result.data || []);
        }
      } catch (error) {
        console.error('Error loading errors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadErrors();
  }, [filters]);

  const totalPages = Math.ceil(errors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedErrors = errors.slice(startIndex, startIndex + itemsPerPage);

  const handleViewError = (error: ErrorData) => {
    setSelectedError(error);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditError = (error: ErrorData) => {
    setSelectedError(error);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedError(null);
    // Reload errors to get updated data
    const loadErrors = async () => {
      try {
        const result = await getErrors(filters);
        if (result.success) {
          setErrors(result.data || []);
        }
      } catch (error) {
        console.error('Error loading errors:', error);
      }
    };
    loadErrors();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto relative bg-background-dark">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 249, 249, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 249, 249, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Header */}
      <PageHeader 
        title="Panel de Diagnóstico"
        subtitle="Reconocimiento de patrones y análisis de errores en tiempo real."
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Filters Section */}
          <ErrorFilters filters={filters} onFiltersChange={setFilters} />

          {/* Errors Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-text-muted">Cargando errores...</div>
            </div>
          ) : paginatedErrors.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-text-muted">No se encontraron errores</div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {paginatedErrors.map((error) => (
                  <DiagnosticCard 
                    key={error.id} 
                    error={error}
                    onView={handleViewError}
                    onEdit={handleEditError}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-surface-dark/70 backdrop-blur-xl rounded-2xl px-6 py-4 flex items-center justify-between border border-white/5">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="text-[10px] font-bold uppercase tracking-wider text-text-muted hover:text-primary transition-colors flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                    Anterior
                  </button>
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-display transition-all ${
                          page === currentPage
                            ? 'bg-primary text-background-dark font-bold shadow-[0_0_10px_rgba(13,242,242,0.3)] cursor-default'
                            : 'hover:bg-white/5 text-text-muted cursor-pointer border border-transparent hover:border-white/10'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="text-[10px] font-bold uppercase tracking-wider text-text-muted hover:text-primary transition-colors flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Siguiente
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>


      {/* Error Details Modal */}
      <ErrorDetailsModal
        error={selectedError}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
      />
    </div>
  );
}
