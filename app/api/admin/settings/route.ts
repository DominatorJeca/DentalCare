import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const {
      name, phone, email, address, description,
      scheduleMfOpen, scheduleMfClose,
      scheduleSatOpen, scheduleSatClose,
      scheduleSunClosed,
    } = body

    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from("clinic_settings")
      .upsert(
        {
          id: 1, name, phone, email, address, description,
          schedule_mf_open: scheduleMfOpen,
          schedule_mf_close: scheduleMfClose,
          schedule_sat_open: scheduleSatOpen,
          schedule_sat_close: scheduleSatClose,
          schedule_sun_closed: scheduleSunClosed,
        },
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
