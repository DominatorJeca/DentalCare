"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RefreshCw } from "lucide-react"

export interface RescheduleTarget {
  id: string
  patient_name: string
  appointment_date: string
  appointment_time: string
  doctor_id: string
  service_id: string
}

interface RescheduleModalProps {
  appointment: RescheduleTarget | null
  onClose: () => void
  onSuccess: (id: string, newDate: string, newTime: string) => void
}

export function RescheduleModal({ appointment, onClose, onSuccess }: RescheduleModalProps) {
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [allSlots, setAllSlots] = useState<string[]>([])
  const [unavailableSlots, setUnavailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (appointment) {
      setDate(appointment.appointment_date)
      setTime(appointment.appointment_time)
      setAllSlots([])
      setUnavailableSlots([])
      setError(null)
    }
  }, [appointment])

  useEffect(() => {
    if (!appointment || !date) return
    const fetchSlots = async () => {
      setLoadingSlots(true)
      setTime("")
      try {
        const res = await fetch(
          `/api/appointments/availability?doctor_id=${appointment.doctor_id}&date=${date}&service_id=${appointment.service_id}`
        )
        const data = await res.json()
        setAllSlots(data.allSlots ?? [])
        setUnavailableSlots(data.unavailableSlots ?? [])
      } catch {
        setAllSlots([])
        setUnavailableSlots([])
      } finally {
        setLoadingSlots(false)
      }
    }
    fetchSlots()
  }, [date, appointment])

  const handleSubmit = async () => {
    if (!appointment || !date || !time) return
    setIsSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointment_date: date, appointment_time: time }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Error al reprogramar")
        return
      }
      onSuccess(appointment.id, date, time)
    } catch {
      setError("Error al reprogramar la cita")
    } finally {
      setIsSubmitting(false)
    }
  }

  const today = new Date().toISOString().split("T")[0]
  const isSameDate = date === appointment?.appointment_date
  const availableSlots = allSlots.filter(
    (s) => !unavailableSlots.includes(s) || (isSameDate && s === appointment?.appointment_time)
  )

  return (
    <Dialog open={!!appointment} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reprogramar Cita</DialogTitle>
          <DialogDescription>
            {appointment?.patient_name} — actualmente el{" "}
            {appointment
              ? new Date(`${appointment.appointment_date}T12:00:00`).toLocaleDateString("es-ES", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })
              : ""}{" "}
            a las {appointment?.appointment_time}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="reschedule-date">Nueva fecha</Label>
            <Input
              id="reschedule-date"
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {date && (
            <div className="space-y-1.5">
              <Label>Horario disponible</Label>
              {loadingSlots ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Cargando horarios...
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay horarios disponibles para esta fecha
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTime(slot)}
                      className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                        time === slot
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:border-primary hover:text-primary"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!date || !time || isSubmitting || loadingSlots}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                Guardando...
              </>
            ) : (
              "Reprogramar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
