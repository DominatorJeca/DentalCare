import Link from "next/link"
import { Phone, Mail, MapPin, Clock } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5 text-primary-foreground"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2C8 2 5 5 5 9c0 3 2 5 3 7 1 2 1 4 4 4s3-2 4-4c1-2 3-4 3-7 0-4-3-7-7-7z" />
                </svg>
              </div>
              <span className="font-serif text-xl font-semibold text-foreground">
                DentaCare
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Cuidamos tu sonrisa con la mejor tecnología y profesionales
              altamente capacitados. Tu salud bucal es nuestra prioridad.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Enlaces</h3>
            <ul className="mt-4 space-y-3">
              {[
                { href: "/", label: "Inicio" },
                { href: "#servicios", label: "Servicios" },
                { href: "#equipo", label: "Nuestro Equipo" },
                { href: "/citas", label: "Reservar Cita" },
                { href: "/admin", label: "Administración" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Servicios</h3>
            <ul className="mt-4 space-y-3">
              {[
                "Limpieza Dental",
                "Ortodoncia",
                "Implantes",
                "Blanqueamiento",
                "Endodoncia",
              ].map((service) => (
                <li key={service}>
                  <span className="text-sm text-muted-foreground">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Contacto</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Av. Principal 123, Ciudad
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <a
                  href="tel:+1234567890"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <a
                  href="mailto:info@dentacare.com"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  info@dentacare.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="text-sm text-muted-foreground">
                  <p>Lun - Vie: 9:00 - 19:00</p>
                  <p>Sáb: 9:00 - 14:00</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} DentaCare. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
