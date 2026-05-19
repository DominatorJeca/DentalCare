import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { OdontogramState } from "@/types"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    const { id, recordId } = await params
    const body = await request.json()

    const supabase = await createClient()

    const updates: { notes?: string; odontogram_state?: OdontogramState } = {}
    if (body.notes          !== undefined) updates.notes           = body.notes
    if (body.odontogram_state !== undefined) updates.odontogram_state = body.odontogram_state

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Sin datos para actualizar" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("patient_records")
      .update(updates)
      .eq("id", recordId)
      .eq("patient_id", id)
      .select()
      .single()

    if (error || !data) {
      console.error("Error al actualizar ficha:", error)
      return NextResponse.json({ error: "Error al actualizar la ficha" }, { status: 500 })
    }

    return NextResponse.json({ record: data })
  } catch (error) {
    console.error("Error en PATCH /pacientes/[id]/records/[recordId]:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
