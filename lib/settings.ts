import { createServiceClient } from "@/lib/supabase/service"

export interface ClinicSettings {
  name: string
  phone: string
  email: string
  address: string
  description: string
}

const DEFAULTS: ClinicSettings = {
  name: "DentaCare",
  phone: "+1 (234) 567-890",
  email: "info@dentacare.com",
  address: "Av. Principal 123, Ciudad",
  description:
    "Clínica dental profesional con los mejores especialistas. Ofrecemos tratamientos de ortodoncia, implantes, blanqueamiento y más.",
}

export async function getClinicSettings(): Promise<ClinicSettings> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from("clinic_settings")
      .select("name, phone, email, address, description")
      .eq("id", 1)
      .single()

    if (!data) return DEFAULTS
    return {
      name:        data.name        ?? DEFAULTS.name,
      phone:       data.phone       ?? DEFAULTS.phone,
      email:       data.email       ?? DEFAULTS.email,
      address:     data.address     ?? DEFAULTS.address,
      description: data.description ?? DEFAULTS.description,
    }
  } catch {
    return DEFAULTS
  }
}
