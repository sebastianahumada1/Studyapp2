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
  User,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { markAttendance } from './actions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/base/dialog'

type Booking = {
  id: string
  status: 'booked' | 'attended' | 'no_show' | 'cancelled'
  created_at: string
  starts_at: string
  ends_at: string
  student_name: string
  student_id: string
  coach_name?: string
  student_avatar?: string
}

export default function CoachSchedulePage() {
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [markingId, setMarkingId] = useState<string | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<'attended' | 'no_show' | null>(null)

  useEffect(() => {
    loadBookings()
  }, [selectedDate])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const startOfDay = new Date(selectedDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(selectedDate)
      endOfDay.setHours(23, 59, 59, 999)

      const { data, error } = await supabase
        .from('class_bookings')
        .select(`
          id,
          status,
          created_at,
          student_id,
          coach_slots!inner (
            id,
            starts_at,
            ends_at,
            coach_id
          )
        `)
        .eq('coach_slots.coach_id', user.id)
        .gte('coach_slots.starts_at', startOfDay.toISOString())
        .lte('coach_slots.starts_at', endOfDay.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      // 2. Obtener los perfiles de los estudiantes manualmente para evitar restricciones de RLS en joins
      const studentIds = [...new Set((data || []).map((b: any) => b.student_id).filter(Boolean))]
      
      let profilesMap: Record<string, any> = {}
      if (studentIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', studentIds)
        
        if (!profilesError && profilesData) {
          profilesData.forEach(p => {
            profilesMap[p.id] = p
          })
        }
      }

      const formatted = (data || [])
        .filter((b: any) => b.coach_slots)
        .map((b: any) => {
          const studentProfile = profilesMap[b.student_id];
          return {
            id: b.id,
            status: b.status,
            created_at: b.created_at,
            starts_at: b.coach_slots.starts_at,
            ends_at: b.coach_slots.ends_at,
            student_name: studentProfile?.full_name || 'Estudiante',
            student_id: b.student_id || '',
            student_avatar: studentProfile?.avatar_url
          }
        })

      setBookings(formatted)
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAttendance = async (booking: Booking, status: 'attended' | 'no_show') => {
    if (status === 'no_show') {
      setSelectedBooking(booking)
      setSelectedStatus(status)
      setConfirmDialogOpen(true)
      return
    }
    await executeMarkAttendance(booking.id, status)
  }

  const executeMarkAttendance = async (bookingId: string, status: 'attended' | 'no_show') => {
    setMarkingId(bookingId)
    try {
      const result = await markAttendance(bookingId, status)
      if (result.success) {
        toast({ title: 'Asistencia marcada', description: 'Se ha actualizado el estado de la reserva.' })
        loadBookings()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message })
    } finally {
      setMarkingId(null)
      setConfirmDialogOpen(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    const startingDay = firstDay.getDay()
    for (let i = 0; i < (startingDay === 0 ? 6 : startingDay - 1); i++) days.push(null)
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i))
    return days
  }

  return (
    <div className="min-h-screen bg-[#F6F1EE] text-[#0A517F] font-sans max-w-md mx-auto flex flex-col relative pb-32">
      <nav className="pt-12 px-6 flex items-center justify-between">
        <Link href="/coach">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/40 border border-white/60 text-[#0A517F] hover:bg-white/60 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div className="w-10 h-10 rounded-full border border-white/60 overflow-hidden">
          {/* Avatar del coach si se desea */}
        </div>
      </nav>

      <header className="pt-6 pb-6 flex flex-col items-center text-center">
        <h1 className="text-[#0A517F] serif-title text-3xl font-normal tracking-tight">Mi Agenda</h1>
        <p className="text-[10px] tracking-[0.3em] uppercase mt-1 text-[#CEB49D] font-bold italic">Your daily flow</p>
      </header>

      <section className="px-6 mb-8">
        <div className="bg-white/50 border border-white/80 rounded-[32px] p-6 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between mb-5 px-2">
            <h2 className="text-[11px] font-bold tracking-widest uppercase text-[#0A517F]/70">
              {currentMonth.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-4">
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
                <ChevronLeft className="h-5 w-5 opacity-40" />
              </button>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
      </div>

          <div className="grid grid-cols-7 gap-y-3 text-center">
            {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(day => (
              <span key={day} className="text-[9px] font-bold text-[#CEB49D] uppercase">{day}</span>
            ))}
            {getDaysInMonth(currentMonth).map((date, i) => {
              if (!date) return <div key={`empty-${i}`} className="h-9 w-9" />
              const isSelected = selectedDate.toDateString() === date.toDateString()
              const isToday = date.toDateString() === new Date().toDateString()

          return (
                <button 
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "h-9 w-9 mx-auto flex items-center justify-center text-xs rounded-full transition-all relative",
                    isSelected ? "bg-[#0A517F] text-white font-bold shadow-md" : "font-medium hover:bg-[#D0E1F5]/50",
                    isToday && !isSelected && "text-[#CEB49D] font-bold underline"
                  )}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <main className="flex-1 px-6 space-y-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#CEB49D]/80">Clases del Día</h2>
          <span className="text-[8px] text-[#CEB49D] uppercase tracking-widest font-bold">
            {bookings.length} {bookings.length === 1 ? 'Reserva' : 'Reservas'}
          </span>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#0A517F]/20" /></div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 bg-white/30 rounded-[32px] border border-dashed border-[#0A517F]/10">
              <p className="serif-title text-xl italic text-[#0A517F]/40">No hay reservas para hoy</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="bg-white/80 backdrop-blur-md rounded-[2rem] p-5 shadow-sm border border-white relative overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#CEB49D]/20 bg-[#F6F1EE] flex items-center justify-center relative">
                      {booking.student_avatar ? (
                        <img 
                          src={booking.student_avatar.startsWith('http') 
                            ? booking.student_avatar 
                            : createClient().storage.from('avatars').getPublicUrl(booking.student_avatar).data.publicUrl} 
                          alt={booking.student_name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <User className="h-6 w-6 text-[#CEB49D]" />
                      )}
                    </div>
                    <div>
                      <h3 className="serif-title text-xl text-[#0A517F] leading-tight italic">{booking.student_name}</h3>
                      <p className="text-[9px] font-bold tracking-[0.2em] text-[#CEB49D] uppercase mt-0.5">Wave Girl • Pilates</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#0A517F] serif-title text-2xl italic leading-none">
                      {new Date(booking.starts_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}
                    </p>
                    <div className="mt-2">
                      {booking.status === 'attended' && <span className="text-[8px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">Asistió</span>}
                      {booking.status === 'no_show' && <span className="text-[8px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold uppercase">No Show</span>}
                      {booking.status === 'booked' && <span className="text-[8px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase">Pendiente</span>}
                    </div>
                  </div>
                </div>

                {booking.status === 'booked' && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button 
                      onClick={() => handleMarkAttendance(booking, 'no_show')}
                      disabled={markingId === booking.id}
                      className="flex items-center justify-center gap-2 py-3 px-4 border border-[#BFA58E]/40 rounded-xl text-[#6D4E38]/60 text-[11px] font-bold uppercase tracking-widest hover:bg-[#BFA58E]/5 transition-colors disabled:opacity-50"
                    >
                      No asistió
                    </button>
                    <button 
                      onClick={() => handleMarkAttendance(booking, 'attended')}
                      disabled={markingId === booking.id}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-[#BFA58E] rounded-xl text-white text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-[#BFA58E]/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {markingId === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="h-4 w-4" /> Asistió</>}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {/* Confirm Dialog para No Show */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="max-w-[320px] p-0 bg-[#F6F1EE] border-none overflow-hidden rounded-[40px] [&>button]:hidden">
          <div className="p-8">
            <DialogHeader className="mb-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <DialogTitle className="serif-title text-2xl italic text-center text-[#0A517F]">¿Marcar No Show?</DialogTitle>
              <DialogDescription className="text-center text-[10px] tracking-[0.1em] uppercase text-black/40 font-bold mt-2">
                Esta acción descontará 1 crédito del estudiante.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => selectedBooking && executeMarkAttendance(selectedBooking.id, 'no_show')}
                className="w-full py-4 bg-red-500 text-white font-bold text-[10px] tracking-[0.3em] uppercase rounded-full shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all"
              >
                Sí, marcar No Show
              </button>
              <button
                onClick={() => setConfirmDialogOpen(false)}
                className="w-full py-4 text-black/40 font-bold text-[10px] tracking-[0.3em] uppercase hover:text-black transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
