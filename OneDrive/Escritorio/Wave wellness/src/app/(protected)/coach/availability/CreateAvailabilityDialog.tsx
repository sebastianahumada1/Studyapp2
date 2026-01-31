'use client'

import { useState, useEffect } from 'react'
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
import { createMultipleSlots } from './actions'
import { useToast } from '@/components/ui/base/use-toast'
import { Loader2, Calendar, Clock, CheckSquare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/base/card'

interface CreateAvailabilityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

// Días de la semana
const daysOfWeek = [
  { value: 1, label: 'Lunes', short: 'Lun' },
  { value: 2, label: 'Martes', short: 'Mar' },
  { value: 3, label: 'Miércoles', short: 'Mié' },
  { value: 4, label: 'Jueves', short: 'Jue' },
  { value: 5, label: 'Viernes', short: 'Vie' },
  { value: 6, label: 'Sábado', short: 'Sáb' },
  { value: 7, label: 'Domingo', short: 'Dom' },
]

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

export function CreateAvailabilityDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateAvailabilityDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // Estado del formulario
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [startTime, setStartTime] = useState<string>('09:00')
  const [endTime, setEndTime] = useState<string>('10:00')
  const [selectedDays, setSelectedDays] = useState<number[]>([])

  // Inicializar fechas (hoy y 30 días después)
  useEffect(() => {
    if (!startDate || !endDate) {
      const today = new Date()
      const nextMonth = new Date(today)
      nextMonth.setDate(today.getDate() + 30)

      const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0]
      }

      if (!startDate) setStartDate(formatDate(today))
      if (!endDate) setEndDate(formatDate(nextMonth))
    }
  }, [])

  // Calcular cantidad de bloques que se crearán
  const calculateBlocks = () => {
    if (!startDate || !endDate || !startTime || !endTime || selectedDays.length === 0) {
      return { totalBlocks: 0, blocksPerDay: 0 }
    }

    // Calcular horas entre startTime y endTime
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const durationMinutes = endMinutes - startMinutes
    const blocksPerDay = Math.floor(durationMinutes / 60) // Bloques de 1 hora

    if (blocksPerDay <= 0) return { totalBlocks: 0, blocksPerDay: 0 }

    // Calcular días en el rango
    const start = new Date(startDate)
    const end = new Date(endDate)
    const daysInRange: number[] = []

    // Obtener día de la semana para cada fecha en el rango
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay() // 0=Domingo, 1=Lunes, ..., 6=Sábado
      const normalizedDay = dayOfWeek === 0 ? 7 : dayOfWeek // Convertir Domingo de 0 a 7
      if (selectedDays.includes(normalizedDay)) {
        daysInRange.push(normalizedDay)
      }
    }

    const totalDays = daysInRange.length
    const totalBlocks = totalDays * blocksPerDay

    return { totalBlocks, blocksPerDay, totalDays }
  }

  const { totalBlocks, blocksPerDay, totalDays } = calculateBlocks()

  // Toggle día seleccionado
  const toggleDay = (day: number) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  const handleSubmit = async () => {
    // Validaciones
    if (!startDate || !endDate) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Por favor selecciona las fechas de inicio y fin.',
      })
      return
    }

    if (!startTime || !endTime) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Por favor selecciona las horas de inicio y fin.',
      })
      return
    }

    if (selectedDays.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Por favor selecciona al menos un día de la semana.',
      })
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start > end) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'La fecha de inicio debe ser anterior a la fecha de fin.',
      })
      return
    }

    if (startTime >= endTime) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'La hora de inicio debe ser anterior a la hora de fin.',
      })
      return
    }

    // Calcular bloques por día
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const durationMinutes = endMinutes - startMinutes
    const blocksPerDay = Math.floor(durationMinutes / 60)

    if (blocksPerDay <= 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Debe haber al menos 1 hora entre la hora de inicio y fin.',
      })
      return
    }

    setLoading(true)

    try {
      const result = await createMultipleSlots({
        startDate: startDate,
        endDate: endDate,
        startTime: startTime,
        endTime: endTime,
        daysOfWeek: selectedDays,
      })

      if (result.success) {
        toast({
          title: '¡Disponibilidad creada!',
          description: `Se crearon ${result.createdCount} bloques de disponibilidad exitosamente.`,
        })
        onSuccess()
        onOpenChange(false)
        // Resetear formulario
        setStartDate('')
        setEndDate('')
        setStartTime('09:00')
        setEndTime('10:00')
        setSelectedDays([])
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        })
      }
    } catch (error) {
      console.error('Error al crear disponibilidad:', error)
      toast({
        variant: 'destructive',
        title: 'Error inesperado',
        description: 'Ocurrió un error al crear la disponibilidad. Por favor intenta de nuevo.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Configurar Disponibilidad
          </DialogTitle>
          <DialogDescription className="text-base">
            Crea múltiples bloques de disponibilidad de forma rápida y sencilla
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rango de Fechas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <Label className="text-base font-semibold">Rango de Fechas</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-base">
                  Desde
                </Label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex h-14 w-full rounded-md border border-input bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-base">
                  Hasta
                </Label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex h-14 w-full rounded-md border border-input bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  min={startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>

          {/* Horario */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <Label className="text-base font-semibold">Horario</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-base">
                  Hora de inicio
                </Label>
                <select
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="flex h-14 w-full rounded-md border border-input bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-base">
                  Hora de fin
                </Label>
                <select
                  id="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="flex h-14 w-full rounded-md border border-input bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {timeOptions
                    .filter((time) => time > startTime)
                    .map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            {blocksPerDay > 0 && (
              <p className="text-sm text-muted-foreground">
                Se crearán <strong>{blocksPerDay}</strong> bloque{blocksPerDay === 1 ? '' : 's'} de 1 hora por día
                ({startTime} - {endTime})
              </p>
            )}
          </div>

          {/* Días de la Semana */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              <Label className="text-base font-semibold">Días de la Semana</Label>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((day) => {
                const isSelected = selectedDays.includes(day.value)
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`
                      flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
                      min-h-[64px] text-base font-medium
                      ${
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background hover:border-primary/50'
                      }
                    `}
                  >
                    <span className="text-xs opacity-70">{day.short}</span>
                    <span className="text-sm font-semibold">{day.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Resumen */}
          {totalBlocks > 0 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-muted-foreground mb-2">Resumen:</p>
                <div className="space-y-1 text-base">
                  <p>
                    <strong>{totalBlocks}</strong> bloque{totalBlocks === 1 ? '' : 's'} se crearán
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {blocksPerDay} bloque{blocksPerDay === 1 ? '' : 's'} por día × {totalDays} día
                    {totalDays === 1 ? '' : 's'} en el rango seleccionado
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
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
            disabled={loading || totalBlocks === 0}
            className="text-base h-14"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creando...
              </>
            ) : (
              `Crear ${totalBlocks > 0 ? totalBlocks : ''} Bloque${totalBlocks === 1 ? '' : 's'}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
