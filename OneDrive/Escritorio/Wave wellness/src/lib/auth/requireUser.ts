import { createClient } from '@/lib/supabase/server'

/**
 * Requiere que el usuario esté autenticado.
 * 
 * @returns El usuario autenticado
 * @throws Error si el usuario no está autenticado
 * 
 * @example
 * ```ts
 * try {
 *   const user = await requireUser()
 *   // Usar user.id, user.email, etc.
 * } catch {
 *   redirect('/auth/login')
 * }
 * ```
 */
export async function requireUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Unauthorized')
  }
  
  return user
}
