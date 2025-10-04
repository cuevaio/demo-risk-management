"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Bell, CheckCircle, Clock } from "lucide-react"

export default function AlertsRequests() {
  const [activeTab, setActiveTab] = useState("alerts")

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Identificación de Necesidades</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="alerts">Alertas</TabsTrigger>
              <TabsTrigger value="requests">Solicitudes Comunales</TabsTrigger>
            </TabsList>

            <TabsContent value="alerts" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Alertas Activas</h3>
                <Button size="sm">Nueva Alerta</Button>
              </div>

              <div className="space-y-2">
                <div className="rounded-md border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="mt-1 h-5 w-5 text-red-500" />
                      <div>
                        <h4 className="font-medium">Alerta de Deslizamiento - Huatocay</h4>
                        <p className="text-sm text-muted-foreground">
                          Precipitaciones intensas reportadas en la zona alta
                        </p>
                        <div className="mt-1 flex items-center space-x-2">
                          <Badge variant="outline">Alta Prioridad</Badge>
                          <span className="text-xs text-muted-foreground">Hace 2 horas</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver Detalles
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      <Bell className="mt-1 h-5 w-5 text-yellow-500" />
                      <div>
                        <h4 className="font-medium">Monitoreo Preventivo - Río Seco</h4>
                        <p className="text-sm text-muted-foreground">Incremento en niveles de erosión detectados</p>
                        <div className="mt-1 flex items-center space-x-2">
                          <Badge variant="outline">Media Prioridad</Badge>
                          <span className="text-xs text-muted-foreground">Hace 1 día</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="requests" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Solicitudes Comunales</h3>
                <Button size="sm">Nueva Solicitud</Button>
              </div>

              <div className="space-y-2">
                <div className="rounded-md border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      <Clock className="mt-1 h-5 w-5 text-blue-500" />
                      <div>
                        <h4 className="font-medium">Evaluación de Riesgo - Asociación de Vivienda Nueva Esperanza</h4>
                        <p className="text-sm text-muted-foreground">
                          Solicitud de evaluación técnica por grietas en terreno
                        </p>
                        <div className="mt-1 flex items-center space-x-2">
                          <Badge variant="outline">En Proceso</Badge>
                          <span className="text-xs text-muted-foreground">Recibido: 15/04/2024</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver Detalles
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="mt-1 h-5 w-5 text-green-500" />
                      <div>
                        <h4 className="font-medium">Inspección - Comunidad Huatocay</h4>
                        <p className="text-sm text-muted-foreground">Evaluación de muros de contención existentes</p>
                        <div className="mt-1 flex items-center space-x-2">
                          <Badge variant="outline">Completado</Badge>
                          <span className="text-xs text-muted-foreground">Finalizado: 10/04/2024</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver Informe
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{activeTab === "alerts" ? "Registrar Alerta" : "Nueva Solicitud"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder={activeTab === "alerts" ? "Título de la alerta" : "Título de la solicitud"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ubicación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="huatocay">Huatocay</SelectItem>
                  <SelectItem value="rio-seco">Río Seco</SelectItem>
                  <SelectItem value="nueva-esperanza">Asociación Nueva Esperanza</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" placeholder="Describa los detalles..." />
            </div>

            <Button className="w-full">{activeTab === "alerts" ? "Registrar Alerta" : "Enviar Solicitud"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
