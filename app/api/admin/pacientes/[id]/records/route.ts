import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("patient_records")
      .select("id, appointment_id, notes, odontogram_state, created_at, updated_at")
      .eq("patient_id", id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error al obtener fichas:", error)
      return NextResponse.json({ error: "Error al obtener fichas" }, { status: 500 })
    }

    return NextResponse.json({ records: data })
  } catch (error) {
    console.error("Error en GET /pacientes/[id]/records:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { appointment_id, notes } = body

    const supabase = await createClient()

    const { data: patient } = await supabase
      .from("patients")
      .select("id")
      .eq("id", id)
      .single()

    if (!patient) {
      return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 })
    }

    const { data, error } = await supabase
      .from("patient_records")
      .insert({
        patient_id:     id,
        appointment_id: appointment_id ?? null,
        notes:          notes?.trim() ?? "",
      })
      .select()
      .single()

    if (error) {
      console.error("Error al crear ficha:", error)
      return NextResponse.json({ error: "Error al crear la ficha" }, { status: 500 })
    }

    return NextResponse.json({ record: data }, { status: 201 })
  } catch (error) {
    console.error("Error en POST /pacientes/[id]/records:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
