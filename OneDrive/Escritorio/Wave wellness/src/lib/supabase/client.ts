import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Crea un cliente de Supabase para uso en Client Components.
 * 
 * Maneja cookies automáticamente en el navegador.
 * 
 * @returns Cliente de Supabase configurado para el cliente
 * 
 * @example
 * ```ts
 * 'use client'
 * 
 * const supabase = createClient()
 * const { data } = await supabase.from('profiles').select('*')
 * ```
 */
export function createClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
