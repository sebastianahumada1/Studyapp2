'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/base/use-toast'
import { 
  ArrowLeft, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Check, 
  Plus,
  Loader2,
  X,
  PlusCircle,
  Edit3,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { createAvailability } from './actions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/base/dialog'
import { Input } from '@/components/ui/base/input'
import { Label } from '@/components/ui/base/label'

export default function CoachAvailabilityPage() {
  const { toast } = useToast()
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [selectedHours, setSelectedDatesHours] = useState<string[]>([])
  const [activeHours, setActiveHours] = useState<string[]>([])
  const [existingSlots, setExistingSlots] = useState<any[]>([])
  const [daysWithSlots, setDaysWithSlots] = useState<string[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [isAddHourOpen, setIsAddHourOpen] = useState(false)
  const [isEditHourOpen, setIsEditHourOpen] = useState(false)
  const [editingSlot, setEditingSlot] = useState<any>(null)
  const [newHour, setNewHour] = useState('09:00')
  const [editHour, setEditHour] = useState('09:00')

  useEffect(() => {
    loadExistingSlots()
  }, [selectedDates])

  useEffect(() => {
    loadDaysWithSlots()
  }, [currentMonth])

  const loadDaysWithSlots = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Ampliamos el rango del mes para capturar slots en bordes de zona horaria
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      startOfMonth.setDate(startOfMonth.getDate() - 1)
      
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59)
      endOfMonth.setDate(endOfMonth.getDate() + 1)

      const { data, error } = await supabase
        .from('coach_slots')
        .select('starts_at')
        .eq('coach_id', user.id)
        .gte('starts_at', startOfMonth.toISOString())
        .lte('starts_at', endOfMonth.toISOString())

      if (!error && data) {
        const days = [...new Set(data.map(s => {
          // Extraer la fecha tal cual viene de la base de datos (YYYY-MM-DD) sin convertir a Date local
          return s.starts_at.split('T')[0];
        }))]
        console.log('Days with slots loaded (raw):', days)
        setDaysWithSlots(days)
      }
    } catch (error) {
      console.error('Error loading days with slots:', error)
    }
  }

  const loadExistingSlots = async () => {
    if (selectedDates.length === 0) {
      setExistingSlots([])
      return
    }

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Obtener el rango de búsqueda en UTC para cubrir todo el día local
      const sortedSelectedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime())
      
      // Crear fechas de inicio y fin del día en la zona horaria local
      // Usamos un margen de seguridad para capturar slots que por UTC podrían caer en bordes
      const localStart = new Date(sortedSelectedDates[0])
      localStart.setHours(0, 0, 0, 0)
      localStart.setDate(localStart.getDate() - 1) // Un día antes para seguridad
      
      const localEnd = new Date(sortedSelectedDates[sortedSelectedDates.length - 1])
      localEnd.setHours(23, 59, 59, 999)
      localEnd.setDate(localEnd.getDate() + 1) // Un día después para seguridad

      const { data, error } = await supabase
        .from('coach_slots')
        .select('*')
        .eq('coach_id', user.id)
        .gte('starts_at', localStart.toISOString())
        .lte('starts_at', localEnd.toISOString())
        .order('starts_at', { ascending: true })
      
      if (error) throw error

      // Filtrado manual exacto comparando la cadena de texto de la fecha tal cual viene de la DB
      const selectedDateStrings = selectedDates.map(d => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })

      const filtered = (data || []).filter(slot => {
        const slotDateOnly = slot.starts_at.split('T')[0];
        return selectedDateStrings.includes(slotDateOnly)
      })

      setExistingSlots(filtered)
    } catch (error) {
      console.error('Error loading slots:', error)
    }
  }

  const handleAddHour = () => {
    if (!selectedHours.includes(newHour)) {
      setSelectedDatesHours(prev => [...prev, newHour].sort())
      setActiveHours(prev => [...prev, newHour])
    }
    setIsAddHourOpen(false)
    setNewHour('09:00')
  }

  const handleUpdateSlot = async () => {
    if (!editingSlot) return
    try {
      setLoading(true)
      const supabase = createClient()
      
      const [hour, min] = editHour.split(':').map(Number)
      const startsAt = new Date(editingSlot.starts_at)
      startsAt.setHours(hour, min, 0, 0)
      
      const endsAt = new Date(startsAt)
      endsAt.setHours(endsAt.getHours() + 1)

      const { error } = await supabase
        .from('coach_slots')
        .update({
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString()
        })
        .eq('id', editingSlot.id)

      if (error) throw error

      toast({ title: 'Horario actualizado', description: 'El espacio ha sido modificado exitosamente.' })
      setIsEditHourOpen(false)
      setEditingSlot(null)
      loadExistingSlots()
      loadDaysWithSlots()
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSlot = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este espacio?')) return
    try {
      setLoading(true)
      const supabase = createClient()
      const { error } = await supabase
        .from('coach_slots')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({ title: 'Espacio eliminado', description: 'El horario ha sido borrado.' })
      loadExistingSlots()
      loadDaysWithSlots()
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar. Puede que ya tenga reservas.' })
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const days = []
    const startingDay = firstDay.getDay()
    // Padding for Monday start
    for (let i = 0; i < (startingDay === 0 ? 6 : startingDay - 1); i++) {
      days.push(null)
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const toggleDate = (date: Date) => {
    setSelectedDates([date])
    // Limpiar horas activas al cambiar de fecha para evitar confusiones
    setActiveHours([])
    setSelectedDatesHours([])
  }

  const toggleHour = (hour: string) => {
    if (activeHours.includes(hour)) {
      setActiveHours(activeHours.filter(h => h !== hour))
    } else {
      setActiveHours([...activeHours, hour])
    }
  }

  const handleSave = async () => {
    if (selectedDates.length === 0 || activeHours.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Selección incompleta',
        description: 'Debes seleccionar al menos un día y una hora.',
      })
      return
    }

    try {
      setLoading(true)
      
      // Formatear fechas a YYYY-MM-DD local para evitar desfases de zona horaria
      const formattedDates = selectedDates.map(d => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })

      const result = await createAvailability(
        formattedDates,
        activeHours
      )

      if (result.success) {
        toast({
          title: 'Disponibilidad creada',
          description: `Se han creado ${result.count} espacios de clase.`,
        })
        setSelectedDates([])
        setActiveHours([])
        setSelectedDatesHours([])
        loadExistingSlots()
        loadDaysWithSlots()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    setCurrentMonth(newMonth)
  }

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    setCurrentMonth(newMonth)
  }

  return (
    <div className="min-h-screen bg-[#F6F1EE] text-[#0A517F] font-sans max-w-md mx-auto flex flex-col relative pb-44">
      {/* Navigation */}
      <nav className="pt-12 px-6 flex items-center justify-between">
        <Link href="/coach">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/40 border border-white/60 text-[#0A517F] hover:bg-white/60 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/40 border border-white/60 text-[#0A517F]">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </nav>

      {/* Header */}
      <header className="pt-6 pb-6 flex flex-col items-center text-center">
        <h1 className="text-[#0A517F] serif-title text-3xl font-normal tracking-tight">Mi Disponibilidad</h1>
        <p className="text-[10px] tracking-[0.3em] uppercase mt-1 text-[#CEB49D] font-bold italic">Set your flow</p>
      </header>

      {/* Calendar Section */}
      <section className="px-6 mb-8">
        <div className="bg-white/50 border border-white/80 rounded-[32px] p-6 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between mb-5 px-2">
            <h2 className="text-[11px] font-bold tracking-widest uppercase text-[#0A517F]/70">
              {currentMonth.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-4">
              <button onClick={handlePrevMonth}><ChevronLeft className="h-5 w-5 opacity-40" /></button>
              <button onClick={handleNextMonth}><ChevronRight className="h-5 w-5" /></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-y-3 text-center mb-4">
            {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(day => (
              <span key={day} className="text-[9px] font-bold text-[#CEB49D] uppercase">{day}</span>
            ))}
            {getDaysInMonth(currentMonth).map((date, i) => {
              if (!date) return <div key={`empty-${i}`} className="h-9 w-9" />
              const isSelected = selectedDates.some(d => d.toDateString() === date.toDateString())
              const isToday = date.toDateString() === new Date().toDateString()
              
              const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
              const hasSlots = daysWithSlots.includes(dateStr)
              
              return (
                <button 
                  key={date.toISOString()}
                  onClick={() => toggleDate(date)}
                  className={cn(
                    "h-9 w-9 mx-auto flex items-center justify-center text-xs rounded-full transition-all relative",
                    isSelected ? "bg-[#D0E1F5] border border-[#0A517F]/20 text-[#0A517F] font-bold shadow-sm" : "font-medium hover:bg-[#D0E1F5]/50",
                    isToday && !isSelected && "text-[#CEB49D] font-bold underline"
                  )}
                >
                  {date.getDate()}
                  {hasSlots && !isSelected && (
                    <div className="absolute bottom-1 w-1 h-1 bg-[#CEB49D] rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Hours Section */}
      <main className="flex-1 px-6 space-y-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#CEB49D]/80">Horarios Disponibles</h2>
          <p className="text-[9px] font-bold text-[#0A517F]/40 uppercase">Common blocks</p>
        </div>

        <div className="space-y-3">
          {/* Slots ya existentes en la base de datos */}
          {existingSlots.length > 0 && (
            <div className="space-y-3">
              <p className="text-[9px] font-bold text-[#0A517F]/40 uppercase px-1">Espacios ya configurados</p>
              {existingSlots.map((slot) => (
                <div 
                  key={slot.id}
                  className="bg-white/80 border border-white p-5 rounded-[24px] flex items-center justify-between shadow-sm group hover:border-[#0A517F]/30 transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 rounded-xl bg-[#D0E1F5]/30 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-[#0A517F]" />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold tracking-tight text-[#0A517F]">
                        {slot.starts_at.split('T')[1].substring(0, 5)} {parseInt(slot.starts_at.split('T')[1].substring(0, 2)) >= 12 ? 'pm' : 'am'}
                      </p>
                      <p className="text-[10px] text-[#6D4E38]/60 font-medium">Espacio activo</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => {
                        const d = new Date(slot.starts_at)
                        const h = String(d.getHours()).padStart(2, '0')
                        const m = String(d.getMinutes()).padStart(2, '0')
                        setEditHour(`${h}:${m}`)
                        setEditingSlot(slot)
                        setIsEditHourOpen(true)
                      }}
                      className="p-2 text-[#0A517F]/40 hover:text-[#0A517F] transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="p-2 text-red-400/40 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-600 ml-2">
                      <Check className="h-4 w-4 font-bold" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Nuevas horas seleccionadas para agregar */}
          {selectedHours.length > 0 && (
            <div className="space-y-3 pt-4">
              <p className="text-[9px] font-bold text-[#CEB49D] uppercase px-1">Nuevos horarios a crear</p>
              {selectedHours.map((hour) => {
                const isActive = activeHours.includes(hour)
                return (
                  <div 
                    key={hour}
                    onClick={() => toggleHour(hour)}
                    className={cn(
                      "bg-white/60 border p-5 rounded-[24px] flex items-center justify-between group cursor-pointer active:scale-[0.99] transition-all",
                      isActive ? "border-[#0A517F] bg-[#0A517F]/5" : "border-white"
                    )}
                  >
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                        isActive ? "bg-[#0A517F]/10" : "bg-[#D0E1F5]/20"
                      )}>
                        <Clock className={cn("h-5 w-5", isActive ? "text-[#0A517F]" : "text-[#0A517F]/60")} />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold tracking-tight">{hour} {parseInt(hour) >= 12 ? 'PM' : 'AM'}</p>
                        <p className="text-[10px] text-[#6D4E38]/60 font-medium">Nueva sesión de Pilates</p>
                      </div>
                    </div>
                    {isActive && (
                      <div className="w-6 h-6 rounded-full bg-[#0A517F] flex items-center justify-center text-white shadow-sm shadow-[#0A517F]/20 animate-in zoom-in duration-200">
                        <Check className="h-4 w-4 font-bold" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div 
            onClick={() => setIsAddHourOpen(true)}
            className="bg-transparent border border-dashed border-[#0A517F]/20 p-5 rounded-[24px] flex items-center justify-center group cursor-pointer hover:border-[#0A517F]/40 transition-all mt-4"
          >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#0A517F]/50" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#0A517F]/60">Agregar otra hora</span>
            </div>
          </div>
        </div>
      </main>

      {/* Dialog: Agregar Hora */}
      <Dialog open={isAddHourOpen} onOpenChange={setIsAddHourOpen}>
        <DialogContent className="max-w-[320px] p-0 bg-[#F6F1EE] border-none overflow-hidden rounded-[40px] [&>button]:hidden">
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="serif-title text-2xl italic text-center text-[#0A517F]">Nueva Hora</DialogTitle>
              <DialogDescription className="text-center text-[10px] tracking-[0.1em] uppercase text-black/40 font-bold">
                Define un nuevo bloque horario
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] text-black/40 font-bold ml-1">Hora de Inicio</Label>
                <Input 
                  type="time"
                  value={newHour}
                  onChange={(e) => setNewHour(e.target.value)}
                  className="bg-white/40 border-white/60 rounded-2xl h-12 px-4 focus:ring-[#CEB49D] focus:border-[#CEB49D]"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={handleAddHour}
                  className="w-full py-4 bg-[#BFA58E] text-white font-bold text-[10px] tracking-[0.3em] uppercase rounded-full shadow-lg shadow-[#BFA58E]/20 hover:bg-[#A68B6F] transition-all flex items-center justify-center"
                >
                  Agregar a la lista
                </button>
                <button
                  onClick={() => setIsAddHourOpen(false)}
                  className="w-full py-4 text-black/40 font-bold text-[10px] tracking-[0.3em] uppercase hover:text-black transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Hora */}
      <Dialog open={isEditHourOpen} onOpenChange={setIsEditHourOpen}>
        <DialogContent className="max-w-[320px] p-0 bg-[#F6F1EE] border-none overflow-hidden rounded-[40px] [&>button]:hidden">
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="serif-title text-2xl italic text-center text-[#0A517F]">Editar Horario</DialogTitle>
              <DialogDescription className="text-center text-[10px] tracking-[0.1em] uppercase text-black/40 font-bold">
                Modifica el bloque seleccionado
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] text-black/40 font-bold ml-1">Nueva Hora</Label>
                <Input 
                  type="time"
                  value={editHour}
                  onChange={(e) => setEditHour(e.target.value)}
                  className="bg-white/40 border-white/60 rounded-2xl h-12 px-4 focus:ring-[#CEB49D] focus:border-[#CEB49D]"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={handleUpdateSlot}
                  disabled={loading}
                  className="w-full py-4 bg-[#BFA58E] text-white font-bold text-[10px] tracking-[0.3em] uppercase rounded-full shadow-lg shadow-[#BFA58E]/20 hover:bg-[#A68B6F] transition-all flex items-center justify-center"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar Cambios'}
                </button>
                <button
                  onClick={() => {
                    setIsEditHourOpen(false)
                    setEditingSlot(null)
                  }}
                  className="w-full py-4 text-black/40 font-bold text-[10px] tracking-[0.3em] uppercase hover:text-black transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fixed Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-gradient-to-t from-[#F6F1EE] via-[#F6F1EE]/95 to-transparent backdrop-blur-[2px] z-30">
        <button 
          onClick={handleSave}
          disabled={loading || selectedDates.length === 0 || activeHours.length === 0}
          className="w-full py-4 bg-[#BFA58E] text-white font-bold text-[11px] tracking-[0.25em] uppercase rounded-2xl shadow-xl shadow-[#BFA58E]/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar Disponibilidad'}
        </button>
      </div>
    </div>
  )
}
