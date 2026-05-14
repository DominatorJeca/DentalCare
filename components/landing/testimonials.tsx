import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Patricia López",
    treatment: "Blanqueamiento",
    rating: 5,
    text: "Excelente atención desde el primer momento. El blanqueamiento superó mis expectativas y el equipo fue muy profesional.",
  },
  {
    name: "Roberto Sánchez",
    treatment: "Implantes",
    rating: 5,
    text: "Tenía mucho miedo al procedimiento de implantes, pero el Dr. Rodríguez me hizo sentir muy seguro. El resultado es increíble.",
  },
  {
    name: "Carmen Díaz",
    treatment: "Ortodoncia",
    rating: 5,
    text: "Mi tratamiento de ortodoncia con la Dra. García ha sido transformador. Muy recomendado para quienes buscan calidad.",
  },
  {
    name: "Miguel Torres",
    treatment: "Limpieza Dental",
    rating: 5,
    text: "Llevo años viniendo a DentaCare para mis limpiezas. El servicio siempre es impecable y el ambiente muy agradable.",
  },
]

export function Testimonials() {
  return (
    <section id="testimonios" className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Testimonios
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Lo que dicen nuestros pacientes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            La satisfacción de nuestros pacientes es nuestro mayor logro.
            Descubre sus experiencias.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  &quot;{testimonial.text}&quot;
                </p>
                <div className="mt-4 border-t border-border pt-4">
                  <p className="font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-primary">{testimonial.treatment}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
