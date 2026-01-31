'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/base/button'
import { Input } from '@/components/ui/base/input'
import { Label } from '@/components/ui/base/label'
import { useToast } from '@/components/ui/base/use-toast'
import { ArrowLeft, Camera, Loader2, LogOut } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    avatar_url: '',
  })
  const [email, setEmail] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      setEmail(user.email || '')

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, phone, avatar_url')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      setProfile({
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
        avatar_url: profileData.avatar_url || '',
      })
      
      if (profileData.avatar_url) {
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(profileData.avatar_url)
        setAvatarPreview(publicUrl)
      }

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error al cargar datos',
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setUpdating(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let avatar_url = profile.avatar_url

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const filePath = `${user.id}-${Math.random()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile)

        if (uploadError) throw uploadError
        avatar_url = filePath
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          avatar_url,
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Actualizar email si cambió
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email })
        if (emailError) throw emailError
        toast({
          title: 'Email actualizado',
          description: 'Por favor verifica tu nuevo correo electrónico.',
        })
      }

      toast({
        title: 'Perfil actualizado',
        description: 'Tus cambios han sido guardados exitosamente.',
      })
      
      loadUserData()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error al actualizar',
        description: error.message,
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#CEB49D]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-light text-black font-sans max-w-md mx-auto flex flex-col relative pb-12 pt-12 px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <Link href="/student" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/40 border border-white/60 text-black/40 hover:text-black transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="serif-title text-2xl italic">Ajustes</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-8">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-200">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#CEB49D]/20 text-[#CEB49D] text-4xl serif-title italic">
                  {profile.full_name.charAt(0)}
                </div>
              )}
            </div>
            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 w-10 h-10 bg-[#CEB49D] text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-[#BFA58E] transition-colors border-2 border-white">
              <Camera className="h-5 w-5" />
              <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <p className="text-[10px] tracking-[0.2em] uppercase mt-4 text-[#CEB49D] font-bold text-center">Foto de Perfil</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-[0.2em] text-black/40 font-bold ml-1">Nombre Completo</Label>
            <Input 
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="bg-white/40 border-white/60 rounded-2xl h-14 px-6 focus:ring-[#CEB49D] focus:border-[#CEB49D]"
              placeholder="Tu nombre"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-[0.2em] text-black/40 font-bold ml-1">Teléfono</Label>
            <Input 
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="bg-white/40 border-white/60 rounded-2xl h-14 px-6 focus:ring-[#CEB49D] focus:border-[#CEB49D]"
              placeholder="+57..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-[0.2em] text-black/40 font-bold ml-1">Correo Electrónico</Label>
            <Input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/40 border-white/60 rounded-2xl h-14 px-6 focus:ring-[#CEB49D] focus:border-[#CEB49D]"
              placeholder="nombre@ejemplo.com"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button 
            type="submit"
            disabled={updating}
            className="w-full py-5 bg-[#BFA58E] text-white font-bold tracking-[0.3em] text-[10px] uppercase shadow-[0_15px_40px_rgba(191,165,142,0.3)] border border-white/20 active:scale-95 transition-all hover:bg-[#A68B6F] hover:shadow-[0_20px_50px_rgba(191,165,142,0.4)] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center rounded-full"
          >
            {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Guardar Cambios
          </button>
        </div>
      </form>

      {/* Logout Button */}
      <div className="mt-8 pt-8 border-t border-black/5">
        <button
          onClick={handleLogout}
          className="w-full py-4 px-6 border border-red-200 text-red-500 rounded-2xl text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-red-50 transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>

      <p className="text-center text-[9px] text-black/20 tracking-[0.2em] uppercase font-bold mt-12">Wave Wellness • Santa Marta</p>
    </div>
  )
}
