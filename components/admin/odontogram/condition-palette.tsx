"use client"

import { Eraser } from "lucide-react"
import type { ToothCondition } from "@/types"

export interface ConditionOption {
  condition: ToothCondition
  label: string
  color: string
  whole?: boolean
}

export const CONDITIONS: ConditionOption[] = [
  { condition: "caries",     label: "Caries",       color: "#dc2626" },
  { condition: "obturacion", label: "Obturación",   color: "#2563eb" },
  { condition: "fractura",   label: "Fractura",     color: "#ea580c" },
  { condition: "corona",     label: "Corona",       color: "#d97706", whole: true },
  { condition: "puente",     label: "Puente",       color: "#0891b2", whole: true },
  { condition: "implante",   label: "Implante",     color: "#7c3aed", whole: true },
  { condition: "extraccion", label: "Extracción",   color: "#991b1b", whole: true },
  { condition: "ausente",    label: "Ausente",      color: "#6b7280", whole: true },
  { condition: "sano",       label: "Sano",         color: "#16a34a" },
]

interface ConditionPaletteProps {
  selected: ToothCondition | null
  onSelect: (condition: ToothCondition) => void
  eraseMode: boolean
  onEraseToggle: () => void
}

export function ConditionPalette({ selected, onSelect, eraseMode, onEraseToggle }: ConditionPaletteProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {CONDITIONS.map((opt) => {
        const isSelected = !eraseMode && selected === opt.condition
        return (
          <button
            key={opt.condition}
            onClick={() => onSelect(opt.condition)}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${
              isSelected
                ? "border-transparent text-white shadow-sm"
                : "border-border bg-background text-foreground hover:border-muted-foreground/50"
            }`}
            style={isSelected ? { backgroundColor: opt.color } : undefined}
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: opt.color }}
            />
            {opt.label}
            {opt.whole && (
              <span className="text-[10px] opacity-60">(global)</span>
            )}
          </button>
        )
      })}

      {/* Separador visual */}
      <div className="w-px self-stretch bg-border mx-0.5" />

      {/* Borrador */}
      <button
        onClick={onEraseToggle}
        className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${
          eraseMode
            ? "border-transparent bg-destructive text-white shadow-sm"
            : "border-border bg-background text-foreground hover:border-destructive/50 hover:text-destructive"
        }`}
      >
        <Eraser className="h-3 w-3" />
        Borrador
      </button>
    </div>
  )
}
