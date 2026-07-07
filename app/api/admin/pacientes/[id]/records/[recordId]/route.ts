import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { OdontogramState } from "@/types"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    const { id, recordId } = await params
    const supabase = await createClient()

    const { data: record } = await supabase
      .from("patient_records")
      .select("id")
      .eq("id", recordId)
      .eq("patient_id", id)
      .single()

    if (!record) {
      return NextResponse.json({ error: "Ficha no encontrada" }, { status: 404 })
    }

    // Obtener evaluaciones del record para borrar tooth_data en cascada
    const { data: evaluations } = await supabase
      .from("dental_evaluations")
      .select("id")
      .eq("record_id", recordId)

    if (evaluations && evaluations.length > 0) {
      const evalIds = evaluations.map((e) => e.id)
      await supabase.from("tooth_data").delete().in("evaluation_id", evalIds)
      await supabase.from("dental_evaluations").delete().eq("record_id", recordId)
    }

    const { error } = await supabase
      .from("patient_records")
      .delete()
      .eq("id", recordId)
      .eq("patient_id", id)

    if (error) {
      console.error("Error al eliminar ficha:", error)
      return NextResponse.json({ error: "Error al eliminar la ficha" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error en DELETE /pacientes/[id]/records/[recordId]:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

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
