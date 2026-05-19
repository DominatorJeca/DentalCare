export type AppointmentStatus = "pendiente" | "confirmada" | "completada" | "cancelada"

export interface Appointment {
  id: string
  patient_name: string
  patient_email: string
  patient_phone: string
  service: string
  doctor: string
  appointment_date: string
  appointment_time: string
  notes: string | null
  status: AppointmentStatus
  created_at: string
}

export interface AppointmentCreatePayload {
  patientName: string
  patientEmail: string
  patientPhone: string
  serviceId: string
  doctorId: string
  appointmentDate: string
  appointmentTime: string
  notes?: string
}

export interface AppointmentRow {
  id: string
  patient_name: string
  patient_email: string
  patient_phone: string
  service_id: string
  doctor_id: string
  appointment_date: string
  appointment_time: string
  notes: string | null
  status: AppointmentStatus
  created_at: string
  cancel_token: string | null
  doctor: { name: string } | null
  service: { name: string } | null
}

export interface AppointmentAvailabilityRow {
  appointment_time: string
  service: { duration_minutes: number } | null
}

