"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type FAQ = {
  id: string
  question: string
  answer: string
  sort_order: number
  active: boolean
}

const EMPTY_FORM = {
  question: "",
  answer: "",
  sort_order: "",
  active: true,
}

export function FAQsTab() {
  const { toast } = useToast()
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [editing, setEditing] = useState<FAQ | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/faqs")
      const json = await res.json()
      setFaqs(json.faqs ?? [])
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar las FAQs", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const openNew = () => {
    setEditing(null)
    setForm({
      ...EMPTY_FORM,
      sort_order: faqs.length > 0 ? String(Math.max(...faqs.map((f) => f.sort_order)) + 1) : "1",
    })
    setDialogOpen(true)
  }

  const openEdit = (f: FAQ) => {
    setEditing(f)
    setForm({
      question: f.question,
      answer: f.answer,
      sort_order: f.sort_order.toString(),
      active: f.active,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      toast({ title: "Error", description: "Pregunta y respuesta son requeridas", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      const newOrder = form.sort_order ? parseInt(form.sort_order) : 0
      const payload = {
        question: form.question.trim(),
        answer: form.answer.trim(),
        sort_order: newOrder,
        active: form.active,
      }

      // Si el orden cambió al editar, hacer swap con quien tenga ese número
      if (editing && newOrder !== editing.sort_order) {
        const conflicting = faqs.find(
          (f) => f.id !== editing.id && f.sort_order === newOrder
        )
        if (conflicting) {
          await fetch(`/api/admin/faqs/${conflicting.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sort_order: editing.sort_order }),
          })
        }
      }

      const url = editing ? `/api/admin/faqs/${editing.id}` : "/api/admin/faqs"
      const method = editing ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      toast({ title: editing ? "Pregunta actualizada" : "Pregunta creada" })
      setDialogOpen(false)
      load()
    } catch {
      toast({ title: "Error", description: "No se pudo guardar la pregunta", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (faq: FAQ) => {
    setToggling(faq.id)
    try {
      const res = await fetch(`/api/admin/faqs/${faq.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !faq.active }),
      })
      if (!res.ok) throw new Error()
      setFaqs((prev) =>
        prev.map((f) => (f.id === faq.id ? { ...f, active: !faq.active } : f))
      )
    } catch {
      toast({ title: "Error", description: "No se pudo cambiar el estado", variant: "destructive" })
    } finally {
      setToggling(null)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast({ title: "Pregunta eliminada" })
      setFaqs((prev) => prev.filter((f) => f.id !== id))
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar la pregunta", variant: "destructive" })
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {faqs.filter((f) => f.active).length} de {faqs.length}{" "}
          {faqs.length === 1 ? "pregunta activa" : "preguntas activas"}
        </p>
        <Button onClick={openNew} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Agregar pregunta
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : faqs.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No hay preguntas frecuentes. Crea la primera.
        </p>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="flex items-start gap-4 rounded-lg border border-border bg-background p-4"
            >
              <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {faq.sort_order}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <p className="font-medium text-foreground leading-snug">{faq.question}</p>
                  {!faq.active && (
                    <Badge variant="secondary" className="flex-shrink-0 text-xs">
                      Oculta
                    </Badge>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{faq.answer}</p>
              </div>

              <div className="flex flex-shrink-0 items-center gap-1">
                <Switch
                  checked={faq.active}
                  onCheckedChange={() => handleToggleActive(faq)}
                  disabled={toggling === faq.id}
                  aria-label="Mostrar en el sitio"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openEdit(faq)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(faq.id)}
                  disabled={deleting === faq.id}
                >
                  {deleting === faq.id
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
            <DialogTitle>{editing ? "Editar pregunta" : "Nueva pregunta frecuente"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="faq-question">Pregunta *</Label>
              <Input
                id="faq-question"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="¿Cómo puedo agendar una cita?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="faq-answer">Respuesta *</Label>
              <Textarea
                id="faq-answer"
                rows={4}
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                placeholder="Puedes agendar tu cita desde nuestra página web..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="faq-order">Orden</Label>
                <Input
                  id="faq-order"
                  type="number"
                  min="0"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  placeholder="1"
                />
              </div>
              <div className="flex items-end gap-3 pb-1">
                <Switch
                  checked={form.active}
                  onCheckedChange={(v) => setForm({ ...form, active: v })}
                  id="faq-active"
                />
                <Label htmlFor="faq-active">Visible en el sitio</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear pregunta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
