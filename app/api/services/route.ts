import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("services")
    .select("id, name, description, icon, duration_minutes, price")
    .order("name")

  if (error) {
    return NextResponse.json({ error: "Error al obtener servicios" }, { status: 500 })
  }

  return NextResponse.json({ services: data })
}
