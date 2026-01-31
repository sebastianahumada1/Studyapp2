'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/base/card'
import { Button } from '@/components/ui/base/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/base/dialog'
import { useToast } from '@/components/ui/base/use-toast'
import { cancelBooking } from './actions'
import { Calendar, Clock, User, XCircle, CheckCircle2, AlertCircle, Loader2, Trash2 } from 'lucide-react'

type Booking = {
  id: string
  status: 'booked' | 'cancelled' | 'attended' | 'no_show'
  created_at: string
  cancelled_at: string | null
  starts_at: string
  ends_at: string
  coach_name: string
  coach_id: string
}

interface StudentBookingsClientProps {
  bookings: Booking[]
}

export function StudentBookingsClient({ bookings }: StudentBookingsClientProps) {
  const { toast } = useToast()
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Bogota',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Bogota',
    })
  }

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'booked':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <Calendar className="h-4 w-4 mr-1" />
            Reservada
          </span>
        )
      case 'attended':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Asistió
          </span>
        )
      case 'no_show':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <AlertCircle className="h-4 w-4 mr-1" />
            No asistió
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            <XCircle className="h-4 w-4 mr-1" />
            Cancelada
          </span>
        )
      default:
        return null
    }
  }

  // Verificar si se puede cancelar (status='booked' y faltan >= 24 horas)
  const canCancel = (booking: Booking): boolean => {
    if (booking.status !== 'booked') {
      return false
    }

    const slotStart = new Date(booking.starts_at)
    const now = new Date()
    const hoursUntilStart = (slotStart.getTime() - now.getTime()) / (1000 * 60 * 60)

    return hoursUntilStart >= 24
  }

  // Obtener mensaje de por qué no se puede cancelar
  const getCancelMessage = (booking: Booking): string | null => {
    if (booking.status !== 'booked') {
      return 'Esta reserva ya fue cancelada o completada.'
    }

    const slotStart = new Date(booking.starts_at)
    const now = new Date()
    const hoursUntilStart = (slotStart.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilStart < 24) {
      const hours = Math.floor(hoursUntilStart)
      const minutes = Math.floor((hoursUntilStart - hours) * 60)
      return `Solo puedes recuperar tu crédito si cancelas con al menos 24 horas de anticipación. Faltan ${hours}h ${minutes}m.`
    }

    return null
  }

  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking)
    setConfirmDialogOpen(true)
  }

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return

    setCancellingId(selectedBooking.id)

    try {
      const result = await cancelBooking(selectedBooking.id)

      if (result.success) {
        toast({
          title: 'Reserva cancelada',
          description: 'Tu reserva ha sido cancelada exitosamente.',
        })

        setConfirmDialogOpen(false)
        setSelectedBooking(null)
        // Recargar página para actualizar lista
        window.location.reload()
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        })
      }
    } catch (error) {
      console.error('Error al cancelar reserva:', error)
      toast({
        variant: 'destructive',
        title: 'Error inesperado',
        description: 'Ocurrió un error al cancelar la reserva. Por favor intenta de nuevo.',
      })
    } finally {
      setCancellingId(null)
    }
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-base text-muted-foreground mb-2">
            No tienes reservas
          </p>
          <p className="text-sm text-muted-foreground">
            Cuando reserves una clase, aparecerá aquí.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {bookings.map((booking) => {
          const canCancelBooking = canCancel(booking)
          const cancelMessage = getCancelMessage(booking)
          const isCancelling = cancellingId === booking.id

          return (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-primary" />
                        <span className="text-lg font-semibold">
                          {formatTime(booking.starts_at)} - {formatTime(booking.ends_at)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <span className="text-base">{formatDate(booking.starts_at)}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <span className="text-base">{booking.coach_name}</span>
                      </div>

                      <div className="mt-2">{getStatusBadge(booking.status)}</div>
                    </div>
                  </div>

                  {canCancelBooking && (
                    <div className="pt-2 border-t border-border">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full text-base h-14"
                        disabled={isCancelling}
                        onClick={() => handleCancelClick(booking)}
                      >
                        {isCancelling ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Cancelando...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-2 h-5 w-5" />
                            Cancelar Reserva
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {!canCancelBooking && cancelMessage && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground">{cancelMessage}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">¿Cancelar reserva?</DialogTitle>
            <DialogDescription className="text-base">
              Al cancelar con al menos 24 horas de anticipación, se te devolverá el crédito utilizado. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-2 py-4">
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <p className="text-sm font-medium text-muted-foreground mb-1">Reserva:</p>
                <p className="text-base font-semibold text-foreground">
                  {formatDate(selectedBooking.starts_at)}
                </p>
                <p className="text-base text-foreground">
                  {formatTime(selectedBooking.starts_at)} - {formatTime(selectedBooking.ends_at)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Coach: {selectedBooking.coach_name}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => {
                setConfirmDialogOpen(false)
                setSelectedBooking(null)
              }}
              disabled={!!cancellingId}
              className="text-base h-14"
            >
              No, mantener
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="lg"
              onClick={handleConfirmCancel}
              disabled={!!cancellingId}
              className="text-base h-14"
            >
              {!!cancellingId ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Cancelando...
                </>
              ) : (
                'Sí, cancelar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
