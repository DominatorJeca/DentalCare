import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const team = [
  {
    name: "Dra. María García",
    role: "Directora Médica",
    specialty: "Ortodoncia",
    experience: "15 años",
    description:
      "Especialista en ortodoncia con formación en universidades de prestigio internacional.",
  },
  {
    name: "Dr. Carlos Rodríguez",
    role: "Cirujano Dental",
    specialty: "Implantes",
    experience: "12 años",
    description:
      "Experto en implantología y cirugía oral con miles de procedimientos exitosos.",
  },
  {
    name: "Dra. Ana Martínez",
    role: "Odontóloga General",
    specialty: "Odontología Estética",
    experience: "10 años",
    description:
      "Especializada en tratamientos estéticos y blanqueamiento dental profesional.",
  },
  {
    name: "Dr. Luis Fernández",
    role: "Endodoncista",
    specialty: "Endodoncia",
    experience: "8 años",
    description:
      "Especialista en tratamientos de conductos con técnicas mínimamente invasivas.",
  },
]

export function Team() {
  return (
    <section id="equipo" className="bg-secondary/30 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Nuestro Equipo
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Profesionales comprometidos con tu salud
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Contamos con un equipo de especialistas altamente calificados y con
            amplia experiencia en el cuidado dental.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <Card
              key={member.name}
              className="group overflow-hidden transition-all hover:shadow-lg"
            >
              <div className="aspect-square bg-gradient-to-br from-primary/10 via-accent/5 to-secondary">
                <div className="flex h-full items-center justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-card text-2xl font-bold text-primary shadow-md">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                </div>
              </div>
              <CardContent className="p-5">
                <Badge variant="secondary" className="mb-2">
                  {member.specialty}
                </Badge>
                <h3 className="font-semibold text-foreground">{member.name}</h3>
                <p className="text-sm text-primary">{member.role}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {member.description}
                </p>
                <p className="mt-3 text-xs font-medium text-muted-foreground">
                  {member.experience} de experiencia
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
