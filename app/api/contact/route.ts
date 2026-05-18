import { Resend } from "resend"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { name, email, phone, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Nombre, email y mensaje son requeridos" },
        { status: 400 }
      )
    }

    await resend.emails.send({
      from: "DentaCare <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL!,
      subject: `Nuevo mensaje de contacto — ${name}`,
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
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Nuevo mensaje de contacto</p>
          </div>
          <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
            <h2 style="color: #0891b2; margin-top: 0;">Mensaje de ${name}</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #0891b2; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; width: 80px;">Nombre:</td>
                  <td style="padding: 8px 0; font-weight: bold;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Email:</td>
                  <td style="padding: 8px 0;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Teléfono:</td>
                  <td style="padding: 8px 0;">${phone || "No proporcionado"}</td>
                </tr>
              </table>
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #64748b; margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">Mensaje:</p>
              <p style="margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          <div style="background: #1e293b; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} DentaCare · Formulario de contacto
            </p>
          </div>
        </body>
        </html>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al enviar mensaje de contacto:", error)
    return NextResponse.json(
      { error: "Error al enviar el mensaje" },
      { status: 500 }
    )
  }
}
