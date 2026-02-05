'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/base/use-toast'
import { ArrowLeft, CheckCircle2, XCircle, Loader2, ZoomIn, X, Bell, User, Image as ImageIcon, Verified, Search } from 'lucide-react'
import { approvePayment, rejectPayment } from './actions'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

type Payment = {
  id: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  proof_path: string | null
  created_at: string
  package_name: string
  package_credits: number | null
  profiles: {
    full_name: string
    avatar_url: string | null
  }
}

export default function AdminPaymentsPage() {
  const { toast } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedProof, setSelectedProof] = useState<{ url: string, name: string } | null>(null)
  const [proofUrls, setProofUrls] = useState<Record<string, string>>({})
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadPayments()
  }, [])

  useEffect(() => {
    if (payments.length > 0) {
      loadProofUrls()
    }
  }, [payments])

  const loadProofUrls = async () => {
    const urls: Record<string, string> = {}
    for (const payment of payments) {
      if (payment.proof_path && payment.status === 'pending') {
        const url = await getProofUrl(payment.proof_path)
        if (url) {
          urls[payment.id] = url
        }
      }
    }
    setProofUrls(urls)
  }

  const getProofUrl = async (path: string) => {
    const supabase = createClient()
    const { data, error } = await supabase.storage.from('payment-proofs').createSignedUrl(path, 3600)
    if (error) {
      console.error('Error creating signed URL:', error)
      return null
    }
    return data.signedUrl
  }

  const loadPayments = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          status,
          proof_path,
          created_at,
          package_name,
          package_credits,
          profiles:student_id (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPayments((data as any) || [])
    } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
        description: 'No se pudieron cargar los pagos',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id)
      const result = await approvePayment(id) as any
      if (result.success) {
        toast({ title: 'Pago aprobado', description: 'Los créditos han sido asignados.' })
        loadPayments()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message })
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id: string) => {
    try {
      setProcessingId(id)
      const result = await rejectPayment(id) as any
      if (result.success) {
        toast({ title: 'Pago rechazado', description: 'El estado del pago ha sido actualizado.' })
      loadPayments()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message })
    } finally {
      setProcessingId(null)
    }
  }

  const getAvatarUrl = (path: string | null) => {
    if (!path) return null
    const supabase = createClient()
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return data.publicUrl
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) {
      return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true })
    }
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
  }

  const pendingCount = payments.filter(p => p.status === 'pending').length
  const todayTotal = payments
    .filter(p => p.status === 'approved' && new Date(p.created_at).toDateString() === new Date().toDateString())
    .reduce((acc, p) => acc + p.amount, 0)

  const filteredPayments = payments.filter(p => 
    p.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#F6F1EE] text-black font-sans max-w-md mx-auto flex flex-col relative pb-32">
      {/* Header */}
      <header className="pt-14 pb-6 px-6 sticky top-0 bg-[#F6F1EE]/80 backdrop-blur-md z-30 flex items-center justify-between border-b border-black/5">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/40 border border-white/60 text-[#0A517F] hover:text-black transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <h1 className="text-[#0A517F] serif-title text-2xl font-normal tracking-tight">Verificación de Pagos</h1>
        </div>
        <div className="relative">
          <Bell className="h-6 w-6 text-[#0A517F]/40" />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-400 rounded-full border-2 border-[#F6F1EE]"></span>
          )}
        </div>
      </header>

      <main className="flex-1 px-6 space-y-6 pt-6">
        {/* Stats */}
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          <div className="bg-white/60 p-4 rounded-2xl min-w-[140px] border border-white/80 shadow-sm backdrop-blur-sm">
            <p className="text-[9px] font-bold tracking-widest uppercase opacity-40">Pendientes</p>
            <p className="text-xl serif-title text-[#0A517F] italic">{pendingCount} Recibos</p>
          </div>
          <div className="bg-white/60 p-4 rounded-2xl min-w-[140px] border border-white/80 shadow-sm backdrop-blur-sm">
            <p className="text-[9px] font-bold tracking-widest uppercase opacity-40">Hoy</p>
            <p className="text-xl serif-title text-[#0A517F] italic">{formatPrice(todayTotal)}</p>
          </div>
      </div>

        {/* Search Bar */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#CEB49D] group-focus-within:text-[#0A517F] transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre de alumna..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/60 backdrop-blur-sm border border-white/80 rounded-2xl py-3.5 pl-11 pr-4 text-sm placeholder:text-black/20 focus:outline-none focus:ring-2 focus:ring-[#0A517F]/10 focus:bg-white transition-all shadow-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-4 flex items-center text-black/20 hover:text-black transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Payments List */}
        <div className="space-y-4">
      {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#CEB49D]" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-20 bg-white/40 rounded-[2rem] border border-white/60">
              <p className="serif-title text-xl text-black/40 italic">
                {searchQuery ? 'No se encontraron resultados' : 'No hay pagos registrados'}
              </p>
                          </div>
          ) : (
            filteredPayments.map((payment) => (
              <div 
                key={payment.id} 
                className={cn(
                  "rounded-[2rem] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white relative overflow-hidden transition-all",
                  payment.status === 'pending' ? "bg-white/80" : "bg-white/40 opacity-70"
                )}
              >
                {/* Status Overlay for Approved/Rejected */}
                {payment.status !== 'pending' && (
                  <div className={cn(
                    "absolute inset-0 flex items-center justify-center pointer-events-none z-10 backdrop-blur-[1px]",
                    payment.status === 'approved' ? "bg-green-500/5" : "bg-red-500/5"
                  )}>
                    <div className="flex flex-col items-center animate-in zoom-in duration-300">
                      {payment.status === 'approved' ? (
                            <>
                          <Verified className="h-10 w-10 text-green-600" />
                          <p className="text-[9px] font-bold tracking-[0.2em] text-green-600 uppercase mt-2">
                            Aprobado +{payment.package_credits || 0} Créditos
                          </p>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-10 w-10 text-red-500" />
                          <p className="text-[9px] font-bold tracking-[0.2em] text-red-500 uppercase mt-2">Rechazado</p>
                            </>
                          )}
                        </div>
            </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#CEB49D]/20 bg-white">
                      {payment.profiles?.avatar_url ? (
                        <img 
                          src={getAvatarUrl(payment.profiles.avatar_url)!} 
                          alt={payment.profiles.full_name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#CEB49D]/10 text-[#CEB49D]">
                          <User className="h-6 w-6" />
                    </div>
                      )}
                    </div>
                    <div>
                      <h3 className="serif-title text-lg text-[#0A517F] leading-tight italic">{payment.profiles?.full_name || 'Estudiante'}</h3>
                      <p className="text-[10px] font-bold tracking-wider text-[#CEB49D] uppercase">{payment.package_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#0A517F] serif-title text-xl italic">{formatPrice(payment.amount)}</p>
                    <p className="text-[9px] opacity-40 font-bold uppercase">{formatTime(payment.created_at)}</p>
                  </div>
                    </div>

                {/* Proof Preview */}
                {payment.proof_path && payment.status === 'pending' ? (
                  <button 
                    onClick={() => setSelectedProof({ 
                      url: proofUrls[payment.id], 
                      name: payment.profiles?.full_name || 'Comprobante' 
                    })}
                    className="w-full aspect-video rounded-2xl overflow-hidden bg-white border border-[#CEB49D]/20 mb-4 group relative shadow-inner"
                  >
                    {proofUrls[payment.id] ? (
                      <img 
                        src={proofUrls[payment.id]} 
                        alt="Comprobante" 
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          console.error('Image Load Error:', e);
                          (e.target as HTMLImageElement).src = 'https://placehold.co/400x225?text=Error+al+cargar+imagen';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-[#CEB49D]/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/5 transition-colors">
                      <ZoomIn className="h-6 w-6 text-[#0A517F]/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ) : payment.proof_path && payment.status !== 'pending' ? (
                  <div className="w-full h-4 mb-4" />
                ) : (
                  <div className="w-full py-8 rounded-2xl bg-black/5 border border-dashed border-black/10 mb-4 flex flex-col items-center justify-center gap-2">
                    <ImageIcon className="h-6 w-6 text-black/20" />
                    <p className="text-[10px] font-bold text-black/20 uppercase tracking-widest">Sin comprobante</p>
                  </div>
                      )}

                {/* Actions */}
                      {payment.status === 'pending' && (
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleReject(payment.id)}
                      disabled={processingId === payment.id}
                      className="flex items-center justify-center gap-2 py-3 px-4 border border-[#6D4E38] rounded-xl text-[#6D4E38] text-[11px] font-bold uppercase tracking-widest hover:bg-[#6D4E38]/5 transition-colors disabled:opacity-50"
                    >
                      {processingId === payment.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Rechazar'}
                    </button>
                    <button 
                      onClick={() => handleApprove(payment.id)}
                      disabled={processingId === payment.id}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-[#0A517F] rounded-xl text-white text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-[#0A517F]/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {processingId === payment.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                            Aprobar
                        </>
                      )}
                    </button>
                    </div>
                )}
            </div>
            ))
          )}
        </div>
      </main>

      {/* Proof Modal */}
      {selectedProof && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
          <button 
            onClick={() => setSelectedProof(null)}
            className="absolute top-12 right-6 text-white/60 hover:text-white transition-colors"
          >
            <X className="h-8 w-8" />
          </button>
          <div className="w-full max-w-lg flex flex-col items-center">
            <img 
              src={selectedProof.url} 
              alt="Receipt Full" 
              className="w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
            />
            <div className="mt-8 text-center text-white">
              <h4 className="serif-title text-2xl italic">Comprobante {selectedProof.name}</h4>
              <p className="text-[10px] tracking-[0.2em] uppercase opacity-40 font-bold mt-2">Verificación de Pago</p>
                  </div>
                    </div>
                  </div>
                )}
    </div>
  )
}
