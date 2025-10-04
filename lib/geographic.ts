/**
 * Geographic dataset, types, derived metrics, and aggregation helpers.
 *
 * Input columns (per point):
 * - lat, lng, zone, department
 * - erosionSum (suma_erosion)
 * - erosionMean (media_erosion)
 * - erosionStd (desviacion_erosion)
 * - sedimentSum (suma_sed)
 * - sedimentMean (media_sed)
 * - sedimentStd (desviacion_sed)
 *
 * Recommended UI columns avoid oversharing raw/coded details and focus on:
 * - Zona/Asociación, Departamento
 * - Erosión media, Sedimentación media
 * - Balance neto (sedimentación + erosión)
 * - Variabilidad (0–1)
 * - Índice de Peligro (0–100) y categoría (bajo/medio/alto)
 */

export interface GeographicRecord {
  id: string;
  lat: number;
  lng: number;
  zone: string;
  department: string;

  erosionSum: number;
  erosionMean: number;
  erosionStd: number;

  sedimentSum: number;
  sedimentMean: number;
  sedimentStd: number;
}

export interface GeographicDerived {
  erosionMagnitude: number; // |erosionSum|
  sedimentMagnitude: number; // |sedimentSum|
  netBalance: number; // sedimentSum + erosionSum (positivo = predominio deposición)
  processDominance: "erosión" | "sedimentación" | "mixto";
  variabilityIndex: number; // 0–1 a partir de desviaciones
  hazardScore: number; // 0–100 (combinado)
  riskCategory: "alto" | "medio" | "bajo";
}

export type GeographicWithDerived = GeographicRecord & GeographicDerived;

export interface ColumnConfig<T = GeographicWithDerived> {
  key: keyof T;
  header: string;
  align?: "left" | "center" | "right";
  format?: (value: any, row: T) => string;
}

/**
 * Derivados y scoring
 */
export function computeDerived(r: GeographicRecord): GeographicDerived {
  const erosionMagnitude = Math.abs(r.erosionSum || 0);
  const sedimentMagnitude = Math.abs(r.sedimentSum || 0);
  const netBalance = (r.sedimentSum || 0) + (r.erosionSum || 0);

  const dominance =
    erosionMagnitude > sedimentMagnitude * 1.1
      ? "erosión"
      : sedimentMagnitude > erosionMagnitude * 1.1
      ? "sedimentación"
      : "mixto";

  // Índices normalizados (heurística basada en rangos observados en el dataset)
  const erosionIntensity = clamp01(Math.abs(r.erosionMean || 0) / 0.0035); // ~0–0.0031
  const sedimentIntensity = clamp01(Math.abs(r.sedimentMean || 0) / 0.002); // ~0–0.0017
  const magnitude = clamp01((erosionMagnitude + sedimentMagnitude) / 120); // sums ~0–106
  const variabilityIndex = clamp01(
    (Math.abs(r.erosionStd || 0) + Math.abs(r.sedimentStd || 0)) / 0.05,
  ); // desvios ~0.007–0.036

  // Combinación ponderada (0–100)
  let hazardScore =
    35 * erosionIntensity +
    25 * sedimentIntensity +
    20 * variabilityIndex +
    20 * magnitude;

  hazardScore = clamp(hazardScore, 0, 100);
  const riskCategory = scoreToCategory(hazardScore);

  return {
    erosionMagnitude,
    sedimentMagnitude,
    netBalance,
    processDominance: dominance,
    variabilityIndex,
    hazardScore,
    riskCategory,
  };
}

export function withDerived(r: GeographicRecord): GeographicWithDerived {
  return Object.assign({}, r, computeDerived(r));
}

export function scoreToCategory(s: number): GeographicDerived["riskCategory"] {
  if (s >= 66) return "alto";
  if (s >= 33) return "medio";
  return "bajo";
}

/**
 * Columnas recomendadas para la UI.
 */
export const geographicColumns: ColumnConfig[] = [
  { key: "zone", header: "Zona / Asociación" },
  { key: "department", header: "Departamento" },
  {
    key: "erosionMean",
    header: "Erosión (media)",
    align: "right",
    format: (v) => formatFixed(v, 6),
  },
  {
    key: "sedimentMean",
    header: "Sedimentación (media)",
    align: "right",
    format: (v) => formatFixed(v, 6),
  },
  {
    key: "netBalance",
    header: "Balance neto",
    align: "right",
    format: (v) => formatFixed(v, 3),
  },
  {
    key: "variabilityIndex",
    header: "Variabilidad",
    align: "right",
    format: (v) => formatFixed(v, 2),
  },
  {
    key: "hazardScore",
    header: "Índice de Peligro",
    align: "right",
    format: (v, row) => `${formatFixed(v, 0)} (${row.riskCategory})`,
  },
];

/**
 * Agregación por zona
 */
