import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Shield, Stethoscope, Smile, HeartPulse, Zap } from "lucide-react"

const services = [
  {
    icon: Sparkles,
    title: "Limpieza Dental",
    description:
      "Limpieza profunda profesional para eliminar sarro y placa bacteriana, manteniendo tu sonrisa brillante.",
    price: "Desde $50",
  },
  {
    icon: Shield,
    title: "Ortodoncia",
    description:
      "Corrección dental con brackets tradicionales o alineadores invisibles para una sonrisa perfecta.",
    price: "Desde $1,500",
  },
  {
    icon: Stethoscope,
    title: "Implantes Dentales",
    description:
      "Reemplazo de piezas dentales con implantes de titanio de alta calidad y apariencia natural.",
    price: "Desde $800",
  },
  {
    icon: Smile,
    title: "Blanqueamiento",
    description:
      "Tratamiento profesional para devolver el blanco natural a tus dientes de forma segura.",
    price: "Desde $200",
  },
  {
    icon: HeartPulse,
    title: "Endodoncia",
    description:
      "Tratamiento de conductos para salvar piezas dentales dañadas y eliminar infecciones.",
    price: "Desde $300",
  },
  {
    icon: Zap,
    title: "Urgencias Dentales",
    description:
      "Atención inmediata para emergencias dentales con disponibilidad extendida.",
    price: "Consultar",
  },
]

export function Services() {
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
          {services.map((service) => (
            <Card
              key={service.title}
              className="group relative overflow-hidden transition-all hover:shadow-lg"
            >
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription className="text-base">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-primary">
                  {service.price}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
