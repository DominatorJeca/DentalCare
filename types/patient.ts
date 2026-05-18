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

export interface PatientRecord {
  id: string
  patient_name: string
  patient_email: string
  appointment_id: string | null
  notes: string
  odontogram_state: OdontogramState | null
  created_at: string
}

export interface PatientFile {
  id: string
  patient_email: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  uploaded_at: string
}
