import Link from 'next/link'
import { getCurrentProfile } from '@/lib/auth/getCurrentProfile'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/base/button'
import { Settings, Plus, Calendar, X } from 'lucide-react'
import { redirect } from 'next/navigation'

type LedgerEntry = {
  id: string
  delta: number
  reason: 'payment_approved' | 'manual_adjustment' | 'class_attended' | 'class_no_show' | 'credits_expired'
  created_at: string
  ref_payment_id: string | null
  expires_at: string | null
}

export default async function StudentDashboard() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/auth/login')
  }

  const supabase = await createClient()

  // 1. Calcular balance de créditos (solo los no expirados)
  const { data: ledgerEntries } = await supabase
    .from('credit_ledger')
    .select('delta, expires_at')
    .eq('student_id', profile.id)

  const balance = ledgerEntries?.reduce((sum, entry) => {
    if (entry.expires_at && new Date(entry.expires_at) < new Date()) {
      return sum
    }
    return sum + entry.delta
  }, 0) || 0

  // 1.1 Créditos que vencen pronto (próximos 30 días)
  const soonExpiring = ledgerEntries?.filter(entry => {
    if (!entry.expires_at || entry.delta <= 0) return false
    const expiryDate = new Date(entry.expires_at)
    const now = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(now.getDate() + 30)
    return expiryDate > now && expiryDate <= thirtyDaysFromNow
  }) || []

  const soonExpiringCount = soonExpiring.reduce((sum, entry) => sum + entry.delta, 0)

  // 2. Próximas reservas (solo futuras y activas)
  const { data: bookings } = await supabase
    .from('class_bookings')
    .select(`
      id,
      status,
      coach_slots!inner(
        starts_at,
        ends_at,
        profiles!coach_slots_coach_id_fkey(full_name)
      )
    `)
    .eq('student_id', profile.id)
    .eq('status', 'booked')
    .order('created_at', { ascending: false })
    .limit(3)

  // Formatear fecha para la agenda
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
    })
  }

  // Calcular progreso del anillo (máximo 30 créditos para el 100%)
  const maxCreditsForRing = 30
  const percentage = Math.min((balance / maxCreditsForRing) * 100, 100)
  const strokeDasharray = 175.93
  const strokeDashoffset = strokeDasharray - (percentage / 100) * strokeDasharray

  const { data: profileData } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', profile.id)
    .single()

  let avatarPublicUrl = null
  if (profileData?.avatar_url) {
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(profileData.avatar_url)
    avatarPublicUrl = publicUrl
  }

  return (
    <div className="min-h-screen bg-background-light text-black font-sans max-w-md mx-auto flex flex-col relative pb-48 pt-12 px-6">
      {/* Settings Button */}
      <div className="absolute top-10 right-6 z-10">
        <Link href="/settings">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/40 border border-white/60 text-black/40 hover:text-black transition-colors">
            <Settings className="h-5 w-5" />
          </button>
        </Link>
      </div>

      {/* Header / Profile */}
      <header className="pt-8 pb-10 flex flex-col items-center">
        <div className="mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-sm bg-slate-200">
            {avatarPublicUrl ? (
              <img src={avatarPublicUrl} alt={profile.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#CEB49D]/20 text-[#CEB49D] text-2xl serif-title italic">
                {profile.full_name.charAt(0)}
              </div>
            )}
          </div>
        </div>
        <h1 className="text-black serif-title text-2xl font-normal tracking-wide">{profile.full_name}</h1>
        <p className="text-[10px] tracking-[0.3em] uppercase mt-1 text-[#CEB49D] font-bold">Wave Girl</p>
      </header>

      <main className="flex-1 space-y-8">
        {/* Credits Section */}
        <section className="bg-white/60 backdrop-blur-md rounded-[40px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-white/80 relative z-10">
          <div className="flex items-center justify-between relative z-20">
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 overflow-visible">
                  <circle 
                    className="text-[#CEB49D]/10" 
                    cx="40" cy="40" r="35" 
                    fill="transparent" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  />
                  <circle 
                    className="text-[#5B96B9] transition-all duration-1000 ease-out" 
                    cx="40" cy="40" r="35" 
                    fill="transparent" 
                    stroke="currentColor" 
                    strokeWidth="4"
                    strokeDasharray="219.9"
                    strokeDashoffset={219.9 - (Math.min(balance, 30) / 30) * 219.9}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-black serif-title text-3xl z-10 -translate-y-2">{balance}</span>
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-bold tracking-[0.2em] text-black/40 uppercase mb-1">Créditos Disponibles</p>
                {soonExpiringCount > 0 ? (
                  <p className="text-[11px] font-medium text-black/60 italic">
                    Vencen: {soonExpiringCount} en los próximos 30 días
                  </p>
                ) : (
                  <p className="text-[11px] font-medium text-black/40 italic">Tu balance está al día</p>
                )}
              </div>
            </div>
            <Link href="/student/payments" className="relative z-10">
              <button className="w-10 h-10 flex items-center justify-center text-white bg-[#CEB49D] hover:bg-[#BFA58E] rounded-full transition-all shadow-sm">
                <Plus className="h-5 w-5" />
              </button>
                </Link>
          </div>
        </section>

        {/* Agenda Section */}
        <section className="bg-white/40 backdrop-blur-md rounded-[40px] overflow-hidden flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-white/60 relative z-10">
          <div className="p-6 border-b border-[#CEB49D]/10 flex justify-between items-center relative z-20">
            <h3 className="serif-title text-black text-xl italic">Mi Agenda</h3>
            <span className="text-[9px] text-[#CEB49D] uppercase tracking-widest font-bold relative z-30">
              {bookings?.length || 0} Sesiones Confirmadas
            </span>
          </div>
          
          <div className="max-h-[380px] overflow-y-auto no-scrollbar p-6 space-y-6">
            {!bookings || bookings.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <Calendar className="h-8 w-8 mx-auto text-black/10" />
                <p className="text-sm text-black/40 italic">No tienes clases programadas</p>
              </div>
            ) : (
              bookings.map((booking: any) => (
                <div key={booking.id} className="flex justify-between items-center pb-6 border-b border-[#CEB49D]/5 last:border-0 last:pb-0">
                  <div>
                    <p className="text-[11px] font-medium text-black/40 mb-1">
                      {formatAgendaDate(booking.coach_slots.starts_at)}, {formatTime(booking.coach_slots.starts_at)}
                        </p>
                    <p className="text-[9px] uppercase tracking-[0.15em] text-[#CEB49D] font-bold mb-0.5">
                      {booking.coach_slots.profiles?.full_name || 'Coach'}
                        </p>
                    <p className="serif-title text-black text-lg italic leading-tight">Pilates Reformer</p>
                  </div>
                  <Link href={`/student/bookings`}>
                    <button className="text-[9px] uppercase tracking-widest text-black/40 font-bold border border-[#CEB49D]/20 px-4 py-2 rounded-full hover:bg-red-50 hover:text-red-800 hover:border-red-100 transition-all">
                      Gestionar
                    </button>
                  </Link>
                </div>
              ))
            )}
      </div>

          <div className="p-6 pt-0">
            <Link href="/student/bookings">
              <button className="w-full py-4 px-6 bg-[#5B96B9] text-white flex items-center justify-center gap-3 rounded-2xl hover:bg-[#4A85A8] transition-all duration-300 shadow-sm">
                <Calendar className="h-4 w-4" />
                <span className="text-sm serif-title italic tracking-wide">Ver Mis Sesiones</span>
              </button>
            </Link>
          </div>
        </section>
      </main>

      {/* Fixed Footer CTA */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-background-light/80 backdrop-blur-xl border-t border-[#CEB49D]/10 px-6 py-8 z-20">
              <Link href="/student/book">
          <button className="w-full bg-[#BFA58E] text-white text-[11px] font-bold tracking-[0.3em] uppercase py-5 px-12 rounded-full shadow-[0_15px_40px_rgba(191,165,142,0.3)] border border-white/20 active:scale-95 transition-all hover:bg-[#A68B6F] hover:shadow-[0_20px_50px_rgba(191,165,142,0.4)] hover:-translate-y-1">
            Reservar Nueva Sesión
          </button>
              </Link>
        <p className="text-center text-[9px] text-black/20 tracking-[0.2em] uppercase font-bold mt-6">Wave Wellness • Santa Marta</p>
      </footer>
    </div>
  )
}
