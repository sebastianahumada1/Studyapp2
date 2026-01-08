'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCreateSubsubtopic } from '@/hooks/useKnowledgeHub';
import type { Difficulty } from '@/types/knowledge-hub';
import { RichTextEditor } from './RichTextEditor';

interface CreateSubsubtopicModalProps {
  subtopicId: string;
  onClose: () => void;
}

export function CreateSubsubtopicModal({ subtopicId, onClose }: CreateSubsubtopicModalProps) {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(60);
  const [difficulty, setDifficulty] = useState<Difficulty>('medio');
  const [mounted, setMounted] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const createSubsubtopic = useCreateSubsubtopic();

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
    const result = await createSubsubtopic.mutateAsync({
      subtopicId,
      formData: {
        name,
        content,
        estimated_time_minutes: estimatedTime,
        difficulty,
      },
    });

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
          maxWidth: '42rem',
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
        <h2 className="text-2xl font-bold text-white mb-6 pr-10">Agregar Sub-subtema</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">Nombre del Sub-subtema</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1a162e] border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="Ej: Props y State"
              required
            />
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-2">Contenido</label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Escribe el contenido detallado aquí. Usa las herramientas de formato arriba para dar estilo a tu texto."
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
              disabled={createSubsubtopic.isPending}
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-colors"
            >
              {createSubsubtopic.isPending ? 'Creando...' : 'Crear Sub-subtema'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

