import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight } from "lucide-react"

export function Hero() {
  const benefits = [
    "Profesionales certificados",
    "Tecnología de vanguardia",
    "Atención personalizada",
  ]

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary/50 to-background py-20 lg:py-32">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-left">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Tu sonrisa, nuestra pasión
            </span>

            <h1 className="mt-6 font-serif text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              <span className="text-balance">Cuidamos tu sonrisa con</span>{" "}
              <span className="text-primary">excelencia</span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              En DentaCare combinamos la última tecnología con un equipo de
              especialistas dedicados a brindarte la mejor experiencia dental.
              Tu bienestar es nuestra prioridad.
            </p>

            <ul className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-6 lg:flex-col">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-center justify-center gap-2 lg:justify-start"
                >
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span className="text-sm font-medium text-foreground">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Button size="lg" asChild>
                <Link href="/citas">
                  Reservar Cita
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#servicios">Conocer Servicios</Link>
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-secondary">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-card shadow-lg">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-12 w-12 text-primary"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M12 2C8 2 5 5 5 9c0 3 2 5 3 7 1 2 1 4 4 4s3-2 4-4c1-2 3-4 3-7 0-4-3-7-7-7z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Más de 10 años de experiencia
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 rounded-xl bg-card p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
                  <span className="text-lg font-bold text-accent-foreground">5k+</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Pacientes</p>
                  <p className="text-xs text-muted-foreground">satisfechos</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 -top-4 rounded-xl bg-card p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                  <span className="text-lg font-bold text-primary">98%</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Satisfacción</p>
                  <p className="text-xs text-muted-foreground">garantizada</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
