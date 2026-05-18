export interface Doctor {
  id: string
  name: string
  specialty: string
}

export interface DoctorRow {
  id: string
  name: string
  specialties: { name: string } | null
}
