'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/base/dialog'
import { Button } from '@/components/ui/base/button'
import { Label } from '@/components/ui/base/label'
import { createSlot } from './actions'
import { useToast } from '@/components/ui/base/use-toast'
import { Loader2 } from 'lucide-react'

interface AddSlotDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDay: string // "lunes", "martes", etc.
  onSuccess: () => void
}

// Generar opciones de hora (6:00 - 20:00, cada 30 min)
const generateTimeOptions = () => {
  const options: string[] = []
  for (let hour = 6; hour <= 20; hour++) {
    options.push(`${hour.toString().padStart(2, '0')}:00`)
    if (hour < 20) {
      options.push(`${hour.toString().padStart(2, '0')}:30`)
    }
  }
  return options
}

const timeOptions = generateTimeOptions()

// Mapeo de días a números (Lunes=1, Martes=2, ..., Domingo=7)
const dayToNumber: Record<string, number> = {
  lunes: 1,
  martes: 2,
  miércoles: 3,
  jueves: 4,
  viernes: 5,
  sábado: 6,
  domingo: 7,
}

// Obtener próxima fecha del día seleccionado
function getNextDateForDay(dayName: string): Date {
  const dayNumber = dayToNumber[dayName.toLowerCase()]
  if (!dayNumber) {
    return new Date() // Fallback a hoy
  }

  const today = new Date()
  const currentDay = today.getDay() // 0=Domingo, 1=Lunes, ...
  const targetDay = dayNumber === 7 ? 0 : dayNumber // Convertir Domingo de 7 a 0

  // Calcular días hasta el próximo día objetivo
  let daysUntilTarget = targetDay - currentDay
  if (daysUntilTarget <= 0) {
    daysUntilTarget += 7 // Si ya pasó, ir a la próxima semana
  }

  const nextDate = new Date(today)
  nextDate.setDate(today.getDate() + daysUntilTarget)
  nextDate.setHours(0, 0, 0, 0) // Resetear hora

  return nextDate
}

export function AddSlotDialog({ open, onOpenChange, selectedDay, onSuccess }: AddSlotDialogProps) {
  const { toast } = useToast()
  const [selectedTime, setSelectedTime] = useState<string>('09:00')
  const [loading, setLoading] = useState(false)

  // Calcular fecha automática
  const slotDate = getNextDateForDay(selectedDay)
  const dayName = selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)

  // Calcular hora de fin (selectedTime + 1 hora)
  const calculateEndTime = (startTime: string): string => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const endDate = new Date(slotDate)
    endDate.setHours(hours + 1, minutes, 0, 0)
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`
  }

  const endTime = calculateEndTime(selectedTime)

  // Formatear fecha para mostrar
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleSubmit = async () => {
    if (!selectedTime) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Por favor selecciona una hora.',
      })
      return
    }

    setLoading(true)

    try {
      // Construir datetime ISO
      const [hours, minutes] = selectedTime.split(':').map(Number)
      const slotDateTime = new Date(slotDate)
      slotDateTime.setHours(hours, minutes, 0, 0)

      // Convertir a ISO string (con timezone local)
      const isoString = slotDateTime.toISOString()

      const result = await createSlot(isoString)

      if (result.success) {
        toast({
          title: '¡Bloque creado!',
          description: `Bloque de 1 hora creado exitosamente para ${dayName}.`,
        })
        onSuccess()
        onOpenChange(false)
        // Resetear formulario
        setSelectedTime('09:00')
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        })
      }
    } catch (error) {
      console.error('Error al crear slot:', error)
      toast({
        variant: 'destructive',
        title: 'Error inesperado',
        description: 'Ocurrió un error al crear el bloque. Por favor intenta de nuevo.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Agregar Bloque 1h</DialogTitle>
          <DialogDescription className="text-base">
            Selecciona la hora de inicio para el bloque de disponibilidad
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Fecha automática (solo lectura) */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-base">
              Fecha
            </Label>
            <div className="text-base font-medium text-foreground">
              {formatDate(slotDate)}
            </div>
            <p className="text-sm text-muted-foreground">
              Próxima fecha de {dayName}
            </p>
          </div>

          {/* Selector de hora */}
          <div className="space-y-2">
            <Label htmlFor="time" className="text-base">
              Hora de inicio
            </Label>
            <select
              id="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="flex h-14 w-full rounded-md border border-input bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          {/* Resumen */}
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm font-medium text-muted-foreground mb-1">Resumen del bloque:</p>
            <p className="text-base font-semibold text-foreground">
              {formatDate(slotDate)} • {selectedTime} - {endTime}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="text-base h-14"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={handleSubmit}
            disabled={loading}
            className="text-base h-14"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creando...
              </>
            ) : (
              'Crear Bloque'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
