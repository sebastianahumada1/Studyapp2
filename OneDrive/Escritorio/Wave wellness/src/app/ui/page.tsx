'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/base/button'
import { Input } from '@/components/ui/base/input'
import { Label } from '@/components/ui/base/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/base/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/base/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/base/dialog'
import { useToast } from '@/components/ui/base/use-toast'
import { Button as KokonutButton } from '@/components/ui/button'
import { Card as KokonutCard, CardHeader as KokonutCardHeader, CardTitle as KokonutCardTitle, CardDescription as KokonutCardDescription, CardContent as KokonutCardContent } from '@/components/ui/card'

export default function UIShowcasePage() {
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)

  const tableData = [
    { id: 1, name: 'Item 1', status: 'Activo' },
    { id: 2, name: 'Item 2', status: 'Pendiente' },
    { id: 3, name: 'Item 3', status: 'Completado' },
  ]

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div>
          <h1 className="text-4xl font-bold mb-4">UI Components Showcase</h1>
          <p className="text-base text-muted-foreground">
            Esta página muestra los sistemas de diseño disponibles en el proyecto.
          </p>
        </div>

        {/* Sección A: Base UI (shadcn/ui) */}
        <section className="space-y-8">
          <div className="border-b pb-4">
            <h2 className="text-3xl font-semibold mb-2">Base UI (shadcn/ui)</h2>
            <p className="text-base text-muted-foreground">
              Sistema de diseño base para pantallas funcionales (auth, dashboards, tablas, forms).
              Optimizado para mobile-first y usuarios +60 años.
            </p>
            <div className="mt-2 text-sm text-muted-foreground">
              <strong>Características:</strong> Tamaños grandes (h-12/h-14), texto 16-18px, focus visible, labels reales.
            </div>
          </div>

          {/* Button Examples */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold">Button</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="default">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="destructive">Destructive Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="link">Link Button</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="sm">Small</Button>
              <Button size="default">Default (h-12)</Button>
              <Button size="lg">Large (h-14)</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button disabled>Disabled</Button>
              <Button>
                <span className="mr-2">Loading...</span>
              </Button>
            </div>
          </div>

          {/* Input Examples */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold">Input</h3>
            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="tu@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="disabled">Disabled</Label>
                <Input id="disabled" type="text" placeholder="Disabled input" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="error">Error State</Label>
                <Input id="error" type="text" placeholder="Input con error" className="border-destructive" />
                <p className="text-sm text-destructive">Este campo tiene un error</p>
              </div>
            </div>
          </div>

          {/* Card Examples */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold">Card</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle>Card {i}</CardTitle>
                    <CardDescription>
                      Descripción de la tarjeta {i}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base">
                      Contenido de la tarjeta con texto legible (16px base).
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm">Acción</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          {/* Table Examples */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold">Table</h3>
            <Card>
              <CardHeader>
                <CardTitle>Tabla de Ejemplo</CardTitle>
                <CardDescription>Tabla con datos de ejemplo</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Empty State */}
            <Card>
              <CardHeader>
                <CardTitle>Tabla Vacía</CardTitle>
                <CardDescription>Estado cuando no hay datos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-base">No hay datos disponibles</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dialog Examples */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold">Dialog</h3>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>Abrir Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>¿Estás seguro?</DialogTitle>
                  <DialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente los datos.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={() => setDialogOpen(false)}>
                    Eliminar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Toast Examples */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold">Toast</h3>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => {
                  toast({
                    title: "Éxito",
                    description: "La operación se completó correctamente.",
                  })
                }}
              >
                Mostrar Toast de Éxito
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Algo salió mal. Por favor intenta de nuevo.",
                  })
                }}
              >
                Mostrar Toast de Error
              </Button>
            </div>
          </div>
        </section>

        {/* Sección B: Kokonut UI (opcional/decorativo) */}
        <section className="space-y-8 border-t pt-8">
          <div className="border-b pb-4">
            <h2 className="text-3xl font-semibold mb-2">Kokonut UI (Opcional/Decorativo)</h2>
            <p className="text-base text-muted-foreground">
              Sistema de diseño decorativo para componentes de marketing y landing pages.
              <strong className="block mt-2 text-destructive">⚠️ NO usar para pantallas funcionales (auth, dashboards, tablas, forms).</strong>
            </p>
            <div className="mt-2 text-sm text-muted-foreground">
              <strong>Uso recomendado:</strong> Solo para componentes decorativos y marketing.
            </div>
          </div>

          {/* Kokonut Button Examples */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold">Kokonut Button (Decorativo)</h3>
            <div className="flex flex-wrap gap-4">
              <KokonutButton variant="default">Kokonut Primary</KokonutButton>
              <KokonutButton variant="secondary">Kokonut Secondary</KokonutButton>
              <KokonutButton variant="outline">Kokonut Outline</KokonutButton>
            </div>
            <p className="text-sm text-muted-foreground italic">
              Estos componentes son de Kokonut UI y están etiquetados como decorativos.
            </p>
          </div>

          {/* Kokonut Card Examples */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold">Kokonut Card (Decorativo)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <KokonutCard>
                <KokonutCardHeader>
                  <KokonutCardTitle>Kokonut Card</KokonutCardTitle>
                  <KokonutCardDescription>
                    Componente decorativo de Kokonut UI
                  </KokonutCardDescription>
                </KokonutCardHeader>
                <KokonutCardContent>
                  <p className="text-sm text-earth-dark">
                    Este es un componente de Kokonut UI, solo para uso decorativo.
                  </p>
                </KokonutCardContent>
              </KokonutCard>
            </div>
            <p className="text-sm text-muted-foreground italic">
              Estos componentes son de Kokonut UI y están etiquetados como decorativos.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
