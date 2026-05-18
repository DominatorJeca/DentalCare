import { createClient } from "@/lib/supabase/server"
import type { AppointmentStatus } from "@/types"
import type { DashboardData } from "@/types/dashboard"

interface RawAppointment {
  id: string
  patient_name: string
  patient_email: string
  appointment_date: string
  appointment_time: string
  status: AppointmentStatus
  created_at: string
  doctor: { name: string } | null
  service: { name: string } | null
}

interface RawAppointmentSummary {
  patient_email: string
  patient_name: string
  appointment_date: string
  status: AppointmentStatus
  created_at: string
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient()
  const todayStr = new Date().toISOString().split("T")[0]
  const monthStart = todayStr.slice(0, 7) + "-01"

  const [todayResult, allResult] = await Promise.all([
    supabase
      .from("appointments")
      .select(
        "id, patient_name, patient_email, appointment_date, appointment_time, status, created_at, doctor:doctors(name), service:services(name)"
      )
      .eq("appointment_date", todayStr)
      .order("appointment_time"),

    supabase
      .from("appointments")
      .select("patient_email, patient_name, appointment_date, status, created_at")
      .order("created_at", { ascending: false }),
  ])

  const todayRaw = (todayResult.data as unknown ?? []) as RawAppointment[]
  const allRaw = (allResult.data as unknown ?? []) as RawAppointmentSummary[]

  const totalPatients = new Set(allRaw.map((a) => a.patient_email)).size
  const thisMonthCount = allRaw.filter((a) => a.appointment_date >= monthStart).length
  const pendingToday = todayRaw.filter(
    (a) => a.status === "pendiente" || a.status === "confirmada"
  ).length

  const seenEmails = new Set<string>()
  const recentPatients = allRaw
    .filter((a) => {
      if (seenEmails.has(a.patient_email)) return false
      seenEmails.add(a.patient_email)
      return true
    })
    .slice(0, 4)

  return {
    stats: [
      {
        title: "Citas Hoy",
        value: todayRaw.length.toString(),
        change: `${pendingToday} pendiente${pendingToday !== 1 ? "s" : ""}`,
      },
      {
        title: "Pacientes Totales",
        value: totalPatients.toLocaleString("es-ES"),
        change: "pacientes únicos registrados",
      },
      {
        title: "Citas este Mes",
        value: thisMonthCount.toLocaleString("es-ES"),
        change: new Date().toLocaleString("es-ES", { month: "long", year: "numeric" }),
      },
      {
        title: "Total Citas",
        value: allRaw.length.toLocaleString("es-ES"),
        change: "citas en el sistema",
      },
    ],
    todayAppointments: todayRaw.map((a) => ({
      id: a.id,
      patient_name: a.patient_name,
      appointment_time: a.appointment_time,
      status: a.status,
      doctor: a.doctor?.name ?? "—",
      service: a.service?.name ?? "—",
    })),
    recentPatients: recentPatients.map((a) => ({
      email: a.patient_email,
      name: a.patient_name,
      lastAppointmentDate: a.appointment_date,
      lastStatus: a.status,
    })),
  }
}
