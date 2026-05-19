import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/landing/hero"
import { Services } from "@/components/landing/services"
import { Team } from "@/components/landing/team"
import { Testimonials } from "@/components/landing/testimonials"
import { Contact } from "@/components/landing/contact"
import { getClinicSettings } from "@/lib/settings"

export default async function Home() {
  const settings = await getClinicSettings()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Services />
        <Team />
        <Testimonials />
        <Contact clinicInfo={settings} />
      </main>
      <Footer />
    </div>
  )
}
