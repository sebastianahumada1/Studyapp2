'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { packageSchema, type Package } from '@/lib/validations/packages'
import { useToast } from '@/components/ui/base/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/base/dialog'
import { Input } from '@/components/ui/base/input'
import { Label } from '@/components/ui/base/label'
import { 
  ChevronLeft, 
  MoreHorizontal, 
  Trash2, 
  PlusCircle,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function AdminPackagesPage() {
  const { toast } = useToast()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue
  } = useForm({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: '',
      credits: 1,
      price: 0,
      active: true,
      validity_days: 30
    }
  })

  useEffect(() => {
    loadPackages()
  }, [])

  const loadPackages = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('price', { ascending: true })

      if (error) throw error
      setPackages(data || [])
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los paquetes',
      })
    } finally {
      setLoading(false)
    }
  }

  const onCreateSubmit = async (values: any) => {
    try {
      setSubmitting(true)
      const supabase = createClient()
      const { error } = await supabase
        .from('packages')
        .insert([values])

      if (error) throw error

      toast({ title: 'Paquete creado', description: 'El nuevo paquete ha sido registrado.' })
      setIsCreateOpen(false)
      reset()
      loadPackages()
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  const onEditSubmit = async (values: any) => {
    if (!editingPackage) return
    try {
      setSubmitting(true)
      const supabase = createClient()
      const { error } = await supabase
        .from('packages')
        .update(values)
        .eq('id', editingPackage.id)

      if (error) throw error

      toast({ title: 'Paquete actualizado', description: 'Los cambios han sido guardados.' })
      setIsEditOpen(false)
      setEditingPackage(null)
      loadPackages()
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg)
    setValue('name', pkg.name)
    setValue('credits', pkg.credits || 1)
    setValue('price', pkg.price)
    setValue('active', pkg.active)
    setValue('validity_days', pkg.validity_days)
    setIsEditOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este paquete? Esta acción no se puede deshacer.')) return
    
    try {
      setLoading(true)
      const supabase = createClient()
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({ title: 'Paquete eliminado', description: 'El paquete ha sido borrado exitosamente.' })
      loadPackages()
    } catch (error: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Error al eliminar', 
        description: 'No se puede eliminar un paquete que ya tiene pagos asociados. Considera desactivarlo en su lugar.' 
      })
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-[#F6F1EE] text-black font-sans max-w-md mx-auto flex flex-col relative pb-32">
      {/* Header */}
      <header className="pt-12 pb-6 px-6 flex items-center justify-between sticky top-0 bg-[#F6F1EE]/80 backdrop-blur-md z-30">
        <Link href="/admin">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/40 border border-white/60 text-[#0A517F] hover:text-black transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
        </Link>
        <h1 className="text-[#0A517F] serif-title text-xl font-normal tracking-wide">Configuración de Paquetes</h1>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/40 border border-white/60 text-[#0A517F] hover:text-black transition-colors">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </header>

      <main className="flex-1 px-6 space-y-4 pt-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#CEB49D]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {packages.map((pkg) => (
              <div 
                key={pkg.id} 
                className={cn(
                  "bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex justify-between items-center group transition-all relative",
                  !pkg.active && "opacity-50 grayscale"
                )}
              >
                <button 
                  onClick={() => handleDelete(pkg.id)}
                  className="absolute top-4 right-4 p-1.5 text-red-400/40 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  title="Eliminar paquete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                <div>
                  <h3 className="serif-title text-[#0A517F] text-xl italic leading-tight">{pkg.name}</h3>
                  <p className="text-[11px] font-bold tracking-widest text-[#CEB49D] uppercase mt-1">
                    {pkg.credits} {pkg.credits === 1 ? 'Clase' : 'Clases'} • {pkg.validity_days} días
                  </p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <p className="text-[#0A517F] font-sans font-semibold text-lg">{formatPrice(pkg.price)}</p>
                  <button 
                    onClick={() => handleEdit(pkg)}
                    className="text-[10px] font-bold tracking-widest text-[#0A517F] uppercase border-b border-[#0A517F]/20 hover:border-[#0A517F] transition-all"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}

            <button 
              onClick={() => {
                reset()
                setIsCreateOpen(true)
              }}
              className="w-full mt-4 py-8 border-2 border-dashed border-[#CEB49D]/40 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-white/30 transition-all group"
            >
              <PlusCircle className="h-8 w-8 text-[#CEB49D] group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold tracking-[0.2em] text-[#CEB49D] uppercase">Crear nuevo paquete</span>
            </button>
          </div>
        )}
      </main>

      {/* Dialogs */}
      <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false)
          setIsEditOpen(false)
          setEditingPackage(null)
          reset()
        }
      }}>
        <DialogContent className="max-w-[360px] p-0 bg-[#F6F1EE] border-none overflow-hidden rounded-[40px] [&>button]:hidden">
          <div className="p-8">
            <DialogHeader className="mb-8">
              <DialogTitle className="serif-title text-2xl italic text-center text-[#0A517F]">
                {isEditOpen ? 'Editar Paquete' : 'Nuevo Paquete'}
              </DialogTitle>
              <DialogDescription className="text-center text-[10px] tracking-[0.1em] uppercase text-black/40 font-bold">
                {isEditOpen ? 'Modifica los detalles del plan' : 'Configura un nuevo plan de clases'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(isEditOpen ? onEditSubmit : onCreateSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] text-black/40 font-bold ml-1">Nombre del Paquete</Label>
                <Input 
                  {...register('name')}
                  className="bg-white/40 border-white/60 rounded-2xl h-12 px-4 focus:ring-[#CEB49D] focus:border-[#CEB49D]"
                  placeholder="Ej: Pack Mensual"
                />
                {errors.name && <p className="text-[9px] text-red-500 ml-1">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-black/40 font-bold ml-1">Créditos</Label>
                  <Input 
                    type="number"
                    {...register('credits', { valueAsNumber: true })}
                    className="bg-white/40 border-white/60 rounded-2xl h-12 px-4 focus:ring-[#CEB49D] focus:border-[#CEB49D]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-black/40 font-bold ml-1">Días Validez</Label>
                  <Input 
                    type="number"
                    {...register('validity_days', { valueAsNumber: true })}
                    className="bg-white/40 border-white/60 rounded-2xl h-12 px-4 focus:ring-[#CEB49D] focus:border-[#CEB49D]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] text-black/40 font-bold ml-1">Precio (COP)</Label>
                <Input 
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  className="bg-white/40 border-white/60 rounded-2xl h-12 px-4 focus:ring-[#CEB49D] focus:border-[#CEB49D]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="active"
                  {...register('active')}
                  className="rounded border-[#CEB49D]/40 text-[#0A517F] focus:ring-[#0A517F]"
                />
                <Label htmlFor="active" className="text-[10px] uppercase tracking-[0.2em] text-black/60 font-bold">Paquete Activo</Label>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-[#BFA58E] text-white font-bold text-[10px] tracking-[0.3em] uppercase rounded-full shadow-lg shadow-[#BFA58E]/20 hover:bg-[#A68B6F] transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Guardar Paquete'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false)
                    setIsEditOpen(false)
                    setEditingPackage(null)
                    reset()
                  }}
                  className="w-full py-4 text-black/40 font-bold text-[10px] tracking-[0.3em] uppercase hover:text-black transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
