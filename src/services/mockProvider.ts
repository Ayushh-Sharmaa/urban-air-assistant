/**
 * Mock / Demo data provider.
 * All mock data is clearly labelled DEMO in the UI.
 * Never present mock data as live readings.
 */

export interface MockReading {
  station: string;
  city: string;
  lat: number;
  lon: number;
  distanceKm: number;
  pm25: number;
  pm10: number;
  no2?: number;
  so2?: number;
  co?: number;
  o3?: number;
  timestamp: string;
  source: string;
  scenarioName?: string;
}

export type DemoScenarioId = "default" | "severe-smog" | "moderate" | "stale-fallback";

export interface DemoScenario {
  id: DemoScenarioId;
  name: string;
  subtitle: string;
  description: string;
  reading: MockReading;
}

/** Predefined Hackathon Scenarios */
export const HACKATHON_SCENARIOS: Record<DemoScenarioId, DemoScenario> = {
  "default": {
    id: "default",
    name: "Standard Live/Demo",
    subtitle: "Delhi Baseline",
    description: "Typical early-winter urban pollution conditions across Delhi-NCR.",
    reading: {
      station: "Anand Vihar, Delhi",
      city: "Delhi",
      lat: 28.6469, lon: 77.3164, distanceKm: 2.1,
      pm25: 178, pm10: 302, no2: 68, so2: 22, co: 2.1, o3: 45,
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      source: "CPCB (DEMO DATA)",
      scenarioName: "Standard",
    },
  },
  "severe-smog": {
    id: "severe-smog",
    name: "Scenario A: Severe Winter Smog",
    subtitle: "Delhi Peak Episode (AQI 435 Severe)",
    description: "Emergency GRAP Stage IV conditions, thermal inversion trapping ground emissions, strict indoor safety required.",
    reading: {
      station: "Anand Vihar Industrial Area, Delhi",
      city: "Delhi",
      lat: 28.6469, lon: 77.3164, distanceKm: 1.4,
      pm25: 382, pm10: 512, no2: 124, so2: 44, co: 4.8, o3: 28,
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      source: "CPCB Station 08 (DEMO SCENARIO A)",
      scenarioName: "Severe Smog (Emergency)",
    },
  },
  "moderate": {
    id: "moderate",
    name: "Scenario B: Moderate Pollution",
    subtitle: "Bengaluru Tech Corridor (AQI 82 Satisfactory)",
    description: "Good ventilation opportunity, outdoor exercise permitted for non-sensitive individuals, transit savings visible.",
    reading: {
      station: "BTM Layout 2nd Stage, Bengaluru",
      city: "Bengaluru",
      lat: 12.9166, lon: 77.5979, distanceKm: 2.8,
      pm25: 48, pm10: 82, no2: 35, so2: 10, co: 0.9, o3: 38,
      timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      source: "KSPCB Continuous Ambient (DEMO SCENARIO B)",
      scenarioName: "Moderate / Satisfactory",
    },
  },
  "stale-fallback": {
    id: "stale-fallback",
    name: "Scenario C: Live Data Unavailable",
    subtitle: "Offline / Stale Telemetry Check",
    description: "Simulates station outage or network disconnect (>5 hours stale), demonstrating honest UX and graceful fallback states.",
    reading: {
      station: "Mandir Marg Sensor 03, Delhi",
      city: "Delhi",
      lat: 28.6366, lon: 77.1996, distanceKm: 4.2,
      pm25: 142, pm10: 240, no2: 52,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      source: "CPCB Station Feed (DEMO SCENARIO C - STALE)",
      scenarioName: "Stale / Offline Fallback",
    },
  },
};

/** Deterministic demo readings for major Indian cities */
export const DEMO_CITIES: Record<string, MockReading> = {
  Delhi: HACKATHON_SCENARIOS["default"].reading,
  Mumbai: {
    station: "Bandra, Mumbai",
    city: "Mumbai",
    lat: 19.0596, lon: 72.8295, distanceKm: 1.8,
    pm25: 62, pm10: 108, no2: 42, so2: 12,
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    source: "MPCB (DEMO DATA)",
  },
  Bengaluru: HACKATHON_SCENARIOS["moderate"].reading,
  Kolkata: {
    station: "Jadavpur, Kolkata",
    city: "Kolkata",
    lat: 22.4983, lon: 88.3718, distanceKm: 4.0,
    pm25: 112, pm10: 195, no2: 55,
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    source: "WBPCB (DEMO DATA)",
  },
  Chennai: {
    station: "Manali, Chennai",
    city: "Chennai",
    lat: 13.1664, lon: 80.2706, distanceKm: 5.5,
    pm25: 55, pm10: 90, no2: 38,
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    source: "TNPCB (DEMO DATA)",
  },
};

export const DEFAULT_DEMO_CITY = "Delhi";

export function demoReading(cityOrScenario?: string): MockReading {
  if (cityOrScenario && cityOrScenario in HACKATHON_SCENARIOS) {
    return HACKATHON_SCENARIOS[cityOrScenario as DemoScenarioId].reading;
  }
  return DEMO_CITIES[cityOrScenario ?? DEFAULT_DEMO_CITY] ?? DEMO_CITIES[DEFAULT_DEMO_CITY];
}

/** 24-hour trend data for the demo city/scenario */
export function demoTrend(cityOrScenario?: string): Array<{ hour: string; pm25: number; pm10: number; aqi: number }> {
  let base = 170;
  if (cityOrScenario === "severe-smog") base = 350;
  else if (cityOrScenario === "moderate" || cityOrScenario === "Bengaluru") base = 45;
  else if (cityOrScenario === "Mumbai") base = 60;

  return Array.from({ length: 24 }, (_, i) => {
    const hourFactor =
      (i >= 6 && i <= 9) ? 1.3 :
        (i >= 7 && i <= 10) ? 1.2 :
          (i >= 12 && i <= 15) ? 0.8 :
            (i >= 19 && i <= 22) ? 1.25 :
              (i >= 0 && i <= 5) ? 1.1 : 1.0;
    const pm25 = Math.round(base * hourFactor + (Math.sin(i / 3) * 8));
    const pm10 = Math.round(pm25 * 1.6);
    const aqi = Math.min(500, Math.round(pm25 > 250 ? 400 + ((pm25 - 250) / 250) * 100 : pm25 * 1.15));
    return { hour: `${i.toString().padStart(2, "0")}:00`, pm25, pm10, aqi };
  });
}

export function demoCities(): string[] {
  return Object.keys(DEMO_CITIES);
}
