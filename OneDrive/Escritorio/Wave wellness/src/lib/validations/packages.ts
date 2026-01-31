import { z } from 'zod'

/**
 * Schema de validación para packages
 */
export const packageSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
  credits: z
    .union([
      z.number().int('Los créditos deben ser un número entero').positive('Los créditos deben ser mayores a 0'),
      z.null(),
    ])
    .nullable(),
  price: z
    .number('El precio debe ser un número')
    .positive('El precio debe ser mayor a 0')
    .min(0.01, 'El precio debe ser al menos $0.01'),
  active: z.boolean(),
  validity_days: z.number().int().positive('Los días de validez deben ser mayores a 0').default(30),
})

export type PackageFormData = z.infer<typeof packageSchema>

/**
 * Tipo para package desde la base de datos
 */
export type Package = {
  id: string
  name: string
  credits: number | null
  price: number
  active: boolean
  validity_days: number
  created_at: string
}
