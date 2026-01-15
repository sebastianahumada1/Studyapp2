'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface CSVImportQuestionsModalProps {
  onClose: () => void;
}

export function CSVImportQuestionsModal({ onClose }: CSVImportQuestionsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleDownloadTemplate = () => {
    const csvContent = `pregunta,opcion_a,opcion_b,opcion_c,opcion_d,respuesta_correcta,dificultad,ruta_id,tema_id,subtema_id,subsubtema_id
"¿Cuál es el mecanismo principal de acción de los diuréticos tiazídicos?","Inhiben la reabsorción de sodio en el túbulo contorneado distal","Aumentan la filtración glomerular","Bloquean los canales de potasio","Estimulan la secreción de aldosterona","A","media","","","",""
"Paciente masculino de 45 años con dolor torácico opresivo...","Infarto agudo de miocardio","Angina estable","Pericarditis","Neumotórax","A","alta","","","",""`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_preguntas.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    // TODO: Implementar importación de CSV
    alert('Funcionalidad de importación CSV próximamente');
    setIsLoading(false);
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
        className="bg-surface-dark border border-white/10 rounded-2xl p-6 md:p-8 overflow-y-auto relative shadow-2xl"
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
          className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors z-10 p-1 rounded-lg hover:bg-white/5"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        <h2 className="text-2xl font-display font-bold text-white mb-6 pr-10">
          Importar Preguntas desde CSV
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
          <div className="space-y-4">
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <h3 className="text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined">warning</span>
                ¡Importante! Codificación UTF-8
              </h3>
              <p className="text-sm text-yellow-200 mb-2">
                Para que las tildes se importen correctamente, el archivo CSV debe estar guardado en <strong>UTF-8</strong>.
              </p>
              <p className="text-sm text-yellow-200">
                En Excel: Archivo → Guardar como → Tipo: <strong>"CSV UTF-8 (delimitado por comas)"</strong>
              </p>
            </div>

            <h3 className="text-lg font-semibold text-white">Formato del CSV:</h3>
            <p className="text-sm text-text-muted mb-3">
              El archivo CSV debe tener las siguientes columnas:
            </p>
            <div className="bg-background-dark border border-white/10 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-primary font-mono">pregunta</span>
                <span className="text-text-muted">- Texto de la pregunta (requerido)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-mono">opcion_a, opcion_b, opcion_c, opcion_d</span>
                <span className="text-text-muted">- Opciones de respuesta (mínimo 2, máximo 4)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-mono">respuesta_correcta</span>
                <span className="text-text-muted">- A, B, C o D (requerido)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-mono">dificultad</span>
                <span className="text-text-muted">- baja/media/alta (opcional, default: media)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-mono">ruta_id, tema_id, subtema_id, subsubtema_id</span>
                <span className="text-text-muted">- Al menos uno debe estar presente</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              Descargar Template CSV
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-white text-sm font-medium">
              Seleccionar archivo CSV
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="csv-file-input"
                required
              />
              <label
                htmlFor="csv-file-input"
                className="px-4 py-2.5 rounded-lg border border-white/10 hover:border-primary/50 bg-background-dark text-white cursor-pointer transition-colors"
              >
                Seleccionar archivo
              </label>
              <span className="text-text-muted text-sm">
                {file ? file.name : 'ningún archivo seleccionado'}
              </span>
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-4 mt-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-white/10 text-text-muted hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!file || isLoading}
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Cargando...' : 'Cargar'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
