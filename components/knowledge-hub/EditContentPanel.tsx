'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { StudyTopic, StudySubtopic, StudySubsubtopic, Difficulty } from '@/types/knowledge-hub';
import { useUpdateTopic, useUpdateSubtopic, useUpdateSubsubtopic } from '@/hooks/useKnowledgeHub';
import { RichTextEditor } from './RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/FormField';
import { FormGroup } from '@/components/forms/FormGroup';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EditContentPanelProps {
  item: StudyTopic | StudySubtopic | StudySubsubtopic;
  itemType: 'topic' | 'subtopic' | 'subsubtopic';
  onClose: () => void;
  onSave: () => void;
}

export function EditContentPanel({ item, itemType, onClose, onSave }: EditContentPanelProps) {
  const [name, setName] = useState(item.name);
  const [content, setContent] = useState(item.content || '');
  const [estimatedTime, setEstimatedTime] = useState(item.estimated_time_minutes);
  const [difficulty, setDifficulty] = useState<Difficulty>(item.difficulty);
  const [mounted, setMounted] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  
  const updateTopic = useUpdateTopic();
  const updateSubtopic = useUpdateSubtopic();
  const updateSubsubtopic = useUpdateSubsubtopic();

  useEffect(() => {
    setMounted(true);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }

    const updateViewportSize = () => {
      if (typeof window !== 'undefined') {
        setViewportSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };

    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);

    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'unset';
      }
      window.removeEventListener('resize', updateViewportSize);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = {
      name,
      content: content || undefined,
      estimated_time_minutes: estimatedTime,
      difficulty,
    };

    let result;
    if (itemType === 'topic') {
      result = await updateTopic.mutateAsync({
        topicId: item.id,
        formData,
      });
    } else if (itemType === 'subtopic') {
      result = await updateSubtopic.mutateAsync({
        subtopicId: item.id,
        formData,
      });
    } else {
      result = await updateSubsubtopic.mutateAsync({
        subsubtopicId: item.id,
        formData,
      });
    }

    if (result.success) {
      onSave();
      onClose();
    }
  };

  const isPending = itemType === 'topic' 
    ? updateTopic.isPending 
    : itemType === 'subtopic' 
      ? updateSubtopic.isPending 
      : updateSubsubtopic.isPending;

  const itemTypeLabel = itemType === 'topic' ? 'Tema' : itemType === 'subtopic' ? 'Subtema' : 'Sub-subtema';

  if (!mounted || typeof document === 'undefined' || !document.body) {
    return null;
  }

  const overlayStyle: React.CSSProperties = {
    animation: 'fadeIn 0.2s ease-out',
    WebkitBackdropFilter: 'blur(12px)',
    backdropFilter: 'blur(12px)',
    position: 'fixed',
    top: 0,
    left: 0,
    padding: '1rem',
    boxSizing: 'border-box',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  if (viewportSize.width > 0 && viewportSize.height > 0) {
    overlayStyle.width = `${viewportSize.width}px`;
    overlayStyle.height = `${viewportSize.height}px`;
  } else {
    overlayStyle.width = '100%';
    overlayStyle.height = '100%';
  }

  const modalMaxHeight = viewportSize.height > 0 
    ? `${Math.floor(viewportSize.height * 0.9)}px`
    : '90vh';

  return createPortal(
    <div 
      className="bg-black/80"
      onClick={onClose}
      style={overlayStyle}
    >
      <div 
        className="bg-card-dark border border-white/10 rounded-2xl p-6 md:p-8 overflow-y-auto relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'zoomIn95 0.2s ease-out',
          WebkitTransform: 'translateZ(0)',
          transform: 'translateZ(0)',
          width: '90%',
          maxWidth: '80rem',
          maxHeight: modalMaxHeight,
          margin: 'auto',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors z-10 p-1 rounded-lg hover:bg-white/5"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-6 pr-10">Editar {itemTypeLabel}</h2>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4">
          <FormGroup spacing="lg">
            <FormField label="Nombre" required>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del contenido"
                required
                style={{
                  backgroundColor: 'rgb(28, 42, 66)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                }}
              />
            </FormField>

            <FormField label="Contenido">
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Escribe el contenido detallado aquí. Usa las herramientas de formato arriba para dar estilo a tu texto."
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Tiempo Estimado (min)" required>
                <Input
                  type="number"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(Number(e.target.value))}
                  min="1"
                  required
                  style={{
                    backgroundColor: 'rgb(28, 42, 66)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                  }}
                />
              </FormField>
              <FormField label="Dificultad">
                <Select value={difficulty} onValueChange={(value) => setDifficulty(value as Difficulty)}>
                  <SelectTrigger
                    style={{
                      backgroundColor: 'rgb(28, 42, 66)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facil">Fácil</SelectItem>
                    <SelectItem value="medio">Medio</SelectItem>
                    <SelectItem value="dificil">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </FormGroup>
          
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

