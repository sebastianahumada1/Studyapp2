'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/base/use-toast'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Mail } from 'lucide-react'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message,
        })
        return
      }

      setSubmitted(true)
      toast({
        title: 'Correo enviado',
        description: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
      })
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
      <div className="w-full max-w-[420px] bg-background-light flex flex-col min-h-screen px-10 pt-16 pb-10">
        {/* Back Button */}
        <div className="mb-8">
          <Link 
            href="/auth/login" 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/40 border border-white/60 text-black/60 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

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
          <h1 className="serif-title text-black text-[32px] leading-tight font-light italic">Recuperar Acceso</h1>
          <p className="text-black/50 text-[11px] mt-2 tracking-widest uppercase">
            {submitted ? 'Revisa tu correo' : 'Ingresa tu email'}
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex flex-col">
              <label className="text-black/60 text-[10px] uppercase tracking-[0.2em] mb-1">Correo electrónico</label>
              <div className="relative w-full">
                <input
                  type="email"
                  {...register('email')}
                  placeholder="nombre@ejemplo.com"
                  disabled={loading}
                  className="w-full bg-transparent border-0 border-b border-[#CEB49D]/40 py-2 px-0 focus:ring-0 focus:border-ocean-blue transition-colors text-black text-base placeholder:text-black/20 pr-10"
                />
                <Mail className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" />
              </div>
              {errors.email && (
                <p className="text-[10px] text-destructive mt-1 uppercase tracking-wider">{errors.email.message}</p>
              )}
            </div>

            <div className="mt-10">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#BFA58E] text-white text-[11px] font-bold tracking-[0.3em] uppercase py-4 px-12 rounded-full shadow-[0_15px_40px_rgba(191,165,142,0.3)] border border-white/20 active:scale-95 transition-all hover:bg-[#A68B6F] hover:shadow-[0_20px_50px_rgba(191,165,142,0.4)] hover:-translate-y-1 disabled:opacity-50"
              >
                {loading ? 'ENVIANDO...' : 'ENVIAR INSTRUCCIONES'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <p className="text-black/60 text-sm leading-relaxed">
              Hemos enviado un enlace para restablecer tu contraseña a tu correo electrónico.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-ocean-blue text-[11px] font-bold tracking-widest uppercase hover:opacity-70 transition-opacity"
            >
              Intentar con otro correo
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-10 text-center">
          <p className="text-black/40 text-[9px] uppercase tracking-[0.15em] leading-loose">
            ¿Recordaste tu contraseña? <br/>
            <Link href="/auth/login" className="underline decoration-[#CEB49D]/40 underline-offset-8">Volver al inicio</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
