'use client';

import { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useQuestions } from '@/hooks/useQuestions';
import { useRoutesWithTree } from '@/hooks/useKnowledgeHub';

interface FiltersSectionProps {
  onFiltersChange?: (filters: {
    route: string;
    topic: string;
    subtopic: string;
    subsubtopic: string;
    difficulty: string;
    search: string;
  }) => void;
}

export function FiltersSection({ onFiltersChange }: FiltersSectionProps) {
  const { data: questions = [] } = useQuestions();
  const { data: routes = [] } = useRoutesWithTree();
  
  const [filters, setFilters] = useState({
    route: '',
    topic: '',
    subtopic: '',
    subsubtopic: '',
    difficulty: '',
    search: '',
  });

  // Extract unique routes from questions
  const availableRoutes = useMemo(() => {
    const routeIds = new Set<string>();
    const routeMap = new Map<string, { id: string; title: string }>();
    
    questions.forEach((q) => {
      if (q.route_id && q.route) {
        routeIds.add(q.route_id);
        routeMap.set(q.route_id, { id: q.route.id, title: q.route.title });
      }
    });
    
    return Array.from(routeMap.values());
  }, [questions]);

  // Extract unique topics from questions (based on selected route)
  const availableTopics = useMemo(() => {
    if (!filters.route || filters.route === 'all') return [];
    
    const topicIds = new Set<string>();
    const topicMap = new Map<string, { id: string; name: string }>();
    
    questions.forEach((q) => {
      if (q.route_id === filters.route && q.topic_id && q.topic) {
        topicIds.add(q.topic_id);
        topicMap.set(q.topic_id, { id: q.topic.id, name: q.topic.name });
      }
    });
    
    return Array.from(topicMap.values());
  }, [questions, filters.route]);

  // Extract unique subtopics from questions (based on selected route and topic)
  const availableSubtopics = useMemo(() => {
    if (!filters.route || filters.route === 'all' || !filters.topic || filters.topic === 'all') return [];
    
    const subtopicIds = new Set<string>();
    const subtopicMap = new Map<string, { id: string; name: string }>();
    
    questions.forEach((q) => {
      if (
        q.route_id === filters.route &&
        q.topic_id === filters.topic &&
        q.subtopic_id &&
        q.subtopic
      ) {
        subtopicIds.add(q.subtopic_id);
        subtopicMap.set(q.subtopic_id, { id: q.subtopic.id, name: q.subtopic.name });
      }
    });
    
    return Array.from(subtopicMap.values());
  }, [questions, filters.route, filters.topic]);

  // Extract unique subsubtopics from questions (based on selected route, topic, and subtopic)
  const availableSubsubtopics = useMemo(() => {
    if (
      !filters.route ||
      filters.route === 'all' ||
      !filters.topic ||
      filters.topic === 'all' ||
      !filters.subtopic ||
      filters.subtopic === 'all'
    )
      return [];
    
    const subsubtopicIds = new Set<string>();
    const subsubtopicMap = new Map<string, { id: string; name: string }>();
    
    questions.forEach((q) => {
      if (
        q.route_id === filters.route &&
        q.topic_id === filters.topic &&
        q.subtopic_id === filters.subtopic &&
        q.subsubtopic_id &&
        q.subsubtopic
      ) {
        subsubtopicIds.add(q.subsubtopic_id);
        subsubtopicMap.set(q.subsubtopic_id, { id: q.subsubtopic.id, name: q.subsubtopic.name });
      }
    });
    
    return Array.from(subsubtopicMap.values());
  }, [questions, filters.route, filters.topic, filters.subtopic]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    
    // Reset dependent filters when parent filter changes
    if (key === 'route') {
      newFilters.topic = '';
      newFilters.subtopic = '';
      newFilters.subsubtopic = '';
    } else if (key === 'topic') {
      newFilters.subtopic = '';
      newFilters.subsubtopic = '';
    } else if (key === 'subtopic') {
      newFilters.subsubtopic = '';
    }
    
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      route: '',
      topic: '',
      subtopic: '',
      subsubtopic: '',
      difficulty: '',
      search: '',
    };
    setFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  return (
    <section className="bg-surface-dark border border-white/5 p-6 rounded-2xl shadow-xl">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">filter_list</span>
            Filtros de Gestión
          </h3>
          <button
            onClick={handleClearFilters}
            className="text-primary text-xs font-bold uppercase hover:underline"
          >
            Limpiar Filtros
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Ruta */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase ml-1">Ruta</label>
            <Select value={filters.route} onValueChange={(value) => handleFilterChange('route', value)}>
              <SelectTrigger className="w-full bg-background-dark border-white/5 text-white text-sm rounded-xl py-3 px-4 focus:ring-primary focus:border-primary">
                <SelectValue placeholder="Todas las Rutas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Rutas</SelectItem>
                {availableRoutes.map((route) => (
                  <SelectItem key={route.id} value={route.id}>
                    {route.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tema */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase ml-1">Tema</label>
            <Select
              value={filters.topic}
              onValueChange={(value) => handleFilterChange('topic', value)}
              disabled={!filters.route || filters.route === 'all'}
            >
              <SelectTrigger className="w-full bg-background-dark border-white/5 text-white text-sm rounded-xl py-3 px-4 focus:ring-primary focus:border-primary disabled:opacity-50">
                <SelectValue placeholder={filters.route && filters.route !== 'all' ? 'Todos los Temas' : 'Selecciona una ruta'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Temas</SelectItem>
                {availableTopics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subtema */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase ml-1">Subtema</label>
            <Select
              value={filters.subtopic}
              onValueChange={(value) => handleFilterChange('subtopic', value)}
              disabled={!filters.route || filters.route === 'all' || !filters.topic || filters.topic === 'all'}
            >
              <SelectTrigger className="w-full bg-background-dark border-white/5 text-white text-sm rounded-xl py-3 px-4 focus:ring-primary focus:border-primary disabled:opacity-50">
                <SelectValue
                  placeholder={
                    !filters.route || filters.route === 'all'
                      ? 'Selecciona una ruta'
                      : !filters.topic || filters.topic === 'all'
                      ? 'Selecciona un tema'
                      : 'Todos los Subtemas'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Subtemas</SelectItem>
                {availableSubtopics.map((subtopic) => (
                  <SelectItem key={subtopic.id} value={subtopic.id}>
                    {subtopic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sub-Subtema */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase ml-1">Sub-Subtema</label>
            <Select
              value={filters.subsubtopic}
              onValueChange={(value) => handleFilterChange('subsubtopic', value)}
              disabled={
                !filters.route ||
                filters.route === 'all' ||
                !filters.topic ||
                filters.topic === 'all' ||
                !filters.subtopic ||
                filters.subtopic === 'all'
              }
            >
              <SelectTrigger className="w-full bg-background-dark border-white/5 text-white text-sm rounded-xl py-3 px-4 focus:ring-primary focus:border-primary disabled:opacity-50">
                <SelectValue
                  placeholder={
                    !filters.route || filters.route === 'all'
                      ? 'Selecciona una ruta'
                      : !filters.topic || filters.topic === 'all'
                      ? 'Selecciona un tema'
                      : !filters.subtopic || filters.subtopic === 'all'
                      ? 'Selecciona un subtema'
                      : 'Todos los Sub-Subtemas'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Sub-Subtemas</SelectItem>
                {availableSubsubtopics.map((subsubtopic) => (
                  <SelectItem key={subsubtopic.id} value={subsubtopic.id}>
                    {subsubtopic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dificultad */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase ml-1">Dificultad</label>
            <Select value={filters.difficulty} onValueChange={(value) => handleFilterChange('difficulty', value)}>
              <SelectTrigger className="w-full bg-background-dark border-white/5 text-white text-sm rounded-xl py-3 px-4 focus:ring-primary focus:border-primary">
                <SelectValue placeholder="Todas las Dificultades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Dificultades</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Búsqueda Rápida */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase ml-1">Búsqueda Rápida</label>
            <div className="relative">
              <Input
                className="w-full bg-background-dark border-white/5 text-white text-sm rounded-xl py-3 px-4 pl-10 focus:ring-primary focus:border-primary placeholder:text-text-muted"
                placeholder="Buscar por texto..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none">
                search
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
