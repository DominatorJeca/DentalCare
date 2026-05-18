import type { AppointmentStatus } from "./appointment"

export interface DashboardAppointment {
  id: string
  patient_name: string
  appointment_time: string
  status: AppointmentStatus
  doctor: string
  service: string
}

export interface DashboardStat {
  title: string
  value: string
  change: string
}

export interface DashboardRecentPatient {
  email: string
  name: string
  lastAppointmentDate: string
  lastStatus: AppointmentStatus
}

export interface DashboardData {
  stats: DashboardStat[]
  todayAppointments: DashboardAppointment[]
  recentPatients: DashboardRecentPatient[]
}
