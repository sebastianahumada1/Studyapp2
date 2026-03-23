'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { QuestionBankSidebar, type SelectedItem } from './QuestionBankSidebar';
import { SessionSettings } from './SessionSettings';
import { AIFunctions } from './AIFunctions';
import { PageHeader } from '@/components/PageHeader';
import { createAssessmentSession, generateSessionQuestions } from '@/app/actions/assessment';

export function AssessmentContent() {
  const router = useRouter();
  const [timePerQuestion, setTimePerQuestion] = useState(60);
  const [timePerQuestionEnabled, setTimePerQuestionEnabled] = useState(true);
  const [questionsPerSubtopic, setQuestionsPerSubtopic] = useState(5);
  const [metacognition, setMetacognition] = useState(true);
  const [interleaving, setInterleaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isStarting, setIsStarting] = useState(false);

  const handleAddItem = (item: SelectedItem) => {
    // Check if item is already selected
    const isAlreadySelected = selectedItems.some(
      existing => existing.type === item.type && existing.id === item.id
    );
    if (!isAlreadySelected) {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleStartAssessment = async () => {
    if (selectedItems.length === 0) {
      alert('Por favor selecciona al menos un elemento para evaluar');
      return;
    }

    setIsStarting(true);
    try {
      // Create session
      const sessionResult = await createAssessmentSession({
        time_per_question: timePerQuestionEnabled ? timePerQuestion : null,
        time_per_question_enabled: timePerQuestionEnabled,
        questions_count: questionsPerSubtopic,
        metacognition_enabled: metacognition,
        interleaving_enabled: interleaving,
        feynman_enabled: metacognition, // Feynman is enabled when metacognition is enabled
        selected_items: selectedItems,
      });

      if (!sessionResult.success) {
        alert(sessionResult.error || 'Error al crear sesión');
        return;
      }

      // Generate questions
      const questionsResult = await generateSessionQuestions({
        selected_items: selectedItems,
        questions_count: questionsPerSubtopic,
        interleaving_enabled: interleaving,
      });

      if (!questionsResult.success) {
        alert(questionsResult.error || 'Error al generar preguntas');
        return;
      }

      // Navigate to session page
      router.push(`/assessment/session/${sessionResult.data.id}`);
    } catch (error) {
      console.error('Error starting assessment:', error);
      alert('Error al iniciar la evaluación');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Background Effect */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Header */}
      <PageHeader title="Configuración de Simulacro" />

      {/* Main Content */}
      <div className="relative z-10 flex-1 overflow-hidden flex">
        <QuestionBankSidebar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedItems={selectedItems}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-10">
              <h2 className="font-display text-4xl font-bold tracking-tight text-white mb-4">Ponte a Prueba</h2>
              <p className="text-text-muted max-w-xl mx-auto text-sm leading-relaxed">
                Personaliza tu sesión de entrenamiento asistida por IA para maximizar la retención y el análisis de errores.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <SessionSettings
                timePerQuestion={timePerQuestion}
                onTimePerQuestionChange={setTimePerQuestion}
                timePerQuestionEnabled={timePerQuestionEnabled}
                onTimePerQuestionEnabledChange={setTimePerQuestionEnabled}
                questionsPerSubtopic={questionsPerSubtopic}
                onQuestionsPerSubtopicChange={setQuestionsPerSubtopic}
              />

              <AIFunctions
                metacognition={metacognition}
                onMetacognitionChange={setMetacognition}
                interleaving={interleaving}
                onInterleavingChange={setInterleaving}
              />

               {/* Start Button */}
               <div className="lg:col-span-12 mt-4">
                 <button
                   onClick={handleStartAssessment}
                   disabled={isStarting || selectedItems.length === 0}
                   className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-primary/80 to-blue-600/80 hover:from-primary hover:to-blue-600 text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(13,242,242,0.4)] hover:shadow-[0_0_30px_rgba(13,242,242,0.6)] hover:scale-[1.02] active:scale-[0.98] border border-primary/30 relative disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                 >
                   <span className="relative flex h-2 w-2 mr-1">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                   </span>
                   <span className="material-symbols-outlined text-sm">bolt</span>
                   {isStarting ? 'Iniciando...' : 'Iniciar Prueba'}
                 </button>
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
