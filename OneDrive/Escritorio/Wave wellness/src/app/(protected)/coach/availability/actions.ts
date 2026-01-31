'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth/getCurrentProfile'

type CreateSlotResult =
  | { success: true; slotId: string }
  | { success: false; error: string }

type CreateMultipleSlotsResult =
  | { success: true; createdCount: number }
  | { success: false; error: string }

type CreateMultipleSlotsParams = {
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  startTime: string // HH:MM
  endTime: string // HH:MM
  daysOfWeek: number[] // [1=Lunes, 2=Martes, ..., 7=Domingo]
}

/**
 * Crea un bloque de disponibilidad de 1 hora para el coach autenticado.
 * 
 * Validaciones:
 * - Usuario autenticado y es coach
 * - startsAt no en el pasado
 * - No existe slot duplicado (coach_id + starts_at)
 * 
 * @param startsAt ISO datetime string (ej: "2024-01-15T09:00:00-05:00")
 * @returns Resultado de la creación
 */
export async function createSlot(startsAt: string): Promise<CreateSlotResult> {
  try {
    const profile = await getCurrentProfile()

    if (!profile) {
      return { success: false, error: 'No estás autenticado. Por favor inicia sesión.' }
    }

    if (profile.role !== 'coach') {
      return { success: false, error: 'Solo los coaches pueden crear bloques de disponibilidad.' }
    }

    const supabase = await createClient()

    // 1. Validar que startsAt no está en el pasado
    const startDate = new Date(startsAt)
    const now = new Date()

    if (startDate <= now) {
      return {
        success: false,
        error: 'No puedes crear bloques en el pasado. Selecciona una fecha y hora futura.',
      }
    }

    // 2. Calcular endsAt (startsAt + 1 hour)
    const endDate = new Date(startDate)
    endDate.setHours(endDate.getHours() + 1)

    // 3. Verificar si ya existe un slot duplicado
    const { data: existingSlot, error: checkError } = await supabase
      .from('coach_slots')
      .select('id')
      .eq('coach_id', profile.id)
      .eq('starts_at', startDate.toISOString())
      .single()

    if (existingSlot) {
      return {
        success: false,
        error: 'Ya existe un bloque en este horario. Por favor selecciona otro.',
      }
    }

    // 4. Insertar slot
    const { data: newSlot, error: insertError } = await supabase
      .from('coach_slots')
      .insert({
        coach_id: profile.id,
        starts_at: startDate.toISOString(),
        ends_at: endDate.toISOString(),
        capacity: 2,
        active: true,
      })
      .select('id')
      .single()

    if (insertError) {
      // Manejar error de constraint UNIQUE (duplicado)
      if (insertError.code === '23505') {
        return {
          success: false,
          error: 'Ya existe un bloque en este horario. Por favor selecciona otro.',
        }
      }

      return {
        success: false,
        error: 'Error al crear el bloque. Por favor intenta de nuevo.',
      }
    }

    return { success: true, slotId: newSlot.id }
  } catch (error) {
    console.error('Error inesperado al crear slot:', error)
    return {
      success: false,
      error: 'Error inesperado. Por favor intenta de nuevo.',
    }
  }
}

/**
 * Crea múltiples bloques de disponibilidad para el coach autenticado.
 * 
 * Crea bloques de 1 hora para cada día seleccionado en el rango de fechas.
 * Si el horario es 9am-11am, crea 2 bloques (9-10am y 10-11am) por cada día.
 * 
 * Validaciones:
 * - Usuario autenticado y es coach
 * - Fechas válidas (startDate <= endDate)
 * - Horas válidas (startTime < endTime)
 * - Al menos 1 día seleccionado
 * - No crear slots en el pasado
 * - No duplicar slots existentes
 * 
 * @param params Parámetros para crear múltiples slots
 * @returns Resultado con cantidad de slots creados
 */
