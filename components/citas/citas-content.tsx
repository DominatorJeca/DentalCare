"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { CalendarDays, Clock, User, Check } from "lucide-react"
import type { Service, Doctor } from "@/types"
import type { ClinicSettings } from "@/types"

function CitasInner({ settings }: { settings: ClinicSettings }) {
  const searchParams = useSearchParams()
  const serviceParam = searchParams.get("service") ?? ""

  const [step, setStep] = useState(1)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [formData, setFormData] = useState({
    serviceId: "",
    doctorId: "",
    name: "",
    email: "",
    phone: "",
    notes: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [services, setServices] = useState<Service[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [allSlots, setAllSlots] = useState<string[]>([])
  const [unavailableSlots, setUnavailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const selectedService = services.find((s) => s.id === formData.serviceId)
  const selectedDoctor = doctors.find((d) => d.id === formData.doctorId)

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((data) => {
        const list: Service[] = data.services || []
        setServices(list)
        if (serviceParam && list.some((s) => s.id === serviceParam)) {
          setFormData((prev) => ({ ...prev, serviceId: serviceParam }))
        }
      })
      .catch(() => {})
      .finally(() => setLoadingServices(false))
  }, [serviceParam])

  useEffect(() => {
    if (!formData.serviceId) {
      setDoctors([])
      return
    }
    setLoadingDoctors(true)
    setFormData((prev) => ({ ...prev, doctorId: "" }))
    setAllSlots([])
    setUnavailableSlots([])
    setSelectedTime("")
    fetch(`/api/doctors?service_id=${formData.serviceId}`)
      .then((r) => r.json())
      .then((data) => setDoctors(data.doctors || []))
      .catch(() => {})
      .finally(() => setLoadingDoctors(false))
  }, [formData.serviceId])

  useEffect(() => {
    if (!date || !formData.doctorId || !formData.serviceId) {
      setAllSlots([])
      setUnavailableSlots([])
      return
    }
    setLoadingSlots(true)
    const dateStr = date.toISOString().split("T")[0]
    fetch(
      `/api/appointments/availability?doctor_id=${formData.doctorId}&date=${dateStr}&service_id=${formData.serviceId}`
    )
      .then((r) => r.json())
      .then((data) => {
        setAllSlots(data.allSlots || [])
        setUnavailableSlots(data.unavailableSlots || [])
        setSelectedTime((prev) =>
          (data.unavailableSlots || []).includes(prev) ? "" : prev
        )
      })
      .catch(() => {})
      .finally(() => setLoadingSlots(false))
  }, [date, formData.doctorId, formData.serviceId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: formData.name,
          patientEmail: formData.email,
          patientPhone: formData.phone,
          serviceId: formData.serviceId,
          doctorId: formData.doctorId,
          appointmentDate: date?.toISOString().split("T")[0],
          appointmentTime: selectedTime,
          notes: formData.notes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al agendar la cita")
      }

      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al agendar la cita")
    } finally {
      setIsLoading(false)
    }
  }

  const canProceedToStep2 = formData.serviceId && formData.doctorId
  const canProceedToStep3 = date && selectedTime
  const canSubmit = formData.name && formData.email && formData.phone

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header clinicSettings={settings} />
        <main className="flex flex-1 items-center justify-center bg-secondary/30 px-4 py-20">
          <Card className="mx-auto max-w-md text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
                <Check className="h-8 w-8 text-accent" />
              </div>
              <CardTitle className="font-serif text-2xl">
                Cita Reservada con Éxito
              </CardTitle>
              <CardDescription className="text-base">
                Hemos recibido tu solicitud de cita. Te enviaremos una
                confirmación por email.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4 text-left">
                <p className="text-sm text-muted-foreground">Resumen:</p>
                <p className="font-medium">{selectedService?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedDoctor?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {date?.toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  a las {selectedTime}
                </p>
              </div>
              <Button
                onClick={() => {
                  setIsSubmitted(false)
                  setStep(1)
                  setDate(undefined)
                  setSelectedTime("")
                  setAllSlots([])
                  setUnavailableSlots([])
                  setDoctors([])
                  setFormData({
                    serviceId: "",
                    doctorId: "",
                    name: "",
                    email: "",
                    phone: "",
                    notes: "",
                  })
                }}
                className="w-full"
              >
                Reservar otra cita
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer settings={settings} />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header clinicSettings={settings} />
      <main className="flex-1 bg-secondary/30 py-12 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Reserva tu cita
            </span>
            <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Agenda tu próxima visita
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Selecciona el servicio, fecha y hora que mejor te convenga.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-10">
            <div className="flex items-center justify-center gap-4">
              {[
                { num: 1, label: "Servicio", icon: User },
                { num: 2, label: "Fecha y Hora", icon: CalendarDays },
                { num: 3, label: "Datos", icon: Clock },
              ].map((s, i) => (
                <div key={s.num} className="flex items-center">
                  <button
                    onClick={() => {
                      if (s.num === 1) setStep(1)
                      else if (s.num === 2 && canProceedToStep2) setStep(2)
                      else if (s.num === 3 && canProceedToStep2 && canProceedToStep3) setStep(3)
                    }}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      step === s.num
                        ? "bg-primary text-primary-foreground"
                        : step > s.num
                          ? "bg-accent/20 text-accent-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <s.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{s.num}</span>
                  </button>
                  {i < 2 && (
                    <div
                      className={`mx-2 h-0.5 w-8 ${
                        step > s.num ? "bg-accent" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              {/* Step 1: Service & Doctor */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="service">Tipo de servicio</Label>
                    <Select
                      value={formData.serviceId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, serviceId: value })
                      }
                      disabled={loadingServices}
                    >
                      <SelectTrigger id="service">
                        <SelectValue
                          placeholder={loadingServices ? "Cargando..." : "Selecciona un servicio"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            <div className="flex items-center justify-between gap-4">
                              <span>{service.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {service.duration_minutes} min · ${service.price}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="doctor">Doctor preferido</Label>
                    <Select
                      value={formData.doctorId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, doctorId: value })
                      }
                      disabled={!formData.serviceId || loadingDoctors}
                    >
                      <SelectTrigger id="doctor">
                        <SelectValue
                          placeholder={
                            !formData.serviceId
                              ? "Selecciona un servicio primero"
                              : loadingDoctors
                                ? "Cargando doctores..."
                                : "Selecciona un doctor"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            <div className="flex items-center gap-2">
                              <span>{doctor.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({doctor.specialty})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={() => setStep(2)}
                    disabled={!canProceedToStep2}
                    className="w-full"
                  >
                    Continuar
                  </Button>
                </div>
              )}

              {/* Step 2: Date & Time */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <Label className="mb-3 block">Selecciona una fecha</Label>
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) =>
                          date < new Date() || date.getDay() === 0
                        }
                        className="rounded-md border"
                      />
                    </div>

                    <div>
                      <Label className="mb-3 block">
                        Selecciona una hora
                        {loadingSlots && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            Verificando disponibilidad...
                          </span>
                        )}
                      </Label>
                      {!date ? (
                        <p className="text-sm text-muted-foreground">
                          Selecciona una fecha para ver los horarios disponibles.
                        </p>
                      ) : allSlots.length === 0 && !loadingSlots ? (
                        <p className="text-sm text-muted-foreground">
                          No hay horarios disponibles para este día.
                        </p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {allSlots.map((time) => {
                            const isBooked = unavailableSlots.includes(time)
                            return (
                              <button
                                key={time}
                                onClick={() => !isBooked && setSelectedTime(time)}
                                disabled={isBooked || loadingSlots}
                                title={isBooked ? "Horario no disponible" : undefined}
                                className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                                  isBooked
                                    ? "cursor-not-allowed border-border bg-muted text-muted-foreground line-through opacity-50"
                                    : selectedTime === time
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-border bg-card hover:border-primary/50 hover:bg-muted"
                                }`}
                              >
                                {time}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Atrás
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!canProceedToStep3}
                      className="flex-1"
                    >
                      Continuar
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Personal Information */}
              {step === 3 && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm font-medium text-foreground">
                      Resumen de tu cita
                    </p>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>
                        {selectedService?.name} con {selectedDoctor?.name}
                      </p>
                      <p>
                        {date?.toLocaleDateString("es-ES", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        a las {selectedTime}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo</Label>
                      <Input
                        id="name"
                        placeholder="Tu nombre"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 234 567 890"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Información adicional que debamos conocer..."
                      rows={3}
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                    />
                  </div>

                  {error && (
                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="flex-1"
                      disabled={isLoading}
                    >
                      Atrás
                    </Button>
                    <Button
                      type="submit"
                      disabled={!canSubmit || isLoading}
                      className="flex-1"
                    >
                      {isLoading ? "Agendando..." : "Confirmar Cita"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer settings={settings} />
    </div>
  )
}

export function CitasContent({ settings }: { settings: ClinicSettings }) {
  return (
    <Suspense>
      <CitasInner settings={settings} />
    </Suspense>
  )
}
