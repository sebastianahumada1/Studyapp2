'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import { useToast } from '@/components/ui/base/use-toast'
import { ROLES } from '@/lib/auth/roles'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)

    try {
      const supabase = createClient()

      // 1. Login con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        let errorMessage = authError.message
        if (authError.message.includes('Invalid login credentials')) {
          errorMessage = 'Email o contraseña incorrectos'
        } else if (authError.message.includes('Email not confirmed')) {
          errorMessage = 'Por favor confirma tu email antes de iniciar sesión'
        }

        toast({
          variant: 'destructive',
          title: 'Error al iniciar sesión',
          description: errorMessage,
        })
        return
      }

      if (!authData.user) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo iniciar sesión',
        })
        return
      }

      // 2. Refrescar sesión para asegurar cookies
      await supabase.auth.refreshSession()

      // 3. Obtener profile para determinar el rol y redirigir
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      if (profileError || !profile) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo obtener tu perfil. Por favor contacta a soporte.',
        })
        return
      }

      // 4. Redirect por rol
      const roleHomePaths: Record<string, string> = {
        [ROLES.STUDENT]: '/student',
        [ROLES.COACH]: '/coach',
        [ROLES.ADMIN]: '/admin',
      }

      const homePath = roleHomePaths[profile.role] || '/student'

      toast({
        title: '¡Bienvenido!',
        description: 'Inicio de sesión exitoso',
      })

      window.location.href = homePath
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

        {/* Welcome Header */}
        <div className="text-center mb-10">
          <h1 className="serif-title text-black text-[32px] leading-tight font-light italic">Bienvenida</h1>
          <p className="text-black/50 text-[11px] mt-2 tracking-widest uppercase">Tu espacio de bienestar</p>
        </div>

        {/* Segmented Control */}
        <div className="mb-10">
          <div className="flex h-10 w-full items-center justify-center rounded-full bg-[#CEB49D]/10 p-1">
            <div className="flex w-full h-full items-center">
              <div className="flex-1 h-full bg-white/60 rounded-full flex items-center justify-center shadow-sm text-ocean-blue text-[12px] font-medium tracking-widest">
                INICIAR SESIÓN
              </div>
              <Link href="/auth/register" className="flex-1 h-full flex items-center justify-center text-black/40 text-[12px] tracking-widest hover:text-black/60 transition-colors">
                REGISTRARSE
              </Link>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Email */}
          <div className="flex flex-col">
            <label className="text-black/60 text-[10px] uppercase tracking-[0.2em] mb-1">Correo electrónico</label>
            <input
              type="email"
              {...register('email')}
              placeholder="nombre@ejemplo.com"
              disabled={loading}
              className="w-full bg-transparent border-0 border-b border-[#CEB49D]/40 py-2 px-0 focus:ring-0 focus:border-ocean-blue transition-colors text-black text-base placeholder:text-black/20"
            />
            {errors.email && (
              <p className="text-[10px] text-destructive mt-1 uppercase tracking-wider">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label className="text-black/60 text-[10px] uppercase tracking-[0.2em] mb-1">Contraseña</label>
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

          <div className="flex justify-center">
            <Link href="/auth/forgot-password" title="Recuperar contraseña" className="text-black/50 text-[11px] hover:text-ocean-blue transition-colors tracking-wide">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Submit Button */}
          <div className="mt-10">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#BFA58E] text-white text-[11px] font-bold tracking-[0.3em] uppercase py-4 px-12 rounded-full shadow-[0_15px_40px_rgba(191,165,142,0.3)] border border-white/20 active:scale-95 transition-all hover:bg-[#A68B6F] hover:shadow-[0_20px_50px_rgba(191,165,142,0.4)] hover:-translate-y-1 disabled:opacity-50"
            >
              {loading ? 'INICIANDO...' : 'INICIAR SESIÓN'}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-auto pt-10 text-center">
          <p className="text-black/40 text-[9px] uppercase tracking-[0.15em] leading-loose">
            Al continuar, aceptas nuestros <br/>
            <Link href="#" className="underline decoration-[#CEB49D]/40 underline-offset-8">Términos de Servicio</Link>
            <span className="mx-1">&</span>
            <Link href="#" className="underline decoration-[#CEB49D]/40 underline-offset-8">Privacidad</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
