import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, email, address, description } = body

    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from("clinic_settings")
      .upsert(
        { id: 1, name, phone, email, address, description },
        { onConflict: "id" }
      )
      .select()
      .single()

    if (error) {
      console.error("Error al guardar configuración:", error)
      return NextResponse.json({ error: "Error al guardar la configuración" }, { status: 500 })
    }

    return NextResponse.json({ settings: data })
  } catch (error) {
    console.error("Error en PATCH /api/admin/settings:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
