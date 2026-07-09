import { createServiceClient } from "@/lib/supabase/service"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createServiceClient()
  const body = await req.json()

  const { data, error } = await supabase
    .from("testimonials")
    .update(body)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: "Error al actualizar testimonio" }, { status: 500 })
  return NextResponse.json({ testimonial: data })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createServiceClient()

  const { error } = await supabase.from("testimonials").delete().eq("id", id)

  if (error) return NextResponse.json({ error: "Error al eliminar testimonio" }, { status: 500 })
  return NextResponse.json({ success: true })
}
