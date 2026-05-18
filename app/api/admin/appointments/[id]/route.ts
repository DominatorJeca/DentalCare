import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { AppointmentStatus } from "@/types"

const VALID_TRANSITIONS: Partial<Record<AppointmentStatus, AppointmentStatus[]>> = {
  pendiente: ["confirmada", "cancelada"],
  confirmada: ["completada", "cancelada"],
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = await createClient()

    const { data: current } = await supabase
      .from("appointments")
      .select("id, status")
      .eq("id", id)
      .single()

    if (!current) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 })
    }

    if (body.status) {
      const allowed = VALID_TRANSITIONS[current.status as AppointmentStatus] ?? []
      if (!allowed.includes(body.status)) {
        return NextResponse.json(
          { error: `No se puede cambiar de "${current.status}" a "${body.status}"` },
          { status: 400 }
        )
      }
      const { error } = await supabase
        .from("appointments")
        .update({ status: body.status })
        .eq("id", id)
      if (error) {
        return NextResponse.json({ error: "Error al actualizar la cita" }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }

    if (body.appointment_date && body.appointment_time) {
      if (current.status === "cancelada" || current.status === "completada") {
        return NextResponse.json({ error: "No se puede reprogramar esta cita" }, { status: 400 })
      }
      const { error } = await supabase
        .from("appointments")
        .update({
          appointment_date: body.appointment_date,
          appointment_time: body.appointment_time,
        })
        .eq("id", id)
      if (error) {
        return NextResponse.json({ error: "Error al reprogramar la cita" }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  } catch (error) {
    console.error("Error al actualizar cita:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
