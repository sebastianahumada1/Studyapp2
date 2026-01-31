'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/base/use-toast'
import { 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  ArrowLeft,
  Calendar as CalendarIcon,
  LayoutDashboard,
  Package,
  CreditCard
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Booking = {
  id: string
  status: 'booked' | 'cancelled' | 'attended' | 'no_show'
  student_id: string
  slot_id: string
  student: {
    full_name: string
  }
  slot: {
    starts_at: string
    coach: {
      full_name: string
    }
  }
}

export default function AdminClassesPage() {
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    loadBookings()
  }, [selectedDate])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      const startOfDay = new Date(selectedDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(selectedDate)
      endOfDay.setHours(23, 59, 59, 999)

      const { data, error } = await supabase
        .from('class_bookings')
        .select(`
          id,
          status,
          student_id,
          slot_id,
          student:profiles!class_bookings_student_id_fkey(full_name),
          slot:coach_slots!inner(
            starts_at,
            coach:profiles!coach_slots_coach_id_fkey(full_name)
          )
        `)
        .gte('slot.starts_at', startOfDay.toISOString())
        .lte('slot.starts_at', endOfDay.toISOString())
        .order('slot(starts_at)', { ascending: true })

      if (error) throw error
      setBookings(data as any || [])
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar las reservas',
      })
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const days = []
    // Add empty days for padding
    const startingDay = firstDay.getDay()
    for (let i = 0; i < (startingDay === 0 ? 6 : startingDay - 1); i++) {
      days.push(null)
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  return (
    <div className="min-h-screen bg-[#F6F1EE] text-[#0A517F] font-sans max-w-md mx-auto flex flex-col relative pb-48">
      {/* Navigation */}
      <nav className="pt-12 px-6 flex items-center justify-between">
        <Link href="/admin">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/40 border border-white/60 text-[#0A517F] hover:text-black transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div className="w-10 h-10 overflow-hidden rounded-full border border-white/60 bg-[#CEB49D]/20 flex items-center justify-center">
          <span className="serif-title text-[#CEB49D] italic">W</span>
        </div>
      </nav>

      {/* Header */}
      <header className="pt-6 pb-4 flex flex-col items-center text-center">
        <h1 className="text-[#0A517F] serif-title text-3xl font-normal tracking-tight">Gestión de Reservas</h1>
        <p className="text-[10px] tracking-[0.3em] uppercase mt-1 text-[#CEB49D] font-bold italic">Find your flow</p>
      </header>

      {/* Calendar Section */}
      <section className="px-6 mb-6">
        <div className="bg-white/50 border border-white/80 rounded-[32px] p-5 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xs font-bold tracking-widest uppercase text-[#0A517F]/70">
              {currentMonth.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-4">
              <button onClick={handlePrevMonth}><ChevronLeft className="h-5 w-5 opacity-40" /></button>
              <button onClick={handleNextMonth}><ChevronRight className="h-5 w-5" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-y-2 text-center">
            {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(day => (
              <span key={day} className="text-[9px] font-bold text-[#CEB49D] uppercase">{day}</span>
            ))}
            {getDaysInMonth(currentMonth).map((date, i) => {
              if (!date) return <div key={`empty-${i}`} className="h-8 w-8" />
              const isSelected = date.toDateString() === selectedDate.toDateString()
              const isToday = date.toDateString() === new Date().toDateString()
              
              return (
                <button 
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "h-8 w-8 mx-auto flex flex-col items-center justify-center text-xs rounded-full transition-all relative",
                    isSelected ? "bg-[#0A517F] text-white shadow-md font-bold" : "font-medium hover:bg-[#D0E1F5]",
                    isToday && !isSelected && "border border-[#0A517F]/20"
                  )}
                >
                  {date.getDate()}
                  {isToday && <div className={cn("absolute bottom-1 w-1 h-1 rounded-full", isSelected ? "bg-white" : "bg-[#0A517F]")}></div>}
                </button>
              )
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-[#0A517F]/5 flex items-center justify-center gap-2">
            <span className="text-[10px] text-[#CEB49D] font-semibold uppercase tracking-wider">Fecha seleccionada:</span>
            <span className="text-[10px] text-[#0A517F] font-bold">
              {selectedDate.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </section>

      {/* Bookings List */}
      <main className="flex-1 px-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#CEB49D]/80">Alumnas Agendadas</h2>
          <p className="text-[9px] font-bold text-[#0A517F]/40 uppercase">Total: {bookings.length} Reservas</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#CEB49D]" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 bg-white/40 rounded-[24px] border border-white/60">
            <p className="serif-title text-xl text-black/40 italic">No hay reservas para este día</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-[24px] p-5 shadow-sm border border-white/60 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="serif-title text-lg text-[#0A517F] leading-tight italic">
                    {formatTime(booking.slot.starts_at)} • Pilates Reformer
                  </h3>
                  <p className="text-[14px] font-bold text-[#0A517F] mt-1">{booking.student?.full_name || 'Estudiante'}</p>
                  <p className="text-[11px] text-[#6D4E38]/70 font-medium">Coach: {booking.slot.coach?.full_name || 'Coach'}</p>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider",
                  booking.status === 'booked' ? "bg-[#0A517F]/10 text-[#0A517F] border border-[#0A517F]/20" : "bg-[#CEB49D]/10 text-[#CEB49D] border border-[#CEB49D]/20"
                )}>
                  {booking.status === 'booked' ? 'Confirmada' : booking.status}
                </span>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  )
}
