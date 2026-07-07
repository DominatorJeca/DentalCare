import { NextResponse } from "next/server"
import { getClinicSettings } from "@/lib/settings"

export async function GET() {
  const settings = await getClinicSettings()
  return NextResponse.json({ settings })
}
