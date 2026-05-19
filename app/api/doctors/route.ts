import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { DoctorRow } from "@/types"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const serviceId = searchParams.get("service_id")

  const supabase = await createClient()

  let doctorIds: string[] | null = null

  if (serviceId) {
    const { data: ds } = await supabase
      .from("doctor_services")
      .select("doctor_id")
      .eq("service_id", serviceId)

    doctorIds = ds?.map((r) => r.doctor_id) ?? []

    if (doctorIds.length === 0) {
      return NextResponse.json({ doctors: [] })
    }
  }

  let query = supabase
    .from("doctors")
    .select("id, name, specialties(name)")
    .order("name")

  if (doctorIds) {
    query = query.in("id", doctorIds)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: "Error al obtener doctores" }, { status: 500 })
  }

  const doctors = (data as unknown as DoctorRow[]).map((d) => ({
    id: d.id,
    name: d.name,
    specialty: d.specialties?.name ?? "",
  }))

  return NextResponse.json({ doctors })
}
