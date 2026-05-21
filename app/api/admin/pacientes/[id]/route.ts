import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .single()

    if (patientError || !patient) {
      return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 })
    }

    const [{ data: records }, { data: appointments }] = await Promise.all([
      supabase
        .from("patient_records")
        .select("id, appointment_id, notes, odontogram_state, created_at, updated_at")
        .eq("patient_id", id)
        .order("created_at", { ascending: false }),

      supabase
        .from("appointments")
        .select(`
          id, appointment_date, appointment_time, status,
          service:services(name),
          doctor:doctors(name)
        `)
        .eq("patient_email", patient.email)
        .order("appointment_date", { ascending: false }),
    ])

    return NextResponse.json({
      patient,
      records: records ?? [],
      appointments: (appointments ?? []).map((apt) => ({
        ...apt,
        service: (apt.service as unknown as { name: string } | null)?.name ?? "",
        doctor:  (apt.doctor  as unknown as { name: string } | null)?.name ?? "",
      })),
    })
  } catch (error) {
    console.error("Error en GET /pacientes/[id]:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const supabase = await createClient()

    const updates: Record<string, string | null> = {}
    if (body.name?.trim())              updates.name            = body.name.trim()
    if (body.phone !== undefined)       updates.phone           = body.phone?.trim() ?? ""
    if (body.identity_number !== undefined)
      updates.identity_number = body.identity_number?.trim() || null

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Sin datos para actualizar" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("patients")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Esa cédula ya está registrada" }, { status: 409 })
      }
      console.error("Error al actualizar paciente:", error)
      return NextResponse.json({ error: "Error al actualizar el paciente" }, { status: 500 })
    }

    return NextResponse.json({ patient: data })
  } catch (error) {
    console.error("Error en PATCH /pacientes/[id]:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
