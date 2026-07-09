import { createServiceClient } from "@/lib/supabase/service"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, name, treatment, rating, text, status, created_at")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: "Error al obtener testimonios" }, { status: 500 })
  return NextResponse.json({ testimonials: data ?? [] })
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient()
  const body = await req.json()
  const { name, treatment, rating, text, status = "approved" } = body

  if (!name?.trim() || !treatment?.trim() || !text?.trim())
    return NextResponse.json({ error: "Nombre, tratamiento y testimonio son requeridos" }, { status: 400 })

  const { data, error } = await supabase
    .from("testimonials")
    .insert({ name: name.trim(), treatment: treatment.trim(), rating, text: text.trim(), status })
    .select()
    .single()

  if (error) return NextResponse.json({ error: "Error al crear testimonio" }, { status: 500 })
  return NextResponse.json({ testimonial: data })
}
