/**
 * Socioeconomic dataset, types and helpers.
 *
 * This module provides:
 * - Typed records loaded from the provided CSV-like data.
 * - Derived helpers to compute useful indicators for the UI.
 * - Aggregation helpers and GeoJSON conversion.
 *
 * Notes on the source data:
 * - Several survey questions are encoded as numeric codes (0/1/2…).
 *   Many of those codes are not self-descriptive (e.g., wall material, service dummies),
 *   so the default column set avoids showing raw codes to the user.
 * - The UI should focus on actionable indicators: household size, dependents,
 *   income, employment, insurance access, and a vulnerability score.
 */

export type GenderCode = 0 | 1 | number;

export interface SocioeconomicRecord {
  id: string; // Generated identifier (e.g., SOC-001)
  lat: number;
  lng: number;
  zone: string; // "Nombre Zona / Asociación"
  department: string;

  genderCode: GenderCode; // P2
  ageCode: number; // P3 (coded in dataset)
  householdSize: number; // P4
  elders65: number; // P5
  childrenUnder10: number; // P6
  healthInsuranceCount: number; // P8
  chronicConditionCount: number; // P9
  higherEducationCount: number; // P10
  illiterateCount: number; // P11
  wallMaterialCode: number; // P13 (kept for completeness, not shown by default)
  servicesDummy1: number; // P15 dummy 1 (kept for completeness)
  servicesDummy2: number; // P15 dummy 2 (kept for completeness)

  monthlyIncome: number; // Ingreso mensual
  formalJobs: number; // P19 (formal)
  informalJobs: number; // P19 (informal)
  estimatedLossHousing: number; // P38 (S/.)
}

/**
 * Derived properties we compute for the UI.
 */
export interface DerivedIndicators {
  dependents: number; // elders65 + childrenUnder10
  employmentTotal: number; // formal + informal
  hasAnyInsurance: boolean; // healthInsuranceCount > 0
  incomePerCapita: number; // monthlyIncome / householdSize
  vulnerabilityScore: number; // 0-100 composite
  riskCategory: "alto" | "medio" | "bajo";
}

/**
 * Recommended minimal columns for the UI.
 * These avoid exposing raw coded fields that are not self-explanatory.
 */
export interface ColumnConfig<T = SocioeconomicRecord & DerivedIndicators> {
  key: keyof T;
  header: string;
  align?: "left" | "center" | "right";
  format?: (value: any, row: T) => string;
}

/**
 * Label helpers
 */
export function genderLabel(code: GenderCode): "Masculino" | "Femenino" | "Otro/NS" {
  if (code === 0) return "Masculino";
  if (code === 1) return "Femenino";
  return "Otro/NS";
}

export function riskCategoryFromScore(score: number): DerivedIndicators["riskCategory"] {
  if (score >= 66) return "alto";
  if (score >= 33) return "medio";
  return "bajo";
}

/**
 * Compute derived indicators for a record.
 * Heuristic scoring (0-100):
 * - Lower income-per-capita increases vulnerability.
 * - More dependents per household increases vulnerability.
 * - Elders and chronic conditions increase vulnerability.
 * - Lack of insurance increases vulnerability.
 * - Illiteracy increases vulnerability; higher education slightly reduces it.
 */
export function computeDerived(r: SocioeconomicRecord): DerivedIndicators {
  const dependents = Math.max(0, (r.elders65 || 0) + (r.childrenUnder10 || 0));
  const employmentTotal = (r.formalJobs || 0) + (r.informalJobs || 0);
  const hasAnyInsurance = (r.healthInsuranceCount || 0) > 0;
  const householdSize = Math.max(1, r.householdSize || 1);
  const incomePerCapita = (r.monthlyIncome || 0) / householdSize;

  // Subscores (0-1)
  const sIncome = clamp01(1 - incomePerCapita / 1500); // <= 0 at 1500 p.c. or more
  const sDependents = clamp01(dependents / householdSize);
  const sElders = clamp01((r.elders65 || 0) / householdSize);
  const sChronic = clamp01((r.chronicConditionCount || 0) / householdSize);
  const sNoInsurance = hasAnyInsurance ? 0 : 1;
  const sIlliteracy = clamp01((r.illiterateCount || 0) / householdSize);
  const sHigherEdu = clamp01((r.higherEducationCount || 0) / householdSize);

  // Weighted sum (weights sum ~100)
  let score =
    30 * sIncome +
    20 * sDependents +
    10 * sElders +
    15 * sChronic +
    15 * sNoInsurance +
    10 * sIlliteracy -
    5 * sHigherEdu;

  score = clamp(score, 0, 100);

  return {
    dependents,
    employmentTotal,
    hasAnyInsurance,
    incomePerCapita,
    vulnerabilityScore: score,
    riskCategory: riskCategoryFromScore(score),
  };
}

/**
 * Compose raw record + derived indicators.
 */
export function withDerived(r: SocioeconomicRecord): SocioeconomicRecord & DerivedIndicators {
  return Object.assign({}, r, computeDerived(r));
}

