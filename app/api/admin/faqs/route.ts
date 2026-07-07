import { createServiceClient } from "@/lib/supabase/service"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("faqs")
    .select("id, question, answer, sort_order, active")
    .order("sort_order")

  if (error) return NextResponse.json({ error: "Error al obtener FAQs" }, { status: 500 })
  return NextResponse.json({ faqs: data ?? [] })
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient()
  const body = await req.json()
  const { question, answer, sort_order = 0, active = true } = body

  if (!question || !answer)
    return NextResponse.json({ error: "Pregunta y respuesta son requeridas" }, { status: 400 })

  const { data, error } = await supabase
    .from("faqs")
    .insert({ question, answer, sort_order, active })
    .select()
    .single()

  if (error) return NextResponse.json({ error: "Error al crear FAQ" }, { status: 500 })
  return NextResponse.json({ faq: data })
}
