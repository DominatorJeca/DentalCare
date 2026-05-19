"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, UserPlus, RefreshCw, Users, IdCard, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Patient } from "@/types"

export default function PacientesPage() {
  const { toast } = useToast()
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [newPatientOpen, setNewPatientOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    name: "", email: "", phone: "", identity_number: "",
  })

  const fetchPatients = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/pacientes")
      const data = await res.json()
      if (data.patients) setPatients(data.patients)
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar los pacientes", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchPatients() }, [fetchPatients])

  const filteredPatients = patients.filter((p) => {
    const q = searchTerm.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      (p.identity_number ?? "").toLowerCase().includes(q)
    )
  })

  const withCedula    = patients.filter((p) => p.identity_number).length
  const withoutCedula = patients.length - withCedula

  const handleCreate = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: "Campos requeridos", description: "Nombre y correo son obligatorios", variant: "destructive" })
      return
    }
    setIsSaving(true)
    try {
      const res = await fetch("/api/admin/pacientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:            form.name.trim(),
          email:           form.email.trim(),
          phone:           form.phone.trim(),
          identity_number: form.identity_number.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: "Error", description: data.error, variant: "destructive" })
        return
      }
      setPatients((prev) => [...prev, data.patient].sort((a, b) => a.name.localeCompare(b.name)))
      setNewPatientOpen(false)
      setForm({ name: "", email: "", phone: "", identity_number: "" })
      toast({ title: "Paciente registrado", description: `${data.patient.name} fue agregado correctamente` })
    } catch {
      toast({ title: "Error", description: "No se pudo registrar el paciente", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const initials = (name: string) =>
    name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">Pacientes</h1>
          <p className="mt-1 text-muted-foreground">Registro clínico de pacientes de la clínica</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPatients} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button onClick={() => setNewPatientOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Paciente
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pacientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold">{patients.length}</span>
              <Users className="mb-0.5 h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Con Cédula</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold">{withCedula}</span>
              <IdCard className="mb-0.5 h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sin Cédula</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold">{withoutCedula}</span>
              {withoutCedula > 0 && (
                <Badge variant="secondary" className="mb-0.5 text-xs">pendiente</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Lista de Pacientes</CardTitle>
              <CardDescription>
                {filteredPatients.length} paciente{filteredPatients.length !== 1 ? "s" : ""} encontrado{filteredPatients.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o cédula..."
                className="pl-9 sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Cargando pacientes...</span>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium">
                {patients.length === 0 ? "No hay pacientes registrados" : "Sin resultados"}
              </p>
              <p className="text-muted-foreground">
                {patients.length === 0
                  ? "Los pacientes aparecerán aquí al agendar su primera cita"
                  : "Intenta con otro nombre o cédula"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Cédula</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Registrado</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {initials(patient.name)}
                          </div>
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-xs text-muted-foreground">{patient.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {patient.identity_number
                          ? <span className="font-mono text-sm">{patient.identity_number}</span>
                          : <span className="text-muted-foreground/60 text-sm">—</span>}
                      </TableCell>
                      <TableCell className="text-sm">{patient.phone || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(patient.created_at).toLocaleDateString("es-ES")}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/pacientes/${patient.id}`}>
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal nuevo paciente */}
      <Dialog open={newPatientOpen} onOpenChange={setNewPatientOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Paciente</DialogTitle>
            <DialogDescription>
              Registra un paciente manualmente. Los que agendan cita online se crean automáticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Nombre completo <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                placeholder="Juan Pérez"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Correo electrónico <span className="text-destructive">*</span></Label>
              <Input
                id="email"
                type="email"
                placeholder="juan@email.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                placeholder="9999-0000"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="identity_number">Cédula de identidad</Label>
              <Input
                id="identity_number"
                placeholder="0801-2000-12345"
                value={form.identity_number}
                onChange={(e) => setForm((f) => ({ ...f, identity_number: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewPatientOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={isSaving}>
              {isSaving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
