import { createServiceClient } from "@/lib/supabase/service"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("services")
    .select("id, name, description, icon, duration_minutes, price")
    .order("name")

  if (error) return NextResponse.json({ error: "Error al obtener servicios" }, { status: 500 })
  return NextResponse.json({ services: data })
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient()
  const body = await req.json()
  const { name, description, icon, duration_minutes, price } = body

  if (!name) return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })

  const { data, error } = await supabase
    .from("services")
    .insert({ name, description, icon, duration_minutes, price })
    .select()
    .single()

  if (error) return NextResponse.json({ error: "Error al crear servicio" }, { status: 500 })
  return NextResponse.json({ service: data })
}
