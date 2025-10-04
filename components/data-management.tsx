"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileUp, FileDown, Search, Filter, Plus } from "lucide-react"

export default function DataManagement() {
  const [activeTab, setActiveTab] = useState("geographic")

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Gestión y Carga de Datos</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="geographic">Datos Geográficos</TabsTrigger>
              <TabsTrigger value="socioeconomic">Datos Socioeconómicos</TabsTrigger>
            </TabsList>

            <TabsContent value="geographic" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Input placeholder="Buscar por nombre..." className="w-64" />
                  <Button variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline">
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                  <Button>
                    <FileUp className="mr-2 h-4 w-4" />
                    Cargar Datos
                  </Button>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre del Archivo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Fecha de Carga</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>erosion_huatocay.asc</TableCell>
                      <TableCell>Erosión</TableCell>
                      <TableCell>15/04/2024</TableCell>
                      <TableCell>Huatocay</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>sedimentacion_huatocay.asc</TableCell>
                      <TableCell>Sedimentación</TableCell>
                      <TableCell>15/04/2024</TableCell>
                      <TableCell>Huatocay</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>dem_rio_seco.asc</TableCell>
                      <TableCell>Elevación (DEM)</TableCell>
                      <TableCell>10/04/2024</TableCell>
                      <TableCell>Río Seco</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="rounded-md border p-4">
                <h3 className="mb-4 text-sm font-medium">Cargar Nuevo Archivo</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="file-type">Tipo de Archivo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="erosion">Erosión</SelectItem>
                        <SelectItem value="sedimentacion">Sedimentación</SelectItem>
                        <SelectItem value="dem">Elevación (DEM)</SelectItem>
                        <SelectItem value="pluvial">Pluvial</SelectItem>
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
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-1 space-y-2 md:col-span-2">
                    <Label htmlFor="file-upload">Archivo (.asc)</Label>
                    <Input id="file-upload" type="file" />
                  </div>
                </div>

                <Button className="mt-4">Cargar Archivo</Button>
              </div>
            </TabsContent>

            <TabsContent value="socioeconomic" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Input placeholder="Buscar por nombre..." className="w-64" />
                  <Button variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline">
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Encuesta
                  </Button>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>Personas en Hogar</TableHead>
                      <TableHead>Material Vivienda</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>SOC-001</TableCell>
                      <TableCell>18/05/2024</TableCell>
                      <TableCell>Huatocay</TableCell>
                      <TableCell>2</TableCell>
                      <TableCell>Madera</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>SOC-002</TableCell>
                      <TableCell>18/05/2024</TableCell>
                      <TableCell>Huatocay</TableCell>
                      <TableCell>5</TableCell>
                      <TableCell>Cemento con estructuras</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>SOC-003</TableCell>
                      <TableCell>15/05/2024</TableCell>
                      <TableCell>Río Seco</TableCell>
                      <TableCell>4</TableCell>
                      <TableCell>Adobe</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="rounded-md border p-4">
                <h3 className="mb-4 text-sm font-medium">Importar Datos Socioeconómicos</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="data-type">Tipo de Datos</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="encuesta">Encuesta Socioeconómica</SelectItem>
                        <SelectItem value="censo">Datos Censales</SelectItem>
                        <SelectItem value="impacto">Evaluación de Impacto</SelectItem>
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
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-1 space-y-2 md:col-span-2">
                    <Label htmlFor="file-upload">Archivo CSV</Label>
                    <Input id="file-upload" type="file" />
                  </div>
                </div>

                <Button className="mt-4">Importar Datos</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
