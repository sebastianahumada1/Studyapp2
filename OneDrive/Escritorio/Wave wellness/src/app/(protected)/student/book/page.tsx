'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/base/button'
import { useToast } from '@/components/ui/base/use-toast'
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Loader2, 
  Calendar as CalendarIcon,
  Bell
} from 'lucide-react'
import Link from 'next/link'
import { reserveSlot } from './actions'
import { cn } from '@/lib/utils'

type Slot = {
  id: string
  starts_at: string
  ends_at: string
  capacity: number
  booked_count: number
  coach_id: string
  profiles: {
    full_name: string
  }
}

export default function StudentBookPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [reserving, setReserving] = useState(false)
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([])
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  useEffect(() => {
    loadSlots()
  }, [])

  const loadSlots = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      // Cargar slots activos y futuros
      const { data, error } = await supabase
        .from('coach_slots')
        .select(`
          id,
          starts_at,
          ends_at,
          capacity,
          active,
          coach_id,
          profiles!coach_slots_coach_id_fkey(full_name),
          class_bookings(count)
        `)
        .eq('active', true)
        .gte('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true })

      if (error) throw error

      const formattedSlots = data.map((slot: any) => ({
        ...slot,
        booked_count: slot.class_bookings[0]?.count || 0
      }))

      setSlots(formattedSlots)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar las clases disponibles',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReserve = async () => {
    if (selectedSlotIds.length === 0) return

    try {
      setReserving(true)
      let successCount = 0
      let errors = []

      // Realizar las reservas una por una (o podrías crear una RPC para múltiples)
      for (const slotId of selectedSlotIds) {
        const result = await reserveSlot(slotId)
        if (result.success) {
          successCount++
        } else {
          errors.push(result.error)
        }
      }

      if (successCount > 0) {
        toast({
          title: '¡Reserva exitosa!',
          description: `Has agendado ${successCount} clase(s) correctamente.`,
        })
        setSelectedSlotIds([])
        loadSlots()
      }

      if (errors.length > 0) {
        toast({
          variant: 'destructive',
          title: 'Algunas reservas fallaron',
          description: errors[0], // Mostramos el primer error
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error inesperado',
        description: 'Ocurrió un error al procesar tus reservas.',
      })
    } finally {
      setReserving(false)
    }
  }

  // Lógica del Calendario
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    // Ajustar primer día (0 es Domingo, queremos que 0 sea Lunes para el grid)
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1
    
    return { adjustedFirstDay, daysInMonth }
  }

  const { adjustedFirstDay, daysInMonth } = getDaysInMonth(currentMonth)
  
  const days = Array.from({ length: 42 }, (_, i) => {
    const dayNumber = i - adjustedFirstDay + 1
    if (dayNumber > 0 && dayNumber <= daysInMonth) {
      return new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNumber)
    }
    return null
  })

  const isSameDay = (d1: Date, d2: Date) => 
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()

  const hasSlotsOnDay = (date: Date) => 
    slots.some(slot => isSameDay(new Date(slot.starts_at), date))

  // Obtener los slots seleccionados completos para el resumen
  const selectedSlotsData = slots.filter(slot => selectedSlotIds.includes(slot.id))

  // Las fechas que tienen al menos un slot seleccionado
  const datesWithSelection = Array.from(new Set(
    selectedSlotsData.map(slot => new Date(slot.starts_at).toDateString())
  )).map(dateStr => new Date(dateStr))

  const filteredSlots = slots.filter(slot => isSameDay(new Date(slot.starts_at), selectedDate))

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      time: date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }),
      ampm: date.getHours() >= 12 ? 'PM' : 'AM'
    }
  }

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1))
  }

  const toggleSlotSelection = (slotId: string) => {
    setSelectedSlotIds(prev => 
      prev.includes(slotId) 
        ? prev.filter(id => id !== slotId) 
        : [...prev, slotId]
    )
  }

  return (
    <div className="min-h-screen bg-background-light text-black font-sans max-w-md mx-auto flex flex-col relative pb-72">
      {/* Navigation */}
      <nav className="pt-12 px-6 flex items-center justify-between">
        <Link href="/student">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/40 border border-white/60 text-black/40 hover:text-black transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/40 border border-white/60 text-black/40 hover:text-black transition-colors">
          <Bell className="h-5 w-5" />
        </button>
      </nav>

      {/* Header */}
      <header className="pt-6 pb-4 flex flex-col items-center text-center">
        <h1 className="text-black serif-title text-3xl font-normal tracking-tight">Agendar Clases</h1>
        <p className="text-[10px] tracking-[0.3em] uppercase mt-1 text-[#CEB49D] font-bold italic">Find your flow</p>
      </header>

      {/* Calendar Section */}
      <section className="px-6 mb-6">
        <div className="bg-white/50 border border-white/80 rounded-[32px] p-5 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-black/60">
              {currentMonth.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                <ChevronLeft className="h-5 w-5 text-black/40" />
              </button>
              <button onClick={() => changeMonth(1)} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                <ChevronRight className="h-5 w-5 text-black/40" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-y-1 text-center">
            {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(day => (
              <span key={day} className="text-[9px] font-bold text-[#CEB49D] uppercase mb-2">{day}</span>
            ))}
            {days.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} className="h-9 w-9" />
              
              const isSelected = isSameDay(date, selectedDate)
              const hasClasses = hasSlotsOnDay(date)
              const isPast = date < new Date(new Date().setHours(0,0,0,0))
              const hasSelectedSlot = selectedSlotsData.some(slot => isSameDay(new Date(slot.starts_at), date))

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => !isPast && setSelectedDate(date)}
                  disabled={isPast}
                  className={cn(
                    "h-9 w-9 mx-auto flex flex-col items-center justify-center text-xs rounded-full transition-all relative",
                    isSelected ? "bg-[#0A517F] text-white shadow-md" : (hasSelectedSlot ? "bg-[#D0E1F5] text-[#0A517F] font-bold" : "hover:bg-[#D0E1F5]/40"),
                    isPast && "opacity-20 cursor-not-allowed",
                    !isSelected && !hasSelectedSlot && hasClasses && "font-bold text-[#0A517F]"
                  )}
                >
                  {date.getDate()}
                  {hasClasses && !isSelected && !hasSelectedSlot && (
                    <div className="absolute bottom-1.5 w-1 h-1 bg-[#0A517F] rounded-full" />
                  )}
                  {hasSelectedSlot && !isSelected && (
                    <div className="absolute bottom-1.5 w-1 h-1 bg-[#0A517F] rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
          
          <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-center gap-2">
            <span className="text-[9px] text-[#CEB49D] font-bold uppercase tracking-wider">Fecha:</span>
            <span className="text-[9px] text-black font-bold uppercase">
              {selectedDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>
      </section>

      {/* Slots Section */}
      <main className="flex-1 px-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#CEB49D]">Clases disponibles</h2>
          <p className="text-[9px] font-bold text-black/20 uppercase">
            {filteredSlots.length} {filteredSlots.length === 1 ? 'opción' : 'opciones'}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#CEB49D]" />
          </div>
        ) : filteredSlots.length === 0 ? (
          <div className="text-center py-12 bg-white/40 rounded-[32px] border border-white/60">
            <CalendarIcon className="h-10 w-10 mx-auto text-black/10 mb-3" />
            <p className="text-sm text-black/40 italic px-8">No hay clases programadas para este día</p>
          </div>
        ) : (
          filteredSlots.map((slot) => {
            const isSelected = selectedSlotIds.includes(slot.id)
            const isFull = slot.booked_count >= slot.capacity
            const { time, ampm } = formatTime(slot.starts_at)

            return (
              <button
                key={slot.id}
                disabled={isFull}
                onClick={() => toggleSlotSelection(slot.id)}
                className={cn(
                  "w-full p-5 rounded-[24px] flex items-center justify-between transition-all border text-left",
                  isSelected 
                    ? "bg-white border-[#0A517F] shadow-md ring-1 ring-[#0A517F]" 
                    : "bg-white/60 border-white/80 hover:bg-white"
                )}
              >
                <div className="flex gap-4 items-center">
                  <div className="text-center min-w-[50px]">
                    <p className="text-[13px] font-bold">{time}</p>
                    <p className="text-[9px] opacity-40 uppercase font-bold">{ampm}</p>
                  </div>
                  <div className="w-px h-8 bg-black/5" />
                  <div>
                    <p className="text-[10px] text-[#CEB49D] font-bold uppercase tracking-widest mb-0.5">
                      {slot.profiles?.full_name || 'Coach'}
                    </p>
                    <h3 className="serif-title text-lg leading-tight italic text-black">Pilates Reformer</h3>
                    <p className="text-[10px] text-black/40 font-medium uppercase tracking-wide mt-1">
                      {isFull ? 'Agotado' : `${slot.capacity - slot.booked_count} cupos disponibles`}
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                  isSelected 
                    ? "bg-[#0A517F] text-white shadow-lg shadow-[#0A517F]/20" 
                    : "border border-black/10 bg-white/40"
                )}>
                  {isSelected && <Check className="h-3.5 w-3.5" />}
                </div>
              </button>
            )
          })
        )}
      </main>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-background-light border-t border-black/5 z-30">
        {selectedSlotIds.length > 0 && (
          <div className="mb-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between mb-3 px-2">
              <div>
                <p className="text-[10px] font-bold text-[#0A517F] tracking-widest uppercase">
                  {selectedSlotIds.length} {selectedSlotIds.length === 1 ? 'Clase seleccionada' : 'Clases seleccionadas'}
                </p>
                <p className="text-[9px] text-[#CEB49D] font-medium mt-0.5 italic">Consumirá {selectedSlotIds.length} {selectedSlotIds.length === 1 ? 'crédito' : 'créditos'}</p>
              </div>
              <button 
                onClick={() => setSelectedSlotIds([])}
                className="text-[10px] text-[#CEB49D] font-bold underline cursor-pointer hover:text-[#0A517F] transition-colors"
              >
                Limpiar
              </button>
            </div>
            
            {/* Resumen de fechas y horas */}
            <div className="flex flex-wrap gap-2 px-2 max-h-32 overflow-y-auto no-scrollbar py-1">
              {selectedSlotsData
                .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
                .map((slot) => {
                  const { time, ampm } = formatTime(slot.starts_at)
                  return (
                    <div 
                      key={slot.id}
                      className="bg-white border border-[#0A517F]/10 rounded-full px-3 py-1 flex items-center gap-2 shadow-sm"
                    >
                      <span className="text-[9px] font-bold text-[#0A517F] uppercase">
                        {new Date(slot.starts_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                      </span>
                      <div className="w-px h-2 bg-[#0A517F]/20" />
                      <span className="text-[9px] font-medium text-black/60">
                        {time} {ampm}
                      </span>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
        <button
          onClick={handleReserve}
          disabled={selectedSlotIds.length === 0 || reserving}
          className={cn(
            "w-full py-5 bg-[#BFA58E] text-white font-bold text-[11px] tracking-[0.3em] uppercase rounded-full shadow-xl transition-all active:scale-[0.98] flex items-center justify-center",
            (selectedSlotIds.length === 0 || reserving) ? "opacity-50 cursor-not-allowed" : "hover:bg-[#A68B6F] shadow-[#BFA58E]/20"
          )}
        >
          {reserving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              PROCESANDO...
            </>
          ) : (
            'Confirmar Agendamiento'
          )}
        </button>
      </div>
    </div>
  )
}
