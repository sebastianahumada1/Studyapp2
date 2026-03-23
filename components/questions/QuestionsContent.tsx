'use client';

import { useState } from 'react';
import { PerformanceMetrics } from './PerformanceMetrics';
import { FiltersSection } from './FiltersSection';
import { QuestionsTable } from './QuestionsTable';
import { QuestionsMainContent } from './QuestionsMainContent';
import { CreateQuestionModal } from './CreateQuestionModal';
import { PageHeader } from '@/components/PageHeader';

export function QuestionsContent() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    route: '',
    topic: '',
    subtopic: '',
    subsubtopic: '',
    difficulty: '',
    search: '',
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Background Effect */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Header */}
      <PageHeader
        title="Banco de Preguntas"
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          <QuestionsMainContent />
          <PerformanceMetrics />
          <FiltersSection onFiltersChange={setFilters} />
          <QuestionsTable filters={filters} />
        </div>
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreateQuestionModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
