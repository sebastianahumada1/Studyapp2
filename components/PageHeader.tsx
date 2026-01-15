'use client';

import { usePathname } from 'next/navigation';
import { useMemo, ReactNode, useState, useEffect } from 'react';

interface PageHeaderProps {
  title: string;
  actionButtons?: ReactNode;
  subtitle?: string;
}

interface BreadcrumbConfig {
  breadcrumb: string[];
  defaultTitle: string;
}

export function PageHeader({ title, actionButtons, subtitle }: PageHeaderProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const routeConfig = useMemo<BreadcrumbConfig>(() => {
    // During SSR, pathname might be null, so we return empty breadcrumb
    if (!mounted || !pathname) {
      return {
        breadcrumb: [],
        defaultTitle: title,
      };
    }

    if (pathname.startsWith('/hub')) {
      return {
        breadcrumb: ['Hub de Conocimiento', 'Rutas de Estudio'],
        defaultTitle: 'Rutas de Estudio',
      };
    }
    
    if (pathname.startsWith('/assessment')) {
      return {
        breadcrumb: ['Evaluación', 'Configuración de la Sesión'],
        defaultTitle: 'Configuración de Simulacro',
      };
    }
    
    if (pathname.startsWith('/questions')) {
      return {
        breadcrumb: ['Evaluación', 'Configuración de la Sesión', 'Banco de Preguntas'],
        defaultTitle: 'Banco de Preguntas',
      };
    }
    
    if (pathname.startsWith('/errors')) {
      return {
        breadcrumb: ['Dashboard de Errores', 'Panel de Diagnóstico'],
        defaultTitle: 'Panel de Diagnóstico',
      };
    }
    
    if (pathname.startsWith('/mentor')) {
      return {
        breadcrumb: ['Tutoría', 'Mentor IA'],
        defaultTitle: 'Mentor IA',
      };
    }

    // Default fallback
    return {
      breadcrumb: [],
      defaultTitle: title,
    };
  }, [pathname, title, mounted]);

  const displayTitle = title || routeConfig.defaultTitle;
  const isLastItem = (index: number, arrayLength: number) => index === arrayLength - 1;

  return (
    <header className="w-full px-6 py-6 md:px-10 border-b border-white/5 bg-background-dark/90 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-col gap-1">
          {mounted && routeConfig.breadcrumb.length > 0 && (
            <div className="flex items-center gap-2 text-text-muted text-xs font-medium uppercase tracking-widest mb-1">
              {routeConfig.breadcrumb.map((item, index) => (
                <span key={`${item}-${index}`} className="flex items-center gap-2">
                  <span className={isLastItem(index, routeConfig.breadcrumb.length) ? 'text-primary font-bold' : 'text-text-muted'}>
                    {item}
                  </span>
                  {!isLastItem(index, routeConfig.breadcrumb.length) && (
                    <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                  )}
                </span>
              ))}
            </div>
          )}
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">
            {displayTitle}
          </h2>
          {subtitle && (
            <p className="text-text-muted text-sm mt-1">{subtitle}</p>
          )}
        </div>
        {actionButtons && (
          <div className="flex items-center gap-3">
            {actionButtons}
          </div>
        )}
      </div>
    </header>
  );
}
