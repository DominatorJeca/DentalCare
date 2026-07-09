import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"
import { Star } from "lucide-react"
import { TestimonialForm } from "@/components/landing/testimonial-form"

export async function Testimonials() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("testimonials")
    .select("id, name, treatment, rating, text")
    .eq("status", "approved")
    .order("created_at", { ascending: false })

  const testimonials = data ?? []

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

        {testimonials.length > 0 ? (
          <Carousel opts={{ align: "start", loop: true }} className="mt-16 px-8 sm:px-12">
            <CarouselContent>
              {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id} className="sm:basis-1/2 lg:basis-1/3">
                  <Card className="h-full transition-all hover:shadow-lg">
                    <CardContent className="flex h-full flex-col p-6">
                      <div className="mb-4 flex gap-1">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                        ))}
                      </div>
                      <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
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
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        ) : (
          <p className="mt-16 text-center text-sm text-muted-foreground">
            Sé el primero en compartir tu experiencia.
          </p>
        )}

        <div className="mt-10 flex justify-center">
          <TestimonialForm />
        </div>
      </div>
    </section>
  )
}