export async function createMultipleSlots(
  params: CreateMultipleSlotsParams
): Promise<CreateMultipleSlotsResult> {
  try {
    const profile = await getCurrentProfile()

    if (!profile) {
      return { success: false, error: 'No estás autenticado. Por favor inicia sesión.' }
    }

    if (profile.role !== 'coach') {
      return { success: false, error: 'Solo los coaches pueden crear bloques de disponibilidad.' }
    }

    const { startDate, endDate, startTime, endTime, daysOfWeek } = params

    // Validaciones básicas
    if (!startDate || !endDate || !startTime || !endTime || daysOfWeek.length === 0) {
      return { success: false, error: 'Por favor completa todos los campos.' }
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const now = new Date()

    if (start > end) {
      return { success: false, error: 'La fecha de inicio debe ser anterior a la fecha de fin.' }
    }

    // Calcular bloques por día
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const durationMinutes = endMinutes - startMinutes
    const blocksPerDay = Math.floor(durationMinutes / 60)

    if (blocksPerDay <= 0) {
      return { success: false, error: 'Debe haber al menos 1 hora entre la hora de inicio y fin.' }
    }

    const supabase = await createClient()

    // Generar todos los slots a crear
    const slotsToCreate: Array<{ starts_at: string; ends_at: string }> = []

    // Iterar sobre cada día en el rango
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay() // 0=Domingo, 1=Lunes, ..., 6=Sábado
      const normalizedDay = dayOfWeek === 0 ? 7 : dayOfWeek // Convertir Domingo de 0 a 7

      // Si este día está seleccionado
      if (daysOfWeek.includes(normalizedDay)) {
        // Crear bloques de 1 hora para este día
        for (let block = 0; block < blocksPerDay; block++) {
          const blockStartHour = startHour + block
          const blockStartMin = startMin
          const blockEndHour = blockStartHour + 1
          const blockEndMin = blockStartMin

          // Crear fecha/hora para este bloque
          const slotDate = new Date(d)
          slotDate.setHours(blockStartHour, blockStartMin, 0, 0)

          // No crear slots en el pasado
          if (slotDate <= now) {
            continue
          }

          const slotEndDate = new Date(slotDate)
          slotEndDate.setHours(blockEndHour, blockEndMin, 0, 0)

          slotsToCreate.push({
            starts_at: slotDate.toISOString(),
            ends_at: slotEndDate.toISOString(),
          })
        }
      }
    }

    if (slotsToCreate.length === 0) {
      return {
        success: false,
        error: 'No hay slots válidos para crear. Verifica que las fechas sean futuras.',
      }
    }

    // Insertar todos los slots (ignorar duplicados)
    let createdCount = 0
    const errors: string[] = []

    for (const slot of slotsToCreate) {
      const { error: insertError } = await supabase.from('coach_slots').insert({
        coach_id: profile.id,
        starts_at: slot.starts_at,
        ends_at: slot.ends_at,
        capacity: 2,
        active: true,
      })

      if (insertError) {
        // Ignorar errores de duplicado (23505)
        if (insertError.code !== '23505') {
          errors.push(insertError.message)
        }
        // Si es duplicado, no contamos como error
      } else {
        createdCount++
      }
    }

    if (createdCount === 0) {
      return {
        success: false,
        error: 'No se pudieron crear los slots. Puede que ya existan en esos horarios.',
      }
    }

    if (errors.length > 0) {
      console.error('Algunos slots no se pudieron crear:', errors)
    }

    return { success: true, createdCount }
  } catch (error) {
    console.error('Error inesperado al crear múltiples slots:', error)
    return {
      success: false,
      error: 'Error inesperado. Por favor intenta de nuevo.',
    }
  }
}

/**
 * Crea disponibilidad para fechas y horas específicas.
 * Adaptado para el nuevo diseño de calendario de selección múltiple.
 */
export async function createAvailability(
  dates: string[], // Array de YYYY-MM-DD
  hours: string[]  // Array de HH:MM
): Promise<{ success: true; count: number } | { success: false; error: string }> {
  try {
    const profile = await getCurrentProfile()
    if (!profile || profile.role !== 'coach') {
      return { success: false, error: 'No autorizado' }
    }

    const supabase = await createClient()
    let createdCount = 0
    const now = new Date()

    for (const dateStr of dates) {
      for (const hourStr of hours) {
        const [hour, min] = hourStr.split(':').map(Number)
        
        // Crear fecha usando componentes locales para evitar desfases de zona horaria
        const [year, month, day] = dateStr.split('-').map(Number)
        const startsAt = new Date(year, month - 1, day, hour, min, 0, 0)

        // Validar que no sea en el pasado
        if (startsAt <= now) continue

        const endsAt = new Date(startsAt)
        endsAt.setHours(endsAt.getHours() + 1)

        const { error } = await supabase.from('coach_slots').insert({
          coach_id: profile.id,
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          capacity: 2,
          active: true,
        })

        if (!error) createdCount++
      }
    }

    if (createdCount === 0) {
      return { success: false, error: 'No se crearon nuevos espacios. Verifica que no existan ya o que no sean fechas pasadas.' }
    }

    return { success: true, count: createdCount }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
