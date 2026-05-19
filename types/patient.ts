export type ToothStatus =
  | "sano"
  | "caries"
  | "corona"
  | "extraido"
  | "implante"
  | "obturacion"
  | "endodoncia"

export interface OdontogramState {
  teeth: Record<string, ToothStatus>
}

export interface Patient {
  id: string
  identity_number: string | null
  name: string
  email: string
  phone: string
  created_at: string
}

export interface PatientRecord {
  id: string
  patient_id: string
  appointment_id: string | null
  notes: string
  odontogram_state: OdontogramState | null
  created_at: string
  updated_at: string
}

export interface PatientFile {
  id: string
  patient_id: string
  file_name: string
  file_path: string
  file_type: string
  file_size: number
  description: string | null
  uploaded_at: string
}
