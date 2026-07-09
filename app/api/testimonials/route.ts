import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, treatment, rating, text } = body

    if (!name?.trim() || !treatment?.trim() || !text?.trim()) {
      return NextResponse.json(
        { error: "Nombre, tratamiento y testimonio son requeridos" },
        { status: 400 }
      )
    }

    const parsedRating = Number(rating)
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json(
        { error: "La calificación debe ser un número entre 1 y 5" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { error } = await supabase.from("testimonials").insert({
      name: name.trim(),
      treatment: treatment.trim(),
      rating: parsedRating,
      text: text.trim(),
      status: "pending",
    })

    if (error) {
      console.error("Error al crear testimonio:", error)
      return NextResponse.json({ error: "Error al enviar el testimonio" }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("Error en POST /api/testimonials:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
