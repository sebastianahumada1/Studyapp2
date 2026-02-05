'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Calendar, 
  Clock, 
  Users, 
  ArrowRight, 
  Settings, 
  CheckCircle2, 
  TrendingUp,
  User,
  LogOut,
  Loader2,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function CoachDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState({
    todaySessions: 0,
    totalStudents: 0,
    pendingAttendance: 0
  })
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Perfil
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)

      // 2. Sesiones de hoy
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data: todayData } = await supabase
        .from('class_bookings')
        .select('id, status, coach_slots!inner(*)')
        .eq('coach_slots.coach_id', user.id)
        .gte('coach_slots.starts_at', today.toISOString())
        .lt('coach_slots.starts_at', tomorrow.toISOString())

      // 3. Próximas sesiones (como en /student)
      const { data: nextData } = await supabase
        .from('class_bookings')
        .select('id, status, coach_slots!inner(*), profiles:student_id(id, full_name, avatar_url)')
        .eq('coach_slots.coach_id', user.id)
        .eq('status', 'booked')
        .gte('coach_slots.starts_at', new Date().toISOString())
        .order('starts_at', { foreignTable: 'coach_slots', ascending: true })
        .limit(3)

      // 4. Estudiantes únicos (histórico)
      const { data: allBookings } = await supabase
        .from('class_bookings')
        .select('student_id, coach_slots!inner(*)')
        .eq('coach_slots.coach_id', user.id)

      const uniqueStudents = new Set(allBookings?.map(b => b.student_id)).size

      setStats({
        todaySessions: todayData?.length || 0,
        totalStudents: uniqueStudents,
        pendingAttendance: todayData?.filter(b => b.status === 'booked').length || 0
      })
      setUpcomingSessions(nextData || [])

    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatAgendaDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(now.getDate() + 1)

    if (date.toDateString() === now.toDateString()) return 'Hoy'
    if (date.toDateString() === tomorrow.toDateString()) return 'Mañana'

    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    }).replace(/^\w/, (c) => c.toUpperCase())
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).toLowerCase()
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  return (
    <div className="min-h-screen bg-[#F6F1EE] text-[#0A517F] font-sans max-w-md mx-auto flex flex-col relative pb-32">
      {/* Header / Profile Section */}
      <header className="pt-14 pb-8 px-8 flex flex-col items-center relative">
        <div className="absolute top-14 right-8 flex gap-3">
          <Link href="/settings">
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/40 border border-white/60 text-[#0A517F] hover:bg-white/60 transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </Link>
      </div>

        <div className="mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-sm bg-white flex items-center justify-center">
            {profile?.avatar_url ? (
              <img 
                src={createClient().storage.from('avatars').getPublicUrl(profile.avatar_url).data.publicUrl} 
                alt={profile.full_name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-[#CEB49D]" />
            )}
          </div>
        </div>
        <h1 className="serif-title text-2xl italic text-[#0A517F]">{profile?.full_name || 'Coach'}</h1>
        <p className="text-[10px] tracking-[0.3em] uppercase mt-1 text-[#CEB49D] font-bold">Wave Coach • Instructor</p>
      </header>

      <main className="flex-1 px-6 space-y-6">
        {/* Quick Stats */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-5 border border-white/80 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#D0E1F5]/30 flex items-center justify-center">
                <Users className="h-4 w-4 text-[#0A517F]" />
              </div>
              <p className="text-[9px] font-bold tracking-widest uppercase text-black/40">Alumnos</p>
            </div>
            <p className="serif-title text-2xl italic text-[#0A517F]">{stats.totalStudents}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-5 border border-white/80 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#CEB49D]/20 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-[#CEB49D]" />
              </div>
              <p className="text-[9px] font-bold tracking-widest uppercase text-black/40">Hoy</p>
            </div>
            <p className="serif-title text-2xl italic text-[#0A517F]">{stats.todaySessions} Sesiones</p>
          </div>
        </section>

        {/* Agenda Section (Reused from /student) */}
        <section className="bg-white/40 backdrop-blur-md rounded-[40px] overflow-hidden flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-white/60 relative z-10">
          <div className="p-6 border-b border-[#CEB49D]/10 flex justify-between items-center relative z-20">
            <h3 className="serif-title text-[#0A517F] text-xl italic">Mi Agenda</h3>
            <span className="text-[9px] text-[#CEB49D] uppercase tracking-widest font-bold relative z-30">
              {upcomingSessions.length} Sesiones Próximas
            </span>
          </div>
          
          <div className="max-h-[380px] overflow-y-auto no-scrollbar p-6 space-y-6">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#0A517F]/20" /></div>
            ) : upcomingSessions.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <Calendar className="h-8 w-8 mx-auto text-[#0A517F]/10" />
                <p className="text-sm text-[#0A517F]/40 italic">No tienes clases programadas</p>
              </div>
            ) : (
              upcomingSessions.map((booking: any) => (
                <div key={booking.id} className="flex justify-between items-center pb-6 border-b border-[#CEB49D]/5 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#CEB49D]/20 bg-white flex items-center justify-center relative">
                      {booking.profiles?.avatar_url ? (
                        <img 
                          src={createClient().storage.from('avatars').getPublicUrl(booking.profiles.avatar_url).data.publicUrl} 
                          alt={booking.profiles.full_name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-[#CEB49D]" />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-black/40 mb-0.5 uppercase tracking-wider">
                        {formatAgendaDate(booking.coach_slots.starts_at)}, {formatTime(booking.coach_slots.starts_at)}
                      </p>
                      <p className="serif-title text-lg text-[#0A517F] italic leading-tight">{booking.profiles?.full_name}</p>
                      <p className="text-[9px] uppercase tracking-[0.15em] text-[#CEB49D] font-bold mt-0.5">Pilates Reformer</p>
                    </div>
                  </div>
                  <Link href="/coach/schedule">
                    <button className="text-[9px] uppercase tracking-widest text-[#0A517F]/40 font-bold border border-[#CEB49D]/20 px-4 py-2 rounded-full hover:bg-[#D0E1F5]/20 hover:text-[#0A517F] transition-all">
                      Gestionar
                    </button>
                  </Link>
                </div>
              ))
            )}
          </div>

          <div className="p-6 pt-0">
            <Link href="/coach/schedule">
              <button className="w-full py-4 px-6 bg-[#BFA58E] text-white flex items-center justify-center gap-3 rounded-2xl shadow-sm hover:bg-[#A68B6F] transition-all duration-300 shadow-sm">
                <Calendar className="h-4 w-4" />
                <span className="text-sm serif-title italic tracking-wide">Ver Agenda Completa</span>
              </button>
            </Link>
          </div>
        </section>

        {/* Pending Actions (Disponibilidad) */}
        <section className="bg-white/70 backdrop-blur-md rounded-[2.5rem] p-6 border border-white shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="serif-title text-xl text-[#0A517F] italic">Disponibilidad</h3>
              <p className="text-[9px] font-bold text-[#CEB49D] uppercase tracking-widest mt-1">Configura tus horarios</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#D0E1F5]/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-[#0A517F]" />
            </div>
      </div>

          <p className="text-[13px] text-[#6D4E38]/80 leading-relaxed mb-6 italic font-medium">
            Mantén tus horarios actualizados para que las alumnas puedan agendar sus sesiones de Pilates.
          </p>

          <Link href="/coach/availability">
            <button className="w-full py-4 bg-[#BFA58E] text-white flex items-center justify-center gap-3 rounded-2xl shadow-sm hover:bg-[#A68B6F] transition-all">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm serif-title italic tracking-wide">Gestionar Horarios</span>
            </button>
          </Link>
        </section>

        {/* Massive Creation CTA */}
        <section className="bg-[#0A517F]/5 backdrop-blur-md rounded-[2.5rem] p-6 border border-[#0A517F]/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0A517F] flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="serif-title text-lg text-[#0A517F] italic leading-tight">Creación Masiva</h3>
                <p className="text-[8px] font-bold text-[#CEB49D] uppercase tracking-widest mt-0.5">Ahorra tiempo</p>
              </div>
            </div>
            <Link href="/coach/schedule2">
              <button className="p-3 bg-white text-[#0A517F] rounded-full shadow-sm hover:shadow-md transition-all">
                <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
          </div>
          <p className="text-[11px] text-[#0A517F]/60 italic font-medium leading-relaxed">
            Configura tus horarios de todo el mes en segundos seleccionando días y horas específicas.
          </p>
        </section>
      </main>

      <div className="h-10"></div>
    </div>
  )
}
