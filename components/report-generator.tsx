"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Download, FileText, Printer } from "lucide-react"

export default function ReportGenerator() {
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Generador de Reportes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="report-type">Tipo de Reporte</Label>
                <Select onValueChange={setSelectedReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo de reporte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="risk-map">Mapa de Riesgo</SelectItem>
                    <SelectItem value="social-impact">Impacto Social</SelectItem>
                    <SelectItem value="economic-impact">Impacto Económico</SelectItem>
                    <SelectItem value="material-impact">Impacto Material</SelectItem>
                    <SelectItem value="comprehensive">Reporte Integral</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="all">Todas las ubicaciones</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedReportType && (
              <div className="space-y-4">
                <div className="rounded-md border p-4">
                  <h3 className="mb-2 font-medium">Secciones a incluir</h3>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="section-summary" defaultChecked />
                      <label htmlFor="section-summary">Resumen Ejecutivo</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="section-maps" defaultChecked />
                      <label htmlFor="section-maps">Mapas y Visualizaciones</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="section-data" defaultChecked />
                      <label htmlFor="section-data">Datos Detallados</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="section-recommendations" defaultChecked />
                      <label htmlFor="section-recommendations">Recomendaciones</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="section-historical" />
                      <label htmlFor="section-historical">Datos Históricos</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="section-methodology" />
                      <label htmlFor="section-methodology">Metodología</label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-title">Título del Reporte</Label>
                  <Input id="report-title" placeholder="Ingrese un título para el reporte" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-description">Descripción</Label>
                  <Textarea id="report-description" placeholder="Ingrese una descripción o notas adicionales" />
                </div>

                <div className="flex items-center justify-end space-x-2">
                  <Button variant="outline">
                    <Printer className="mr-2 h-4 w-4" />
                    Vista Previa
                  </Button>
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Generar Reporte
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reportes Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="rounded-md border p-3">
              <div className="flex items-start space-x-2">
                <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">Reporte de Impacto Social - Huatocay</h4>
                  <p className="text-xs text-muted-foreground">Generado: 20/04/2024</p>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    Descargar
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-md border p-3">
              <div className="flex items-start space-x-2">
                <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">Mapa de Riesgo - Río Seco</h4>
                  <p className="text-xs text-muted-foreground">Generado: 15/04/2024</p>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    Descargar
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-md border p-3">
              <div className="flex items-start space-x-2">
                <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">Reporte Integral - Todas las ubicaciones</h4>
                  <p className="text-xs text-muted-foreground">Generado: 10/04/2024</p>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    Descargar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
