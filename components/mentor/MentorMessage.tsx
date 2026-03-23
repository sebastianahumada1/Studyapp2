'use client';

interface MentorMessageProps {
  message: {
    id: string;
    role: 'tutor' | 'user';
    content: string;
    timestamp: string;
    codeBlock?: string;
    isTyping?: boolean;
  };
}

export function MentorMessage({ message }: MentorMessageProps) {
  if (message.isTyping) {
    return (
      <div className="flex items-center gap-4 self-start bg-white/5 px-5 py-3 rounded-full border border-white/5 shadow-lg">
        <div className="flex gap-1">
          <div className="size-1.5 bg-primary rounded-full animate-bounce"></div>
          <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
          <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
        </div>
        <span className="text-[11px] font-display font-medium text-primary uppercase tracking-widest">
          Procesando respuesta técnica...
        </span>
      </div>
    );
  }

  if (message.role === 'tutor') {
    // Check if message contains code blocks (between ```)
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const codeBlocks: Array<{ language?: string; code: string }> = [];
    let processedContent = message.content;
    let match;

    while ((match = codeBlockRegex.exec(message.content)) !== null) {
      codeBlocks.push({
        language: match[1] || undefined,
        code: match[2],
      });
      processedContent = processedContent.replace(match[0], '');
    }

    return (
      <div className="flex flex-col gap-2 max-w-[75%] self-start group">
        <div className="bg-white/5 backdrop-blur-xl border border-primary/20 rounded-2xl rounded-tl-none p-5 text-white shadow-lg transition-all">
          {processedContent && (
            <div className="leading-relaxed mb-4 whitespace-pre-wrap">{processedContent}</div>
          )}
          {codeBlocks.map((block, index) => (
            <div
              key={index}
              className="bg-[#050b0c] rounded-xl p-4 border border-white/5 font-mono text-xs overflow-x-auto shadow-inner mb-4"
            >
              <pre className="text-primary/80 whitespace-pre">
                <code>{block.code}</code>
              </pre>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 px-1">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
            Tutor IA
          </span>
          <span className="text-[10px] text-text-muted">{message.timestamp}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 max-w-[75%] self-end">
      <div className="bg-primary/20 border border-primary/30 rounded-2xl rounded-tr-none p-5 text-white shadow-xl">
        <p className="leading-relaxed">{message.content}</p>
      </div>
      <div className="flex items-center gap-2 px-1 self-end">
        <span className="text-[10px] text-text-muted">{message.timestamp}</span>
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
          Estudiante
        </span>
      </div>
    </div>
  );
}
