'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/base/button'
import { useToast } from '@/components/ui/base/use-toast'
import type { Profile } from '@/lib/auth/roles'
import { ROLES } from '@/lib/auth/roles'

interface TopbarProps {
  profile: Profile
}

export function Topbar({ profile }: TopbarProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo cerrar sesión',
        })
        return
      }

      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente',
      })

      // Redirect a login
      router.push('/auth/login')
      // Forzar recarga para limpiar estado
      window.location.href = '/auth/login'
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error inesperado',
        description: 'Ocurrió un error al cerrar sesión',
      })
    }
  }

  const roleLabels = {
    [ROLES.STUDENT]: 'Estudiante',
    [ROLES.COACH]: 'Coach',
    [ROLES.ADMIN]: 'Administrador',
  }

  return (
    <header className="h-16 bg-white border-b border-border fixed top-0 left-0 md:left-64 right-0 px-4 flex items-center justify-between z-10">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold text-ocean">Wave Wellness</h1>
      </div>
      <div className="flex items-center gap-4">
        {/* Desktop: mostrar nombre y rol */}
        <div className="hidden md:flex items-center gap-3 text-base">
          <span className="text-foreground font-medium">{profile.full_name}</span>
          <span className="text-muted-foreground">|</span>
          <span className="text-muted-foreground">{roleLabels[profile.role]}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="text-base h-10"
        >
          Cerrar Sesión
        </Button>
      </div>
    </header>
  )
}
