"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { MessageSquarePlus, Send, Star } from "lucide-react"

const EMPTY_FORM = { name: "", treatment: "", rating: 5, text: "" }

export function TestimonialForm() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al enviar el testimonio")
      setIsSuccess(true)
      setForm(EMPTY_FORM)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el testimonio")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) {
          setIsSuccess(false)
          setError(null)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <MessageSquarePlus className="h-4 w-4" />
          Deja tu testimonio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Comparte tu experiencia</DialogTitle>
        </DialogHeader>

        {isSuccess ? (
          <div className="rounded-md bg-accent/10 p-4 text-sm text-accent-foreground">
            ¡Gracias por tu testimonio! Será revisado por nuestro equipo antes de publicarse en el sitio.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="t-name">Nombre completo</Label>
                <Input
                  id="t-name"
                  placeholder="Tu nombre"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-treatment">Tratamiento recibido</Label>
                <Input
                  id="t-treatment"
                  placeholder="Ej. Ortodoncia"
                  value={form.treatment}
                  onChange={(e) => setForm({ ...form, treatment: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Calificación</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, rating: n })}
                    className="rounded p-0.5 hover:bg-muted"
                    aria-label={`${n} estrellas`}
                  >
                    <Star
                      className={`h-6 w-6 ${n <= form.rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="t-text">Tu testimonio</Label>
              <Textarea
                id="t-text"
                placeholder="Cuéntanos cómo fue tu experiencia..."
                rows={4}
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                required
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="gap-2">
                <Send className="h-4 w-4" />
                {isLoading ? "Enviando..." : "Enviar testimonio"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
