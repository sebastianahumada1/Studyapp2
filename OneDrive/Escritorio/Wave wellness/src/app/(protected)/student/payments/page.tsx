'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/base/button'
import { Input } from '@/components/ui/base/input'
import { Label } from '@/components/ui/base/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/base/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/base/dialog'
import { useToast } from '@/components/ui/base/use-toast'
import { validateFile, generateStoragePath, formatFileSize, MAX_FILE_SIZE } from '@/lib/validations/payments'
import { ArrowLeft, Check, CheckCircle2, Upload, Loader2, Clock, XCircle, CreditCard, History, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type Package = {
  id: string
  name: string
  credits: number | null
  price: number
  active: boolean
  validity_days: number
}

type Payment = {
  id: string
  package_name: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  proof_path: string | null
  created_at: string
  package_validity_days: number | null
}

export default function StudentPaymentsPage() {
  const { toast } = useToast()
  const [packages, setPackages] = useState<Package[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loadingPackages, setLoadingPackages] = useState(true)
  const [loadingPayments, setLoadingPayments] = useState(true)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    loadPackages()
    loadPayments()
  }, [])

  const loadPackages = async () => {
    try {
      setLoadingPackages(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('active', true)
        .order('price', { ascending: true })

      if (error) throw error
      setPackages(data || [])
    } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar los planes',
      })
    } finally {
      setLoadingPackages(false)
    }
  }

  const loadPayments = async () => {
    try {
      setLoadingPayments(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('payments')
        .select('id, package_name, amount, status, proof_path, created_at, package_validity_days')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPayments(data || [])
    } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar los pagos',
      })
    } finally {
      setLoadingPayments(false)
    }
  }

  const handlePayPackage = (pkg: Package) => {
    setSelectedPackage(pkg)
    setIsUploadDialogOpen(true)
  }

  const handleUpload = async () => {
    if (!selectedFile || (!currentPaymentId && !selectedPackage)) return

    try {
      setUploading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let paymentId = currentPaymentId

      // 1. Si no hay paymentId, es una compra nueva, crear el registro primero
      if (!paymentId && selectedPackage) {
        const { data: payment, error: insertError } = await supabase
        .from('payments')
        .insert({
          student_id: user.id,
            package_id: selectedPackage.id,
            package_name: selectedPackage.name,
            package_credits: selectedPackage.credits,
            amount: selectedPackage.price,
            package_validity_days: selectedPackage.validity_days,
          status: 'pending',
        })
        .select()
        .single()

        if (insertError) throw insertError
        paymentId = payment.id
      }

      if (!paymentId) throw new Error('No se pudo determinar el ID del pago')

      // 2. Generar path y subir a Storage
      const storagePath = generateStoragePath(user.id, paymentId, selectedFile.name)

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(storagePath, selectedFile, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      // 3. Update proof_path en el registro de pago
      const { error: updateError } = await supabase
        .from('payments')
        .update({ proof_path: storagePath })
        .eq('id', paymentId)

      if (updateError) throw updateError

      toast({
        title: 'Comprobante enviado',
        description: 'Tu solicitud ha sido creada y será revisada por un administrador.',
      })

      setIsUploadDialogOpen(false)
      setSelectedFile(null)
      setCurrentPaymentId(null)
      setSelectedPackage(null)
      loadPayments()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Ocurrió un error al procesar el pago',
      })
    } finally {
      setUploading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status: Payment['status']) => {
    const badges = {
      pending: { label: 'Pendiente', color: 'text-yellow-600 bg-yellow-50', icon: Clock },
      approved: { label: 'Aprobado', color: 'text-green-600 bg-green-50', icon: CheckCircle2 },
      rejected: { label: 'Rechazado', color: 'text-red-600 bg-red-50', icon: XCircle },
    }
    const badge = badges[status]
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge.color}`}>
        <Icon className="h-3 w-3" />
        {badge.label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-background-light text-black font-sans max-w-md mx-auto flex flex-col relative pb-12">
      {/* Navigation */}
      <nav className="pt-12 px-6 flex items-center justify-between">
        <Link href="/student">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/40 border border-white/60 text-black/40 hover:text-black transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/40 border border-white/60 text-black/40 hover:text-black transition-colors"
        >
          <History className="h-5 w-5" />
        </button>
      </nav>

      {/* Header */}
      <header className="pt-6 pb-8 flex flex-col items-center text-center px-6">
        <h1 className="text-black serif-title text-3xl font-normal tracking-tight">
          {showHistory ? 'Mis Pagos' : 'Adquirir Paquetes'}
        </h1>
        <p className="text-[10px] tracking-[0.3em] uppercase mt-2 text-[#CEB49D] font-bold italic">
          {showHistory ? 'Tu historial de flujo' : 'Find your flow'}
        </p>
      </header>

      <main className="flex-1 px-6 space-y-5">
        {showHistory ? (
          /* Historial de Pagos */
          <div className="space-y-4">
        {loadingPayments ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#CEB49D]" />
              </div>
        ) : payments.length === 0 ? (
              <div className="text-center py-12 bg-white/40 rounded-[32px] border border-white/60">
                <CreditCard className="h-12 w-12 mx-auto text-black/10 mb-4" />
                <p className="text-sm text-black/40 italic">No tienes pagos registrados</p>
              </div>
            ) : (
              payments.map((payment) => (
                <div key={payment.id} className="bg-white rounded-[32px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/80">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-sans font-semibold text-[10px] tracking-wider uppercase text-black/40">
                        {payment.package_name}
                      </h3>
                      <p className="serif-title text-xl mt-1">{formatPrice(payment.amount)}</p>
              </div>
                    <div className="text-right">
                      <p className="text-[10px] text-black/30 font-medium mb-2">{formatDate(payment.created_at)}</p>
                        {getStatusBadge(payment.status)}
                      </div>
                      </div>
                      {payment.status === 'pending' && !payment.proof_path && (
                    <button 
                      onClick={() => {
                        setCurrentPaymentId(payment.id)
                        setIsUploadDialogOpen(true)
                      }}
                      className="w-full py-3 bg-[#BFA58E] text-white font-bold text-[10px] tracking-[0.2em] uppercase rounded-2xl hover:bg-[#A68B6F] transition-all flex items-center justify-center gap-2"
                        >
                      <Upload className="h-3 w-3" />
                      Subir Comprobante
                    </button>
                      )}
              </div>
              ))
        )}
          </div>
        ) : (
          /* Lista de Paquetes */
          <>
            {loadingPackages ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#CEB49D]" />
              </div>
            ) : packages.length === 0 ? (
              <div className="text-center py-12 bg-white/40 rounded-[32px] border border-white/60">
                <p className="text-sm text-black/40 italic">No hay planes disponibles en este momento</p>
              </div>
            ) : (
              packages.map((pkg, index) => {
                const isPopular = pkg.credits && pkg.credits >= 30
                return (
                  <div 
                    key={pkg.id} 
                    className={`package-card rounded-[32px] p-6 relative overflow-hidden ${
                      isPopular 
                        ? 'bg-[#D0E1F5]/30 border-2 border-[#0A517F]/10 p-7 shadow-[0_10px_30px_rgba(10,81,127,0.06)] scale-[1.02]' 
                        : 'bg-white border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute top-4 right-6">
                        <span className="bg-[#CEB49D] text-white text-[8px] font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-full">Popular</span>
                </div>
              )}
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className={`font-sans font-semibold text-xs tracking-wider uppercase ${isPopular ? 'text-[#0A517F]' : 'opacity-60'}`}>
                          {pkg.name}
                        </h3>
                        <p className={`serif-title mt-1 ${isPopular ? 'text-4xl' : 'text-3xl'}`}>
                          {formatPrice(pkg.price)}
              </p>
            </div>
                    </div>

                    <ul className="space-y-2 mb-6">
                      <li className={`flex items-center gap-2 text-[11px] font-medium ${isPopular ? 'text-[#0A517F]/80' : 'text-black/60'}`}>
                        {isPopular ? <CheckCircle2 className="h-4 w-4" /> : <Check className="h-3.5 w-3.5" />}
                        Vigencia de {pkg.validity_days} días
                      </li>
                      <li className={`flex items-center gap-2 text-[11px] font-medium ${isPopular ? 'text-[#0A517F]/80' : 'text-black/60'}`}>
                        {isPopular ? <CheckCircle2 className="h-4 w-4" /> : <Check className="h-3.5 w-3.5" />}
                        {pkg.credits ? `${pkg.credits} clases incluidas` : 'Clases ilimitadas'}
                      </li>
                      {isPopular && (
                        <li className="flex items-center gap-2 text-[11px] font-medium text-[#0A517F]/80">
                          <CheckCircle2 className="h-4 w-4" />
                          Prioridad en lista de espera
                        </li>
                      )}
                    </ul>

                    <button 
                      onClick={() => handlePayPackage(pkg)}
                      className={`w-full py-4 font-bold text-[10px] tracking-[0.2em] uppercase rounded-2xl transition-all active:scale-[0.98] ${
                        isPopular 
                          ? 'bg-[#0A517F] text-white shadow-lg shadow-[#0A517F]/20 hover:brightness-110' 
                          : 'bg-[#D0E1F5]/50 text-[#0A517F] hover:bg-[#D0E1F5]'
                      }`}
                    >
                      Seleccionar
                    </button>
                  </div>
                )
              })
            )}
          </>
        )}
      </main>

      {/* Dialog: Pago y Comprobante */}
      <Dialog 
        open={isUploadDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setIsUploadDialogOpen(false)
            setSelectedFile(null)
            setCurrentPaymentId(null)
            setSelectedPackage(null)
          }
        }}
      >
        <DialogContent className="max-w-[360px] p-0 bg-[#F6F1EE] border-none overflow-hidden rounded-[40px] [&>button]:hidden">
          <div className="relative flex flex-col items-center p-6 pt-10">
            <DialogTitle className="sr-only">Confirmar Pago y Subir Comprobante</DialogTitle>
            <DialogDescription className="sr-only">
              Información de cuenta bancaria y formulario para subir el comprobante de pago.
            </DialogDescription>
            <button 
                onClick={() => {
                  setIsUploadDialogOpen(false)
                  setSelectedFile(null)
                  setCurrentPaymentId(null)
                setSelectedPackage(null)
              }}
              className="absolute top-5 right-5 text-black/20 hover:text-black transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <header className="flex flex-col items-center gap-2 mb-8">
              <div className="flex items-center justify-center">
                <Image 
                  src="/images/wave-logo-isotipo.png" 
                  alt="Wave Isotipo" 
                  width={50} 
                  height={50} 
                  className="h-10 w-auto object-contain"
                />
              </div>
              <h2 className="text-black text-[9px] font-bold uppercase tracking-[0.4em] leading-tight">
                Wave Wellness
              </h2>
            </header>

            {/* Message */}
            <div className="text-center mb-6 px-2">
              <h3 className="serif-title text-xl text-black mb-3 italic">🌊 Wave Club</h3>
              <p className="text-black/60 text-[11px] leading-relaxed">
                Sabemos que a veces los planes cambian, pero en Wave cuidamos mucho el tiempo y el compromiso de cada una de ustedes ✨
              </p>
            </div>

            {/* Bank Info */}
            <div className="w-full bg-white/40 backdrop-blur-sm rounded-[28px] p-6 border border-white/60 text-center mb-6">
              <p className="text-black/40 text-[8px] font-bold uppercase tracking-[0.2em] mb-3">Nuestra Cuenta</p>
              <h4 className="serif-title text-2xl text-[#0A517F] mb-1.5 tracking-wider">78100005805</h4>
              <p className="text-black/60 text-[10px] font-medium uppercase tracking-widest mb-0.5">Ahorros Bancolombia</p>
              <p className="text-black/80 text-[11px] font-bold">WAVE S.A.S</p>
            </div>

            {/* Price & Package */}
            <div className="text-center mb-8">
              <h1 className="text-black text-[36px] serif-title leading-none italic">
                ${(selectedPackage?.price || payments.find(p => p.id === currentPaymentId)?.amount || 0).toLocaleString('es-CO')}
              </h1>
              <p className="text-[#CEB49D] font-bold text-[9px] uppercase tracking-[0.2em] mt-2">
                {selectedPackage?.name || payments.find(p => p.id === currentPaymentId)?.package_name}
              </p>
            </div>

            {/* Upload Section */}
            <div className="w-full px-2 mb-8">
              <label className="group relative flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-[#CEB49D]/30 rounded-[28px] bg-white/20 hover:bg-white/40 transition-all cursor-pointer overflow-hidden">
                {selectedFile ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                    <p className="text-[9px] font-bold text-black/60 uppercase tracking-wider truncate max-w-[180px]">
                      {selectedFile.name}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <Upload className="h-6 w-6 text-[#CEB49D]" />
                    <p className="text-[9px] font-bold text-[#CEB49D] uppercase tracking-wider">Subir Comprobante</p>
                  </div>
                )}
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const validation = validateFile(file)
                      if (!validation.valid) {
                        toast({ variant: 'destructive', title: 'Archivo inválido', description: validation.error })
                        setSelectedFile(null)
                        return
                      }
                      setSelectedFile(file)
                    }
                  }}
                />
              </label>
            </div>

            {/* Action */}
            <button 
                onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="w-full py-4 bg-[#BFA58E] text-white font-bold tracking-[0.3em] text-[9px] uppercase shadow-[0_12px_30px_rgba(191,165,142,0.25)] hover:bg-[#A68B6F] hover:shadow-[0_15px_40px_rgba(191,165,142,0.35)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
              >
              {uploading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Confirmar Envío'
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

