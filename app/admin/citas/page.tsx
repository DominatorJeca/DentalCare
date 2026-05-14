"use client"

import { useState } from "react"
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Filter, MoreHorizontal, Calendar, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled"

const appointments = [
  {
    id: "APT-001",
    patient: "María López",
    phone: "+1 234 567 001",
    service: "Limpieza Dental",
    doctor: "Dra. Ana Martínez",
    date: "2024-01-15",
    time: "09:00",
    status: "completed" as AppointmentStatus,
  },
  {
    id: "APT-002",
    patient: "Carlos Ruiz",
    phone: "+1 234 567 002",
    service: "Consulta Ortodoncia",
    doctor: "Dra. María García",
    date: "2024-01-15",
    time: "09:45",
    status: "completed" as AppointmentStatus,
  },
  {
    id: "APT-003",
    patient: "Laura Sánchez",
    phone: "+1 234 567 003",
    service: "Blanqueamiento",
    doctor: "Dra. Ana Martínez",
    date: "2024-01-15",
    time: "10:30",
    status: "confirmed" as AppointmentStatus,
  },
  {
    id: "APT-004",
    patient: "Pedro González",
    phone: "+1 234 567 004",
    service: "Implantes",
    doctor: "Dr. Carlos Rodríguez",
    date: "2024-01-15",
    time: "11:30",
    status: "pending" as AppointmentStatus,
  },
  {
    id: "APT-005",
    patient: "Ana Torres",
    phone: "+1 234 567 005",
    service: "Endodoncia",
    doctor: "Dr. Luis Fernández",
    date: "2024-01-16",
    time: "09:00",
    status: "pending" as AppointmentStatus,
  },
  {
    id: "APT-006",
    patient: "Miguel Díaz",
    phone: "+1 234 567 006",
    service: "Revisión General",
    doctor: "Dra. Ana Martínez",
    date: "2024-01-16",
    time: "10:00",
    status: "confirmed" as AppointmentStatus,
  },
  {
    id: "APT-007",
    patient: "Rosa Fernández",
    phone: "+1 234 567 007",
    service: "Urgencia Dental",
    doctor: "Dr. Carlos Rodríguez",
    date: "2024-01-14",
    time: "16:00",
    status: "cancelled" as AppointmentStatus,
  },
  {
    id: "APT-008",
    patient: "Jorge Martín",
    phone: "+1 234 567 008",
    service: "Limpieza Dental",
    doctor: "Dra. María García",
    date: "2024-01-17",
    time: "11:00",
    status: "pending" as AppointmentStatus,
  },
]

const statusConfig: Record<AppointmentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendiente", variant: "secondary" },
  confirmed: { label: "Confirmada", variant: "default" },
  completed: { label: "Completada", variant: "outline" },
  cancelled: { label: "Cancelada", variant: "destructive" },
}

export default function CitasAdminPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.service.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
            Gestión de Citas
          </h1>
          <p className="mt-1 text-muted-foreground">
            Administra todas las citas de la clínica
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Cita
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Todas las Citas</CardTitle>
              <CardDescription>
                {filteredAppointments.length} citas encontradas
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar citas..."
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
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">
                      {appointment.id}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{appointment.patient}</p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{appointment.service}</TableCell>
                    <TableCell>{appointment.doctor}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(appointment.date).toLocaleDateString("es-ES")}
                      </div>
                    </TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[appointment.status].variant}>
                        {statusConfig[appointment.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                          <DropdownMenuItem>Editar cita</DropdownMenuItem>
                          <DropdownMenuItem>Confirmar cita</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Cancelar cita
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
