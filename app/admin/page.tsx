import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react"

const stats = [
  {
    title: "Citas Hoy",
    value: "12",
    change: "+2 desde ayer",
    icon: Calendar,
    trend: "up",
  },
  {
    title: "Pacientes Totales",
    value: "1,284",
    change: "+24 este mes",
    icon: Users,
    trend: "up",
  },
  {
    title: "Ingresos del Mes",
    value: "$18,540",
    change: "+12% vs mes anterior",
    icon: DollarSign,
    trend: "up",
  },
  {
    title: "Tasa de Asistencia",
    value: "94%",
    change: "+3% vs mes anterior",
    icon: TrendingUp,
    trend: "up",
  },
]

const todayAppointments = [
  {
    id: 1,
    patient: "María López",
    service: "Limpieza Dental",
    time: "09:00",
    doctor: "Dra. Ana Martínez",
    status: "completed",
  },
  {
    id: 2,
    patient: "Carlos Ruiz",
    service: "Consulta Ortodoncia",
    time: "09:45",
    doctor: "Dra. María García",
    status: "completed",
  },
  {
    id: 3,
    patient: "Laura Sánchez",
    service: "Blanqueamiento",
    time: "10:30",
    doctor: "Dra. Ana Martínez",
    status: "in-progress",
  },
  {
    id: 4,
    patient: "Pedro González",
    service: "Implantes",
    time: "11:30",
    doctor: "Dr. Carlos Rodríguez",
    status: "pending",
  },
  {
    id: 5,
    patient: "Ana Torres",
    service: "Endodoncia",
    time: "12:30",
    doctor: "Dr. Luis Fernández",
    status: "pending",
  },
  {
    id: 6,
    patient: "Miguel Díaz",
    service: "Revisión General",
    time: "15:00",
    doctor: "Dra. Ana Martínez",
    status: "pending",
  },
]

const recentPatients = [
  { name: "María López", lastVisit: "Hoy", nextVisit: "En 6 meses" },
  { name: "Carlos Ruiz", lastVisit: "Hoy", nextVisit: "En 2 semanas" },
  { name: "Patricia Moreno", lastVisit: "Ayer", nextVisit: "En 1 mes" },
  { name: "Roberto Sánchez", lastVisit: "Hace 2 días", nextVisit: "Pendiente" },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Bienvenido al panel de administración de DentaCare
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <p className="text-xs text-accent">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Citas de Hoy</CardTitle>
            <CardDescription>
              Tienes {todayAppointments.length} citas programadas para hoy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        appointment.status === "completed"
                          ? "bg-accent/20 text-accent"
                          : appointment.status === "in-progress"
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {appointment.status === "completed" ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Clock className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {appointment.patient}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.service} - {appointment.doctor}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">
                      {appointment.time}
                    </p>
                    <p
                      className={`text-xs ${
                        appointment.status === "completed"
                          ? "text-accent"
                          : appointment.status === "in-progress"
                            ? "text-primary"
                            : "text-muted-foreground"
                      }`}
                    >
                      {appointment.status === "completed"
                        ? "Completada"
                        : appointment.status === "in-progress"
                          ? "En progreso"
                          : "Pendiente"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Patients */}
        <Card>
          <CardHeader>
            <CardTitle>Pacientes Recientes</CardTitle>
            <CardDescription>
              Últimas visitas y próximas citas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPatients.map((patient, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {patient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {patient.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Última: {patient.lastVisit}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {patient.nextVisit}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
