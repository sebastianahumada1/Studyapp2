'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/getCurrentProfile'
import { ROLES } from '@/lib/auth/roles'

/**
 * Genera una signed URL para ver el comprobante de pago
 */
export async function getProofSignedUrl(proofPath: string): Promise<{ url: string } | { error: string }> {
  try {
    const profile = await getCurrentProfile()

    if (!profile || profile.role !== ROLES.ADMIN) {
      return { error: 'No autorizado' }
    }

    const supabase = await createClient()

    // Generar signed URL (válida por 1 hora)
    const { data, error } = await supabase.storage
      .from('payment-proofs')
      .createSignedUrl(proofPath, 3600)

    if (error) {
      return { error: error.message || 'No se pudo generar la URL del comprobante' }
    }

    return { url: data.signedUrl }
  } catch (error) {
    return { error: 'Error inesperado al generar URL' }
  }
}

/**
 * Aprueba un payment y crea el ledger entry (idempotente)
 */
export async function approvePayment(paymentId: string): Promise<{ success: true } | { error: string }> {
  try {
    const profile = await getCurrentProfile()

    if (!profile || profile.role !== ROLES.ADMIN) {
      return { error: 'No autorizado' }
    }

    const supabase = await createClient()

    // 1. Obtener payment y validar
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, student_id, status, proof_path, package_credits, package_name, amount, package_validity_days')
      .eq('id', paymentId)
      .single()

    if (paymentError || !payment) {
      return { error: 'No se encontró el pago' }
    }

    // 2. Validaciones
    if (payment.status !== 'pending') {
      return { error: 'El pago no está pendiente' }
    }

    if (!payment.proof_path) {
      return { error: 'El pago no tiene comprobante subido' }
    }

    if (payment.package_credits === null) {
      return { error: 'No se pueden aprobar pagos con créditos ilimitados en este momento' }
    }

    // 3. Verificar si ya existe ledger (idempotente)
    const { data: existingLedger } = await supabase
      .from('credit_ledger')
      .select('id')
      .eq('ref_payment_id', paymentId)
      .single()

    // 4. Si no existe ledger, crearlo
    if (!existingLedger) {
      // Calcular fecha de expiración
      const validityDays = payment.package_validity_days || 30 // Default 30 si no hay snapshot
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + validityDays)

      const { error: ledgerError } = await supabase.from('credit_ledger').insert({
        student_id: payment.student_id,
        delta: payment.package_credits,
        reason: 'payment_approved',
        ref_payment_id: payment.id,
        created_by: profile.id,
        expires_at: expiresAt.toISOString(),
      })

      if (ledgerError) {
        return { error: ledgerError.message || 'No se pudo crear el registro de créditos' }
      }
    }

    // 5. Update payment (idempotente: si ya está approved, no hay problema)
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: profile.id,
      })
      .eq('id', paymentId)
      .eq('status', 'pending') // Solo actualizar si sigue pending (idempotente)

    if (updateError) {
      return { error: updateError.message || 'No se pudo actualizar el pago' }
    }

    return { success: true }
  } catch (error) {
    return { error: 'Error inesperado al aprobar el pago' }
  }
}

/**
 * Rechaza un payment
 */
export async function rejectPayment(paymentId: string): Promise<{ success: true } | { error: string }> {
  try {
    const profile = await getCurrentProfile()

    if (!profile || profile.role !== ROLES.ADMIN) {
      return { error: 'No autorizado' }
    }

    const supabase = await createClient()

    // 1. Obtener payment y validar
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, status')
      .eq('id', paymentId)
      .single()

    if (paymentError || !payment) {
      return { error: 'No se encontró el pago' }
    }

    // 2. Validar que está pending
    if (payment.status !== 'pending') {
      return { error: 'El pago no está pendiente' }
    }

    // 3. Update payment a rejected
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'rejected',
      })
      .eq('id', paymentId)
      .eq('status', 'pending') // Solo actualizar si sigue pending (idempotente)

    if (updateError) {
      return { error: updateError.message || 'No se pudo rechazar el pago' }
    }

    return { success: true }
  } catch (error) {
    return { error: 'Error inesperado al rechazar el pago' }
  }
}
