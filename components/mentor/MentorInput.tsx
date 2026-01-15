'use client';

import { useState, useRef, useEffect } from 'react';

interface MentorInputProps {
  onSendMessage: (content: string) => void;
}

export function MentorInput({ onSendMessage }: MentorInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <footer className="p-6 bg-background-dark/90 backdrop-blur-xl border-t border-white/5 z-10">
      <div className="max-w-4xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-2xl p-2 pl-4 flex items-center gap-3 focus-within:border-primary/50 transition-all shadow-2xl"
        >
          <button
            type="button"
            className="p-2 text-text-muted hover:text-primary transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl">attachment</span>
          </button>
          <textarea
            ref={textareaRef}
            className="flex-1 bg-transparent border-none focus:ring-0 text-white text-sm placeholder:text-text-muted py-3 resize-none font-body outline-none"
            placeholder="Escribe tu consulta sobre React, Python o CSS..."
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center gap-2 pr-1">
            <button
              type="button"
              className="p-2 text-text-muted hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-xl">mic</span>
            </button>
            <button
              type="submit"
              disabled={!message.trim()}
              className="bg-primary text-background-dark px-5 py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:shadow-[0_0_20px_rgba(13,242,242,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              <span>Enviar</span>
              <span className="material-symbols-outlined text-sm">send</span>
            </button>
          </div>
        </form>
        <div className="flex justify-center gap-8 mt-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">
          <span>Engine: GPT-4 Advanced Tutor</span>
          <span className="text-primary/40">•</span>
          <span>Modo: Interactivo de alto rendimiento</span>
        </div>
      </div>
    </footer>
  );
}
