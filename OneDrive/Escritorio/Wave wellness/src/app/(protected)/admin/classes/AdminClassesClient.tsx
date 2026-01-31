'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/base/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/base/accordion'
import { Calendar, Clock, User, Users } from 'lucide-react'
import { Button } from '@/components/ui/base/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type SlotWithBookings = {
  id: string
  starts_at: string
  ends_at: string
  capacity: number
  coach_name: string
  coach_id: string
  bookings: {
    id: string
    status: 'booked' | 'cancelled' | 'attended' | 'no_show'
    student_name: string
    student_phone: string
  }[]
}

interface AdminClassesClientProps {
  slots: SlotWithBookings[]
  weekStart: string
  weekEnd: string
}

// Obtener día de la semana (1=Lunes, 2=Martes, ..., 7=Domingo)
function getDayOfWeek(date: Date): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Bogota',
    weekday: 'long',
  })
  const dayName = formatter.format(date)
  const dayMap: Record<string, number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  }
  return dayMap[dayName] || 1
}

// Mapeo inverso (número a nombre)
const numberToDay: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo',
}

export function AdminClassesClient({ slots, weekStart, weekEnd }: AdminClassesClientProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date(weekStart))

  // Calcular semana actual
  const getMondayOfWeek = (date: Date): Date => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }

  const getSundayOfWeek = (date: Date): Date => {
    const monday = getMondayOfWeek(date)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)
    return sunday
  }

  const formatDate = (date: Date) => {
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

  // Agrupar slots por día
  const slotsByDay: Record<string, SlotWithBookings[]> = {}

  // Inicializar días
  for (let i = 1; i <= 7; i++) {
    slotsByDay[numberToDay[i]] = []
  }

  slots.forEach((slot) => {
    const slotDate = new Date(slot.starts_at)
    const dayNumber = getDayOfWeek(slotDate)
    const dayName = numberToDay[dayNumber]

    if (dayName && slotsByDay[dayName]) {
      slotsByDay[dayName].push(slot)
    }
  })

  // Calcular breakdown de estados
  const getStatusCounts = (bookings: SlotWithBookings['bookings']) => {
    return {
      booked: bookings.filter((b) => b.status === 'booked').length,
      cancelled: bookings.filter((b) => b.status === 'cancelled').length,
      attended: bookings.filter((b) => b.status === 'attended').length,
      no_show: bookings.filter((b) => b.status === 'no_show').length,
    }
  }

  const getStatusBadge = (status: SlotWithBookings['bookings'][0]['status']) => {
    const badges = {
      booked: { label: 'Reservada', className: 'bg-blue-100 text-blue-800' },
      cancelled: { label: 'Cancelada', className: 'bg-gray-100 text-gray-800' },
      attended: { label: 'Asistió', className: 'bg-green-100 text-green-800' },
      no_show: { label: 'No asistió', className: 'bg-red-100 text-red-800' },
    }
    const badge = badges[status]
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>
    )
  }

  // Navegación de semanas (placeholder - se implementará con query params en siguiente paso)
  const handlePreviousWeek = () => {
    // TODO: Implementar cambio de semana
  }

  const handleNextWeek = () => {
    // TODO: Implementar cambio de semana
  }

  const weekStartDate = new Date(weekStart)
  const weekEndDate = new Date(weekEnd)

  const totalSlots = slots.length
  const totalBookings = slots.reduce((sum, slot) => sum + slot.bookings.length, 0)

  if (slots.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-base text-muted-foreground mb-2">
            No hay clases programadas para esta semana
          </p>
          <p className="text-sm text-muted-foreground">
            Las clases aparecerán aquí cuando los coaches configuren su disponibilidad.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Selector de Semana */}
      <Card>
        <CardHeader>
          <CardTitle>Semana</CardTitle>
          <CardDescription>
            {formatDate(weekStartDate)} - {formatDate(weekEndDate)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePreviousWeek}
              disabled
              className="text-base h-14"
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Semana Anterior
            </Button>
            <div className="text-center">
              <p className="text-base font-semibold">
                {totalSlots} clase{totalSlots === 1 ? '' : 's'} • {totalBookings} reserva{totalBookings === 1 ? '' : 's'}
              </p>
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={handleNextWeek}
              disabled
              className="text-base h-14"
            >
              Semana Próxima
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Acordeón por Día */}
      <Card>
        <CardHeader>
          <CardTitle>Clases por Día</CardTitle>
          <CardDescription>
            Expande cada día para ver las clases programadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(slotsByDay).map(([dayName, daySlots]) => {
              if (daySlots.length === 0) return null

              return (
                <AccordionItem key={dayName} value={dayName.toLowerCase()}>
                  <AccordionTrigger className="text-base font-semibold min-h-[56px]">
                    <div className="flex items-center justify-between w-full pr-4">
                      <span className="capitalize">{dayName}</span>
                      <span className="text-sm text-muted-foreground font-normal">
                        {daySlots.length} clase{daySlots.length === 1 ? '' : 's'}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      {daySlots.map((slot) => {
                        const statusCounts = getStatusCounts(slot.bookings)
                        const bookedCount = slot.bookings.filter((b) => b.status === 'booked').length

                        return (
                          <Card key={slot.id} className="border-l-4 border-l-primary">
                            <CardContent className="pt-6">
                              <div className="space-y-4">
                                {/* Header: Hora y Coach */}
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                      <Clock className="h-5 w-5 text-primary" />
                                      <span className="text-lg font-semibold">
                                        {formatTime(slot.starts_at)} - {formatTime(slot.ends_at)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <User className="h-5 w-5 text-muted-foreground" />
                                      <span className="text-base">{slot.coach_name}</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-base font-semibold">
                                      {bookedCount} / {slot.capacity}
                                    </p>
                                    <p className="text-sm text-muted-foreground">ocupados</p>
                                  </div>
                                </div>

                                {/* Breakdown de Estados */}
                                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                                  {statusCounts.booked > 0 && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                      Reservadas: {statusCounts.booked}
                                    </span>
                                  )}
                                  {statusCounts.attended > 0 && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                      Asistieron: {statusCounts.attended}
                                    </span>
                                  )}
                                  {statusCounts.cancelled > 0 && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                      Canceladas: {statusCounts.cancelled}
                                    </span>
                                  )}
                                  {statusCounts.no_show > 0 && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                      No asistieron: {statusCounts.no_show}
                                    </span>
                                  )}
                                </div>

                                {/* Lista de Alumnos */}
                                {slot.bookings.length > 0 ? (
                                  <div className="space-y-2 pt-2 border-t border-border">
                                    <p className="text-sm font-medium text-muted-foreground mb-2">
                                      Alumnos:
                                    </p>
                                    <div className="space-y-2">
                                      {slot.bookings.map((booking) => (
                                        <div
                                          key={booking.id}
                                          className="flex items-center justify-between p-3 border border-border rounded-lg"
                                        >
                                          <div className="flex-1">
                                            <p className="text-base font-medium text-foreground">
                                              {booking.student_name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                              {booking.student_phone}
                                            </p>
                                          </div>
                                          <div>{getStatusBadge(booking.status)}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="pt-2 border-t border-border">
                                    <p className="text-sm text-muted-foreground">
                                      Sin reservas en este slot
                                    </p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
