import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.json({ error: "Token requerido" }, { status: 400 })
  }

  const supabase = await createClient()

  const { data } = await supabase
    .from("appointments")
    .select(`
      id,
      patient_name,
      appointment_date,
      appointment_time,
      status,
      service:services(name),
      doctor:doctors(name)
    `)
    .eq("cancel_token", token)
    .maybeSingle()

  if (!data) {
    return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 })
  }

  return NextResponse.json({
    appointment: {
      id: data.id,
      patient_name: data.patient_name,
      appointment_date: data.appointment_date,
      appointment_time: data.appointment_time,
      status: data.status,
      service: (data.service as any)?.name ?? "",
      doctor: (data.doctor as any)?.name ?? "",
    },
  })
}

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token requerido" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: appointment } = await supabase
      .from("appointments")
      .select("id, status, patient_name")
      .eq("cancel_token", token)
      .maybeSingle()

    if (!appointment) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 })
    }

    if (appointment.status === "cancelada") {
      return NextResponse.json(
        { error: "Esta cita ya fue cancelada" },
        { status: 400 }
      )
    }

    if (appointment.status === "completada") {
      return NextResponse.json(
        { error: "No se puede cancelar una cita ya completada" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelada" })
      .eq("cancel_token", token)

    if (error) {
      return NextResponse.json(
        { error: "Error al cancelar la cita" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al cancelar cita:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
