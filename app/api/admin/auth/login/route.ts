import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { signToken, COOKIE_NAME } from "@/lib/auth"
import type { AdminSession } from "@/types"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: "Usuario y contraseña son requeridos" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: user } = await supabase
      .from("admin_users")
      .select("id, username, password_hash, role, doctor_id")
      .eq("username", username)
      .maybeSingle()

    if (!user) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password_hash)

    if (!valid) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })
    }

    const session: AdminSession = {
      userId: user.id,
      username: user.username,
      role: user.role as AdminSession["role"],
      doctorId: user.doctor_id,
    }

    const token = await signToken(session)

    const response = NextResponse.json({ success: true })
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    })

    return response
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
