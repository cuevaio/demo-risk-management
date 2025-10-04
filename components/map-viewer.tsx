"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { toMapImpactPoints } from "@/lib/points";

interface ImpactPoint {
  id: string;
  lat: number;
  lng: number;
  type: string;
  severity: string;
  details: any;
}

interface MapViewerProps {
  mapType: string;
  impactPoints: ImpactPoint[];
  onSelectPoint: (id: string) => void;
}

export default function MapViewer({
  mapType,
  impactPoints,
  onSelectPoint,
}: MapViewerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  // Inicializa Leaflet, centra en Lima y agrega polígono + marcadores de riesgo
  useEffect(() => {
    let map: any;
    let polygon: any;
    const markers: any[] = [];
    let timeoutId: number | undefined;

    const init = async () => {
      const leaflet = await import("leaflet");
      const L = (leaflet as any).default || leaflet;

      if (!mapRef.current) return;

      // Mapa centrado en Lima, Perú
      map = L.map(mapRef.current, {
        center: [-16.394224, -71.469349],
        zoom: 15,
      });

      // Capa satelital similar al screenshot
      const tiles = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
          maxZoom: 19,
        },
      ).addTo(map);
      // Loading handlers: tiles, map readiness, and timeout fallback
      const finishLoading = () => {
        setLoading(false);
        if (timeoutId) clearTimeout(timeoutId);
      };
      tiles.once("load", finishLoading);
      map.whenReady(finishLoading);
      // Fallback in case tile server is slow
      timeoutId = window.setTimeout(finishLoading, 7000);

      // Polígono de ejemplo en Lima (zona ficticia)
      const polygonCoords: [number, number][] = [
        [-16.399224, -71.469349],
        [-16.390224, -71.459949],
        [-16.390224, -71.489349],
        [-16.394224, -71.489349],
        [-16.409224, -71.479349],
        [-16.405224, -71.469349],
      ];

      polygon = L.polygon(polygonCoords, {
        color: "#ef4444",
        weight: 2,
        fillColor: "#ef4444",
        fillOpacity: 0.3,
      }).addTo(map);

      // Ajusta la vista al polígono
      map.fitBounds(polygon.getBounds(), { padding: [20, 20] });

      // Usa la fuente de verdad unificada cuando no se reciben puntos por props
      const points: ImpactPoint[] =
        impactPoints && impactPoints.length
          ? impactPoints
          : (toMapImpactPoints() as unknown as ImpactPoint[]);

      const iconForSeverity = (severity: string) => {
        const bg =
          severity === "alto"
            ? "bg-red-500"
            : severity === "medio"
              ? "bg-yellow-500"
              : "bg-green-500";
        return L.divIcon({
          className: "",
          html: `<div class="w-6 h-6 rounded-full ${bg} border-2 border-white shadow"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
      };

      points.forEach((p) => {
        const m = L.marker([p.lat, p.lng], {
          icon: iconForSeverity(p.severity),
        }).addTo(map);
        m.on("click", () => onSelectPoint(p.id));
        markers.push(m);
      });

      // loading se resuelve cuando cargan los tiles
    };

    init();

    return () => {
      // Limpieza
      if (timeoutId) clearTimeout(timeoutId);
      try {
        markers.forEach((m) => m.remove());
      } catch {}
      try {
        if (polygon) polygon.remove();
      } catch {}
      try {
        if (map) map.remove();
      } catch {}
    };
  }, []); // Ejecuta una sola vez al montar

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="absolute inset-0 rounded-md"></div>

      {loading && (
        <div className="pointer-events-none absolute inset-0 z-[1000] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
            <p className="mt-2 text-sm text-muted-foreground">
              Cargando mapa...
            </p>
          </div>
        </div>
      )}

      <div className="absolute bottom-2 left-2 z-[1000] rounded-md bg-white/90 p-2 text-xs">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <span>Riesgo Alto</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <span>Riesgo Medio</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <span>Riesgo Bajo</span>
        </div>
      </div>

      <div className="absolute right-2 top-2 z-[1000] rounded-md bg-white/90 p-2">
        <div className="flex items-center space-x-1 text-xs">
          <AlertCircle className="h-3 w-3" />
          <span>
            {mapType === "riesgo"
              ? "Mapa de Riesgo"
              : mapType === "impacto-social"
                ? "Impacto Social"
                : "Impacto Económico"}
          </span>
        </div>
      </div>
    </div>
  );
}
