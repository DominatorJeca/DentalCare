import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim() ?? ""

    const supabase = await createClient()

    let query = supabase
      .from("patients")
      .select("id, identity_number, name, email, phone, created_at")
      .order("name", { ascending: true })

    if (q) {
      query = query.or(`name.ilike.%${q}%,identity_number.ilike.%${q}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error al obtener pacientes:", error)
      return NextResponse.json({ error: "Error al obtener pacientes" }, { status: 500 })
    }

    return NextResponse.json({ patients: data })
  } catch (error) {
    console.error("Error en GET /pacientes:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, identity_number } = body

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Nombre y correo son requeridos" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: existing } = await supabase
      .from("patients")
      .select("id")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: "Ya existe un paciente con ese correo" }, { status: 409 })
    }

    const { data, error } = await supabase
      .from("patients")
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() ?? "",
        identity_number: identity_number?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Esa cédula ya está registrada" }, { status: 409 })
      }
      console.error("Error al crear paciente:", error)
      return NextResponse.json({ error: "Error al crear el paciente" }, { status: 500 })
    }

    return NextResponse.json({ patient: data }, { status: 201 })
  } catch (error) {
    console.error("Error en POST /pacientes:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
