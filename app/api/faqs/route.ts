import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("faqs")
    .select("id, question, answer")
    .eq("active", true)
    .order("sort_order")

  if (error) return NextResponse.json({ error: "Error al obtener preguntas frecuentes" }, { status: 500 })
  return NextResponse.json({ faqs: data ?? [] })
}
