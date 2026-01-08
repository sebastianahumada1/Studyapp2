'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import type { StudyRoute } from '@/types/knowledge-hub';
import { ProgressBar } from './ProgressBar';
import { getStatusColor, getStatusLabel, formatEstimatedTime } from '@/lib/knowledge-hub';
import { EditRouteModal } from './EditRouteModal';
import { useDeleteRoute } from '@/hooks/useKnowledgeHub';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface RouteCardProps {
  route: StudyRoute;
}

export function RouteCard({ route }: RouteCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const deleteRoute = useDeleteRoute();
  const statusColor = getStatusColor(route.status);
  const statusLabel = getStatusLabel(route.status);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleDelete = async () => {
    if (confirm(`¿Estás seguro de que deseas eliminar la ruta "${route.title}"? Esta acción no se puede deshacer.`)) {
      try {
        const result = await deleteRoute.mutateAsync(route.id);
        if ('error' in result && result.error) {
          alert(result.error);
        }
        setShowMenu(false);
      } catch (error: any) {
        alert(error.message || 'Error al eliminar la ruta');
      }
    }
  };

  const getStatusVariant = () => {
    switch (route.status) {
      case 'completado':
        return 'success';
      case 'en_curso':
        return 'default';
      case 'en_pausa':
        return 'warning';
      default:
        return 'outline';
    }
  };

  return (
    <>
      <Link href={`/hub/${route.id}`} className="block h-full">
        <Card
          variant="elevated"
          className={cn(
            "overflow-hidden h-full flex flex-col group",
            "hover:border-primary/40 transition-all"
          )}
        >
          <div
            className="h-32 bg-cover bg-center relative"
            style={
              route.cover_image_url
                ? { backgroundImage: `url("${route.cover_image_url}")` }
                : { backgroundColor: 'hsl(var(--surface-input))' }
            }
          >
            {!route.cover_image_url && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon name="science" size={80} className="text-indigo-500/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent"></div>
            <div className="absolute top-3 right-3">
              <Badge variant={getStatusVariant()} size="sm">
                {statusLabel}
              </Badge>
            </div>
          </div>

          <CardContent className="p-5 flex flex-col flex-1">
            <div className="flex justify-between items-start mb-2">
              <Badge variant="outline" size="sm" className="text-accent border-accent/30">
                {route.category || 'Sin categoría'}
              </Badge>
              <div className="relative" ref={menuRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                >
                  <Icon name="more_horiz" size="sm" />
                </Button>
                {showMenu && (
                  <Card className="absolute right-0 top-8 z-[100] min-w-[160px] overflow-hidden">
                    <CardContent className="p-0">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowEditModal(true);
                          setShowMenu(false);
                        }}
                      >
                        <Icon name="edit" size="sm" className="mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete();
                        }}
                        disabled={deleteRoute.isPending}
                      >
                        <Icon name="delete" size="sm" className="mr-2" />
                        {deleteRoute.isPending ? 'Eliminando...' : 'Eliminar'}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <h4 className="text-card-foreground font-bold text-lg mb-2">{route.title}</h4>
            <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
              {route.description || 'Sin descripción'}
            </p>

            <div className="mt-auto pt-4 border-t border-border">
              {route.status === 'completado' ? (
                <>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-card-foreground">Puntuación Final</span>
                    <span className="text-emerald-400 font-bold">100/100</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                </>
              ) : (
                <ProgressBar progress={route.progress} showLabel={true} />
              )}

              <div className="flex items-center justify-between mt-4">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Icon name="schedule" size={12} />
                  {route.status === 'completado'
                    ? 'Completado'
                    : route.status === 'en_pausa'
                      ? 'En pausa'
                      : `${100 - route.progress}% restante`}
                </span>
                <Button
                  size="sm"
                  variant={
                    route.status === 'completado'
                      ? 'outline'
                      : route.status === 'pendiente'
                        ? 'secondary'
                        : 'default'
                  }
                  onClick={(e) => e.preventDefault()}
                  className="text-xs"
                >
                  {route.status === 'completado'
                    ? 'Repasar'
                    : route.status === 'pendiente'
                      ? 'Empezar'
                      : 'Continuar'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    {showEditModal && (
      <EditRouteModal
        route={route}
        onClose={() => setShowEditModal(false)}
      />
    )}
    </>
  );
}

