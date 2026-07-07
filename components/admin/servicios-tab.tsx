"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sparkles, Shield, Stethoscope, Smile, HeartPulse, Zap,
  Anchor, Sun, Star, Activity, AlertTriangle, Search, Scissors,
  Plus, Pencil, Trash2, RefreshCw,
  type LucideIcon,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const ICONS: { name: string; icon: LucideIcon; label: string }[] = [
  { name: "Sparkles",      icon: Sparkles,      label: "Destellos (limpieza)" },
  { name: "Smile",         icon: Smile,         label: "Sonrisa (estética)" },
  { name: "HeartPulse",    icon: HeartPulse,    label: "Pulso cardíaco (salud)" },
  { name: "Shield",        icon: Shield,        label: "Escudo (protección)" },
  { name: "Stethoscope",   icon: Stethoscope,   label: "Estetoscopio (consulta)" },
  { name: "Zap",           icon: Zap,           label: "Rayo (urgencia)" },
  { name: "Anchor",        icon: Anchor,        label: "Ancla (implantes)" },
  { name: "Sun",           icon: Sun,           label: "Sol (blanqueamiento)" },
  { name: "Activity",      icon: Activity,      label: "Actividad (general)" },
  { name: "Star",          icon: Star,          label: "Estrella (premium)" },
  { name: "Search",        icon: Search,        label: "Lupa (diagnóstico)" },
  { name: "AlertTriangle", icon: AlertTriangle, label: "Alerta (emergencia)" },
  { name: "Scissors",      icon: Scissors,      label: "Tijeras (cirugía oral)" },
]

const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  ICONS.map(({ name, icon }) => [name, icon])
)

type Service = {
  id: string
  name: string
  description: string | null
  icon: string | null
  duration_minutes: number | null
  price: string | null
}

const EMPTY_FORM = {
  name: "",
  description: "",
  icon: "Stethoscope",
  duration_minutes: "",
  price: "",
}

export function ServiciosTab() {
  const { toast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/services")
      const json = await res.json()
      setServices(json.services ?? [])
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar los servicios", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const openNew = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (s: Service) => {
    setEditing(s)
    setForm({
      name: s.name,
      description: s.description ?? "",
      icon: s.icon ?? "Stethoscope",
      duration_minutes: s.duration_minutes?.toString() ?? "",
      price: s.price ?? "",
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    console.log("Saving service with form data:", form)
    if (!form.name.trim()) {
      toast({ title: "Error", description: "El nombre es requerido", variant: "destructive" })
      console.log("Aqui muero", form)
      return
    }
    setSaving(true)
    console.log("Aqui muero 1", setSaving)
    try {
      console.log("Aqui muero 2")
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        icon: form.icon || null,
        duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : null,
        price: form.price || null,
      }
      const url = editing ? `/api/admin/services/${editing.id}` : "/api/admin/services"
      const method = editing ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || "Error al guardar el servicio")
      }
      toast({ title: editing ? "Servicio actualizado" : "Servicio creado" })
      setDialogOpen(false)
      load()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "No se pudo guardar el servicio",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast({ title: "Servicio eliminado" })
      setServices((prev) => prev.filter((s) => s.id !== id))
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar el servicio", variant: "destructive" })
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {services.length} {services.length === 1 ? "servicio" : "servicios"} registrados
        </p>
        <Button onClick={openNew} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Agregar servicio
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : services.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No hay servicios registrados. Crea el primero.
        </p>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Icono</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden sm:table-cell">Descripción</TableHead>
                <TableHead className="hidden md:table-cell">Duración</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead className="w-24 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s) => {
                const Icon = ICON_MAP[s.icon ?? ""] ?? Stethoscope
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="hidden max-w-xs truncate sm:table-cell text-muted-foreground text-sm">
                      {s.description ?? <span className="italic">Sin descripción</span>}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {s.duration_minutes ? `${s.duration_minutes} min` : "—"}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-primary">
                      {s.price ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(s)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(s.id)}
                          disabled={deleting === s.id}
                        >
                          {deleting === s.id
                            ? <RefreshCw className="h-4 w-4 animate-spin" />
                            : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar servicio" : "Nuevo servicio"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="svc-name">Nombre *</Label>
              <Input
                id="svc-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Limpieza dental"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="svc-desc">Descripción</Label>
              <Textarea
                id="svc-desc"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Breve descripción del servicio..."
              />
            </div>

            <div className="space-y-2">
              <Label>Icono</Label>
              <Select value={form.icon} onValueChange={(v) => setForm({ ...form, icon: v })}>
                <SelectTrigger>
                  <SelectValue>
                    {(() => {
                      const found = ICONS.find((i) => i.name === form.icon)
                      if (!found) return "Seleccionar icono"
                      const I = found.icon
                      return (
                        <span className="flex items-center gap-2">
                          <I className="h-4 w-4" />
                          {found.label}
                        </span>
                      )
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ICONS.map(({ name, icon: I, label }) => (
                    <SelectItem key={name} value={name}>
                      <span className="flex items-center gap-2">
                        <I className="h-4 w-4" />
                        {label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="svc-duration">Duración (min)</Label>
                <Input
                  id="svc-duration"
                  type="number"
                  min="1"
                  value={form.duration_minutes}
                  onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                  placeholder="60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="svc-price">Precio</Label>
                <Input
                  id="svc-price"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="Desde $50"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear servicio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
