import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Crea un cliente de Supabase para uso en Server Components, Server Actions y Route Handlers.
 * 
 * Maneja cookies automáticamente para mantener la sesión del usuario.
 * 
 * @returns Cliente de Supabase configurado para el servidor
 * 
 * @example
 * ```ts
 * const supabase = await createClient()
 * const { data } = await supabase.from('profiles').select('*')
 * ```
 */
export async function createClient(): Promise<SupabaseClient> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    )
  }

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        // Retornar TODAS las cookies, no solo las de Supabase
        // Esto es crítico para que createServerClient pueda parsear la sesión
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Ignore errors in server components (e.g., during static generation)
          // Esto puede ocurrir durante static generation o en edge runtime
        }
      },
    },
  })
}
