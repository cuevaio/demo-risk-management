"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertCircle, Download, Filter, Layers, MapPin } from "lucide-react"
import MapViewer from "./map-viewer"
import ImpactDetails from "./impact-details"

export default function Dashboard() {
  const [activeMap, setActiveMap] = useState("riesgo")
  const [selectedImpact, setSelectedImpact] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Datos de ejemplo para los impactos
  const impactPoints = [
    {
      id: "1",
      lat: -11.756448,
      lng: -76.986898,
      type: "social",
      severity: "alto",
      details: {
        title: "Impacto Social Alto",
        housing: "Cemento con estructuras",
        damage: "Acceso a servicios básicos",
        services: ["Agua", "Luz", "Teléfono"],
        affected: 25,
      },
    },
    {
      id: "2",
      lat: -11.757448,
      lng: -76.987898,
      type: "economico",
      severity: "medio",
      details: {
        title: "Impacto Económico Medio",
        housing: "Madera",
        damage: "Daño a infraestructura",
        services: ["Luz"],
        affected: 12,
      },
    },
    {
      id: "3",
      lat: -11.758448,
      lng: -76.988898,
      type: "material",
      severity: "bajo",
      details: {
        title: "Impacto Material Bajo",
        housing: "Adobe",
        damage: "Daños leves a viviendas",
        services: [],
        affected: 5,
      },
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-md font-medium">Visor de Mapas</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Layers className="mr-2 h-4 w-4" />
                  Capas
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Gestión de Capas</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="layer-risk" defaultChecked />
                    <label htmlFor="layer-risk">Mapa de Riesgo</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="layer-erosion" />
                    <label htmlFor="layer-erosion">Erosión</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="layer-sedimentation" />
                    <label htmlFor="layer-sedimentation">Sedimentación</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="layer-socioeconomic" defaultChecked />
                    <label htmlFor="layer-socioeconomic">Datos Socioeconómicos</label>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeMap} onValueChange={setActiveMap} className="mb-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="riesgo">Mapa de Riesgo</TabsTrigger>
              <TabsTrigger value="impacto-social">Impacto Social</TabsTrigger>
              <TabsTrigger value="impacto-economico">Impacto Económico</TabsTrigger>
            </TabsList>
          </Tabs>

          {showFilters && (
            <div className="mb-4 rounded-md border bg-muted/40 p-3">
              <h4 className="mb-2 font-medium">Filtros</h4>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="filter-high" defaultChecked />
                  <label htmlFor="filter-high">Riesgo Alto</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="filter-medium" defaultChecked />
                  <label htmlFor="filter-medium">Riesgo Medio</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="filter-low" defaultChecked />
                  <label htmlFor="filter-low">Riesgo Bajo</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="filter-historical" />
                  <label htmlFor="filter-historical">Eventos Históricos</label>
                </div>
              </div>
            </div>
          )}

          <div className="relative h-[500px] w-full rounded-md border">
            <MapViewer mapType={activeMap} impactPoints={impactPoints} onSelectPoint={(id) => setSelectedImpact(id)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium">Resumen de Impacto</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {selectedImpact ? (
              <ImpactDetails
                impact={impactPoints.find((p) => p.id === selectedImpact)?.details}
                onClose={() => setSelectedImpact(null)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MapPin className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Selecciona un punto en el mapa para ver detalles del impacto
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium">Estadísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Viviendas en riesgo alto</p>
                <p className="text-2xl font-bold">124</p>
              </div>
              <div>
                <p className="text-sm font-medium">Personas potencialmente afectadas</p>
                <p className="text-2xl font-bold">568</p>
              </div>
              <div>
                <p className="text-sm font-medium">Impacto económico estimado</p>
                <p className="text-2xl font-bold">S/. 1.2M</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button className="mt-auto">
          <Download className="mr-2 h-4 w-4" />
          Generar Reporte
        </Button>
      </div>
    </div>
  )
}
