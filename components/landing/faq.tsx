import { createClient } from "@/lib/supabase/server"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export async function FAQ() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("faqs")
    .select("id, question, answer")
    .eq("active", true)
    .order("sort_order")

  const faqs = data ?? []

  if (faqs.length === 0) return null

  return (
    <section id="faq" className="bg-muted/30 py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Preguntas Frecuentes
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Resolvemos tus dudas
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Encuentra respuestas a las preguntas más comunes sobre nuestros servicios.
          </p>
        </div>

        <div className="mt-12">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="rounded-lg border border-border bg-background px-6"
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
