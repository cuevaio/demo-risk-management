"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import "leaflet/dist/leaflet.css";

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
        center: [-12.046374, -77.042793],
        zoom: 14,
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
        [-12.059, -76.9545],
        [-12.0565, -76.9492],
        [-12.0609, -76.9468],
        [-12.0654, -76.953],
        [-12.062, -76.9586],
      ];

      polygon = L.polygon(polygonCoords, {
        color: "#ef4444",
        weight: 2,
        fillColor: "#ef4444",
        fillOpacity: 0.3,
      }).addTo(map);

      // Ajusta la vista al polígono
      map.fitBounds(polygon.getBounds(), { padding: [20, 20] });

      // Tres puntos de riesgo (alto, medio, bajo) o usa los recibidos por props
      const points: ImpactPoint[] =
        impactPoints && impactPoints.length
          ? impactPoints
          : [
              {
                id: "1",
                lat: -12.0612,
                lng: -76.9527,
                type: "riesgo",
                severity: "alto",
                details: {},
              },
              {
                id: "2",
                lat: -12.0602,
                lng: -76.9516,
                type: "riesgo",
                severity: "medio",
                details: {},
              },
              {
                id: "3",
                lat: -12.062,
                lng: -76.9538,
                type: "riesgo",
                severity: "bajo",
                details: {},
              },
            ];

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
