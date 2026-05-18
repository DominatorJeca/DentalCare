"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Filter, MoreHorizontal, Calendar, Plus, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { RescheduleModal } from "@/components/admin/reschedule-modal"
import type { RescheduleTarget } from "@/components/admin/reschedule-modal"
import { NewAppointmentModal } from "@/components/admin/new-appointment-modal"
import type { Appointment, AppointmentStatus } from "@/types"

const PAGE_SIZE = 10

interface AppointmentFull extends Appointment {
  service_id: string
  doctor_id: string
}

const statusConfig: Record<AppointmentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendiente:  { label: "Pendiente",  variant: "secondary"    },
  confirmada: { label: "Confirmada", variant: "default"      },
  completada: { label: "Completada", variant: "outline"      },
  cancelada:  { label: "Cancelada",  variant: "destructive"  },
}

export default function CitasAdminPage() {
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<AppointmentFull[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [rescheduleTarget, setRescheduleTarget] = useState<RescheduleTarget | null>(null)
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/appointments")
      const data = await res.json()
      if (data.appointments) {
        setAppointments(data.appointments as AppointmentFull[])
      }
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar las citas", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: "Error", description: data.error, variant: "destructive" })
        return
      }
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
      toast({
        title: "Cita actualizada",
        description: `Estado cambiado a "${statusConfig[status].label}"`,
      })
    } catch {
      toast({ title: "Error", description: "No se pudo actualizar la cita", variant: "destructive" })
    } finally {
      setLoadingId(null)
    }
  }

  const handleRescheduleSuccess = (id: string, newDate: string, newTime: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, appointment_date: newDate, appointment_time: newTime } : a))
    )
    setRescheduleTarget(null)
    toast({
      title: "Cita reprogramada",
      description: `Nueva fecha: ${new Date(`${newDate}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "long" })} a las ${newTime}`,
    })
  }

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.service.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Reset a página 1 cuando cambia el filtro o búsqueda
  useEffect(() => { setCurrentPage(1) }, [searchTerm, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / PAGE_SIZE))
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = []
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== "ellipsis") {
        pages.push("ellipsis")
      }
    }
    return pages
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
            Gestión de Citas
          </h1>
          <p className="mt-1 text-muted-foreground">Administra todas las citas de la clínica</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAppointments} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button onClick={() => setNewAppointmentOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cita
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Todas las Citas</CardTitle>
              <CardDescription>
                {filteredAppointments.length} cita{filteredAppointments.length !== 1 ? "s" : ""} encontrada{filteredAppointments.length !== 1 ? "s" : ""} · página {currentPage} de {totalPages}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por paciente o servicio..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="confirmada">Confirmada</SelectItem>
                  <SelectItem value="completada">Completada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Cargando citas...</span>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium text-foreground">No hay citas</p>
              <p className="text-muted-foreground">Las citas agendadas aparecerán aquí</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAppointments.map((appointment) => (
                    <TableRow
                      key={appointment.id}
                      className={loadingId === appointment.id ? "opacity-50 pointer-events-none" : ""}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{appointment.patient_name}</p>
                          <p className="text-xs text-muted-foreground">{appointment.patient_email}</p>
                          <p className="text-xs text-muted-foreground">{appointment.patient_phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{appointment.service}</TableCell>
                      <TableCell>{appointment.doctor}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {new Date(`${appointment.appointment_date}T12:00:00`).toLocaleDateString("es-ES")}
                        </div>
                      </TableCell>
                      <TableCell>{appointment.appointment_time}</TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[appointment.status]?.variant ?? "secondary"}>
                          {statusConfig[appointment.status]?.label ?? appointment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={loadingId === appointment.id}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {appointment.status === "pendiente" && (
                              <DropdownMenuItem
                                onClick={() => updateStatus(appointment.id, "confirmada")}
                              >
                                Confirmar cita
                              </DropdownMenuItem>
                            )}
                            {appointment.status === "confirmada" && (
                              <DropdownMenuItem
                                onClick={() => updateStatus(appointment.id, "completada")}
                              >
                                Marcar como completada
                              </DropdownMenuItem>
                            )}
                            {(appointment.status === "pendiente" || appointment.status === "confirmada") && (
                              <>
                                <DropdownMenuItem onClick={() => setRescheduleTarget(appointment)}>
                                  Reprogramar cita
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => updateStatus(appointment.id, "cancelada")}
                                >
                                  Cancelar cita
                                </DropdownMenuItem>
                              </>
                            )}
                            {(appointment.status === "completada" || appointment.status === "cancelada") && (
                              <DropdownMenuItem disabled>
                                Sin acciones disponibles
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="flex items-center justify-between py-1">
                        <p className="text-xs text-muted-foreground">
                          Mostrando {Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredAppointments.length)}–{Math.min(currentPage * PAGE_SIZE, filteredAppointments.length)} de {filteredAppointments.length}
                        </p>
                        {totalPages > 1 && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>
                            {getPageNumbers().map((page, i) =>
                              page === "ellipsis" ? (
                                <span key={`e-${i}`} className="px-1 text-xs text-muted-foreground">…</span>
                              ) : (
                                <Button
                                  key={page}
                                  variant={currentPage === page ? "default" : "outline"}
                                  size="icon"
                                  className="h-7 w-7 text-xs"
                                  onClick={() => setCurrentPage(page)}
                                >
                                  {page}
                                </Button>
                              )
                            )}
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <RescheduleModal
        appointment={rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        onSuccess={handleRescheduleSuccess}
      />

      <NewAppointmentModal
        open={newAppointmentOpen}
        onClose={() => setNewAppointmentOpen(false)}
        onSuccess={() => {
          setNewAppointmentOpen(false)
          fetchAppointments()
          toast({ title: "Cita creada", description: "La cita fue agendada exitosamente" })
        }}
      />
    </div>
  )
}
