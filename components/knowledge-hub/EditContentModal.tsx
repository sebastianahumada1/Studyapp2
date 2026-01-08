'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { StudyTopic, StudySubtopic, StudySubsubtopic, Difficulty } from '@/types/knowledge-hub';
import { useUpdateTopic, useUpdateSubtopic, useUpdateSubsubtopic } from '@/hooks/useKnowledgeHub';

interface EditContentModalProps {
  item: StudyTopic | StudySubtopic | StudySubsubtopic;
  itemType: 'topic' | 'subtopic' | 'subsubtopic';
  onClose: () => void;
}

export function EditContentModal({ item, itemType, onClose }: EditContentModalProps) {
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description || '');
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
      description: description || undefined,
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
      onClose();
    }
  };

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

  const isPending = itemType === 'topic' 
    ? updateTopic.isPending 
    : itemType === 'subtopic' 
      ? updateSubtopic.isPending 
      : updateSubsubtopic.isPending;

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
          maxWidth: '48rem',
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
        <h2 className="text-2xl font-bold text-white mb-6 pr-10">
          Editar {itemType === 'topic' ? 'Tema' : itemType === 'subtopic' ? 'Subtema' : 'Sub-subtema'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1a162e] border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="Nombre del contenido"
              required
            />
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-2">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#1a162e] border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
              placeholder="Describe brevemente el contenido..."
              rows={3}
            />
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-2">Contenido</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#1a162e] border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
              placeholder="Contenido detallado del tema, subtema o sub-subtema..."
              rows={8}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Tiempo Estimado (min)</label>
              <input
                type="number"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(Number(e.target.value))}
                className="w-full bg-[#1a162e] border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Dificultad</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full bg-[#1a162e] border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              >
                <option value="facil">Fácil</option>
                <option value="medio">Medio</option>
                <option value="dificil">Difícil</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-white/10 text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-colors"
            >
              {isPending ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

