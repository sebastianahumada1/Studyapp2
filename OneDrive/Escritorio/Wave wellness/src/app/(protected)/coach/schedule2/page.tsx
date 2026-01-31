'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/base/use-toast'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Check, 
  Loader2,
  Sparkles,
  Info
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { createMultipleSlots } from '../availability/actions'
import { Label } from '@/components/ui/base/label'
import { Input } from '@/components/ui/base/input'

const DAYS = [
  { id: 1, name: 'Lunes', short: 'Lu' },
  { id: 2, name: 'Martes', short: 'Ma' },
  { id: 3, name: 'Miércoles', short: 'Mi' },
  { id: 4, name: 'Jueves', short: 'Ju' },
  { id: 5, name: 'Viernes', short: 'Vi' },
  { id: 6, name: 'Sábado', short: 'Sa' },
  { id: 7, name: 'Domingo', short: 'Do' },
]

const HOURS = Array.from({ length: 13 }, (_, i) => {
  const h = i + 7
  return `${h.toString().padStart(2, '0')}:00`
})

export default function CoachMassiveSchedulePage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [selectedHours, setSelectedHours] = useState<string[]>([])

  const toggleDay = (id: number) => {
    setSelectedDays(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    )
  }

  const toggleHour = (hour: string) => {
    setSelectedHours(prev => 
      prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour]
    )
  }

  const handleMassiveCreate = async () => {
    if (!startDate || !endDate || selectedDays.length === 0 || selectedHours.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Campos incompletos',
        description: 'Por favor selecciona fechas, días y al menos una hora.',
      })
      return
    }

    try {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let totalCreated = 0
      const start = new Date(startDate + 'T00:00:00')
      const end = new Date(endDate + 'T23:59:59')
      const now = new Date()

      const slotsToInsert = []

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay() // 0=Dom, 1=Lun...
        const normalizedDay = dayOfWeek === 0 ? 7 : dayOfWeek

        if (selectedDays.includes(normalizedDay)) {
          for (const hourStr of selectedHours) {
            const [h, m] = hourStr.split(':').map(Number)
            
            // Crear el string ISO manualmente para asegurar que se guarde EXACTAMENTE como se seleccionó
            // Usamos formato YYYY-MM-DDTHH:mm:ssZ para que Supabase lo reciba como UTC puro
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hour = String(h).padStart(2, '0');
            const minute = String(m).padStart(2, '0');
            
            const startsAtISO = `${year}-${month}-${day}T${hour}:${minute}:00Z`;
            
            // Calcular fin (1 hora después)
            const endH = h + 1;
            const endsAtISO = `${year}-${month}-${day}T${String(endH).padStart(2, '0')}:${minute}:00Z`;

            slotsToInsert.push({
              coach_id: user.id,
              starts_at: startsAtISO,
              ends_at: endsAtISO,
              capacity: 2,
              active: true
            })
          }
        }
      }

      if (slotsToInsert.length === 0) {
        throw new Error('No hay horarios válidos para crear en el rango seleccionado.')
      }

      // Insertar masivamente (ignorar errores de duplicados si los hay)
      const { error } = await supabase.from('coach_slots').insert(slotsToInsert)
      
      if (error) {
        if (error.code === '23505') {
          toast({ title: 'Proceso completado', description: 'Se crearon los nuevos espacios. Algunos ya existían y fueron omitidos.' })
        } else {
          throw error
        }
      } else {
        toast({ title: '¡Éxito!', description: `Se han creado ${slotsToInsert.length} espacios masivamente.` })
      }

      // Limpiar selección
      setSelectedDays([])
      setSelectedHours([])
      setStartDate('')
      setEndDate('')

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message })
    } finally {
      setLoading(false)
    }
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
        <div className="w-10 h-10 bg-[#CEB49D]/10 rounded-full flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-[#CEB49D]" />
        </div>
      </nav>

      {/* Header */}
      <header className="pt-6 pb-8 flex flex-col items-center text-center px-6">
        <h1 className="text-[#0A517F] serif-title text-3xl font-normal tracking-tight">Creación Masiva</h1>
        <p className="text-[10px] tracking-[0.3em] uppercase mt-1 text-[#CEB49D] font-bold italic">Plan your month</p>
      </header>

      <main className="flex-1 px-6 space-y-8">
        {/* Date Range Section */}
        <section className="bg-white/60 backdrop-blur-md rounded-[32px] p-6 shadow-sm border border-white/80">
          <div className="flex items-center gap-3 mb-6 px-1">
            <Calendar className="h-4 w-4 text-[#CEB49D]" />
            <h2 className="text-[11px] font-bold tracking-widest uppercase text-[#0A517F]/70">Rango de Fechas</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[9px] uppercase tracking-widest text-black/40 font-bold ml-1">Inicio</Label>
              <Input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white/40 border-white/60 rounded-2xl h-12 text-xs focus:ring-[#CEB49D] focus:border-[#CEB49D]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[9px] uppercase tracking-widest text-black/40 font-bold ml-1">Fin</Label>
              <Input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white/40 border-white/60 rounded-2xl h-12 text-xs focus:ring-[#CEB49D] focus:border-[#CEB49D]"
              />
            </div>
          </div>
        </section>

        {/* Days Selection */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#CEB49D]/80">Días de la semana</h2>
          </div>
          <div className="flex justify-between gap-2">
            {DAYS.map(day => (
              <button
                key={day.id}
                onClick={() => toggleDay(day.id)}
                className={cn(
                  "flex-1 h-12 rounded-2xl text-[10px] font-bold transition-all border",
                  selectedDays.includes(day.id) 
                    ? "bg-[#0A517F] text-white border-[#0A517F] shadow-md" 
                    : "bg-white/40 text-[#0A517F]/40 border-white/60 hover:bg-white/60"
                )}
              >
                {day.short}
              </button>
            ))}
          </div>
        </section>

        {/* Hours Selection */}
        <section className="space-y-4 pb-10">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#CEB49D]/80">Horarios (7am - 7pm)</h2>
            <p className="text-[9px] font-bold text-[#0A517F]/40 uppercase">{selectedHours.length} seleccionados</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {HOURS.map(hour => (
              <button
                key={hour}
                onClick={() => toggleHour(hour)}
                className={cn(
                  "py-4 rounded-[20px] text-[12px] font-bold transition-all border flex flex-col items-center gap-1",
                  selectedHours.includes(hour)
                    ? "bg-white border-[#0A517F] text-[#0A517F] shadow-sm ring-1 ring-[#0A517F]/10"
                    : "bg-white/40 border-white/60 text-[#0A517F]/40 hover:bg-white/60"
                )}
              >
                <span>{hour}</span>
                <span className="text-[8px] opacity-60 uppercase">{parseInt(hour) >= 12 ? 'PM' : 'AM'}</span>
                {selectedHours.includes(hour) && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0A517F] mt-1 animate-in zoom-in duration-300" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Info Card */}
        <div className="bg-[#D0E1F5]/20 rounded-3xl p-5 border border-[#0A517F]/5 flex gap-4 items-start">
          <Info className="h-5 w-5 text-[#0A517F] shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#0A517F]/70 leading-relaxed italic font-medium">
            Esta acción creará automáticamente bloques de 1 hora para todos los días y horarios seleccionados en el rango de fechas.
          </p>
        </div>
      </main>

      {/* Fixed Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-gradient-to-t from-[#F6F1EE] via-[#F6F1EE]/95 to-transparent backdrop-blur-[2px] z-30">
        <button 
          onClick={handleMassiveCreate}
          disabled={loading || !startDate || !endDate || selectedDays.length === 0 || selectedHours.length === 0}
          className="w-full py-5 bg-[#BFA58E] text-white flex items-center justify-center gap-3 rounded-2xl shadow-xl shadow-[#BFA58E]/20 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span className="text-sm serif-title italic tracking-wide">Crear Slots Masivamente</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
