"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle2, XCircle, AlertCircle, Calendar, Clock, User, RefreshCw } from "lucide-react"
import Link from "next/link"

interface AppointmentDetails {
  id: string
  patient_name: string
  appointment_date: string
  appointment_time: string
  status: string
  service: string
  doctor: string
}

export function CancelarContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [details, setDetails] = useState<AppointmentDetails | null>(null)
  const [fetchStatus, setFetchStatus] = useState<"loading" | "not-found" | "ready">("loading")
  const [cancelStatus, setCancelStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setFetchStatus("not-found")
      return
    }

    fetch(`/api/appointments/cancel?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.appointment) {
          setDetails(data.appointment)
          setFetchStatus("ready")
        } else {
          setFetchStatus("not-found")
        }
      })
      .catch(() => setFetchStatus("not-found"))
  }, [token])

  const handleCancel = async () => {
    setCancelStatus("loading")
    try {
      const res = await fetch("/api/appointments/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMessage(data.error || "Error al cancelar la cita")
        setCancelStatus("error")
      } else {
        setCancelStatus("success")
      }
    } catch {
      setErrorMessage("Error de conexión. Intenta nuevamente.")
      setCancelStatus("error")
    }
  }

  const formattedDate = details
    ? new Date(details.appointment_date).toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : ""

  if (fetchStatus === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (fetchStatus === "not-found") {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-20">
        <Card className="mx-auto w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="font-serif text-2xl">Enlace inválido</CardTitle>
            <CardDescription className="text-base">
              Este enlace de cancelación no es válido o ya expiró.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/">Volver al inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (cancelStatus === "success") {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-20">
        <Card className="mx-auto w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
              <CheckCircle2 className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="font-serif text-2xl">Cita cancelada</CardTitle>
            <CardDescription className="text-base">
              Tu cita ha sido cancelada exitosamente. Si deseas reagendar, puedes hacerlo en cualquier momento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/citas">Agendar nueva cita</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Volver al inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (details?.status === "cancelada") {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-20">
        <Card className="mx-auto w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="font-serif text-2xl">Cita ya cancelada</CardTitle>
            <CardDescription className="text-base">
              Esta cita ya fue cancelada anteriormente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/citas">Agendar nueva cita</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-20">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="font-serif text-2xl">Cancelar cita</CardTitle>
          <CardDescription className="text-base">
            Estás a punto de cancelar la siguiente cita
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-medium">{details?.patient_name}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="capitalize">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{details?.appointment_time} — {details?.service} con {details?.doctor}</span>
            </div>
          </div>

          {cancelStatus === "error" && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          <div className="space-y-3">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleCancel}
              disabled={cancelStatus === "loading"}
            >
              {cancelStatus === "loading" ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Confirmar cancelación"
              )}
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">No cancelar, volver al inicio</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
