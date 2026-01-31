import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth/getCurrentProfile'
import { Sidebar } from '@/components/ui/Sidebar'
import { Topbar } from '@/components/ui/Topbar'
import { BottomNav } from '@/components/ui/BottomNav'
import { cn } from '@/lib/utils'

/**
 * Layout Protegido: Renderiza el shell para usuarios autenticados.
 * 
 * Nota: La verificación de autenticación y roles se hace en el middleware
 * para evitar loops de renderizado. El middleware redirige si:
 * - No hay sesión → /auth/login
 * - El rol no coincide con la ruta → home correcto del rol
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Obtener perfil del usuario autenticado
  // Si no hay perfil, el middleware ya debería haber redirigido
  const profile = await getCurrentProfile()

  // Si no hay perfil (caso edge), redirigir a login
  if (!profile) {
    redirect('/auth/login')
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar: solo visible en desktop */}
      {profile.role !== 'student' && profile.role !== 'admin' && profile.role !== 'coach' && <Sidebar role={profile.role} />}
      
      {/* Contenido principal */}
      <div className={cn("flex-1", (profile.role !== 'student' && profile.role !== 'admin' && profile.role !== 'coach') && "md:ml-64")}>
        {/* Topbar: visible en mobile y desktop */}
        {profile.role !== 'student' && profile.role !== 'admin' && profile.role !== 'coach' && <Topbar profile={profile} />}
        
        {/* Main content: padding para topbar y bottom nav */}
        <main className={cn(
          "p-4 md:p-8",
          (profile.role !== 'student' && profile.role !== 'admin' && profile.role !== 'coach') ? "pt-16 pb-20 md:pb-8" : "pt-0 pb-0"
        )}>
          {children}
        </main>
        
        {/* BottomNav: solo visible en mobile */}
        {profile.role !== 'student' && profile.role !== 'admin' && profile.role !== 'coach' && <BottomNav role={profile.role} />}
      </div>
    </div>
  )
}

