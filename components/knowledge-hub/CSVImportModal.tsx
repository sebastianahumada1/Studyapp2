'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface CSVImportModalProps {
  onClose: () => void;
}

export function CSVImportModal({ onClose }: CSVImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [mounted, setMounted] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

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
    // Create CSV template with proper quoting for HTML content
    const csvContent = `ruta,objetivo_ruta,tema,contenido_intro_tema,subtema,contenido_subtema,sub_subtema,contenido_sub_subtema,tiempo_estimado,dificultad
"Ejemplo Ruta","Objetivo de la ruta de estudio","Tema 1","<p>Contenido HTML del tema</p>","Subtema 1.1","<p>Contenido HTML del subtema</p>","Sub-subtema 1.1.1","<p>Contenido HTML del sub-subtema</p>",60,medio
"Ejemplo Ruta",,"Tema 2",,"Subtema 2.1",,,,45,facil
"Ejemplo Ruta",,"Tema 3",,,,,,30,facil`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_rutas_estudio.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvData = event.target?.result as string;
      try {
        // Ensure UTF-8 encoding is preserved
        const { importRoutesFromCSV } = await import('@/app/actions/knowledge-hub');
        const result = await importRoutesFromCSV(csvData);
        
        if (result.success) {
          const message = result.data.routesCreated > 0 || result.data.routesUpdated > 0
            ? `Importación exitosa: ${result.data.routesCreated} rutas creadas, ${result.data.routesUpdated} rutas actualizadas`
            : 'No se encontraron datos válidos para importar. Verifica que el CSV tenga las columnas: ruta, tema';
          alert(message);
          if (result.data.routesCreated > 0 || result.data.routesUpdated > 0) {
            onClose();
          }
        } else {
          alert(result.error || 'Error al importar CSV');
        }
      } catch (error: any) {
        console.error('CSV import error:', error);
        alert('Error al importar CSV: ' + (error.message || 'Error desconocido'));
      } finally {
        setIsLoading(false);
      }
    };
    // Read file as UTF-8 to preserve special characters (tildes, etc.)
    reader.readAsText(file, 'UTF-8');
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
        
        <h2 className="text-2xl font-bold text-white mb-6 pr-10">Cargar Rutas desde CSV</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
          {/* CSV Format Section */}
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
            <p className="text-sm text-slate-400 mb-3">
              El archivo CSV debe tener las siguientes columnas:
            </p>
            <div className="bg-[#1a162e] border border-white/10 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-primary font-mono">ruta</span>
                <span className="text-slate-400">- Nombre de la ruta de estudio (requerido)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-mono">objetivo_ruta</span>
                <span className="text-slate-400">- Objetivo de la ruta (opcional, solo se usa al crear nueva ruta)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-mono">tema</span>
                <span className="text-slate-400">- Nombre del tema (requerido)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-mono">contenido_intro_tema</span>
                <span className="text-slate-400">- Contenido HTML introductorio del tema (opcional)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-mono">subtema</span>
                <span className="text-slate-400">- Nombre del subtema (opcional)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-mono">contenido_subtema</span>
                <span className="text-slate-400">- Contenido HTML del subtema (opcional, requerido si hay subtema)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-mono">sub_subtema</span>
                <span className="text-slate-400">- Nombre del sub-subtema (opcional)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-mono">contenido_sub_subtema</span>
                <span className="text-slate-400">- Contenido HTML del sub-subtema (opcional, requerido si hay sub-subtema)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-mono">tiempo_estimado</span>
                <span className="text-slate-400">- Minutos estimados (opcional, default: 60, rango: 15-480)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-mono">dificultad</span>
                <span className="text-slate-400">- facil/medio/dificil (opcional, default: medio)</span>
              </div>
            </div>
            
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-primary">Nota:</span> Si la ruta ya existe, se agregarán los temas/subtemas a esa ruta. Si un tema ya existe, se actualizará su contenido introductorio.
              </p>
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

          {/* File Selection */}
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
                className="px-4 py-2.5 rounded-lg border border-white/10 hover:border-primary/50 bg-[#1a162e] text-white cursor-pointer transition-colors"
              >
                Seleccionar archivo
              </label>
              <span className="text-slate-400 text-sm">
                {file ? file.name : 'ningún archivo seleccionado'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end pt-4 mt-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-white/10 text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
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
