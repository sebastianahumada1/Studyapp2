'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/base/use-toast'
import Image from 'next/image'
import { Eye, EyeOff, Lock } from 'lucide-react'

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    setLoading(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.updateUser({
        password: data.password
      })

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message,
        })
        return
      }

      toast({
        title: 'Contraseña actualizada',
        description: 'Tu contraseña ha sido restablecida exitosamente.',
      })

      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error inesperado',
        description: 'Ocurrió un error inesperado. Por favor intenta de nuevo.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background-light font-sans flex flex-col items-center">
      <div className="w-full max-w-[420px] bg-background-light flex flex-col min-h-screen px-10 pt-24 pb-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-2 opacity-90">
            <Image 
              src="/images/wave-logo-isotipo.png" 
              alt="Wave Isotipo" 
              width={77} 
              height={77} 
              className="h-16 w-auto object-contain"
            />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="serif-title text-black text-[32px] leading-tight font-light italic">Nueva Contraseña</h1>
          <p className="text-black/50 text-[11px] mt-2 tracking-widest uppercase">Ingresa tu nueva clave</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Password */}
          <div className="flex flex-col">
            <label className="text-black/60 text-[10px] uppercase tracking-[0.2em] mb-1">Nueva Contraseña</label>
            <div className="relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="••••••••"
                disabled={loading}
                className="w-full bg-transparent border-0 border-b border-[#CEB49D]/40 py-2 px-0 focus:ring-0 focus:border-ocean-blue transition-colors text-black text-base placeholder:text-black/20 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-black/30 hover:text-ocean-blue transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[10px] text-destructive mt-1 uppercase tracking-wider">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col">
            <label className="text-black/60 text-[10px] uppercase tracking-[0.2em] mb-1">Confirmar Contraseña</label>
            <div className="relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                placeholder="••••••••"
                disabled={loading}
                className="w-full bg-transparent border-0 border-b border-[#CEB49D]/40 py-2 px-0 focus:ring-0 focus:border-ocean-blue transition-colors text-black text-base placeholder:text-black/20 pr-10"
              />
              <Lock className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" />
            </div>
            {errors.confirmPassword && (
              <p className="text-[10px] text-destructive mt-1 uppercase tracking-wider">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="mt-10">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#BFA58E] text-white text-[11px] font-bold tracking-[0.3em] uppercase py-4 px-12 rounded-full shadow-[0_15px_40px_rgba(191,165,142,0.3)] border border-white/20 active:scale-95 transition-all hover:bg-[#A68B6F] hover:shadow-[0_20px_50px_rgba(191,165,142,0.4)] hover:-translate-y-1 disabled:opacity-50"
            >
              {loading ? 'ACTUALIZANDO...' : 'ACTUALIZAR CONTRASEÑA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
