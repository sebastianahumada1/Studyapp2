'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/base/use-toast'
import { 
  Settings, 
  ChevronRight, 
  BellRing, 
  Loader2,
  Users,
  TrendingUp,
  DollarSign,
  User
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type DashboardStats = {
  totalStudents: number
  todayBookings: number
  monthlyRevenue: number
}

type NextSession = {
  id: string
  starts_at: string
  coach_name: string
  bookings_count: number
}

export default function AdminDashboardPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    todayBookings: 0,
    monthlyRevenue: 0
  })
  const [nextSession, setNextSession] = useState<NextSession | null>(null)
  const [pendingPayments, setPendingPayments] = useState(0)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // 1. Total Students
      const { count: studentsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')

      // Time calculations for Colombia (UTC-5)
      const now = new Date()
      const bogotaNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }))
      
      const startOfToday = new Date(bogotaNow)
      startOfToday.setHours(0, 0, 0, 0)
      
      const endOfToday = new Date(bogotaNow)
      endOfToday.setHours(23, 59, 59, 999)

      // 2. Today's Bookings (Colombia Time)
      const { count: todayCount } = await supabase
        .from('class_bookings')
        .select('id, coach_slots!inner(starts_at)', { count: 'exact', head: true })
        .eq('status', 'booked')
        .gte('coach_slots.starts_at', startOfToday.toISOString())
        .lte('coach_slots.starts_at', endOfToday.toISOString())

      // 3. Today's Revenue (Approved payments today, Colombia Time)
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'approved')
        .gte('created_at', startOfToday.toISOString())
        .lte('created_at', endOfToday.toISOString())

      const revenue = paymentsData?.reduce((acc, p) => acc + p.amount, 0) || 0

      // 4. Next Session (Today only, Colombia Time)
      const { data: sessionData } = await supabase
        .from('coach_slots')
        .select(`
          id,
          starts_at,
          profiles!coach_slots_coach_id_fkey(full_name),
          class_bookings(count)
        `)
        .gte('starts_at', bogotaNow.toISOString())
        .lte('starts_at', endOfToday.toISOString())
        .order('starts_at', { ascending: true })
        .limit(1)
        .single()

      // 5. Pending Activities
      const { count: pendingCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      setStats({
        totalStudents: studentsCount || 0,
        todayBookings: todayCount || 0,
        monthlyRevenue: revenue
      })

      if (sessionData) {
        setNextSession({
          id: sessionData.id,
          starts_at: sessionData.starts_at,
          coach_name: (sessionData.profiles as any)?.full_name || 'Coach',
          bookings_count: (sessionData.class_bookings as any)?.[0]?.count || 0
        })
      } else {
        setNextSession(null)
      }

      setPendingPayments(pendingCount || 0)

    } catch (error: any) {
      console.error('Dashboard Error:', error)
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F1EE] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#CEB49D]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F6F1EE] text-black font-sans max-w-md mx-auto flex flex-col relative pb-10">
      {/* Settings Button */}
      <div className="absolute top-8 right-6 z-10">
        <Link href="/settings">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/40 border border-white/60 text-[#0A517F]/60 active:scale-95 transition-transform backdrop-blur-sm">
            <Settings className="h-5 w-5" />
          </button>
        </Link>
      </div>

      {/* Header */}
      <header className="pt-14 pb-8 px-6 flex items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-white shadow-sm overflow-hidden ring-4 ring-[#D0E1F5]/20 bg-[#CEB49D]/10 flex items-center justify-center">
            <span className="serif-title text-[#CEB49D] text-2xl italic">W</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
      <div>
          <h1 className="text-[#0A517F] serif-title text-3xl font-normal tracking-tight italic leading-none">Panel Admin</h1>
          <p className="text-[10px] font-bold tracking-[0.1em] text-[#CEB49D] uppercase mt-1">Gestión de Estudio</p>
        </div>
      </header>

      <main className="flex-1 px-6 space-y-6">
        {/* Quick Stats */}
        <section className="grid grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-[24px] flex flex-col items-center justify-between text-center border border-[#CEB49D]/10 shadow-sm">
            <p className="text-[8px] font-bold tracking-[0.05em] text-[#0A517F]/60 uppercase mb-2">Alumnas</p>
            <div className="relative w-12 h-12 flex items-center justify-center mb-2">
              <svg className="w-full h-full -rotate-90">
                <circle className="text-[#D0E1F5]/30" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="4"></circle>
                <circle className="text-[#0A517F]" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * Math.min(stats.totalStudents / 200, 1))} strokeWidth="4"></circle>
              </svg>
              <Users className="absolute h-4 w-4 text-[#0A517F]/40" />
            </div>
            <p className="font-sans text-lg font-bold text-[#0A517F]">{stats.totalStudents}</p>
          </div>

          <div className="bg-[#D0E1F5] p-3 rounded-[24px] flex flex-col items-center justify-between text-center shadow-sm">
            <p className="text-[8px] font-bold tracking-[0.05em] text-[#0A517F]/80 uppercase mb-2">Hoy</p>
            <div className="w-full h-10 mb-2 px-1 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-white/80" />
            </div>
            <p className="font-sans text-lg font-bold text-[#0A517F]">{stats.todayBookings}</p>
          </div>

          <div className="bg-white p-3 rounded-[24px] flex flex-col items-center justify-between text-center border border-[#CEB49D]/10 shadow-sm">
            <p className="text-[8px] font-bold tracking-[0.05em] text-[#0A517F]/60 uppercase mb-2">Ingresos</p>
            <div className="flex items-center justify-center mb-2 h-10">
              <div className="flex items-end gap-1 h-8">
                <div className="w-1.5 bg-[#D0E1F5]/40 h-1/2 rounded-full"></div>
                <div className="w-1.5 bg-[#D0E1F5]/40 h-3/4 rounded-full"></div>
                <div className="w-1.5 bg-[#0A517F] h-full rounded-full"></div>
                <div className="w-1.5 bg-[#D0E1F5]/40 h-2/3 rounded-full"></div>
              </div>
            </div>
            <p className="font-sans text-lg font-bold text-[#0A517F]">{formatPrice(stats.monthlyRevenue)}</p>
          </div>
        </section>

        {/* Agenda & Activities */}
        <section className="bg-white rounded-[32px] p-6 shadow-sm border border-[#CEB49D]/10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="serif-title text-[#0A517F] text-xl font-medium italic">Agenda del Día</h3>
            <span className="text-[10px] bg-[#D0E1F5] text-[#0A517F] px-2 py-1 rounded-full font-bold uppercase tracking-wider">Próxima</span>
      </div>

          <div className="space-y-4">
            {nextSession ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center min-w-[54px] h-[54px] bg-[#F6F1EE] rounded-2xl border border-[#CEB49D]/20">
                  <span className="text-xs font-bold text-[#0A517F]">{formatTime(nextSession.starts_at)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-[#0A517F] serif-title text-lg leading-tight italic">Pilates Reformer</p>
                  <p className="text-[11px] text-[#6D4E38]/60 font-medium">Con {nextSession.coach_name} • {nextSession.bookings_count} alumnas</p>
                </div>
                <Link href="/admin/classes">
                  <button className="text-[#0A517F]/40 hover:text-[#0A517F] transition-colors">
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </Link>
              </div>
            ) : (
              <p className="text-center text-sm text-black/30 italic py-2">No hay sesiones programadas</p>
            )}

            <Link href="/admin/classes" className="block">
              <button className="w-full py-3 text-[#0A517F] text-[10px] font-bold uppercase tracking-widest border border-[#0A517F]/10 rounded-xl hover:bg-[#0A517F]/5 active:scale-[0.99] transition-all">
                Ver todas las sesiones
              </button>
            </Link>
          </div>

          <div className="pt-6 border-t border-[#CEB49D]/10">
            <div className="bg-[#F6F1EE]/50 p-5 rounded-2xl border border-white flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#CEB49D]/20 flex items-center justify-center">
                  <BellRing className="h-5 w-5 text-[#6D4E38]" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#6D4E38]">{pendingPayments} Actividades pendientes</p>
                  <p className="text-[11px] text-[#6D4E38]/60">Pagos por revisar</p>
                </div>
              </div>
            <Link href="/admin/payments">
                <button className="w-full py-4 bg-[#BFA58E] text-white text-[11px] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-[#BFA58E]/20 hover:bg-[#A68B6F] active:scale-[0.98] transition-all">
                  Resolver ahora
                </button>
            </Link>
      </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto px-6 pt-10 pb-8">
        <div className="flex flex-col items-center opacity-30">
          <p className="text-[8px] tracking-[0.2em] uppercase font-bold text-[#0A517F]">Wave Wellness • Admin</p>
          <div className="w-1/4 h-[2px] bg-[#0A517F]/20 rounded-full mt-4"></div>
        </div>
      </footer>
    </div>
  )
}
