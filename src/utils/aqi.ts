/**
 * CPCB Indian AQI engine (deterministic, no AI).
 * Units: PM2.5 / PM10 in µg/m³.
 * AQI = max sub-index across all valid pollutants.
 * Never compute from missing, invalid, or stale values.
 * Never use the US AQI.
 */

export type Pollutant = "pm25" | "pm10" | "no2" | "so2" | "co" | "o3" | "nh3" | "pb";

/** AQI index breakpoints (same for all pollutants) */
const INDEX = [0, 50, 100, 200, 300, 400, 500] as const;

/** Concentration breakpoints per pollutant (CPCB NAAQS 2014) */
const BREAKS: Record<Pollutant, readonly number[]> = {
  pm25: [0, 30,  60,   90,  120,  250, 500],
  pm10: [0, 50, 100,  250,  350,  430, 600],
  no2:  [0, 40,  80,  180,  280,  400, 800],
  so2:  [0, 40,  80,  380,  800, 1600, 2100],
  co:   [0, 1,    2,   10,   17,   34,  50], // mg/m³
  o3:   [0, 50, 100,  168,  208,  748, 1000], // µg/m³ (8h)
  nh3:  [0, 200, 400, 800, 1200, 1800, 2400], // µg/m³
  pb:   [0, 0.5, 1,   1.5,   2,    3,    4],  // µg/m³
};

/** CPCB AQI categories with colours (AQI category colours ONLY for gauge/chart use) */
export const CATEGORIES = [
  { max: 50,  label: "Good",         color: "#1f7a4d", bg: "#e3f3ea" },
  { max: 100, label: "Satisfactory", color: "#6aa84f", bg: "#eef5e3" },
  { max: 200, label: "Moderate",     color: "#e0a800", bg: "#fff8df" },
  { max: 300, label: "Poor",         color: "#f57c00", bg: "#fef0e6" },
  { max: 400, label: "Very Poor",    color: "#d32f2f", bg: "#fbe5e3" },
  { max: 500, label: "Severe",       color: "#7b1fa2", bg: "#f3e5f5" },
] as const;

export type AqiCategory = (typeof CATEGORIES)[number];

/**
 * Compute CPCB sub-index for one pollutant at a given concentration.
 * Returns null for invalid / missing data — NEVER fabricates.
 */
export function subIndex(p: Pollutant, conc: number): number | null {
  if (!Number.isFinite(conc) || conc < 0) return null;
  const b = BREAKS[p];
  for (let i = 0; i < b.length - 1; i++) {
    if (conc <= b[i + 1]) {
      return Math.round(
        INDEX[i] + ((INDEX[i + 1] - INDEX[i]) / (b[i + 1] - b[i])) * (conc - b[i])
      );
    }
  }
  return 500;
}

export interface AqiResult {
  aqi: number;
  mainPollutant: Pollutant;
  category: AqiCategory;
  subIndices: Partial<Record<Pollutant, number>>;
}

/**
 * Compute overall AQI = max sub-index across all valid pollutants.
 * Returns null if no valid sub-index can be computed.
 */
export function overallAqi(
  concentrations: Partial<Record<Pollutant, number>>
): AqiResult | null {
  const subs: { p: Pollutant; s: number }[] = [];
  for (const [key, val] of Object.entries(concentrations)) {
    if (val === undefined || val === null) continue;
    const s = subIndex(key as Pollutant, val);
    if (s !== null) subs.push({ p: key as Pollutant, s });
  }
  if (!subs.length) return null;
  const top = subs.reduce((a, b) => (b.s > a.s ? b : a));
  const subIndices: Partial<Record<Pollutant, number>> = {};
  for (const { p, s } of subs) subIndices[p] = s;
  return {
    aqi: top.s,
    mainPollutant: top.p,
    category: categoryFor(top.s),
    subIndices,
  };
}

export function categoryFor(aqi: number): AqiCategory {
  return CATEGORIES.find((c) => aqi <= c.max) ?? CATEGORIES[5];
}

export function pollutantLabel(p: Pollutant): string {
  const labels: Record<Pollutant, string> = {
    pm25: "PM2.5", pm10: "PM10", no2: "NO₂", so2: "SO₂",
    co: "CO", o3: "O₃", nh3: "NH₃", pb: "Pb",
  };
  return labels[p];
}

export function pollutantUnit(p: Pollutant): string {
  return p === "co" ? "mg/m³" : "µg/m³";
}

/** Health advisory for a given AQI value */
export function healthAdvisory(aqi: number): { general: string; sensitive: string } {
  if (aqi <= 50)  return { general: "Air quality is good. Enjoy outdoor activities.", sensitive: "No special precautions needed." };
  if (aqi <= 100) return { general: "Air quality is acceptable. Unusually sensitive people should consider reducing prolonged outdoor exertion.", sensitive: "Consider reducing prolonged outdoor exertion." };
  if (aqi <= 200) return { general: "Members of sensitive groups may experience health effects. Reduce prolonged outdoor exertion.", sensitive: "Avoid prolonged outdoor exertion. Keep windows closed during peak hours." };
  if (aqi <= 300) return { general: "Everyone may begin to experience health effects. Reduce outdoor activities. Wear N95 mask if outdoors.", sensitive: "Avoid all outdoor exertion. Keep windows and doors closed. Use air purifier." };
  if (aqi <= 400) return { general: "Health alert: everyone may experience more serious health effects. Avoid outdoor activities.", sensitive: "Remain indoors. Use HEPA purifier. Avoid cooking with biomass/wood." };
  return {
    general: "Health warning of emergency conditions. Everyone is affected. Stay indoors with air purifier running.",
    sensitive: "Do NOT go outside. Seal gaps in windows/doors. Run HEPA purifier at highest setting. Seek medical advice if symptomatic.",
  };
}
