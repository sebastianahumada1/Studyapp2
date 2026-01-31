import { createClient } from '@/lib/supabase/server'
import type { Profile } from './roles'

/**
 * Obtiene el perfil del usuario autenticado actual.
 * 
 * @returns El perfil del usuario si está autenticado y tiene profile, `null` en caso contrario
 * 
 * @example
 * ```ts
 * const profile = await getCurrentProfile()
 * if (!profile) {
 *   redirect('/auth/login')
 * }
 * // Usar profile.role, profile.full_name, etc.
 * ```
 * 
 * @note Si el usuario está autenticado pero no tiene profile en la tabla `profiles`,
 * retorna `null`. El usuario debe completar su perfil antes de continuar.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient()

  // Usar getSession() primero (más confiable que getUser())
  // getSession() lee de cookies, getUser() hace llamada al servidor
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session?.user) {
    // No hay sesión activa
    return null
  }

  const user = session.user

  // Consultar profile desde la tabla profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, phone, role, created_at')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    // Usuario autenticado pero sin profile
    // Nota: El usuario debe completar su perfil en la tabla profiles
    return null
  }

  // Validar que el role es válido (TypeScript ya lo valida, pero por seguridad)
  if (profile.role !== 'student' && profile.role !== 'coach' && profile.role !== 'admin') {
    return null
  }

  return {
    id: profile.id,
    full_name: profile.full_name,
    phone: profile.phone,
    role: profile.role,
    created_at: profile.created_at,
  }
}
