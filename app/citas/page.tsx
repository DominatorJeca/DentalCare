"use client"

import { useState } from "react"
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

const services = [
  { id: "limpieza", name: "Limpieza Dental", duration: "45 min", price: "$50" },
  { id: "revision", name: "Revisión General", duration: "30 min", price: "$35" },
  { id: "blanqueamiento", name: "Blanqueamiento", duration: "60 min", price: "$200" },
  { id: "ortodoncia", name: "Consulta Ortodoncia", duration: "45 min", price: "$75" },
  { id: "implantes", name: "Consulta Implantes", duration: "45 min", price: "$75" },
  { id: "endodoncia", name: "Endodoncia", duration: "90 min", price: "$300" },
  { id: "urgencia", name: "Urgencia Dental", duration: "30 min", price: "$100" },
]

const doctors = [
  { id: "maria", name: "Dra. María García", specialty: "Ortodoncia" },
  { id: "carlos", name: "Dr. Carlos Rodríguez", specialty: "Implantes" },
  { id: "ana", name: "Dra. Ana Martínez", specialty: "Estética" },
  { id: "luis", name: "Dr. Luis Fernández", specialty: "Endodoncia" },
]

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30",
]

export default function CitasPage() {
  const [step, setStep] = useState(1)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [formData, setFormData] = useState({
    service: "",
    doctor: "",
    name: "",
    email: "",
    phone: "",
    notes: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedService = services.find((s) => s.id === formData.service)
  const selectedDoctor = doctors.find((d) => d.id === formData.doctor)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientName: formData.name,
          patientEmail: formData.email,
          patientPhone: formData.phone,
          service: selectedService?.name,
          doctor: selectedDoctor?.name,
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

  const canProceedToStep2 = formData.service && formData.doctor
  const canProceedToStep3 = date && selectedTime
  const canSubmit = formData.name && formData.email && formData.phone

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
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
                <p className="text-sm text-muted-foreground">
                  {selectedDoctor?.name}
                </p>
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
                  setFormData({
                    service: "",
                    doctor: "",
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
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
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
              {/* Step 1: Service & Doctor Selection */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="service">Tipo de servicio</Label>
                    <Select
                      value={formData.service}
                      onValueChange={(value) =>
                        setFormData({ ...formData, service: value })
                      }
                    >
                      <SelectTrigger id="service">
                        <SelectValue placeholder="Selecciona un servicio" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            <div className="flex items-center justify-between gap-4">
                              <span>{service.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {service.duration} - {service.price}
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
                      value={formData.doctor}
                      onValueChange={(value) =>
                        setFormData({ ...formData, doctor: value })
                      }
                    >
                      <SelectTrigger id="doctor">
                        <SelectValue placeholder="Selecciona un doctor" />
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

              {/* Step 2: Date & Time Selection */}
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
                      <Label className="mb-3 block">Selecciona una hora</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                              selectedTime === time
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-card hover:border-primary/50 hover:bg-muted"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
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
                      <p>{selectedService?.name} con {selectedDoctor?.name}</p>
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
      <Footer />
    </div>
  )
}
