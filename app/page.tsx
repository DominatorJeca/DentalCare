import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/landing/hero"
import { Services } from "@/components/landing/services"
import { Team } from "@/components/landing/team"
import { Testimonials } from "@/components/landing/testimonials"
import { Contact } from "@/components/landing/contact"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Services />
        <Team />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
