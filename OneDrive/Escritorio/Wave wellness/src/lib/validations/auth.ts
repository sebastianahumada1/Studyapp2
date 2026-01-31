import { z } from 'zod'

/**
 * Schema de validación para registro
 */
export const registerSchema = z.object({
  full_name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
  phone: z
    .string()
    .min(10, 'El teléfono debe tener al menos 10 caracteres')
    .max(20, 'El teléfono no puede tener más de 20 caracteres')
    .regex(/^[0-9+\-\s()]+$/, 'El teléfono solo puede contener números y caracteres: +, -, espacios, ()'),
  email: z
    .string()
    .email('Email inválido')
    .min(5, 'El email debe tener al menos 5 caracteres')
    .max(255, 'El email no puede tener más de 255 caracteres'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede tener más de 100 caracteres'),
})

export type RegisterFormData = z.infer<typeof registerSchema>

/**
 * Schema de validación para login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .min(1, 'El email es requerido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida'),
})

export type LoginFormData = z.infer<typeof loginSchema>
