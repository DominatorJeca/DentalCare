"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Save, Plus, RefreshCw } from "lucide-react"
import { ConditionPalette } from "./condition-palette"
import { OdontogramCanvas } from "./odontogram-canvas"
import type { DentalEvaluation, ToothCondition, ToothData } from "@/types"

interface OdontogramPanelProps {
  patientId: string
  recordId: string
}

export function OdontogramPanel({ patientId, recordId }: OdontogramPanelProps) {
  const [evaluation, setEvaluation] = useState<DentalEvaluation | null>(null)
  const [teethData, setTeethData]   = useState<ToothData[]>([])
  const [selectedCondition, setSelectedCondition] = useState<ToothCondition | null>(null)
  const [loading, setLoading]   = useState(true)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [dirty, setDirty]       = useState(false)

  const base = `/api/admin/pacientes/${patientId}/evaluations`

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(base)
    if (!res.ok) { setLoading(false); return }
    const { evaluations } = await res.json()
    const linked: DentalEvaluation | undefined = evaluations.find(
      (e: DentalEvaluation) => e.record_id === recordId
    )
    if (linked) {
      setEvaluation(linked)
      setTeethData(linked.tooth_data)
    }
    setLoading(false)
  }, [base, recordId])

  useEffect(() => { load() }, [load])

  async function initEvaluation() {
    setCreating(true)
    const res = await fetch(base, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ record_id: recordId }),
    })
    if (!res.ok) { setCreating(false); return }
    const { evaluation: ev } = await res.json()
    setEvaluation(ev)
    setTeethData([])
    setDirty(false)
    setCreating(false)
  }

  async function save() {
    if (!evaluation) return
    setSaving(true)
    const res = await fetch(`${base}/${evaluation.id}/teeth`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teeth: teethData }),
    })
    setSaving(false)
    if (res.ok) {
      setDirty(false)
      // actualizar updated_at local
      setEvaluation((prev) =>
        prev ? { ...prev, updated_at: new Date().toISOString() } : prev
      )
    }
  }

  function handleToothChange(updated: ToothData) {
    setTeethData((prev) => {
      const idx = prev.findIndex((t) => t.tooth_number === updated.tooth_number)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = updated
        return next
      }
      return [...prev, updated]
    })
    setDirty(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
        Cargando odontograma…
      </div>
    )
  }

  if (!evaluation) {
    return (
      <div className="rounded-lg border border-dashed border-border py-12 text-center">
        <p className="text-sm text-muted-foreground mb-3">
          No hay odontograma para esta consulta.
        </p>
        <Button onClick={initEvaluation} disabled={creating}>
          {creating
            ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            : <Plus className="mr-2 h-4 w-4" />}
          Iniciar odontograma
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Guardar + última actualización */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Actualizado{" "}
          {new Date(evaluation.updated_at).toLocaleString("es-ES", {
            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
          })}
        </p>
        <Button size="sm" onClick={save} disabled={!dirty || saving}>
          <Save className="h-3.5 w-3.5 mr-1.5" />
          {saving ? "Guardando…" : "Guardar"}
        </Button>
      </div>

      {/* Paleta de condiciones */}
      <div className="rounded-lg border border-border bg-muted/30 p-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Condición activa — haz clic en una superficie del diente
        </p>
        <ConditionPalette
          selected={selectedCondition}
          onSelect={(c) => setSelectedCondition((prev) => (prev === c ? null : c))}
        />
      </div>

      {/* Canvas */}
      <div className="overflow-x-auto rounded-lg border border-border bg-white p-4">
        <OdontogramCanvas
          teethData={teethData}
          selectedCondition={selectedCondition}
          onToothChange={handleToothChange}
        />
      </div>

      {/* Leyenda */}
      <div className="rounded-lg border border-border bg-muted/30 p-3">
        <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Superficies dentales
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>▲ Vestibular/Bucal</span>
          <span>▼ Palatino/Lingual</span>
          <span>◄ Mesial</span>
          <span>► Distal</span>
          <span>■ Oclusal/Incisal</span>
        </div>
      </div>
    </div>
  )
}
