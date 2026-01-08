'use client';

import { useRef, useEffect, useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertTable = () => {
    const rows = prompt('Número de filas:', '3');
    const cols = prompt('Número de columnas:', '3');
    if (rows && cols) {
      let tableHTML = '<table style="border-collapse: collapse; width: 100%; margin: 1rem 0;"><tbody>';
      for (let i = 0; i < parseInt(rows); i++) {
        tableHTML += '<tr>';
        for (let j = 0; j < parseInt(cols); j++) {
          tableHTML += '<td style="border: 1px solid #ccc; padding: 8px;">&nbsp;</td>';
        }
        tableHTML += '</tr>';
      }
      tableHTML += '</tbody></table>';
      execCommand('insertHTML', tableHTML);
    }
  };

  const insertLink = () => {
    const url = prompt('URL del enlace:', 'https://');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('URL de la imagen:', 'https://');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const insertYouTube = () => {
    const url = prompt('URL de YouTube:', 'https://www.youtube.com/watch?v=');
    if (url) {
      const videoId = url.includes('youtu.be/') 
        ? url.split('youtu.be/')[1].split('?')[0]
        : url.split('v=')[1]?.split('&')[0];
      if (videoId) {
        const embedHTML = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        execCommand('insertHTML', embedHTML);
      }
    }
  };

  const insertCode = () => {
    const code = prompt('Código:', '');
    if (code) {
      execCommand('insertHTML', `<pre style="background: #1a162e; padding: 1rem; border-radius: 0.5rem; overflow-x: auto;"><code>${code}</code></pre>`);
    }
  };

  const ToolbarButton = ({ 
    onClick, 
    children, 
    title 
  }: { 
    onClick: () => void; 
    children: React.ReactNode; 
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="px-2 py-1 hover:bg-white/10 rounded transition-colors text-white text-sm font-medium"
      style={{ WebkitAppearance: 'none', appearance: 'none' }}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden" style={{ backgroundColor: '#1a162e' }}>
      {/* Toolbar */}
      <div 
        className="flex items-center gap-1 px-3 py-2 border-b border-white/10 flex-wrap"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
      >
        <div className="flex items-center gap-1 border-r border-white/10 pr-2">
          <ToolbarButton onClick={() => execCommand('bold')} title="Negrita">
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('italic')} title="Cursiva">
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('underline')} title="Subrayado">
            <u>U</u>
          </ToolbarButton>
        </div>

        <div className="flex items-center gap-1 border-r border-white/10 pr-2">
          <ToolbarButton onClick={() => execCommand('formatBlock', 'h1')} title="Título 1">
            H1
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('formatBlock', 'h2')} title="Título 2">
            H2
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('formatBlock', 'h3')} title="Título 3">
            H3
          </ToolbarButton>
        </div>

        <div className="flex items-center gap-1 border-r border-white/10 pr-2">
          <ToolbarButton onClick={() => execCommand('insertUnorderedList')} title="Lista con viñetas">
            • Lista
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('insertOrderedList')} title="Lista numerada">
            1. Lista
          </ToolbarButton>
        </div>

        <div className="flex items-center gap-1 border-r border-white/10 pr-2">
          <ToolbarButton onClick={insertLink} title="Insertar enlace">
            <span className="material-symbols-outlined text-base">link</span>
          </ToolbarButton>
          <ToolbarButton onClick={insertImage} title="Insertar imagen">
            <span className="material-symbols-outlined text-base">image</span>
          </ToolbarButton>
          <ToolbarButton onClick={insertCode} title="Insertar código">
            {'</>'}
          </ToolbarButton>
        </div>

        <div className="flex items-center gap-1">
          <ToolbarButton onClick={insertTable} title="Insertar tabla">
            <span className="material-symbols-outlined text-base">table_chart</span>
            Tabla
          </ToolbarButton>
          <ToolbarButton onClick={insertYouTube} title="Insertar YouTube">
            <span className="text-base">▶</span>
            YouTube
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('formatBlock', 'blockquote')} title="Cita">
            " Cita
          </ToolbarButton>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="min-h-[300px] p-4 text-white focus:outline-none"
        style={{
          backgroundColor: isFocused ? '#1a162e' : '#1a162e',
          color: '#ffffff',
        }}
        data-placeholder={placeholder || 'Escribe aquí...'}
        suppressContentEditableWarning
      />
    </div>
  );
}

