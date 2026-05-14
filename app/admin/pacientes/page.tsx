"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, MoreHorizontal, UserPlus, Mail, Phone } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const patients = [
  {
    id: "PAT-001",
    name: "María López",
    email: "maria.lopez@email.com",
    phone: "+1 234 567 001",
    dateOfBirth: "1985-03-15",
    lastVisit: "2024-01-15",
    totalVisits: 12,
    status: "active",
  },
  {
    id: "PAT-002",
    name: "Carlos Ruiz",
    email: "carlos.ruiz@email.com",
    phone: "+1 234 567 002",
    dateOfBirth: "1990-07-22",
    lastVisit: "2024-01-15",
    totalVisits: 8,
    status: "active",
  },
  {
    id: "PAT-003",
    name: "Laura Sánchez",
    email: "laura.sanchez@email.com",
    phone: "+1 234 567 003",
    dateOfBirth: "1978-11-08",
    lastVisit: "2024-01-10",
    totalVisits: 24,
    status: "active",
  },
  {
    id: "PAT-004",
    name: "Pedro González",
    email: "pedro.gonzalez@email.com",
    phone: "+1 234 567 004",
    dateOfBirth: "1995-02-28",
    lastVisit: "2024-01-05",
    totalVisits: 5,
    status: "active",
  },
  {
    id: "PAT-005",
    name: "Ana Torres",
    email: "ana.torres@email.com",
    phone: "+1 234 567 005",
    dateOfBirth: "1982-09-14",
    lastVisit: "2023-12-20",
    totalVisits: 15,
    status: "inactive",
  },
  {
    id: "PAT-006",
    name: "Miguel Díaz",
    email: "miguel.diaz@email.com",
    phone: "+1 234 567 006",
    dateOfBirth: "1970-06-03",
    lastVisit: "2024-01-12",
    totalVisits: 32,
    status: "active",
  },
  {
    id: "PAT-007",
    name: "Rosa Fernández",
    email: "rosa.fernandez@email.com",
    phone: "+1 234 567 007",
    dateOfBirth: "1988-12-19",
    lastVisit: "2023-11-15",
    totalVisits: 7,
    status: "inactive",
  },
  {
    id: "PAT-008",
    name: "Jorge Martín",
    email: "jorge.martin@email.com",
    phone: "+1 234 567 008",
    dateOfBirth: "1992-04-25",
    lastVisit: "2024-01-08",
    totalVisits: 10,
    status: "active",
  },
]

export default function PacientesPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--
    }
    return age
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
            Pacientes
          </h1>
          <p className="mt-1 text-muted-foreground">
            Gestiona el registro de pacientes de la clínica
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo Paciente
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pacientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {patients.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pacientes Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {patients.filter((p) => p.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Visitas Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {patients.reduce((acc, p) => acc + p.totalVisits, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Lista de Pacientes</CardTitle>
              <CardDescription>
                {filteredPatients.length} pacientes encontrados
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar pacientes..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Edad</TableHead>
                  <TableHead>Última Visita</TableHead>
                  <TableHead>Visitas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {patient.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {patient.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {patient.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {patient.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{calculateAge(patient.dateOfBirth)} años</TableCell>
                    <TableCell>
                      {new Date(patient.lastVisit).toLocaleDateString("es-ES")}
                    </TableCell>
                    <TableCell>{patient.totalVisits}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          patient.status === "active" ? "default" : "secondary"
                        }
                      >
                        {patient.status === "active" ? "Activo" : "Inactivo"}
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
                          <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                          <DropdownMenuItem>Editar datos</DropdownMenuItem>
                          <DropdownMenuItem>Ver historial</DropdownMenuItem>
                          <DropdownMenuItem>Agendar cita</DropdownMenuItem>
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
