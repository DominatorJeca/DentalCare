import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { RefreshCw } from "lucide-react"
import { getClinicSettings } from "@/lib/settings"
import { CancelarContent } from "./cancelar-content"

export default async function CancelarCitaPage() {
  const settings = await getClinicSettings()

  return (
    <div className="flex min-h-screen flex-col">
      <Header clinicSettings={settings} />
      <main className="flex flex-1 bg-secondary/30">
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <CancelarContent />
        </Suspense>
      </main>
      <Footer settings={settings} />
    </div>
  )
}
