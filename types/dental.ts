export type ToothSurface = "occlusal" | "mesial" | "distal" | "buccal" | "lingual"

export type ToothCondition =
  | "caries"
  | "obturacion"
  | "corona"
  | "extraccion"
  | "ausente"
  | "implante"
  | "puente"
  | "fractura"
  | "sano"

export interface ToothMark {
  surface: ToothSurface | "whole"
  condition: ToothCondition
  color: string
}

export interface ToothData {
  tooth_number: number
  conditions: ToothMark[]
  notes?: string
}

export interface DentalEvaluation {
  id: string
  patient_id: string
  record_id: string | null
  type: "odontogram"
  created_at: string
  updated_at: string
  tooth_data: ToothData[]
}
