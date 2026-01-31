'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/getCurrentProfile'

type ReserveSlotResult =
  | { success: true; bookingId: string }
  | { success: false; error: string }

/**
 * Reserva un slot para el estudiante autenticado.
 * 
 * Validaciones:
 * - Usuario autenticado
 * - Créditos disponibles > 0
 * - Slot existe, activo y futuro
 * - Cupos disponibles (booked_count < 2)
 * - No tiene reserva previa en ese slot
 * 
 * @param slotId ID del slot a reservar
 * @returns Resultado de la reserva
 */
export async function reserveSlot(slotId: string): Promise<ReserveSlotResult> {
  try {
    const profile = await getCurrentProfile()

    if (!profile) {
      return { success: false, error: 'No estás autenticado. Por favor inicia sesión.' }
    }

    if (profile.role !== 'student') {
      return { success: false, error: 'Solo los estudiantes pueden reservar slots.' }
    }

    const supabase = await createClient()

    // 1. Verificar créditos disponibles (solo los no expirados)
    const { data: ledgerEntries, error: ledgerError } = await supabase
      .from('credit_ledger')
      .select('delta, expires_at')
      .eq('student_id', profile.id)

    if (ledgerError) {
      return { success: false, error: 'Error al verificar créditos disponibles.' }
    }

    const credits = ledgerEntries?.reduce((sum, entry) => {
      if (entry.expires_at && new Date(entry.expires_at) < new Date()) {
        return sum
      }
      return sum + entry.delta
    }, 0) || 0

    if (credits <= 0) {
      return {
        success: false,
        error: 'No tienes créditos disponibles. Primero debes pagar para agendar clases.',
      }
    }

    // 2. Llamar a RPC para reserva atómica
    // La función SQL valida: slot existe, activo, futuro, cupos, duplicados
    console.log('Llamando RPC book_slot con slot_id:', slotId)
    
    const { data: rpcResult, error: rpcError } = await supabase.rpc('book_slot', {
      slot_id: slotId,
      p_student_id: profile.id,
    })

    console.log('Respuesta RPC:', { rpcResult, rpcError })

    if (rpcError) {
      console.error('Error al llamar RPC book_slot:', {
        code: rpcError.code,
        message: rpcError.message,
        details: rpcError.details,
        hint: rpcError.hint,
      })
      // Proporcionar mensaje más específico según el tipo de error
      if (rpcError.code === '42883' || rpcError.message?.includes('function') || rpcError.message?.includes('does not exist')) {
        return {
          success: false,
          error: 'La función de reserva no está disponible. Por favor contacta al administrador.',
        }
      }
      // Si el error viene de la función SQL, puede estar en el mensaje
      return {
        success: false,
        error: rpcError.message || rpcError.details || 'Error al reservar el slot. Por favor intenta de nuevo.',
      }
    }

    // 3. Procesar respuesta de RPC
    // La RPC puede retornar null si hay un error interno
    if (rpcResult === null || rpcResult === undefined) {
      console.error('RPC retornó null/undefined. Posible problema con auth.uid() o RLS.')
      return {
        success: false,
        error: 'Error al procesar la reserva. Verifica que estés autenticado correctamente.',
      }
    }

    console.log('Tipo de rpcResult:', typeof rpcResult, 'Valor:', rpcResult)

    // La RPC retorna JSON, puede ser string o objeto
    let result: { success: boolean; booking_id?: string; error?: string }
    
    if (typeof rpcResult === 'string') {
      try {
        result = JSON.parse(rpcResult)
      } catch (parseError) {
        console.error('Error al parsear respuesta RPC:', parseError, 'Respuesta:', rpcResult)
        return {
          success: false,
          error: 'Error al procesar la respuesta. Por favor intenta de nuevo.',
        }
      }
    } else if (typeof rpcResult === 'object' && rpcResult !== null) {
      result = rpcResult as { success: boolean; booking_id?: string; error?: string }
    } else {
      console.error('Tipo de respuesta RPC inesperado:', typeof rpcResult, rpcResult)
      return {
        success: false,
        error: 'Error inesperado al reservar. Por favor intenta de nuevo.',
      }
    }

    console.log('Resultado procesado:', result)

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Error al reservar el slot. Por favor intenta de nuevo.',
      }
    }

    if (!result.booking_id) {
      return {
        success: false,
        error: 'Error al crear la reserva. Por favor intenta de nuevo.',
      }
    }

    return { success: true, bookingId: result.booking_id }
  } catch (error) {
    console.error('Error inesperado al reservar slot:', error)
    // Proporcionar más detalles del error en desarrollo
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return {
      success: false,
      error: `Error inesperado: ${errorMessage}. Por favor intenta de nuevo.`,
    }
  }
}
