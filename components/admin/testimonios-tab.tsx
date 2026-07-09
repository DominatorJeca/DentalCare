"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Check, X, Pencil, Trash2, RefreshCw, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Testimonial, TestimonialStatus } from "@/types"

const STATUS_LABEL: Record<TestimonialStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
}

const STATUS_VARIANT: Record<TestimonialStatus, "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
}

const EMPTY_FORM = { name: "", treatment: "", rating: 5, text: "" }

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="rounded p-0.5 hover:bg-muted"
          aria-label={`${n} estrellas`}
        >
          <Star className={`h-5 w-5 ${n <= value ? "fill-primary text-primary" : "text-muted-foreground"}`} />
        </button>
      ))}
    </div>
  )
}

export function TestimoniosTab() {
  const { toast } = useToast()
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/testimonials")
      const json = await res.json()
      setTestimonials(json.testimonials ?? [])
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar los testimonios", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const openEdit = (t: Testimonial) => {
    setEditing(t)
    setForm({ name: t.name, treatment: t.treatment, rating: t.rating, text: t.text })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!editing) return
    if (!form.name.trim() || !form.treatment.trim() || !form.text.trim()) {
      toast({ title: "Error", description: "Nombre, tratamiento y testimonio son requeridos", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/testimonials/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          treatment: form.treatment.trim(),
          rating: form.rating,
          text: form.text.trim(),
        }),
      })
      if (!res.ok) throw new Error()
      toast({ title: "Testimonio actualizado" })
      setDialogOpen(false)
      load()
    } catch {
      toast({ title: "Error", description: "No se pudo guardar el testimonio", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const setStatus = async (t: Testimonial, status: TestimonialStatus) => {
    setBusyId(t.id)
    try {
      const res = await fetch(`/api/admin/testimonials/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      setTestimonials((prev) => prev.map((x) => (x.id === t.id ? { ...x, status } : x)))
    } catch {
      toast({ title: "Error", description: "No se pudo cambiar el estado", variant: "destructive" })
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (id: string) => {
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast({ title: "Testimonio eliminado" })
      setTestimonials((prev) => prev.filter((t) => t.id !== id))
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar el testimonio", variant: "destructive" })
    } finally {
      setBusyId(null)
    }
  }

  const pendingCount = testimonials.filter((t) => t.status === "pending").length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {pendingCount > 0
            ? `${pendingCount} testimonio${pendingCount === 1 ? "" : "s"} pendiente${pendingCount === 1 ? "" : "s"} de revisión`
            : "No hay testimonios pendientes de revisión"}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : testimonials.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Aún no se ha enviado ningún testimonio desde el sitio.
        </p>
      ) : (
        <div className="space-y-3">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="flex items-start gap-4 rounded-lg border border-border bg-background p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{t.name}</p>
                  <Badge variant={STATUS_VARIANT[t.status]} className="text-xs">
                    {STATUS_LABEL[t.status]}
                  </Badge>
                </div>
                <p className="text-sm text-primary">{t.treatment}</p>
                <div className="mt-1 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{t.text}</p>
              </div>

              <div className="flex flex-shrink-0 items-center gap-1">
                {t.status !== "approved" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary hover:text-primary"
                    onClick={() => setStatus(t, "approved")}
                    disabled={busyId === t.id}
                    aria-label="Aprobar"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                {t.status !== "rejected" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setStatus(t, "rejected")}
                    disabled={busyId === t.id}
                    aria-label="Rechazar"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openEdit(t)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(t.id)}
                  disabled={busyId === t.id}
                >
                  {busyId === t.id
                    ? <RefreshCw className="h-4 w-4 animate-spin" />
                    : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar testimonio</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="testimonial-name">Nombre *</Label>
                <Input
                  id="testimonial-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="testimonial-treatment">Tratamiento *</Label>
                <Input
                  id="testimonial-treatment"
                  value={form.treatment}
                  onChange={(e) => setForm({ ...form, treatment: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Calificación</Label>
              <StarPicker value={form.rating} onChange={(n) => setForm({ ...form, rating: n })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="testimonial-text">Testimonio *</Label>
              <Textarea
                id="testimonial-text"
                rows={4}
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
