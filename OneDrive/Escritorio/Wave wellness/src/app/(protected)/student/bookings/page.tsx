'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/base/use-toast'
import { 
  ArrowLeft, 
  Bell, 
  Loader2, 
  Plus,
  Waves,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { cancelBooking } from './actions'
import { cn } from '@/lib/utils'

type Booking = {
  id: string
  status: 'booked' | 'cancelled' | 'attended' | 'no_show'
  created_at: string
  coach_slots: {
    starts_at: string
    ends_at: string
    profiles: {
      full_name: string
    }
  }
}

export default function StudentBookingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('class_bookings')
        .select(`
          id,
          status,
          created_at,
          coach_slots!inner(
            starts_at,
            ends_at,
            profiles!coach_slots_coach_id_fkey(full_name)
          )
        `)
        .eq('student_id', user.id)
        .order('coach_slots(starts_at)', { ascending: activeTab === 'upcoming' })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar tus reservas',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (bookingId: string) => {
    try {
      setCancellingId(bookingId)
      const result = await cancelBooking(bookingId)

      if (result.success) {
        toast({
          title: 'Reserva cancelada',
          description: 'Tu clase ha sido cancelada exitosamente.',
        })
        loadBookings()
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error inesperado',
        description: 'Ocurrió un error al cancelar la reserva.',
      })
    } finally {
      setCancellingId(null)
    }
  }

  const now = new Date()
  const filteredBookings = bookings.filter(b => {
    const slotDate = new Date(b.coach_slots.starts_at)
    if (activeTab === 'upcoming') {
      return slotDate >= now && b.status === 'booked'
    } else {
      return slotDate < now || b.status !== 'booked'
    }
  })

  const formatBookingDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }).replace(/^\w/, (c) => c.toUpperCase())
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'cancelled':
        return <span className="text-[9px] font-bold uppercase tracking-wider text-red-400 bg-red-50 px-2 py-0.5 rounded-full">Cancelada</span>
      case 'attended':
        return <span className="text-[9px] font-bold uppercase tracking-wider text-green-500 bg-green-50 px-2 py-0.5 rounded-full">Asistida</span>
      case 'no_show':
        return <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">No asistió</span>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background-light text-black font-sans max-w-md mx-auto flex flex-col relative pb-32">
      {/* Navigation */}
      <nav className="pt-12 px-6 flex items-center justify-between">
        <Link href="/student">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/40 border border-white/60 text-black/40 hover:text-black transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div className="w-10" />
      </nav>

      {/* Header */}
      <header className="pt-10 pb-8 px-8 text-center">
        <h1 className="text-black serif-title text-4xl font-normal tracking-tight">Mis Sesiones</h1>
      </header>

      {/* Tabs */}
      <div className="px-8 mb-10">
        <div className="flex p-1 bg-white/40 rounded-full border border-white/60 backdrop-blur-sm">
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={cn(
              "flex-1 py-2 text-[11px] font-bold tracking-[0.15em] uppercase rounded-full transition-all",
              activeTab === 'upcoming' ? "bg-[#D0E1F5] text-[#0A517F]" : "text-black/40 hover:text-black"
            )}
          >
            Próximas
          </button>
          <button 
            onClick={() => setActiveTab('past')}
            className={cn(
              "flex-1 py-2 text-[11px] font-bold tracking-[0.15em] uppercase rounded-full transition-all",
              activeTab === 'past' ? "bg-[#D0E1F5] text-[#0A517F]" : "text-black/40 hover:text-black"
            )}
          >
            Pasadas
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#CEB49D]" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <section className="flex flex-col items-center justify-center px-12 text-center py-20 animate-in fade-in">
            <Waves className="text-[#D0E1F5] h-16 w-16 mb-6" />
            <p className="serif-title text-2xl text-black/40 mb-8 italic">No tienes sesiones {activeTab === 'upcoming' ? 'agendadas' : 'pasadas'}</p>
            {activeTab === 'upcoming' && (
              <Link href="/student/book">
                <button className="px-8 py-3 border border-[#0A517F]/20 rounded-full text-[10px] font-bold tracking-[0.25em] text-[#0A517F] uppercase hover:bg-white/50 transition-colors">
                  RESERVAR AHORA
                </button>
              </Link>
            )}
          </section>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-[28px] p-6 shadow-sm border border-white/80 relative animate-in fade-in slide-in-from-bottom-2">
              <div className="mb-4">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-[12px] font-bold text-[#0A517F] tracking-wide">
                    {formatBookingDate(booking.coach_slots.starts_at)} • {formatTime(booking.coach_slots.starts_at)}
                  </p>
                  {getStatusBadge(booking.status)}
                </div>
                <h3 className="serif-title text-2xl text-[#0A517F] leading-tight italic">Pilates Reformer</h3>
                <p className="text-[11px] text-[#CEB49D] font-bold uppercase tracking-widest mt-1">
                  Con {booking.coach_slots.profiles?.full_name || 'Coach'}
                </p>
              </div>
              
              {activeTab === 'upcoming' && booking.status === 'booked' && (
                <div className="flex justify-end mt-2">
                  <button 
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancellingId === booking.id}
                    className="text-[#6D4E38] text-[10px] font-bold tracking-[0.2em] uppercase hover:opacity-70 transition-opacity flex items-center gap-2"
                  >
                    {cancellingId === booking.id ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    CANCELAR
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </main>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-8 pointer-events-none z-30">
        <Link href="/student/book" className="pointer-events-auto">
          <button className="w-full py-4 bg-[#BFA58E] text-white font-bold tracking-[0.3em] text-[10px] uppercase shadow-[0_15px_40px_rgba(191,165,142,0.3)] hover:bg-[#A68B6F] hover:shadow-[0_20px_50px_rgba(191,165,142,0.4)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 rounded-xl flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" />
            Agendar Nueva
          </button>
        </Link>
      </div>
    </div>
  )
}
