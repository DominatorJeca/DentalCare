import { getClinicSettings } from "@/lib/settings"
import { CitasContent } from "@/components/citas/citas-content"

export default async function CitasPage() {
  const settings = await getClinicSettings()
  return <CitasContent settings={settings} />
}
