import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { verifyToken, COOKIE_NAME } from "@/lib/auth"
import { cookies } from "next/headers"
import type { ToothData, DentalEvaluation } from "@/types"

async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

// GET /api/admin/pacientes/[id]/evaluations
// Returns all odontogram evaluations for a patient, each with its tooth_data
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id: patientId } = await params
  const supabase = createServiceClient()

  const { data: evaluations, error } = await supabase
    .from("dental_evaluations")
    .select("id, patient_id, record_id, type, created_at, updated_at")
    .eq("patient_id", patientId)
    .eq("type", "odontogram")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching evaluations:", error)
    return NextResponse.json({ error: "Error al obtener evaluaciones" }, { status: 500 })
  }

  // For each evaluation, fetch its tooth_data
  const results: DentalEvaluation[] = await Promise.all(
    (evaluations ?? []).map(async (ev) => {
      const { data: teeth } = await supabase
        .from("tooth_data")
        .select("tooth_number, conditions, notes")
        .eq("evaluation_id", ev.id)

      const toothData: ToothData[] = (teeth ?? []).map((t) => ({
        tooth_number: t.tooth_number,
        conditions: t.conditions ?? [],
        notes: t.notes ?? undefined,
      }))

      return { ...ev, tooth_data: toothData }
    })
  )

  return NextResponse.json({ evaluations: results })
}

// POST /api/admin/pacientes/[id]/evaluations
// Creates a new odontogram evaluation for the patient
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id: patientId } = await params
  const body = await req.json().catch(() => ({}))
  const recordId: string | null = body.record_id ?? null

  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from("dental_evaluations")
    .insert({ patient_id: patientId, record_id: recordId, type: "odontogram" })
    .select("id, patient_id, record_id, type, created_at, updated_at")
    .single()

  if (error) {
    console.error("Error creating evaluation:", error)
    return NextResponse.json({ error: "Error al crear evaluación" }, { status: 500 })
  }

  return NextResponse.json({ evaluation: { ...data, tooth_data: [] } }, { status: 201 })
}