export interface ZoneAggregate {
  zone: string;
  department: string;
  sites: number;

  totalErosionSum: number;
  totalSedimentSum: number;
  netBalanceTotal: number;

  avgErosionMean: number;
  avgSedimentMean: number;
  avgVariability: number;

  avgHazardScore: number;
  riskCategory: GeographicDerived["riskCategory"];
}

export function aggregateByZone(
  rows: Array<GeographicRecord | GeographicWithDerived>,
): ZoneAggregate[] {
  const acc = new Map<
    string,
    {
      zone: string;
      department: string;
      n: number;
      totalErosionSum: number;
      totalSedimentSum: number;
      sumErosionMean: number;
      sumSedimentMean: number;
      sumVariability: number;
      sumHazard: number;
    }
  >();

  rows.forEach((r0) => {
    const r =
      "hazardScore" in r0
        ? (r0 as GeographicWithDerived)
        : withDerived(r0 as GeographicRecord);
    const k = r.zone;
    const m =
      acc.get(k) || {
        zone: r.zone,
        department: r.department,
        n: 0,
        totalErosionSum: 0,
        totalSedimentSum: 0,
        sumErosionMean: 0,
        sumSedimentMean: 0,
        sumVariability: 0,
        sumHazard: 0,
      };
    m.n += 1;
    m.totalErosionSum += r.erosionSum;
    m.totalSedimentSum += r.sedimentSum;
    m.sumErosionMean += r.erosionMean;
    m.sumSedimentMean += r.sedimentMean;
    m.sumVariability += r.variabilityIndex;
    m.sumHazard += r.hazardScore;
    acc.set(k, m);
  });

  return Array.from(acc.values()).map((m) => {
    const avgHazardScore = m.sumHazard / m.n;
    return {
      zone: m.zone,
      department: m.department,
      sites: m.n,
      totalErosionSum: m.totalErosionSum,
      totalSedimentSum: m.totalSedimentSum,
      netBalanceTotal: m.totalErosionSum + m.totalSedimentSum,
      avgErosionMean: m.sumErosionMean / m.n,
      avgSedimentMean: m.sumSedimentMean / m.n,
      avgVariability: m.sumVariability / m.n,
      avgHazardScore,
      riskCategory: scoreToCategory(avgHazardScore),
    };
  });
}

/**
 * GeoJSON para mapear los puntos.
 */
export type GeoJSON = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: { type: "Point"; coordinates: [number, number] };
    properties: Record<string, any>;
  }>;
};

export function toGeoJSON(
  rows: Array<GeographicRecord | GeographicWithDerived>,
): GeoJSON {
  return {
    type: "FeatureCollection",
    features: rows.map((r0) => {
      const r =
        "hazardScore" in r0
          ? (r0 as GeographicWithDerived)
          : withDerived(r0 as GeographicRecord);
      return {
        type: "Feature",
        geometry: { type: "Point", coordinates: [r.lng, r.lat] },
        properties: {
          id: r.id,
          zone: r.zone,
          department: r.department,
          erosionMean: r.erosionMean,
          sedimentMean: r.sedimentMean,
          netBalance: r.netBalance,
          variability: r.variabilityIndex,
          hazardScore: r.hazardScore,
          riskCategory: r.riskCategory,
        },
      };
    }),
  };
}

/**
 * Dataset (18 filas) – IDs GEOG-001..GEOG-018 en orden de inserción
 */
