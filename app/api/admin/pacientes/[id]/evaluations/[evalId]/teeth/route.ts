import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { verifyToken, COOKIE_NAME } from "@/lib/auth"
import { cookies } from "next/headers"
import type { ToothData } from "@/types"

async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

// PATCH /api/admin/pacientes/[id]/evaluations/[evalId]/teeth
// Upserts tooth_data for a given evaluation. Receives { teeth: ToothData[] }
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; evalId: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { evalId } = await params
  const body = await req.json().catch(() => null)

  if (!body?.teeth || !Array.isArray(body.teeth)) {
    return NextResponse.json({ error: "Se requiere un array de dientes" }, { status: 400 })
  }

  const teeth: ToothData[] = body.teeth
  const supabase = createServiceClient()

  // Verify the evaluation exists
  const { data: evaluation } = await supabase
    .from("dental_evaluations")
    .select("id")
    .eq("id", evalId)
    .single()

  if (!evaluation) {
    return NextResponse.json({ error: "Evaluación no encontrada" }, { status: 404 })
  }

  // Upsert all teeth in one batch
  const rows = teeth.map((t) => ({
    evaluation_id: evalId,
    tooth_number: t.tooth_number,
    conditions: t.conditions,
    notes: t.notes ?? null,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase
    .from("tooth_data")
    .upsert(rows, { onConflict: "evaluation_id,tooth_number" })

  if (error) {
    console.error("Error upserting teeth:", error)
    return NextResponse.json({ error: "Error al guardar datos dentales" }, { status: 500 })
  }

  // Update evaluation's updated_at
  await supabase
    .from("dental_evaluations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", evalId)

  return NextResponse.json({ success: true })
}
