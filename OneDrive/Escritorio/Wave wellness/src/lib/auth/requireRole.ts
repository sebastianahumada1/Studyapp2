import { getCurrentProfile } from './getCurrentProfile'
import type { Role } from './roles'

/**
 * Requiere que el usuario tenga un role específico.
 * 
 * @param role - El role requerido ('student', 'coach', o 'admin')
 * @returns El perfil del usuario con el role correcto
 * @throws Error si el usuario no está autenticado o no tiene el role requerido
 * 
 * @example
 * ```ts
 * try {
 *   const profile = await requireRole('admin')
 *   // Usar profile.role, profile.full_name, etc.
 * } catch {
 *   redirect('/auth/login')
 * }
 * ```
 */
export async function requireRole(role: Role) {
  const profile = await getCurrentProfile()
  
  if (!profile) {
    throw new Error('Unauthorized')
  }
  
  if (profile.role !== role) {
    throw new Error('Forbidden')
  }
  
  return profile
}
