import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"
import { NextResponse } from "next/server"
import type { AppointmentRow } from "@/types"

export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const body = await request.json()
    const {
      patientName,
      patientEmail,
      patientPhone,
      serviceId,
      doctorId,
      appointmentDate,
      appointmentTime,
      notes,
      status,
    } = body

    const VALID_STATUSES = ["pendiente", "confirmada", "completada", "cancelada"]
    const resolvedStatus = VALID_STATUSES.includes(status) ? status : "pendiente"

    if (!patientName || !patientEmail || !patientPhone || !serviceId || !doctorId || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Validar que el doctor realiza ese servicio
    const { data: doctorService } = await supabase
      .from("doctor_services")
      .select("doctor_id")
      .eq("doctor_id", doctorId)
      .eq("service_id", serviceId)
      .maybeSingle()

    if (!doctorService) {
      return NextResponse.json(
        { error: "El doctor seleccionado no realiza este servicio" },
        { status: 400 }
      )
    }

    // Obtener nombres y duración para el correo y la validación
    const [{ data: doctor }, { data: service }] = await Promise.all([
      supabase.from("doctors").select("name").eq("id", doctorId).single(),
      supabase.from("services").select("name, duration_minutes").eq("id", serviceId).single(),
    ])

    if (!doctor || !service) {
      return NextResponse.json(
        { error: "Doctor o servicio no encontrado" },
        { status: 404 }
      )
    }

    // Verificar conflicto de horario (mismo doctor, fecha y hora)
    const { data: existing } = await supabase
      .from("appointments")
      .select("id")
      .eq("doctor_id", doctorId)
      .eq("appointment_date", appointmentDate)
      .eq("appointment_time", appointmentTime)
      .not("status", "eq", "cancelada")
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: "Este horario ya no está disponible. Por favor seleccione otra hora." },
        { status: 409 }
      )
    }

    // Insertar la cita
    const { data: appointment, error: dbError } = await supabase
      .from("appointments")
      .insert({
        patient_name: patientName,
        patient_email: patientEmail,
        patient_phone: patientPhone,
        service_id: serviceId,
        doctor_id: doctorId,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        notes: notes || null,
        status: resolvedStatus,
      })
      .select()
      .single()

    if (dbError) {
      console.error("Error al guardar la cita:", dbError)
      return NextResponse.json(
        { error: "Error al guardar la cita" },
        { status: 500 }
      )
    }

    const origin = new URL(request.url).origin
    const cancelUrl = `${origin}/citas/cancelar?token=${appointment.cancel_token}`

    const formattedDate = new Date(`${appointmentDate}T12:00:00`).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    try {
      await resend.emails.send({
        from: "DentaCare <onboarding@resend.dev>",
        to: patientEmail,
        subject: "Confirmación de Cita - DentaCare",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">DentaCare</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Servicios Dentales de Excelencia</p>
            </div>
            <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
              <h2 style="color: #0891b2; margin-top: 0;">¡Cita Confirmada!</h2>
              <p>Estimado/a <strong>${patientName}</strong>,</p>
              <p>Su cita ha sido agendada exitosamente. A continuación los detalles:</p>
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #0891b2; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; width: 120px;">Servicio:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${service.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b;">Doctor:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${doctor.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b;">Fecha:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b;">Hora:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${appointmentTime}</td>
                  </tr>
                  ${notes ? `
                  <tr>
                    <td style="padding: 8px 0; color: #64748b;">Notas:</td>
                    <td style="padding: 8px 0;">${notes}</td>
                  </tr>
                  ` : ""}
                </table>
              </div>
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>Recordatorio:</strong> Por favor llegue 15 minutos antes de su cita.
                </p>
              </div>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${cancelUrl}" style="display: inline-block; padding: 10px 24px; background: #fee2e2; color: #991b1b; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
                  Cancelar mi cita
                </a>
              </div>
              <p style="color: #64748b; font-size: 14px;">
                Si tiene alguna pregunta, no dude en contactarnos:<br>
                Teléfono: +1 (555) 123-4567<br>
                Email: contacto@dentacare.com
              </p>
            </div>
            <div style="background: #1e293b; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
              <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} DentaCare. Todos los derechos reservados.<br>
                Av. Principal 123, Ciudad
              </p>
            </div>
          </body>
          </html>
        `,
      })
    } catch (emailError) {
      console.error("Error al enviar el correo:", emailError)
    }

    return NextResponse.json({
      success: true,
      message: "Cita agendada exitosamente",
      appointment,
    })
  } catch (error) {
    console.error("Error en la API de citas:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        doctor:doctors(name),
        service:services(name)
      `)
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true })

    if (error) {
      console.error("Error al obtener citas:", error)
      return NextResponse.json(
        { error: "Error al obtener las citas" },
        { status: 500 }
      )
    }

    const appointments = (data as AppointmentRow[]).map((apt) => ({
      ...apt,
      doctor: apt.doctor?.name ?? "",
      service: apt.service?.name ?? "",
    }))

    return NextResponse.json({ appointments })
  } catch (error) {
    console.error("Error en la API de citas:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
