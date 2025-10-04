import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Dashboard from "@/components/dashboard"
import AlertsRequests from "@/components/alerts-requests"
import DataManagement from "@/components/data-management"
import ReportGenerator from "@/components/report-generator"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <span className="font-bold">SIGRID-Huaicos</span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Ayuda
              </Button>
              <Button size="sm">Iniciar sesión</Button>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-4">
          <h1 className="mb-4 text-2xl font-bold">Sistema de Gestión de Riesgos de Deslizamientos</h1>
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">Visor de Mapas</TabsTrigger>
              <TabsTrigger value="alerts">Alertas y Solicitudes</TabsTrigger>
              <TabsTrigger value="data">Gestión de Datos</TabsTrigger>
              <TabsTrigger value="reports">Reportes</TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard" className="mt-4">
              <Dashboard />
            </TabsContent>
            <TabsContent value="alerts" className="mt-4">
              <AlertsRequests />
            </TabsContent>
            <TabsContent value="data" className="mt-4">
              <DataManagement />
            </TabsContent>
            <TabsContent value="reports" className="mt-4">
              <ReportGenerator />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <footer className="border-t py-4">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">© 2024 SIGRID-Huaicos. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
