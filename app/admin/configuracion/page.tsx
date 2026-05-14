"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Clock, Bell, Save } from "lucide-react"

export default function ConfiguracionPage() {
  const [clinicInfo, setClinicInfo] = useState({
    name: "DentaCare",
    address: "Av. Principal 123, Ciudad",
    phone: "+1 (234) 567-890",
    email: "info@dentacare.com",
    description:
      "Clínica dental profesional con los mejores especialistas. Ofrecemos tratamientos de ortodoncia, implantes, blanqueamiento y más.",
  })

  const [schedule, setSchedule] = useState({
    mondayFriday: { open: "09:00", close: "19:00" },
    saturday: { open: "09:00", close: "14:00" },
    sundayClosed: true,
  })

  const [notifications, setNotifications] = useState({
    emailReminders: true,
    smsReminders: true,
    reminderHours: "24",
    confirmationEmail: true,
    cancelNotification: true,
  })

  const handleSave = () => {
    console.log("Saving configuration:", { clinicInfo, schedule, notifications })
    alert("Configuración guardada correctamente")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
          Configuración
        </h1>
        <p className="mt-1 text-muted-foreground">
          Administra la configuración general de la clínica
        </p>
      </div>

      <Tabs defaultValue="clinic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="clinic" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Clínica</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Horarios</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificaciones</span>
          </TabsTrigger>
        </TabsList>

        {/* Clinic Info Tab */}
        <TabsContent value="clinic">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Clínica</CardTitle>
              <CardDescription>
                Datos generales que se muestran en el sitio web
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clinic-name">Nombre de la clínica</Label>
                  <Input
                    id="clinic-name"
                    value={clinicInfo.name}
                    onChange={(e) =>
                      setClinicInfo({ ...clinicInfo, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic-phone">Teléfono</Label>
                  <Input
                    id="clinic-phone"
                    value={clinicInfo.phone}
                    onChange={(e) =>
                      setClinicInfo({ ...clinicInfo, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinic-email">Email</Label>
                <Input
                  id="clinic-email"
                  type="email"
                  value={clinicInfo.email}
                  onChange={(e) =>
                    setClinicInfo({ ...clinicInfo, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinic-address">Dirección</Label>
                <Input
                  id="clinic-address"
                  value={clinicInfo.address}
                  onChange={(e) =>
                    setClinicInfo({ ...clinicInfo, address: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinic-description">Descripción</Label>
                <Textarea
                  id="clinic-description"
                  rows={4}
                  value={clinicInfo.description}
                  onChange={(e) =>
                    setClinicInfo({
                      ...clinicInfo,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Horarios de Atención</CardTitle>
              <CardDescription>
                Configura los horarios de apertura y cierre
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">
                  Lunes a Viernes
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="mf-open">Hora de apertura</Label>
                    <Input
                      id="mf-open"
                      type="time"
                      value={schedule.mondayFriday.open}
                      onChange={(e) =>
                        setSchedule({
                          ...schedule,
                          mondayFriday: {
                            ...schedule.mondayFriday,
                            open: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mf-close">Hora de cierre</Label>
                    <Input
                      id="mf-close"
                      type="time"
                      value={schedule.mondayFriday.close}
                      onChange={(e) =>
                        setSchedule({
                          ...schedule,
                          mondayFriday: {
                            ...schedule.mondayFriday,
                            close: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Sábado</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sat-open">Hora de apertura</Label>
                    <Input
                      id="sat-open"
                      type="time"
                      value={schedule.saturday.open}
                      onChange={(e) =>
                        setSchedule({
                          ...schedule,
                          saturday: {
                            ...schedule.saturday,
                            open: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sat-close">Hora de cierre</Label>
                    <Input
                      id="sat-close"
                      type="time"
                      value={schedule.saturday.close}
                      onChange={(e) =>
                        setSchedule({
                          ...schedule,
                          saturday: {
                            ...schedule.saturday,
                            close: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="font-medium text-foreground">Domingo cerrado</p>
                  <p className="text-sm text-muted-foreground">
                    La clínica no atiende los domingos
                  </p>
                </div>
                <Switch
                  checked={schedule.sundayClosed}
                  onCheckedChange={(checked) =>
                    setSchedule({ ...schedule, sundayClosed: checked })
                  }
                />
              </div>

              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>
                Configura los recordatorios y notificaciones automáticas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-foreground">
                      Recordatorios por Email
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Enviar recordatorio de cita por email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailReminders}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        emailReminders: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-foreground">
                      Recordatorios por SMS
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Enviar recordatorio de cita por SMS
                    </p>
                  </div>
                  <Switch
                    checked={notifications.smsReminders}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        smsReminders: checked,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminder-hours">
                    Horas antes del recordatorio
                  </Label>
                  <Input
                    id="reminder-hours"
                    type="number"
                    min="1"
                    max="72"
                    value={notifications.reminderHours}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        reminderHours: e.target.value,
                      })
                    }
                    className="w-32"
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-foreground">
                      Email de confirmación
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Enviar confirmación al reservar una cita
                    </p>
                  </div>
                  <Switch
                    checked={notifications.confirmationEmail}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        confirmationEmail: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-foreground">
                      Notificación de cancelación
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Notificar cuando se cancela una cita
                    </p>
                  </div>
                  <Switch
                    checked={notifications.cancelNotification}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        cancelNotification: checked,
                      })
                    }
                  />
                </div>
              </div>

              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
