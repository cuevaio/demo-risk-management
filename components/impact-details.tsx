"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface ImpactDetailsProps {
  impact: any
  onClose: () => void
}

export default function ImpactDetails({ impact, onClose }: ImpactDetailsProps) {
  if (!impact) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{impact.title}</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Material de vivienda</p>
          <p>{impact.housing}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">Principal daño</p>
          <p>{impact.damage}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">Servicios básicos</p>
          <div className="flex flex-wrap gap-1">
            {impact.services.length > 0 ? (
              impact.services.map((service: string, i: number) => (
                <Badge key={i} variant="outline">
                  {service}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">Ninguno</span>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">Personas afectadas</p>
          <p className="text-xl font-bold">{impact.affected}</p>
        </div>
      </div>

      <Button className="w-full">Descargar reporte</Button>
    </div>
  )
}