/**
 * Recommended columns for a table UI.
 */
export const socioeconomicColumns: ColumnConfig[] = [
  { key: "id", header: "ID" },
  { key: "zone", header: "Zona / Asociación" },
  { key: "department", header: "Departamento" },
  {
    key: "householdSize",
    header: "Personas Hogar",
    align: "right",
  },
  {
    key: "dependents",
    header: "Dependientes",
    align: "right",
  },
  {
    key: "monthlyIncome",
    header: "Ingreso Mensual (S/.)",
    align: "right",
    format: (v) => soles(v),
  },
  {
    key: "incomePerCapita",
    header: "Ingreso p/cápita (S/.)",
    align: "right",
    format: (v) => soles(v),
  },
  {
    key: "employmentTotal",
    header: "Empleo (Total)",
    align: "right",
  },
  {
    key: "hasAnyInsurance",
    header: "Seguro de Salud",
    format: (v) => (v ? "Sí" : "No"),
  },
  {
    key: "vulnerabilityScore",
    header: "Índice de Vulnerabilidad",
    align: "right",
    format: (v, row) => `${v.toFixed(0)} (${row.riskCategory})`,
  },
];

/**
 * Aggregation by zone.
 */
export interface ZoneAggregate {
  zone: string;
  department: string;
  households: number;
  avgHouseholdSize: number;
  avgIncome: number;
  avgIncomePerCapita: number;
  shareWithInsurance: number; // 0-1
  avgVulnerability: number; // 0-100
  riskCategory: DerivedIndicators["riskCategory"];
}

export function aggregateByZone(
  rows: Array<SocioeconomicRecord | (SocioeconomicRecord & DerivedIndicators)>,
): ZoneAggregate[] {
  const map = new Map<
    string,
    {
      zone: string;
      department: string;
      n: number;
      sumHousehold: number;
      sumIncome: number;
      sumIncomePc: number;
      insured: number;
      sumVuln: number;
    }
  >();

  rows.forEach((r0) => {
    const r = "vulnerabilityScore" in r0 ? (r0 as SocioeconomicRecord & DerivedIndicators) : withDerived(r0);
    const k = r.zone;
    const m = map.get(k) || {
      zone: r.zone,
      department: r.department,
      n: 0,
      sumHousehold: 0,
      sumIncome: 0,
      sumIncomePc: 0,
      insured: 0,
      sumVuln: 0,
    };
    m.n += 1;
    m.sumHousehold += r.householdSize;
    m.sumIncome += r.monthlyIncome;
    m.sumIncomePc += r.incomePerCapita;
    m.insured += r.hasAnyInsurance ? 1 : 0;
    m.sumVuln += r.vulnerabilityScore;
    map.set(k, m);
  });

  return Array.from(map.values()).map((m) => {
    const avgVuln = m.sumVuln / m.n;
    return {
      zone: m.zone,
      department: m.department,
      households: m.n,
      avgHouseholdSize: m.sumHousehold / m.n,
      avgIncome: m.sumIncome / m.n,
      avgIncomePerCapita: m.sumIncomePc / m.n,
      shareWithInsurance: m.insured / m.n,
      avgVulnerability: avgVuln,
      riskCategory: riskCategoryFromScore(avgVuln),
    };
  });
}

/**
 * GeoJSON conversion for mapping.
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
  rows: Array<SocioeconomicRecord | (SocioeconomicRecord & DerivedIndicators)>,
): GeoJSON {
  return {
    type: "FeatureCollection",
    features: rows.map((r0) => {
      const r = "vulnerabilityScore" in r0 ? (r0 as SocioeconomicRecord & DerivedIndicators) : withDerived(r0);
      return {
        type: "Feature",
        geometry: { type: "Point", coordinates: [r.lng, r.lat] },
        properties: {
          id: r.id,
          zone: r.zone,
          department: r.department,
          gender: genderLabel(r.genderCode),
          householdSize: r.householdSize,
          dependents: r.dependents,
          income: r.monthlyIncome,
          incomePerCapita: r.incomePerCapita,
          employmentTotal: r.employmentTotal,
          hasAnyInsurance: r.hasAnyInsurance,
          vulnerabilityScore: r.vulnerabilityScore,
          riskCategory: r.riskCategory,
        },
      };
    }),
  };
}

/**
 * Source dataset (parsed from the user-provided data).
 * IDs are generated as SOC-001..SOC-016 in insertion order.
 */
