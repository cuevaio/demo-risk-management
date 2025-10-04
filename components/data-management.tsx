"use client";

import { useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileUp, FileDown, Search, Filter, Plus } from "lucide-react";
import socioeconomic, {
  socioeconomicColumns,
  aggregateByZone,
} from "@/lib/socioeconomic";

export default function DataManagement() {
  const [activeTab, setActiveTab] = useState("geographic");
  const [viewTab, setViewTab] = useState<"records" | "zones">("records");
  const [query, setQuery] = useState("");

  const soles = (n: number) =>
    `S/. ${Number(n || 0).toLocaleString("es-PE", { maximumFractionDigits: 0 })}`;

  // Filter dataset by query (ID, zona, departamento)
  const filteredRecords = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return socioeconomic;
    return socioeconomic.filter((r) => {
      return (
        r.id.toLowerCase().includes(q) ||
        r.zone.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q)
      );
    });
  }, [query]);

  // Aggregation by zone for the "Zonas" view
  const zoneRows = useMemo(
    () => aggregateByZone(filteredRecords),
    [filteredRecords],
  );

  const zoneColumns = [
    { key: "zone", header: "Zona / Asociación" },
    { key: "department", header: "Departamento" },
    { key: "households", header: "Hogares", align: "right" as const },
    {
      key: "avgHouseholdSize",
      header: "Prom. Personas Hogar",
      align: "right" as const,
      format: (v: number) => v.toFixed(1),
    },
    {
      key: "avgIncome",
      header: "Ingreso Prom. (S/.)",
      align: "right" as const,
      format: soles,
    },
    {
      key: "avgIncomePerCapita",
      header: "Ingreso p/cápita Prom. (S/.)",
      align: "right" as const,
      format: soles,
    },
    {
      key: "shareWithInsurance",
      header: "Seguro (Cobertura)",
      align: "right" as const,
      format: (v: number) => `${Math.round(v * 100)}%`,
    },
    {
      key: "avgVulnerability",
      header: "Índice de Vulnerabilidad",
      align: "right" as const,
      format: (v: number, row: any) => `${v.toFixed(0)} (${row.riskCategory})`,
    },
  ];

  // Export current view to CSV
  const exportCSV = useCallback(() => {
    const toCSV = (
      headers: string[],
      rows: (string | number | boolean)[][],
    ) => {
      const escape = (v: any) => {
        if (v === null || v === undefined) return "";
        const s = String(v);
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const lines = [
        headers.join(","),
        ...rows.map((r) => r.map(escape).join(",")),
      ];
      return lines.join("\n");
    };

    if (viewTab === "records") {
      const headers = socioeconomicColumns.map((c) => c.header);
      const rows = filteredRecords.map((row) =>
        socioeconomicColumns.map((c) => {
          const value = (row as any)[c.key as string];
          return c.format ? c.format(value, row) : value;
        }),
      );
      const csv = toCSV(headers, rows);
      downloadFile(csv, "socioeconomico_registros.csv");
    } else {
      const headers = zoneColumns.map((c) => c.header);
      const rows = zoneRows.map((row: any) =>
        zoneColumns.map((c) => {
          const value = (row as any)[c.key as string];
          return c.format ? c.format(value, row) : value;
        }),
      );
      const csv = toCSV(headers, rows);
      downloadFile(csv, "socioeconomico_zonas.csv");
    }
  }, [viewTab, filteredRecords, zoneRows]);

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

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
              <TabsTrigger value="socioeconomic">
                Datos Socioeconómicos
              </TabsTrigger>
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
                <h3 className="mb-4 text-sm font-medium">
                  Cargar Nuevo Archivo
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="file-type">Tipo de Archivo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="erosion">Erosión</SelectItem>
                        <SelectItem value="sedimentacion">
                          Sedimentación
                        </SelectItem>
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
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Buscar por ID, zona o departamento..."
                    className="w-64"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <Button variant="outline" size="icon" title="Buscar">
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" title="Filtros (próx.)">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={exportCSV}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar CSV
                  </Button>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Encuesta
                  </Button>
                </div>
              </div>

              <Tabs
                value={viewTab}
                onValueChange={(v) => setViewTab(v as any)}
                className="space-y-3"
              >
                <TabsList>
                  <TabsTrigger value="records">Registros</TabsTrigger>
                  <TabsTrigger value="zones">Zonas</TabsTrigger>
                </TabsList>

                <TabsContent value="records" className="space-y-2">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {socioeconomicColumns.map((c) => (
                            <TableHead key={`${c.key}`}>{c.header}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRecords.map((row) => (
                          <TableRow key={row.id}>
                            {socioeconomicColumns.map((c) => {
                              const value = (row as any)[c.key as string];
                              const display = c.format
                                ? c.format(value, row)
                                : value;
                              const align =
                                c.align === "right"
                                  ? "text-right"
                                  : c.align === "center"
                                    ? "text-center"
                                    : "";
                              return (
                                <TableCell
                                  key={`${row.id}-${String(c.key)}`}
                                  className={align}
                                >
                                  {String(display)}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="zones" className="space-y-2">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {zoneColumns.map((c) => (
                            <TableHead key={`${c.key}`}>{c.header}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {zoneRows.map((row: any) => (
                          <TableRow key={row.zone}>
                            {zoneColumns.map((c) => {
                              const value = (row as any)[c.key as string];
                              const display = c.format
                                ? c.format(value, row)
                                : value;
                              const align =
                                c.align === "right"
                                  ? "text-right"
                                  : c.align === "center"
                                    ? "text-center"
                                    : "";
                              return (
                                <TableCell
                                  key={`${row.zone}-${String(c.key)}`}
                                  className={align}
                                >
                                  {String(display)}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="rounded-md border p-4">
                <h3 className="mb-4 text-sm font-medium">
                  Importar Datos Socioeconómicos
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="data-type">Tipo de Datos</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="encuesta">
                          Encuesta Socioeconómica
                        </SelectItem>
                        <SelectItem value="censo">Datos Censales</SelectItem>
                        <SelectItem value="impacto">
                          Evaluación de Impacto
                        </SelectItem>
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
  );
}
