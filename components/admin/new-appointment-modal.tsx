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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RefreshCw } from "lucide-react"
import type { Service, Doctor } from "@/types"

interface NewAppointmentModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const EMPTY_FORM = {
  serviceId: "",
  doctorId: "",
  date: "",
  time: "",
  name: "",
  email: "",
  phone: "",
  notes: "",
}

export function NewAppointmentModal({ open, onClose, onSuccess }: NewAppointmentModalProps) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [services, setServices] = useState<Service[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [allSlots, setAllSlots] = useState<string[]>([])
  const [unavailableSlots, setUnavailableSlots] = useState<string[]>([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar servicios al abrir
  useEffect(() => {
    if (!open) return
    setLoadingServices(true)
    fetch("/api/services")
      .then((r) => r.json())
      .then((data) => setServices(data.services ?? []))
      .catch(() => {})
      .finally(() => setLoadingServices(false))
  }, [open])

  // Reset al cerrar
  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM)
      setDoctors([])
      setAllSlots([])
      setUnavailableSlots([])
      setError(null)
    }
  }, [open])

  // Doctores según servicio seleccionado
  useEffect(() => {
    if (!form.serviceId) {
      setDoctors([])
      return
    }
    setLoadingDoctors(true)
    setForm((prev) => ({ ...prev, doctorId: "", time: "" }))
    setAllSlots([])
    setUnavailableSlots([])
    fetch(`/api/doctors?service_id=${form.serviceId}`)
      .then((r) => r.json())
      .then((data) => setDoctors(data.doctors ?? []))
      .catch(() => {})
      .finally(() => setLoadingDoctors(false))
  }, [form.serviceId])

  // Slots según doctor + fecha
  useEffect(() => {
    if (!form.doctorId || !form.date || !form.serviceId) {
      setAllSlots([])
      setUnavailableSlots([])
      return
    }
    setLoadingSlots(true)
    setForm((prev) => ({ ...prev, time: "" }))
    fetch(
      `/api/appointments/availability?doctor_id=${form.doctorId}&date=${form.date}&service_id=${form.serviceId}`
    )
      .then((r) => r.json())
      .then((data) => {
        setAllSlots(data.allSlots ?? [])
        setUnavailableSlots(data.unavailableSlots ?? [])
      })
      .catch(() => {})
      .finally(() => setLoadingSlots(false))
  }, [form.doctorId, form.date, form.serviceId])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: form.name,
          patientEmail: form.email,
          patientPhone: form.phone,
          serviceId: form.serviceId,
          doctorId: form.doctorId,
          appointmentDate: form.date,
          appointmentTime: form.time,
          notes: form.notes || undefined,
          status: "confirmada"
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Error al crear la cita")
        return
      }
      onSuccess()
    } catch {
      setError("Error al crear la cita")
    } finally {
      setIsSubmitting(false)
    }
  }

  const today = new Date().toISOString().split("T")[0]
  const canSubmit =
    form.serviceId &&
    form.doctorId &&
    form.date &&
    form.time &&
    form.name.trim() &&
    form.email.trim() &&
    form.phone.trim()

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nueva Cita</DialogTitle>
          <DialogDescription>
            Completa los datos para agendar una cita manualmente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Servicio y Doctor */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Servicio</Label>
              <Select
                value={form.serviceId}
                onValueChange={(v) => setForm((prev) => ({ ...prev, serviceId: v }))}
                disabled={loadingServices}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingServices ? "Cargando..." : "Selecciona un servicio"} />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <span>{s.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {s.duration_minutes} min · ${s.price}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Doctor</Label>
              <Select
                value={form.doctorId}
                onValueChange={(v) => setForm((prev) => ({ ...prev, doctorId: v, time: "" }))}
                disabled={!form.serviceId || loadingDoctors}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !form.serviceId
                        ? "Selecciona un servicio primero"
                        : loadingDoctors
                          ? "Cargando doctores..."
                          : "Selecciona un doctor"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      <span>{d.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">({d.specialty})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fecha */}
          <div className="space-y-1.5">
            <Label htmlFor="appt-date">Fecha</Label>
            <Input
              id="appt-date"
              type="date"
              min={today}
              value={form.date}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              disabled={!form.doctorId}
            />
          </div>

          {/* Slots */}
          {form.date && form.doctorId && (
            <div className="space-y-1.5">
              <Label>
                Horario disponible
                {loadingSlots && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    Verificando disponibilidad...
                  </span>
                )}
              </Label>
              {loadingSlots ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Cargando horarios...
                </div>
              ) : allSlots.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay horarios disponibles para esta fecha
                </p>
              ) : (
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
                  {allSlots.map((slot) => {
                    const booked = unavailableSlots.includes(slot)
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={booked}
                        onClick={() => setForm((prev) => ({ ...prev, time: slot }))}
                        className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                          booked
                            ? "cursor-not-allowed border-border bg-muted text-muted-foreground line-through opacity-50"
                            : form.time === slot
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background hover:border-primary hover:text-primary"
                        }`}
                      >
                        {slot}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Separador datos paciente */}
          <div className="border-t border-border pt-1">
            <p className="text-sm font-medium text-foreground">Datos del paciente</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="appt-name">Nombre completo</Label>
              <Input
                id="appt-name"
                placeholder="Nombre del paciente"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="appt-phone">Teléfono</Label>
              <Input
                id="appt-phone"
                type="tel"
                placeholder="+1 234 567 890"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="appt-email">Email</Label>
            <Input
              id="appt-email"
              type="email"
              placeholder="paciente@email.com"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="appt-notes">Notas (opcional)</Label>
            <Textarea
              id="appt-notes"
              placeholder="Información adicional..."
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear Cita"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