export const socioeconomicRaw: SocioeconomicRecord[] = [
  // lat, lng, zone, dept, P2, P3, P4, P5, P6, P8, P9, P10, P11, P13, P15 d1, P15 d2, ingreso, P19 formal, P19 informal, P38 pérdida
  rec(1, -16.394224, -71.469349, "Asociación Los Olivos", "Arequipa", 0, 0, 3, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1500, 0, 1, 200),
  rec(2, -16.393202, -71.468926, "Asociación Los Olivos", "Arequipa", 1, 0, 4, 0, 2, 2, 0, 1, 0, 0, 0, 1, 2000, 0, 1, 200),
  rec(3, -16.39308, -71.479171, "Asociación Héroes del Cenepa", "Arequipa", 0, 1, 2, 1, 0, 2, 2, 0, 0, 0, 1, 0, 1200, 0, 1, 200),
  rec(4, -16.394906, -71.484159, "Asociación Héroes del Cenepa", "Arequipa", 0, 1, 6, 0, 1, 6, 0, 0, 0, 0, 1, 0, 2000, 0, 2, 200),
  rec(5, -16.392518, -71.483483, "Asociación Héroes del Cenepa", "Arequipa", 1, 0, 4, 0, 1, 1, 0, 0, 1, 0, 1, 0, 500, 0, 1, 200),
  rec(6, -16.396844, -71.483827, "Asociación Héroes del Cenepa", "Arequipa", 0, 0, 4, 0, 2, 0, 0, 0, 0, 0, 0, 1, 1500, 0, 1, 200),
  rec(7, -16.397229, -71.48313, "Asociación Héroes del Cenepa", "Arequipa", 0, 1, 2, 1, 0, 1, 1, 0, 0, 1, 0, 1, 900, 0, 1, 200),
  rec(8, -16.404107, -71.478406, "Asociación San Gerónimo", "Arequipa", 0, 0, 5, 1, 2, 0, 0, 0, 0, 0, 1, 0, 2800, 1, 1, 0),
  rec(9, -16.403934, -71.478124, "Asociación Miguel Grau", "Arequipa", 1, 0, 5, 0, 2, 4, 0, 0, 0, 0, 0, 0, 3000, 1, 1, 300),
  rec(10, -16.403258, -71.47743, "Asociación Villa Del Misti", "Arequipa", 0, 1, 2, 0, 0, 0, 0, 0, 0, 1, 1, 0, 900, 0, 2, 300),
  rec(11, -16.403235, -71.479252, "Asociación Miguel Grau", "Arequipa", 0, 0, 6, 1, 1, 6, 2, 1, 0, 0, 0, 0, 1500, 1, 2, 600),
  rec(12, -16.405362, -71.47793, "Asociación Miguel Grau", "Arequipa", 0, 1, 9, 1, 6, 0, 0, 0, 3, 0, 1, 0, 3000, 0, 3, 300),
  rec(13, -16.406663, -71.475701, "Asociación Miguel Grau", "Arequipa", 0, 0, 5, 1, 0, 0, 0, 1, 0, 0, 0, 0, 900, 1, 1, 600),
  rec(14, -16.404435, -71.478442, "Asociación Miguel Grau", "Arequipa", 0, 0, 3, 0, 1, 1, 0, 1, 1, 0, 0, 0, 4500, 0, 2, 600),
  rec(15, -16.396312, -71.469612, "Asociación Los Olivos", "Arequipa", 0, 0, 6, 1, 3, 1, 1, 1, 1, 0, 0, 1, 1050, 0, 2, 200),
  rec(16, -16.395225, -71.468467, "Asociación Los Olivos", "Arequipa", 0, 1, 2, 2, 0, 2, 2, 0, 0, 0, 0, 1, 900, 0, 1, 200),
];

/**
 * Dataset with derived indicators applied.
 */
export const socioeconomic: Array<SocioeconomicRecord & DerivedIndicators> = socioeconomicRaw.map(withDerived);

/**
 * Default export: enriched dataset.
 */
export default socioeconomic;

/**
 * Utilities
 */
function rec(
  idx: number,
  lat: number,
  lng: number,
  zone: string,
  department: string,
  genderCode: number,
  ageCode: number,
  householdSize: number,
  elders65: number,
  childrenUnder10: number,
  healthInsuranceCount: number,
  chronicConditionCount: number,
  higherEducationCount: number,
  illiterateCount: number,
  wallMaterialCode: number,
  servicesDummy1: number,
  servicesDummy2: number,
  monthlyIncome: number,
  formalJobs: number,
  informalJobs: number,
  estimatedLossHousing: number,
): SocioeconomicRecord {
  return {
    id: `SOC-${String(idx).padStart(3, "0")}`,
    lat,
    lng,
    zone,
    department,
    genderCode,
    ageCode,
    householdSize,
    elders65,
    childrenUnder10,
    healthInsuranceCount,
    chronicConditionCount,
    higherEducationCount,
    illiterateCount,
    wallMaterialCode,
    servicesDummy1,
    servicesDummy2,
    monthlyIncome,
    formalJobs,
    informalJobs,
    estimatedLossHousing,
  };
}

function clamp01(x: number): number {
  if (Number.isNaN(x)) return 0;
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function clamp(x: number, min: number, max: number): number {
  if (Number.isNaN(x)) return min;
  return Math.min(max, Math.max(min, x));
}

function soles(n: number): string {
  if (!Number.isFinite(n)) return "S/.-";
  return `S/. ${n.toLocaleString("es-PE", { maximumFractionDigits: 0 })}`;
}
