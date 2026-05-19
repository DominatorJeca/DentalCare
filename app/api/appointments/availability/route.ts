import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { AppointmentAvailabilityRow } from "@/types"

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function generateSlots(durationMinutes: number): string[] {
  const slots: string[] = []
  const periods = [
    { start: 9 * 60, end: 13 * 60 },
    { start: 15 * 60, end: 19 * 60 },
  ]
  for (const { start, end } of periods) {
    for (let t = start; t + durationMinutes <= end; t += durationMinutes) {
      const h = Math.floor(t / 60).toString().padStart(2, "0")
      const m = (t % 60).toString().padStart(2, "0")
      slots.push(`${h}:${m}`)
    }
  }
  return slots
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const doctorId = searchParams.get("doctor_id")
  const date = searchParams.get("date")
  const serviceId = searchParams.get("service_id")

  if (!doctorId || !date || !serviceId) {
    return NextResponse.json(
      { error: "doctor_id, date y service_id son requeridos" },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const [{ data: service }, { data: existing, error }] = await Promise.all([
    supabase
      .from("services")
      .select("duration_minutes")
      .eq("id", serviceId)
      .single(),
    supabase
      .from("appointments")
      .select("appointment_time, service:services(duration_minutes)")
      .eq("doctor_id", doctorId)
      .eq("appointment_date", date)
      .not("status", "eq", "cancelada"),
  ])

  if (!service) {
    return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
  }

  if (error) {
    return NextResponse.json({ error: "Error al consultar disponibilidad" }, { status: 500 })
  }

  const requestedDuration = service.duration_minutes
  const allSlots = generateSlots(requestedDuration)

  const unavailableSlots = allSlots.filter((slot) => {
    const slotStart = timeToMinutes(slot)
    const slotEnd = slotStart + requestedDuration
    return (existing as unknown as AppointmentAvailabilityRow[] | null)?.some((appt) => {
      const apptStart = timeToMinutes(appt.appointment_time)
      const apptDuration = appt.service?.duration_minutes ?? 30
      return slotStart < apptStart + apptDuration && slotEnd > apptStart
    }) ?? false
  })

  return NextResponse.json({ allSlots, unavailableSlots })
}
