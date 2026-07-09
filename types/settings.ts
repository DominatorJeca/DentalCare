export interface ClinicSettings {
  name: string
  phone: string
  email: string
  address: string
  description: string
  scheduleMfOpen: string
  scheduleMfClose: string
  scheduleSatOpen: string
  scheduleSatClose: string
  scheduleSunClosed: boolean
}

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
