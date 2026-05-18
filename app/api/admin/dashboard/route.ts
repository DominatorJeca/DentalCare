import { NextResponse } from "next/server"
import { getDashboardData } from "@/lib/dashboard"

export async function GET() {
  try {
    const data = await getDashboardData()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error al obtener datos del dashboard:", error)
    return NextResponse.json(
      { error: "Error al obtener datos del dashboard" },
      { status: 500 }
    )
  }
}
