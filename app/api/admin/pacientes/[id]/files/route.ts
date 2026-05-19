import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]
const MAX_SIZE = 52_428_800 // 50 MB
const SIGNED_URL_TTL = 3600 // 1 hora

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServiceClient()

    const { data: files, error } = await supabase
      .from("patient_files")
      .select("id, file_name, file_path, file_type, file_size, description, uploaded_at")
      .eq("patient_id", id)
      .order("uploaded_at", { ascending: false })

    if (error) {
      console.error("Error al obtener archivos:", error)
      return NextResponse.json({ error: "Error al obtener archivos" }, { status: 500 })
    }

    const filesWithUrls = await Promise.all(
      (files ?? []).map(async (file) => {
        const { data } = await supabase.storage
          .from("patient-files")
          .createSignedUrl(file.file_path, SIGNED_URL_TTL)
        return { ...file, signed_url: data?.signedUrl ?? null }
      })
    )

    return NextResponse.json({ files: filesWithUrls })
  } catch (error) {
    console.error("Error en GET /files:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const description = formData.get("description") as string | null

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Use JPG, PNG, WEBP, GIF o PDF" },
        { status: 400 }
      )
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "El archivo excede el límite de 50 MB" }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data: patient } = await supabase
      .from("patients")
      .select("id")
      .eq("id", id)
      .single()

    if (!patient) {
      return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 })
    }

    const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const filePath = `${id}/${Date.now()}-${sanitized}`

    const { error: uploadError } = await supabase.storage
      .from("patient-files")
      .upload(filePath, await file.arrayBuffer(), {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("Error al subir archivo:", uploadError)
      return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 })
    }

    const { data, error: dbError } = await supabase
      .from("patient_files")
      .insert({
        patient_id:  id,
        file_name:   file.name,
        file_path:   filePath,
        file_type:   file.type,
        file_size:   file.size,
        description: description?.trim() || null,
      })
      .select()
      .single()

    if (dbError) {
      // Rollback: eliminar archivo subido
      await supabase.storage.from("patient-files").remove([filePath])
      console.error("Error al guardar en BD:", dbError)
      return NextResponse.json({ error: "Error al guardar el archivo" }, { status: 500 })
    }

    return NextResponse.json({ file: data }, { status: 201 })
  } catch (error) {
    console.error("Error en POST /files:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const fileId = new URL(request.url).searchParams.get("fileId")

    if (!fileId) {
      return NextResponse.json({ error: "fileId es requerido" }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data: file } = await supabase
      .from("patient_files")
      .select("id, file_path")
      .eq("id", fileId)
      .eq("patient_id", id)
      .single()

    if (!file) {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 })
    }

    const { error: storageError } = await supabase.storage
      .from("patient-files")
      .remove([file.file_path])

    if (storageError) {
      console.error("Error al eliminar del storage:", storageError)
      return NextResponse.json({ error: "Error al eliminar el archivo" }, { status: 500 })
    }

    await supabase.from("patient_files").delete().eq("id", fileId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error en DELETE /files:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
