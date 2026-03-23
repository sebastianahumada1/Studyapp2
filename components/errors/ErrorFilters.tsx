'use client';

import { useState, useEffect } from 'react';
import { useRoutes } from '@/hooks/useKnowledgeHub';
import { createClient } from '@/lib/supabase/client';

interface Filters {
  startDate: string;
  endDate: string;
  route: string;
  topic: string;
  errorType: string;
}

interface ErrorFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function ErrorFilters({ filters, onFiltersChange }: ErrorFiltersProps) {
  const { data: routes } = useRoutes();
  const [localFilters, setLocalFilters] = useState<Filters>(filters);
  const [selectedRoute, setSelectedRoute] = useState<string>(filters.route);
  const [topics, setTopics] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    setLocalFilters(filters);
    setSelectedRoute(filters.route);
  }, [filters]);

  useEffect(() => {
    // Load topics when route changes
    const loadTopics = async () => {
      if (selectedRoute) {
        const supabase = createClient();
        const { data: topicsData } = await supabase
          .from('study_topics')
          .select('id, name')
          .eq('route_id', selectedRoute)
          .order('order_index');
        
        setTopics(topicsData || []);
        // Reset topic filter when route changes
        setLocalFilters(prev => ({ ...prev, topic: '' }));
      } else {
        setTopics([]);
      }
    };
    
    loadTopics();
  }, [selectedRoute]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  return (
    <section className="bg-surface-dark/70 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-white/5">
      <div className="flex items-center gap-2 mb-6 text-primary">
        <span className="material-symbols-outlined">tune</span>
        <h2 className="font-display font-semibold uppercase tracking-wider text-xs">
          Filtros de Análisis
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
        <div className="space-y-2 lg:col-span-4">
          <label className="text-[10px] font-bold text-text-muted flex items-center gap-1 uppercase tracking-tighter">
            <span className="material-symbols-outlined text-xs">calendar_month</span>
            Rango de Fechas
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={localFilters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-white text-sm min-w-0"
            />
            <span className="text-text-muted text-xs flex-shrink-0">-</span>
            <input
              type="date"
              value={localFilters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-white text-sm min-w-0"
            />
          </div>
        </div>
        <div className="space-y-2 lg:col-span-3">
          <label className="text-[10px] font-bold text-text-muted flex items-center gap-1 uppercase tracking-tighter">
            <span className="material-symbols-outlined text-xs">alt_route</span>
            Ruta
          </label>
          <select
            value={localFilters.route}
            onChange={(e) => {
              setSelectedRoute(e.target.value);
              handleFilterChange('route', e.target.value);
            }}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-white text-sm appearance-none"
          >
            <option value="">Todas las rutas</option>
            {routes?.map((route) => (
              <option key={route.id} value={route.id}>
                {route.title}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 lg:col-span-2">
          <label className="text-[10px] font-bold text-text-muted flex items-center gap-1 uppercase tracking-tighter">
            <span className="material-symbols-outlined text-xs">topic</span>
            Tema
          </label>
          <select
            value={localFilters.topic}
            onChange={(e) => handleFilterChange('topic', e.target.value)}
            disabled={!selectedRoute}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-white text-sm appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Cualquier tema</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 lg:col-span-2">
          <label className="text-[10px] font-bold text-text-muted flex items-center gap-1 uppercase tracking-tighter">
            <span className="material-symbols-outlined text-xs">category</span>
            Tipo de Error
          </label>
          <select
            value={localFilters.errorType}
            onChange={(e) => handleFilterChange('errorType', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-white text-sm appearance-none"
          >
            <option value="">Todos los tipos</option>
            <option value="concepto">Concepto</option>
            <option value="analisis">Análisis</option>
            <option value="atencion">Atención</option>
            <option value="null">Sin categorizar</option>
          </select>
        </div>
        <div className="space-y-2 flex items-end lg:col-span-1">
          <button
            onClick={handleApplyFilters}
            className="w-[42px] h-[42px] bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-xl transition-all flex items-center justify-center flex-shrink-0"
            title="Aplicar Filtros"
          >
            <span className="material-symbols-outlined text-lg">search</span>
          </button>
        </div>
      </div>
    </section>
  );
}
