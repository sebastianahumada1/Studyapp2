'use client';

import { useState } from 'react';
import { useUpdateRoute } from '@/hooks/useKnowledgeHub';
import type { StudyRoute, RouteStatus } from '@/types/knowledge-hub';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/forms/FormField';
import { FormGroup } from '@/components/forms/FormGroup';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EditRouteModalProps {
  route: StudyRoute;
  onClose: () => void;
}

export function EditRouteModal({ route, onClose }: EditRouteModalProps) {
  const [title, setTitle] = useState(route.title);
  const [description, setDescription] = useState(route.description || '');
  const [category, setCategory] = useState(route.category || '');
  const [status, setStatus] = useState<RouteStatus>(route.status);
  const [open, setOpen] = useState(true);
  const updateRoute = useUpdateRoute();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await updateRoute.mutateAsync({
      routeId: route.id,
      data: {
        title,
        description,
        category,
        status,
      },
    });

    if (result.success) {
      setOpen(false);
      onClose();
    } else {
      alert(result.error || 'Error al actualizar la ruta');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Ruta de Estudio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FormGroup spacing="md">
            <FormField label="Título" required>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Introducción a React"
                required
              />
            </FormField>
            <FormField label="Descripción">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el objetivo de esta ruta de estudio..."
                rows={4}
              />
            </FormField>
            <FormField label="Categoría">
              <Input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ej: Programación, Medicina, etc."
              />
            </FormField>
            <FormField label="Estado">
              <Select value={status} onValueChange={(value) => setStatus(value as RouteStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en_curso">En Curso</SelectItem>
                  <SelectItem value="en_pausa">En Pausa</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormGroup>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateRoute.isPending}>
              {updateRoute.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

