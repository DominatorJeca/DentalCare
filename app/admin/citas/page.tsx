"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, Filter, MoreHorizontal, Calendar, CalendarRange, Plus, RefreshCw, ChevronLeft, ChevronRight, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { es } from "date-fns/locale"
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
  const [statusFilter, setStatusFilter] = useState<Set<AppointmentStatus>>(new Set())
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [rescheduleTarget, setRescheduleTarget] = useState<RescheduleTarget | null>(null)
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<"patient_name" | "service" | "doctor" | "appointment_date" | "status" | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const handleSort = (field: "patient_name" | "service" | "doctor" | "appointment_date" | "status") => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const toggleStatus = (status: AppointmentStatus) => {
    setStatusFilter((prev) => {
      const next = new Set(prev)
      if (next.has(status)) next.delete(status)
      else next.add(status)
      return next
    })
  }

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

  const toLocalDateStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.service.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter.size === 0 || statusFilter.has(apt.status)
    const matchesDate = (() => {
      if (!dateRange?.from) return true
      const from = toLocalDateStr(dateRange.from)
      const to = dateRange.to ? toLocalDateStr(dateRange.to) : from
      return apt.appointment_date >= from && apt.appointment_date <= to
    })()
    return matchesSearch && matchesStatus && matchesDate
  })

  useEffect(() => { setCurrentPage(1) }, [searchTerm, statusFilter, dateRange, sortField, sortDir])

  const sortedAppointments = sortField
    ? [...filteredAppointments].sort((a, b) => {
        let cmp = 0
        if (sortField === "appointment_date") {
          cmp = a.appointment_date.localeCompare(b.appointment_date)
            || a.appointment_time.localeCompare(b.appointment_time)
        } else {
          cmp = a[sortField].localeCompare(b[sortField])
        }
        return sortDir === "asc" ? cmp : -cmp
      })
    : filteredAppointments

  const totalPages = Math.max(1, Math.ceil(sortedAppointments.length / PAGE_SIZE))
  const paginatedAppointments = sortedAppointments.slice(
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
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por paciente o servicio..."
                  className="pl-9 sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filtro por estado */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto justify-start sm:justify-center">
                    <Filter className="mr-2 h-4 w-4 shrink-0" />
                    Estado
                    {statusFilter.size > 0 && (
                      <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                        {statusFilter.size}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Filtrar por estado</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(Object.keys(statusConfig) as AppointmentStatus[]).map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={statusFilter.has(status)}
                      onCheckedChange={() => toggleStatus(status)}
                    >
                      {statusConfig[status].label}
                    </DropdownMenuCheckboxItem>
                  ))}
                  {statusFilter.size > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-muted-foreground text-xs"
                        onClick={() => setStatusFilter(new Set())}
                      >
                        <X className="mr-2 h-3.5 w-3.5" />
                        Limpiar filtro
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Filtro por rango de fechas */}
              <div className="flex w-full sm:w-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`flex-1 sm:flex-none justify-start sm:justify-center${dateRange?.from ? " rounded-r-none border-r-0" : ""}`}
                    >
                      <CalendarRange className="mr-2 h-4 w-4 shrink-0" />
                      {dateRange?.from ? (
                        <span>
                          {dateRange.from.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                          {dateRange.to && dateRange.to.getTime() !== dateRange.from.getTime()
                            ? ` – ${dateRange.to.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}`
                            : ""}
                        </span>
                      ) : (
                        "Fecha"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <CalendarComponent
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={1}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
                {dateRange?.from && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-l-none px-2"
                    onClick={() => setDateRange(undefined)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
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
            <>
              {/* Mobile: tarjetas */}
              <div className="sm:hidden space-y-3">
                {paginatedAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`rounded-lg border border-border bg-background p-4${loadingId === appointment.id ? " opacity-50 pointer-events-none" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium leading-tight">{appointment.patient_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{appointment.patient_email}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={statusConfig[appointment.status]?.variant ?? "secondary"}>
                          {statusConfig[appointment.status]?.label ?? appointment.status}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={loadingId === appointment.id}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {appointment.status === "pendiente" && (
                              <DropdownMenuItem onClick={() => updateStatus(appointment.id, "confirmada")}>
                                Confirmar cita
                              </DropdownMenuItem>
                            )}
                            {appointment.status === "confirmada" && (
                              <DropdownMenuItem onClick={() => updateStatus(appointment.id, "completada")}>
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
                              <DropdownMenuItem disabled>Sin acciones disponibles</DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <span>{appointment.service}</span>
                      <span className="mx-1.5">·</span>
                      <span>{appointment.doctor}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span>{new Date(`${appointment.appointment_date}T12:00:00`).toLocaleDateString("es-ES")}</span>
                      <span className="mx-0.5">·</span>
                      <span>{appointment.appointment_time}</span>
                    </div>
                  </div>
                ))}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-muted-foreground">
                      {Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredAppointments.length)}–{Math.min(currentPage * PAGE_SIZE, filteredAppointments.length)} de {filteredAppointments.length}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      {getPageNumbers().map((page, i) =>
                        page === "ellipsis" ? (
                          <span key={`e-${i}`} className="px-1 text-xs text-muted-foreground">…</span>
                        ) : (
                          <Button key={page} variant={currentPage === page ? "default" : "outline"} size="icon" className="h-7 w-7 text-xs" onClick={() => setCurrentPage(page)}>
                            {page}
                          </Button>
                        )
                      )}
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop: tabla */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {([
                        { label: "Paciente",  field: "patient_name"      },
                        { label: "Servicio",  field: "service"            },
                        { label: "Doctor",    field: "doctor"             },
                        { label: "Fecha",     field: "appointment_date"   },
                        { label: "Hora",      field: null                 },
                        { label: "Estado",    field: "status"             },
                      ] as { label: string; field: "patient_name" | "service" | "doctor" | "appointment_date" | "status" | null }[]).map(({ label, field }) => {
                        if (!field) return <TableHead key={label}>{label}</TableHead>
                        const Icon = sortField !== field ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown
                        return (
                          <TableHead key={field}>
                            <button
                              className="flex items-center gap-1 hover:text-foreground transition-colors select-none"
                              onClick={() => handleSort(field)}
                            >
                              {label}
                              <Icon className={`h-3.5 w-3.5 ${sortField === field ? "text-foreground" : "text-muted-foreground/50"}`} />
                            </button>
                          </TableHead>
                        )
                      })}
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
                                <DropdownMenuItem onClick={() => updateStatus(appointment.id, "confirmada")}>
                                  Confirmar cita
                                </DropdownMenuItem>
                              )}
                              {appointment.status === "confirmada" && (
                                <DropdownMenuItem onClick={() => updateStatus(appointment.id, "completada")}>
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
            </>
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
