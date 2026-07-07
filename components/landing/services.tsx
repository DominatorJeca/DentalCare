import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Sparkles, Shield, Stethoscope, Smile, HeartPulse, Zap,
  Anchor, Sun, Star, Activity, AlertTriangle, Search, Scissors,
  Clock,
  type LucideIcon,
} from "lucide-react"

const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles, Shield, Stethoscope, Smile, HeartPulse, Zap,
  Anchor, Sun, Star, Activity, AlertTriangle, Search, Scissors,
}

export async function Services() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("services")
    .select("id, name, description, icon, price, duration_minutes")
    .order("name")

  const services = data ?? []

  if (services.length === 0) return null

  return (
    <section id="servicios" className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Nuestros Servicios
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Cuidado dental completo para toda la familia
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Ofrecemos una amplia gama de tratamientos dentales con la mejor
            tecnología y profesionales especializados.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = ICON_MAP[service.icon ?? ""] ?? Stethoscope
            return (
              <Card
                key={service.id}
                className="group relative overflow-hidden transition-all hover:shadow-lg"
              >
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{service.name}</CardTitle>
                  {service.description && (
                    <CardDescription className="text-base">
                      {service.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    {service.price && (
                      <p className="text-sm text-muted-foreground">
                        Precio:{" "}
                        <span className="font-semibold text-primary">
                          {service.price} LPS
                        </span>
                      </p>
                    )}
                    {service.duration_minutes && (
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        Duración aprox:{" "}
                        <span className="font-medium text-foreground">
                          {service.duration_minutes} min
                        </span>
                      </p>
                    )}
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={`/citas?service=${service.id}`}>
                      Reservar cita
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
