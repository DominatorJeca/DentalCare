"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Pencil,
  Save,
  X,
  Calendar,
  FileText,
  Upload,
  Trash2,
  Download,
  FilePlus,
  IdCard,
  Phone,
  Mail,
  ImageIcon,
  FileIcon,
  ClipboardList,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Patient, PatientRecord, PatientFile, AppointmentStatus } from "@/types"

interface AppointmentRow {
  id: string
  appointment_date: string
  appointment_time: string
  status: AppointmentStatus
  service: string
  doctor: string
}

interface FileWithUrl extends PatientFile {
  signed_url: string | null
}

const statusConfig: Record<AppointmentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendiente:  { label: "Pendiente",  variant: "secondary"   },
  confirmada: { label: "Confirmada", variant: "default"     },
  completada: { label: "Completada", variant: "outline"     },
  cancelada:  { label: "Cancelada",  variant: "destructive" },
}

const formatSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const initials = (name: string) =>
  name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()

  // Data
  const [patient, setPatient]           = useState<Patient | null>(null)
  const [records, setRecords]           = useState<PatientRecord[]>([])
  const [appointments, setAppointments] = useState<AppointmentRow[]>([])
  const [files, setFiles]               = useState<FileWithUrl[]>([])
  const [isLoading, setIsLoading]       = useState(true)

  // Patient edit
  const [isEditingPatient, setIsEditingPatient] = useState(false)
  const [editForm, setEditForm] = useState({ name: "", phone: "", identity_number: "" })
  const [isSavingPatient, setIsSavingPatient] = useState(false)

  // Record / notes
  const [selectedRecord, setSelectedRecord] = useState<PatientRecord | null>(null)
  const [notes, setNotes]                   = useState("")
  const [isSavingNotes, setIsSavingNotes]   = useState(false)
  const [isCreatingRecord, setIsCreatingRecord] = useState(false)

  // Appointment pagination
  const [aptPage, setAptPage] = useState(1)
  const APT_PAGE_SIZE = 5

  // Files
  const fileInputRef                      = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile]   = useState<File | null>(null)
  const [uploadDesc, setUploadDesc]       = useState("")
  const [isUploading, setIsUploading]     = useState(false)
  const [fileToDelete, setFileToDelete]   = useState<FileWithUrl | null>(null)
  const [isDeletingFile, setIsDeletingFile] = useState(false)

  // ─── Load ────────────────────────────────────────────────────────────────

  const fetchPatient = useCallback(async () => {
    try {
      const [detailRes, filesRes] = await Promise.all([
        fetch(`/api/admin/pacientes/${id}`),
        fetch(`/api/admin/pacientes/${id}/files`),
      ])
      const detail = await detailRes.json()
      const filesData = await filesRes.json()

      if (!detailRes.ok) throw new Error(detail.error)

      setPatient(detail.patient)
      setRecords(detail.records)
      setAppointments(detail.appointments)
      setFiles(filesData.files ?? [])

      const latest = detail.records[0] ?? null
      setSelectedRecord(latest)
      setNotes(latest?.notes ?? "")
    } catch {
      toast({ title: "Error", description: "No se pudo cargar la ficha del paciente", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [id, toast])

  useEffect(() => { fetchPatient() }, [fetchPatient])

  // ─── Patient edit ────────────────────────────────────────────────────────

  const startEditPatient = () => {
    if (!patient) return
    setEditForm({
      name:            patient.name,
      phone:           patient.phone,
      identity_number: patient.identity_number ?? "",
    })
    setIsEditingPatient(true)
  }

  const handleSavePatient = async () => {
    if (!editForm.name.trim()) {
      toast({ title: "El nombre es requerido", variant: "destructive" })
      return
    }
    setIsSavingPatient(true)
    try {
      const res = await fetch(`/api/admin/pacientes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:            editForm.name.trim(),
          phone:           editForm.phone.trim(),
          identity_number: editForm.identity_number.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: "Error", description: data.error, variant: "destructive" })
        return
      }
      setPatient(data.patient)
      setIsEditingPatient(false)
      toast({ title: "Datos actualizados" })
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" })
    } finally {
      setIsSavingPatient(false)
    }
  }

  // ─── Records / notes ─────────────────────────────────────────────────────

  const handleCreateRecord = async () => {
    setIsCreatingRecord(true)
    try {
      const res = await fetch(`/api/admin/pacientes/${id}/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "" }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: "Error", description: data.error, variant: "destructive" })
        return
      }
      const newRecord = data.record as PatientRecord
      setRecords((prev) => [newRecord, ...prev])
      setSelectedRecord(newRecord)
      setNotes("")
    } catch {
      toast({ title: "Error al crear ficha", variant: "destructive" })
    } finally {
      setIsCreatingRecord(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!selectedRecord) return
    setIsSavingNotes(true)
    try {
      const res = await fetch(`/api/admin/pacientes/${id}/records/${selectedRecord.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: "Error", description: data.error, variant: "destructive" })
        return
      }
      const updated = data.record as PatientRecord
      setRecords((prev) => prev.map((r) => r.id === updated.id ? updated : r))
      setSelectedRecord(updated)
      toast({ title: "Notas guardadas" })
    } catch {
      toast({ title: "Error al guardar notas", variant: "destructive" })
    } finally {
      setIsSavingNotes(false)
    }
  }

  // ─── Files ───────────────────────────────────────────────────────────────

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setSelectedFile(file)
    setUploadDesc("")
    e.target.value = ""
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", selectedFile)
      if (uploadDesc.trim()) fd.append("description", uploadDesc.trim())

      const res = await fetch(`/api/admin/pacientes/${id}/files`, {
        method: "POST",
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: "Error", description: data.error, variant: "destructive" })
        return
      }
      // Refetch files to get signed URL
      const filesRes = await fetch(`/api/admin/pacientes/${id}/files`)
      const filesData = await filesRes.json()
      setFiles(filesData.files ?? [])
      setSelectedFile(null)
      setUploadDesc("")
      toast({ title: "Archivo subido", description: selectedFile.name })
    } catch {
      toast({ title: "Error al subir archivo", variant: "destructive" })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteFile = async () => {
    if (!fileToDelete) return
    setIsDeletingFile(true)
    try {
      const res = await fetch(`/api/admin/pacientes/${id}/files?fileId=${fileToDelete.id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json()
        toast({ title: "Error", description: data.error, variant: "destructive" })
        return
      }
      setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id))
      toast({ title: "Archivo eliminado" })
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" })
    } finally {
      setIsDeletingFile(false)
      setFileToDelete(null)
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Cargando ficha...</span>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium">Paciente no encontrado</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/admin/pacientes"><ChevronLeft className="mr-2 h-4 w-4" />Volver</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb + header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/admin/pacientes" className="hover:text-foreground transition-colors">
              Pacientes
            </Link>
            <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
            <span className="text-foreground">{patient.name}</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">{patient.name}</h1>
        </div>
      </div>

      {/* Patient info card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                {initials(patient.name)}
              </div>
              <div>
                <CardTitle className="text-lg">{patient.name}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-0.5">
                  <Mail className="h-3.5 w-3.5" />
                  {patient.email}
                </CardDescription>
              </div>
            </div>
            {!isEditingPatient && (
              <Button variant="outline" size="sm" onClick={startEditPatient}>
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Editar
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {isEditingPatient ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-1.5">
                <Label htmlFor="edit-name">Nombre</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="edit-phone">Teléfono</Label>
                <Input
                  id="edit-phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="edit-cedula">Cédula de identidad</Label>
                <Input
                  id="edit-cedula"
                  placeholder="0801-2000-12345"
                  value={editForm.identity_number}
                  onChange={(e) => setEditForm((f) => ({ ...f, identity_number: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-3 flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setIsEditingPatient(false)} disabled={isSavingPatient}>
                  <X className="mr-2 h-3.5 w-3.5" />Cancelar
                </Button>
                <Button size="sm" onClick={handleSavePatient} disabled={isSavingPatient}>
                  {isSavingPatient
                    ? <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
                    : <Save className="mr-2 h-3.5 w-3.5" />}
                  Guardar
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-2 text-sm">
                <IdCard className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Cédula:</span>
                <span className={patient.identity_number ? "font-mono" : "text-muted-foreground/60"}>
                  {patient.identity_number ?? "No registrada"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Teléfono:</span>
                <span>{patient.phone || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Registrado:</span>
                <span>{new Date(patient.created_at).toLocaleDateString("es-ES")}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="resumen">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="resumen" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="ficha" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Ficha Clínica
          </TabsTrigger>
          <TabsTrigger value="archivos" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Archivos
            {files.length > 0 && (
              <Badge variant="secondary" className="h-5 min-w-5 rounded-full px-1 text-[10px]">
                {files.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Tab: Resumen ─────────────────────────────────────────── */}
        <TabsContent value="resumen" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Citas</CardTitle>
              <CardDescription>
                {appointments.length} cita{appointments.length !== 1 ? "s" : ""} registrada{appointments.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Calendar className="h-10 w-10 text-muted-foreground/50" />
                  <p className="mt-3 font-medium">Sin citas registradas</p>
                  <p className="text-sm text-muted-foreground">Las citas del paciente aparecerán aquí</p>
                </div>
              ) : (() => {
                const totalAptPages = Math.ceil(appointments.length / APT_PAGE_SIZE)
                const paged = appointments.slice((aptPage - 1) * APT_PAGE_SIZE, aptPage * APT_PAGE_SIZE)
                return (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Hora</TableHead>
                          <TableHead>Servicio</TableHead>
                          <TableHead>Doctor</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paged.map((apt) => (
                          <TableRow key={apt.id}>
                            <TableCell>
                              {new Date(`${apt.appointment_date}T12:00:00`).toLocaleDateString("es-ES")}
                            </TableCell>
                            <TableCell>{apt.appointment_time}</TableCell>
                            <TableCell>{apt.service}</TableCell>
                            <TableCell>{apt.doctor}</TableCell>
                            <TableCell>
                              <Badge variant={statusConfig[apt.status]?.variant ?? "secondary"}>
                                {statusConfig[apt.status]?.label ?? apt.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      {totalAptPages > 1 && (
                        <TableFooter>
                          <TableRow>
                            <TableCell colSpan={5}>
                              <div className="flex items-center justify-between py-1">
                                <p className="text-xs text-muted-foreground">
                                  {(aptPage - 1) * APT_PAGE_SIZE + 1}–{Math.min(aptPage * APT_PAGE_SIZE, appointments.length)} de {appointments.length}
                                </p>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="outline" size="icon" className="h-7 w-7"
                                    onClick={() => setAptPage((p) => p - 1)}
                                    disabled={aptPage === 1}
                                  >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                  </Button>
                                  <span className="px-2 text-xs">
                                    {aptPage} / {totalAptPages}
                                  </span>
                                  <Button
                                    variant="outline" size="icon" className="h-7 w-7"
                                    onClick={() => setAptPage((p) => p + 1)}
                                    disabled={aptPage === totalAptPages}
                                  >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        </TableFooter>
                      )}
                    </Table>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: Ficha Clínica ───────────────────────────────────── */}
        <TabsContent value="ficha" className="mt-4 space-y-4">
          {records.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-14 text-center">
                <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-lg font-medium">Sin ficha clínica</p>
                <p className="text-sm text-muted-foreground">Crea la primera ficha para registrar notas clínicas</p>
                <Button className="mt-4" onClick={handleCreateRecord} disabled={isCreatingRecord}>
                  {isCreatingRecord
                    ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    : <FilePlus className="mr-2 h-4 w-4" />}
                  Crear primera ficha
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Record selector + new record */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  {records.map((r, i) => (
                    <Button
                      key={r.id}
                      variant={selectedRecord?.id === r.id ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => { setSelectedRecord(r); setNotes(r.notes) }}
                    >
                      Consulta {records.length - i}
                      <span className="ml-1.5 text-[10px] opacity-70">
                        {new Date(r.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                      </span>
                    </Button>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={handleCreateRecord} disabled={isCreatingRecord}>
                  {isCreatingRecord
                    ? <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
                    : <FilePlus className="mr-2 h-3.5 w-3.5" />}
                  Nueva consulta
                </Button>
              </div>

              {selectedRecord && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Notas clínicas</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Actualizado {new Date(selectedRecord.updated_at).toLocaleDateString("es-ES", {
                          day: "numeric", month: "long", year: "numeric"
                        })}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Textarea
                      placeholder="Escribe las notas de la consulta aquí..."
                      className="min-h-40 resize-none"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleSaveNotes} disabled={isSavingNotes}>
                        {isSavingNotes
                          ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          : <Save className="mr-2 h-4 w-4" />}
                        Guardar notas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Odontogram placeholder */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Odontograma</CardTitle>
                  <CardDescription>Mapa dental interactivo del paciente</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border py-14 text-muted-foreground">
                    Odontograma SVG — Paso 5
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ── Tab: Archivos ────────────────────────────────────────── */}
        <TabsContent value="archivos" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>Archivos del Paciente</CardTitle>
                  <CardDescription>Radiografías, exámenes y documentos clínicos</CardDescription>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir archivo
                  </Button>
                  <p className="text-xs text-muted-foreground">JPG, PNG, WEBP, GIF, PDF · Máx. 50 MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                  onChange={handleFileSelect}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload preview */}
              {selectedFile && (
                <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    {selectedFile.type.startsWith("image/")
                      ? <ImageIcon className="h-8 w-8 text-primary shrink-0" />
                      : <FileIcon className="h-8 w-8 text-primary shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">{formatSize(selectedFile.size)}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setSelectedFile(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Descripción (ej: Rx periapical cuadrante 1)"
                    value={uploadDesc}
                    onChange={(e) => setUploadDesc(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedFile(null)}>Cancelar</Button>
                    <Button size="sm" onClick={handleUpload} disabled={isUploading}>
                      {isUploading
                        ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        : <Upload className="mr-2 h-4 w-4" />}
                      Subir
                    </Button>
                  </div>
                </div>
              )}

              <Separator />

              {/* File grid */}
              {files.length === 0 ? (
                <button
                  className="w-full rounded-lg border-2 border-dashed border-border py-12 text-center transition-colors hover:border-primary/50 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto h-10 w-10 text-muted-foreground/50" />
                  <p className="mt-3 font-medium text-foreground">Haz clic para subir un archivo</p>
                  <p className="mt-1 text-sm text-muted-foreground">Radiografías, exámenes y documentos clínicos</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    {["JPG", "PNG", "WEBP", "GIF", "PDF"].map((fmt) => (
                      <span key={fmt} className="rounded-md bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
                        {fmt}
                      </span>
                    ))}
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      Máx. 50 MB
                    </span>
                  </div>
                </button>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {files.map((file) => (
                    <div key={file.id} className="group relative rounded-lg border border-border bg-card overflow-hidden">
                      {/* Thumbnail or icon */}
                      {file.file_type.startsWith("image/") && file.signed_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={file.signed_url}
                          alt={file.file_name}
                          className="h-36 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-36 items-center justify-center bg-muted/50">
                          <FileIcon className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                      )}
                      {/* Info */}
                      <div className="p-3 space-y-1">
                        <p className="truncate text-sm font-medium">{file.file_name}</p>
                        {file.description && (
                          <p className="truncate text-xs text-muted-foreground">{file.description}</p>
                        )}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-muted-foreground">{formatSize(file.file_size)}</span>
                          <div className="flex gap-1">
                            {file.signed_url && (
                              <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                                <a href={file.signed_url} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-3.5 w-3.5" />
                                </a>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => setFileToDelete(file)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete file confirmation */}
      <AlertDialog open={!!fileToDelete} onOpenChange={(open) => !open && setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar archivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente <strong>{fileToDelete?.file_name}</strong>. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingFile}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteFile}
              disabled={isDeletingFile}
            >
              {isDeletingFile ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
