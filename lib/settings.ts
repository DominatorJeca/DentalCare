import { createServiceClient } from "@/lib/supabase/service"
import type { ClinicSettings } from "@/types/settings"

export type { ClinicSettings }

export const DEFAULTS: ClinicSettings = {
  name: "DentaCare",
  phone: "+1 (234) 567-890",
  email: "info@dentacare.com",
  address: "Av. Principal 123, Ciudad",
  description:
    "Clínica dental profesional con los mejores especialistas. Ofrecemos tratamientos de ortodoncia, implantes, blanqueamiento y más.",
  scheduleMfOpen: "09:00",
  scheduleMfClose: "19:00",
  scheduleSatOpen: "09:00",
  scheduleSatClose: "14:00",
  scheduleSunClosed: true,
}

export async function getClinicSettings(): Promise<ClinicSettings> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from("clinic_settings")
      .select("name, phone, email, address, description, schedule_mf_open, schedule_mf_close, schedule_sat_open, schedule_sat_close, schedule_sun_closed")
      .eq("id", 1)
      .single()

    if (!data) return DEFAULTS
    return {
      name:              data.name              ?? DEFAULTS.name,
      phone:             data.phone             ?? DEFAULTS.phone,
      email:             data.email             ?? DEFAULTS.email,
      address:           data.address           ?? DEFAULTS.address,
      description:       data.description       ?? DEFAULTS.description,
      scheduleMfOpen:    data.schedule_mf_open  ?? DEFAULTS.scheduleMfOpen,
      scheduleMfClose:   data.schedule_mf_close ?? DEFAULTS.scheduleMfClose,
      scheduleSatOpen:   data.schedule_sat_open ?? DEFAULTS.scheduleSatOpen,
      scheduleSatClose:  data.schedule_sat_close ?? DEFAULTS.scheduleSatClose,
      scheduleSunClosed: data.schedule_sun_closed ?? DEFAULTS.scheduleSunClosed,
    }
  } catch {
    return DEFAULTS
  }
}
