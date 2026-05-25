import { getDashboardData } from "@/lib/dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, CalendarDays, Clock, CheckCircle, AlertCircle } from "lucide-react"
import type { AppointmentStatus } from "@/types"

const STAT_ICONS = [Calendar, Users, CalendarDays, Clock]

function getStatusConfig(status: AppointmentStatus) {
  switch (status) {
    case "completada":
      return { bg: "bg-accent/20 text-accent", text: "text-accent", Icon: CheckCircle, label: "Completada" }
    case "confirmada":
      return { bg: "bg-primary/20 text-primary", text: "text-primary", Icon: Clock, label: "Confirmada" }
    case "cancelada":
      return { bg: "bg-destructive/20 text-destructive", text: "text-destructive", Icon: AlertCircle, label: "Cancelada" }
    default:
      return { bg: "bg-muted text-muted-foreground", text: "text-muted-foreground", Icon: Clock, label: "Pendiente" }
  }
}

function formatRelativeDate(dateStr: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(`${dateStr}T12:00:00`)
  date.setHours(0, 0, 0, 0)
  const diffDays = Math.round((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0)  return "Hoy"
  if (diffDays === 1)  return "Ayer"
  if (diffDays === -1) return "Mañana"
  if (diffDays > 0 && diffDays <= 7)  return `Hace ${diffDays} días`
  if (diffDays < 0 && diffDays >= -7) return `En ${Math.abs(diffDays)} días`
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "short" })
}

export default async function AdminDashboard() {
  const { stats, todayAppointments, recentPatients } = await getDashboardData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Bienvenido al panel de administración de DentaCare
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = STAT_ICONS[i]
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-accent">{stat.change}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Citas de Hoy</CardTitle>
            <CardDescription>
              {todayAppointments.length === 0
                ? "No hay citas programadas para hoy"
                : `${todayAppointments.length} cita${todayAppointments.length !== 1 ? "s" : ""} programada${todayAppointments.length !== 1 ? "s" : ""} para hoy`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Sin citas para hoy</p>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((appointment) => {
                  const { bg, text, Icon, label } = getStatusConfig(appointment.status)
                  return (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${bg}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{appointment.patient_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.service} · {appointment.doctor}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">{appointment.appointment_time}</p>
                        <p className={`text-xs ${text}`}>{label}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pacientes Recientes</CardTitle>
            <CardDescription>Últimas visitas registradas</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPatients.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Sin pacientes registrados
              </p>
            ) : (
              <div className="space-y-4">
                {recentPatients.map((patient) => (
                  <div
                    key={patient.email}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {patient.name
                          .split(" ")
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{patient.name}</p>
                        <p className="text-xs capitalize text-muted-foreground">{patient.lastStatus}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeDate(patient.lastAppointmentDate)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
