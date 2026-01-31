'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/getCurrentProfile'
import { revalidatePath } from 'next/cache'

type CancelBookingResult =
  | { success: true }
  | { success: false; error: string }

/**
 * Cancela una reserva del estudiante autenticado.
 * 
 * Reglas:
 * - Solo student puede cancelar sus bookings
 * - Status debe ser 'booked' (no se puede cancelar attended/no_show)
 * - Faltan >= 24 horas para starts_at del slot para recuperar crédito
 * 
 * @param bookingId ID del booking a cancelar
 * @returns Resultado de la cancelación
 */
export async function cancelBooking(bookingId: string): Promise<CancelBookingResult> {
  try {
    const profile = await getCurrentProfile()

    if (!profile) {
      return { success: false, error: 'No estás autenticado. Por favor inicia sesión.' }
    }

    if (profile.role !== 'student') {
      return { success: false, error: 'Solo los estudiantes pueden cancelar reservas.' }
    }

    const supabase = await createClient()

    // 1. Verificar que el booking existe y obtener información del slot
    const { data: booking, error: bookingError } = await supabase
      .from('class_bookings')
      .select(`
        id,
        status,
        student_id,
        slot_id,
        coach_slots!inner(
          starts_at,
          ends_at
        )
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return { success: false, error: 'Esta reserva no existe.' }
    }

    // 2. Verificar que el booking pertenece al student
    if (booking.student_id !== profile.id) {
      return {
        success: false,
        error: 'No tienes permiso para cancelar esta reserva.',
      }
    }

    // 3. Verificar que el status es 'booked' (no se puede cancelar attended/no_show)
    if (booking.status !== 'booked') {
      return {
        success: false,
        error: 'Esta reserva ya fue cancelada o completada. No se puede cancelar.',
      }
    }

    // 4. Verificar tiempo para devolución de crédito (24 horas)
    const slot = booking.coach_slots as any
    const slotStart = new Date(slot.starts_at)
    const now = new Date()
    const hoursUntilStart = (slotStart.getTime() - now.getTime()) / (1000 * 60 * 60)

    // 5. Iniciar proceso de cancelación
    if (hoursUntilStart >= 24) {
      // DEVOLVER CRÉDITO
      const { error: ledgerError } = await supabase.from('credit_ledger').insert({
        student_id: profile.id,
        delta: 1,
        reason: 'class_cancelled',
        created_by: profile.id,
      })

      if (ledgerError) {
        console.error('Error al devolver crédito:', ledgerError)
        return {
          success: false,
          error: 'Error al procesar la devolución del crédito. Por favor intenta de nuevo.',
        }
      }
    }

    // 6. Actualizar booking: status='cancelled', cancelled_at=now()
    const { error: updateError } = await supabase
      .from('class_bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', bookingId)

    if (updateError) {
      console.error('Error al actualizar booking:', updateError)
      return {
        success: false,
        error: 'Error al cancelar la reserva en la base de datos.',
      }
    }

    // Revalidar las rutas para que el balance se actualice
    revalidatePath('/student')
    revalidatePath('/student/bookings')

    return { success: true }
  } catch (error) {
    console.error('Error inesperado al cancelar reserva:', error)
    return {
      success: false,
      error: 'Error inesperado. Por favor intenta de nuevo.',
    }
  }
}