export const geographicRaw: GeographicRecord[] = [
  rec(
    1,
    -16.394224,
    -71.469349,
    "Asociación Los Olivos",
    "Arequipa",
    -47.295373,
    -0.00120237378924621,
    0.0157621026301429,
    56.1839459999999,
    0.00142834488369136,
    0.0315842240544365,
  ),
  rec(
    2,
    -16.393202,
    -71.468926,
    "Asociación Los Olivos",
    "Arequipa",
    -50.244198,
    -0.00123081176816422,
    0.0158102372114366,
    54.406455,
    0.001332772892068,
    0.0300769207685796,
  ),
  rec(
    3,
    -16.39308,
    -71.479171,
    "Asociación Héroes del Cenepa",
    "Arequipa",
    -33.418393,
    -0.00172704873385012,
    0.0203642419147883,
    29.408354,
    0.00151981157622739,
    0.0345942068914171,
  ),
  rec(
    4,
    -16.394906,
    -71.484159,
    "Asociación Héroes del Cenepa",
    "Arequipa",
    -8.88996,
    -0.00175068137061835,
    0.0189243891005892,
    2.359736,
    0.000464697912564001,
    0.0107159362387537,
  ),
  rec(
    5,
    -16.392518,
    -71.483483,
    "Asociación Héroes del Cenepa",
    "Arequipa",
    -9.934339,
    -0.00310739411948701,
    0.027990019684418,
    5.467676,
    0.00171025211135439,
    0.0366682420999237,
  ),
  rec(
    6,
    -16.396844,
    -71.483827,
    "Asociación Héroes del Cenepa",
    "Arequipa",
    -4.714232,
    -0.00176298878085265,
    0.0187262660983751,
    1.95406299999999,
    0.000730764023934181,
    0.014291893686451,
  ),
  rec(
    7,
    -16.397229,
    -71.48313,
    "Asociación Héroes del Cenepa",
    "Arequipa",
    -5.545974,
    -0.001739095014111,
    0.0201680549883688,
    5.545973,
    0.00173909470053308,
    0.0302249792304995,
  ),
  rec(
    8,
    -16.404107,
    -71.478406,
    "Asociación San Gerónimo",
    "Arequipa",
    -2.702429,
    -0.000711540021063717,
    0.0084333773022747,
    3.451062,
    0.000908652448657188,
    0.0160679558559837,
  ),
  rec(
    9,
    -16.403934,
    -71.478124,
    "Asociación Miguel Grau",
    "Arequipa",
    -2.870302,
    -0.000688156796931191,
    0.00817167553534923,
    3.977812,
    0.000953683049628386,
    0.0166577805217426,
  ),
  rec(
    10,
    -16.403258,
    -71.47743,
    "Asociación Villa Del Misti",
    "Arequipa",
    -7.73971799999999,
    -0.00141727119575169,
    0.0160864324226057,
    9.396763,
    0.00172070371726789,
    0.0323503169790241,
  ),
  rec(
    11,
    -16.403235,
    -71.479252,
    "Asociación Miguel Grau",
    "Arequipa",
    -3.551973,
    -0.000910295489492568,
    0.00945386873220252,
    3.977812,
    0.00101942901076371,
    0.0172205930283661,
  ),
  rec(
    12,
    -16.405362,
    -71.47793,
    "Asociación Miguel Grau",
    "Arequipa",
    -1.517023,
    -0.000515293138586956,
    0.00786243292554358,
    2.078371,
    0.000705968410326087,
    0.0140687535528962,
  ),
  rec(
    13,
    -16.406663,
    -71.475701,
    "Asociación Miguel Grau",
    "Arequipa",
    -1.475149,
    -0.00053525,
    0.00809202204062114,
    1.497645,
    0.000543412554426705,
    0.0125687747544284,
  ),
  rec(
    14,
    -16.404435,
    -71.478442,
    "Asociación Miguel Grau",
    "Arequipa",
    -2.352365,
    -0.000679481513575967,
    0.00843473200441026,
    2.677513,
    0.000773400635470826,
    0.0144833912554184,
  ),
  rec(
    15,
    -16.396312,
    -71.469612,
    "Asociación Los Olivos",
    "Arequipa",
    -25.294173,
    -0.00127317526551567,
    0.0160303226521524,
    26.343314,
    0.00132598349020989,
    0.0302083106041892,
  ),
  rec(
    16,
    -16.395225,
    -71.468467,
    "Asociación Los Olivos",
    "Arequipa",
    -24.9028149999999,
    -0.00121134424554917,
    0.0156652544768983,
    26.916436,
    0.00130929253818464,
    0.0301011051050529,
  ),
  rec(
    17,
    -16.39425,
    -71.470053,
    "Asociación Los Olivos",
    "Arequipa",
    -29.143923,
    -0.00129522790098217,
    0.0166439665742345,
    33.348058,
    0.00148207004133149,
    0.0325813883024292,
  ),
  rec(
    18,
    -16.394433,
    -71.469763,
    "Asociación Los Olivos",
    "Arequipa",
    -26.755498,
    -0.00120541980537033,
    0.0157759006436174,
    31.574869,
    0.00142254771129933,
    0.0320266778564364,
  ),
];

/**
 * Dataset enriquecido con derivados
 */
export const geographic: GeographicWithDerived[] = geographicRaw.map(
  withDerived,
);

export default geographic;

/**
 * Utilidades
 */
function rec(
  idx: number,
  lat: number,
  lng: number,
  zone: string,
  department: string,
  erosionSum: number,
  erosionMean: number,
  erosionStd: number,
  sedimentSum: number,
  sedimentMean: number,
  sedimentStd: number,
): GeographicRecord {
  return {
    id: `GEOG-${String(idx).padStart(3, "0")}`,
    lat,
    lng,
    zone,
    department,
    erosionSum,
    erosionMean,
    erosionStd,
    sedimentSum,
    sedimentMean,
    sedimentStd,
  };
}

function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function clamp(x: number, min: number, max: number): number {
  if (!Number.isFinite(x)) return min;
  return Math.min(max, Math.max(min, x));
}

function formatFixed(v: any, d: number): string {
  const n = Number(v);
  if (!Number.isFinite(n)) return "-";
  return n.toFixed(d);
}
