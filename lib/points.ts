/**
 * Unified points dataset by joining socioeconomic and geographic records.
 *
 * - Single source of truth for spatial points.
 * - Joins by (lat,lng) with 6-decimal key and a small-distance fallback.
 * - Computes loss risk category ("bajo" | "medio" | "alto") from
 *   estimated housing loss distribution.
 * - Exposes helpers to consume points from the map viewer.
 *
 * Notes:
 * - If a geographic point has no socioeconomic counterpart, it's still included,
 *   but the loss risk will be inferred (see inferLossRiskForGeoOnly).
 * - If a socioeconomic point has no geographic counterpart, it's included with geo undefined.
 */

import socioeconomic from "@/lib/socioeconomic";
import type {
  SocioeconomicRecord,
  DerivedIndicators as SocioDerived,
} from "@/lib/socioeconomic";
import geographic from "@/lib/geographic";
import type {
  GeographicRecord,
  GeographicWithDerived,
} from "@/lib/geographic";

export type LossRisk = "bajo" | "medio" | "alto";

export interface UnifiedPoint {
  id: string; // prefer socioeconomic id when present; fallback to geographic id
  lat: number;
  lng: number;
  zone: string;
  department: string;

  // Raw/derived bundles (optional when unmatched)
  socio?: SocioeconomicRecord & SocioDerived;
  geo?: GeographicWithDerived;

  // Normalized indicators for quick access
  lossHousing: number; // S/. P38 (socioeconomic)
  lossRiskCategory: LossRisk;
}

/**
 * Build a key from coordinates. 6 decimals ~ 0.11 m precision; good for exact matches.
 */
function coordKey(lat: number, lng: number): string {
  return `${lat.toFixed(6)},${lng.toFixed(6)}`;
}

/**
 * Haversine distance in meters. Used for nearest-neighbor fallback join.
 */
function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function toRad(d: number) {
  return (d * Math.PI) / 180;
}

/**
 * Compute data-driven thresholds from the distribution of estimated housing loss.
 * If the dataset is too small or degenerate, fall back to sensible static thresholds.
 */
function computeLossThresholds(values: number[]) {
  const xs = values.filter((v) => Number.isFinite(v)).slice().sort((a, b) => a - b);
  if (xs.length < 4) {
    // Fallback thresholds (S/.)
    return { tLow: 200, tMid: 500 };
  }
  const q = (p: number) => {
    const idx = (xs.length - 1) * p;
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    if (lo === hi) return xs[lo];
    const w = idx - lo;
    return xs[lo] * (1 - w) + xs[hi] * w;
  };
  const tLow = q(0.33);
  const tMid = q(0.66);
  return { tLow, tMid };
}

function riskCategoryFromLoss(loss: number, tLow: number, tMid: number): LossRisk {
  if (!Number.isFinite(loss)) return "bajo";
  if (loss <= tLow) return "bajo";
  if (loss <= tMid) return "medio";
  return "alto";
}

/**
 * For geo-only points (sin socio), infer a loss risk based on hazard score.
 * This keeps the map consistent even when a point lacks P38.
 */
function inferLossRiskForGeoOnly(g: GeographicWithDerived): LossRisk {
  const s = g.hazardScore;
  if (s >= 66) return "alto";
  if (s >= 33) return "medio";
  return "bajo";
}

/**
 * Join socioeconomic and geographic datasets.
 */
function joinPoints(): {
  points: UnifiedPoint[];
  thresholds: { tLow: number; tMid: number };
} {
  // 1) Precompute thresholds from socioeconomic losses (P38)
  const losses = socioeconomic.map((r) => r.estimatedLossHousing || 0);
  const thresholds = computeLossThresholds(losses);

  // 2) Build index for geographic by exact coordinate key
  const geoIndex = new Map<string, GeographicWithDerived>();
  geographic.forEach((g) => {
    geoIndex.set(coordKey(g.lat, g.lng), g);
  });

  // Helper: nearest geographic point within a max distance (meters)
  const nearestGeo = (lat: number, lng: number, maxMeters = 120): GeographicWithDerived | undefined => {
    let best: GeographicWithDerived | undefined;
    let bestD = Infinity;
    for (const g of geographic) {
      const d = haversineMeters({ lat, lng }, { lat: g.lat, lng: g.lng });
      if (d < bestD && d <= maxMeters) {
        bestD = d;
        best = g;
      }
    }
    return best;
  };

  const usedGeoIds = new Set<string>();
  const unified: UnifiedPoint[] = [];

  // 3) Merge: iterate socioeconomic points, match geo by exact key or nearest
  for (const s of socioeconomic) {
    const key = coordKey(s.lat, s.lng);
    let g = geoIndex.get(key);
    if (!g) {
      g = nearestGeo(s.lat, s.lng, 150); // ~150 m fallback
    }

    if (g) usedGeoIds.add(g.id);

    const lossRisk = riskCategoryFromLoss(s.estimatedLossHousing || 0, thresholds.tLow, thresholds.tMid);

    unified.push({
      id: s.id,
      lat: s.lat,
      lng: s.lng,
      zone: s.zone,
      department: s.department,
      socio: s,
      geo: g,
      lossHousing: s.estimatedLossHousing || 0,
      lossRiskCategory: lossRisk,
    });
  }

  // 4) Include geo-only points not matched above
  for (const g of geographic) {
    if (usedGeoIds.has(g.id)) continue;
    const lossRisk = inferLossRiskForGeoOnly(g);
    unified.push({
      id: g.id,
      lat: g.lat,
      lng: g.lng,
      zone: g.zone,
      department: g.department,
      socio: undefined,
      geo: g,
      lossHousing: 0,
      lossRiskCategory: lossRisk,
    });
  }

  return { points: unified, thresholds };
}

const { points: unifiedPoints, thresholds: lossThresholds } = joinPoints();

/**
 * Helper shape for the MapViewer. This mirrors the props it expects.
 */
export type MapImpactPoint = {
  id: string;
  lat: number;
  lng: number;
  type: string; // e.g., "riesgo"
  severity: LossRisk extends "alto" | "medio" | "bajo" ? "alto" | "medio" | "bajo" : never;
  details: {
    title: string;
    zone: string;
    department: string;
    lossHousing: number;
    lossRiskCategory: LossRisk;
  };
};

/**
 * Convert unified points to MapViewer impact points.
 * - Severity is derived from lossRiskCategory.
 */
export function toMapImpactPoints(points = unifiedPoints): MapImpactPoint[] {
  return points.map((p) => ({
    id: p.id,
    lat: p.lat,
    lng: p.lng,
    type: "riesgo",
    severity: p.lossRiskCategory,
    details: {
      title: `Riesgo por pérdida de vivienda: ${p.lossRiskCategory}`,
      zone: p.zone,
      department: p.department,
      lossHousing: p.lossHousing,
      lossRiskCategory: p.lossRiskCategory,
    },
  }));
}

/**
 * Lookup helpers
 */
export function getUnifiedPoints(): UnifiedPoint[] {
  return unifiedPoints;
}

export function getUnifiedPointById(id: string): UnifiedPoint | undefined {
  return unifiedPoints.find((p) => p.id === id);
}

export function getLossThresholds() {
  return lossThresholds;
}

export default unifiedPoints;
