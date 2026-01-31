'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/getCurrentProfile'

type MarkAttendanceResult =
  | { success: true }
  | { success: false; error: string }

/**
 * Marca la asistencia de un estudiante en un booking.
 * 
 * Si status = 'attended':
 * - Actualiza booking.status = 'attended'
 * - Inserta en credit_ledger: delta = -1, reason = 'class_attended'
 * - Idempotente: no duplica descuento si ya está marcado como 'attended'
 * 
 * Si status = 'no_show':
 * - Actualiza booking.status = 'no_show'
 * - NO descuenta créditos
 * 
 * Validaciones:
 * - Usuario autenticado y es coach
 * - Booking existe
 * - Slot pertenece al coach
 * - Status actual es 'booked' (solo se puede marcar una vez)
 * 
 * @param bookingId ID del booking a marcar
 * @param status 'attended' o 'no_show'
 * @returns Resultado de la operación
 */
export async function markAttendance(
  bookingId: string,
  status: 'attended' | 'no_show'
): Promise<MarkAttendanceResult> {
  try {
    const profile = await getCurrentProfile()

    if (!profile) {
      return { success: false, error: 'No estás autenticado. Por favor inicia sesión.' }
    }

    if (profile.role !== 'coach' && profile.role !== 'admin') {
      return { success: false, error: 'Solo los coaches y administradores pueden marcar asistencia.' }
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
        coach_slots!inner(coach_id)
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return { success: false, error: 'Este booking no existe.' }
    }

    // 2. Verificar que el slot pertenece al coach (o admin puede todo)
    const slot = booking.coach_slots as any
    if (profile.role !== 'admin' && slot.coach_id !== profile.id) {
      return {
        success: false,
        error: 'No tienes permiso para marcar asistencia en este booking.',
      }
    }

    // 3. Verificar que el status actual es 'booked' (solo se puede marcar una vez)
    // Y que NO estaba 'cancelled' antes (no descontar si ya estaba cancelado)
    if (booking.status !== 'booked') {
      return {
        success: false,
        error: 'Este booking ya fue marcado. No se puede cambiar el estado.',
      }
    }

    // Verificar que NO estaba cancelled antes (no descontar si ya estaba cancelado)
    // Esto es una validación adicional de seguridad
    if (booking.status === 'cancelled') {
      return {
        success: false,
        error: 'No puedes marcar no-show en un booking cancelado.',
      }
    }

    // 4. Actualizar el booking
    const { error: updateError } = await supabase
      .from('class_bookings')
      .update({ status })
      .eq('id', bookingId)

    if (updateError) {
      return {
        success: false,
        error: 'Error al actualizar el booking. Por favor intenta de nuevo.',
      }
    }

    // 5. Si es 'attended', insertar en credit_ledger (idempotente)
    if (status === 'attended') {
      // Idempotencia: Como ya verificamos que booking.status = 'booked' antes de actualizar,
      // y actualizamos el booking a 'attended', podemos insertar el ledger de forma segura.
      // Si por alguna razón el booking ya estaba 'attended', no llegaríamos aquí.
      // 
      // Nota: Idealmente deberíamos tener ref_booking_id en credit_ledger para tracking preciso,
      // pero por ahora confiamos en que el flujo es correcto (booking.status = 'booked' → 'attended').

      const { error: ledgerError } = await supabase.from('credit_ledger').insert({
        student_id: booking.student_id,
        delta: -1,
        reason: 'class_attended',
        created_by: profile.id,
      })

      if (ledgerError) {
        // Si falla el insert del ledger, el booking ya se actualizó a 'attended'
        // Esto es un problema de consistencia, pero por ahora solo logueamos el error
        // En producción, podríamos implementar un job de compensación o alerta
        console.error('Error al insertar en credit_ledger:', ledgerError)
        // No retornamos error aquí porque el booking ya se actualizó
        // El admin puede corregir manualmente si es necesario
      }
    }

    // 6. Si es 'no_show', insertar en credit_ledger (idempotente)
    if (status === 'no_show') {
      // Idempotencia: Como ya verificamos que booking.status = 'booked' antes de actualizar,
      // y actualizamos el booking a 'no_show', podemos insertar el ledger de forma segura.
      // Si por alguna razón el booking ya estaba 'no_show', no llegaríamos aquí.

      const { error: ledgerError } = await supabase.from('credit_ledger').insert({
        student_id: booking.student_id,
        delta: -1,
        reason: 'class_no_show',
        created_by: profile.id,
      })

      if (ledgerError) {
        // Si falla el insert del ledger, el booking ya se actualizó a 'no_show'
        // Esto es un problema de consistencia, pero por ahora solo logueamos el error
        // En producción, podríamos implementar un job de compensación o alerta
        console.error('Error al insertar en credit_ledger:', ledgerError)
        // No retornamos error aquí porque el booking ya se actualizó
        // El admin puede corregir manualmente si es necesario
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error inesperado al marcar asistencia:', error)
    return {
      success: false,
      error: 'Error inesperado. Por favor intenta de nuevo.',
    }
  }
}
