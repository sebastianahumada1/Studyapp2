'use client';

import { useState } from 'react';
import { useCreateRoute } from '@/hooks/useKnowledgeHub';
import { useRouter } from 'next/navigation';
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
import { Label } from '@/components/ui/label';

interface CreateRouteModalProps {
  onClose: () => void;
}

export function CreateRouteModal({ onClose }: CreateRouteModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [open, setOpen] = useState(true);
  const createRoute = useCreateRoute();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createRoute.mutateAsync({
      title,
      description,
      category,
    });

    if (result.success && result.data) {
      router.push(`/hub/${result.data.id}`);
      setOpen(false);
      onClose();
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
          <DialogTitle>Crear Ruta Manualmente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FormGroup spacing="md">
            <FormField label="Título" required>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Matemáticas Avanzadas"
                required
              />
            </FormField>
            <FormField label="Descripción">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe brevemente el objetivo de esta ruta de estudio..."
                rows={3}
              />
            </FormField>
            <FormField label="Categoría">
              <Input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ej: Matemáticas, Ciencias, Medicina..."
              />
            </FormField>
          </FormGroup>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createRoute.isPending}>
              {createRoute.isPending ? 'Creando...' : 'Crear Ruta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

