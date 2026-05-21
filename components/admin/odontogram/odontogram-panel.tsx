"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Save, Plus, RefreshCw, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ConditionPalette } from "./condition-palette"
import { OdontogramCanvas } from "./odontogram-canvas"
import type { DentalEvaluation, ToothCondition, ToothData } from "@/types"
import { toast } from "@/components/ui/use-toast"

interface OdontogramPanelProps {
  patientId: string
  recordId: string
}

export function OdontogramPanel({ patientId, recordId }: OdontogramPanelProps) {
  const [evaluation, setEvaluation] = useState<DentalEvaluation | null>(null)
  const [teethData, setTeethData]   = useState<ToothData[]>([])
  const [selectedCondition, setSelectedCondition] = useState<ToothCondition | null>(null)
  const [eraseMode, setEraseMode]   = useState(false)
  const [loading, setLoading]       = useState(true)
  const [creating, setCreating]     = useState(false)
  const [saving, setSaving]         = useState(false)
  const [dirty, setDirty]           = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [paletteHint, setPaletteHint]   = useState(false)
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function triggerPaletteHint() {
    if (hintTimer.current) clearTimeout(hintTimer.current)
    setPaletteHint(true)
    hintTimer.current = setTimeout(() => setPaletteHint(false), 700)
  }

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
      toast({ title: "Odontograma guardado", description: "Odontograma guardado correctamente" })
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

  function handleConditionSelect(c: ToothCondition) {
    setSelectedCondition((prev) => (prev === c ? null : c))
    setEraseMode(false)
  }

  function handleEraseToggle() {
    setEraseMode((prev) => !prev)
    setSelectedCondition(null)
  }

  function handleResetConfirm() {
    setTeethData([])
    setDirty(true)
    setConfirmReset(false)
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
    <>
      <div className="space-y-4">
        {/* Barra superior: última actualización + acciones */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-xs text-muted-foreground">
            Actualizado{" "}
            {new Date(evaluation.updated_at).toLocaleString("es-ES", {
              day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
            })}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive hover:border-destructive/50"
              onClick={() => setConfirmReset(true)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Resetear
            </Button>
            <Button size="sm" onClick={save} disabled={!dirty || saving}>
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </div>

        {/* Paleta de condiciones + borrador */}
        <div className={`rounded-lg border bg-muted/30 p-3 transition-colors duration-150 ${
          paletteHint ? "border-primary ring-2 ring-primary/30" : "border-border"
        }`}>
          <p className={`mb-2 text-xs font-medium uppercase tracking-wide transition-colors duration-150 ${
            paletteHint
              ? "text-primary"
              : eraseMode
              ? "text-destructive"
              : "text-muted-foreground"
          }`}>
            {eraseMode
              ? "Modo borrador — haz clic en un diente para limpiar sus condiciones"
              : paletteHint
              ? "← Selecciona una condición primero"
              : "Selecciona una condición y haz clic en una superficie"}
          </p>
          <ConditionPalette
            selected={selectedCondition}
            onSelect={handleConditionSelect}
            eraseMode={eraseMode}
            onEraseToggle={handleEraseToggle}
          />
        </div>

        {/* Canvas */}
        <div className="overflow-x-auto rounded-lg border border-border bg-white p-4">
          <OdontogramCanvas
            teethData={teethData}
            selectedCondition={selectedCondition}
            eraseMode={eraseMode}
            onToothChange={handleToothChange}
            onNoConditionClick={triggerPaletteHint}
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

      {/* Confirmación de reset */}
      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Resetear el odontograma?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán todas las condiciones marcadas. Deberás guardar para que el cambio sea permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white"
              onClick={handleResetConfirm}
            >
              Resetear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
