export type AdminRole = "doctor" | "admin"

export interface AdminUser {
  id: string
  username: string
  password_hash: string
  doctor_id: string | null
  role: AdminRole
  created_at: string
}

export interface AdminSession {
  userId: string
  username: string
  role: AdminRole
  doctorId: string | null
}
