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
}

/** Deterministic demo readings for major Indian cities */
export const DEMO_CITIES: Record<string, MockReading> = {
  Delhi: {
    station: "Anand Vihar, Delhi",
    city: "Delhi",
    lat: 28.6469, lon: 77.3164, distanceKm: 2.1,
    pm25: 178, pm10: 302, no2: 68, so2: 22, co: 2.1, o3: 45,
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    source: "CPCB (DEMO DATA)",
  },
  Mumbai: {
    station: "Bandra, Mumbai",
    city: "Mumbai",
    lat: 19.0596, lon: 72.8295, distanceKm: 1.8,
    pm25: 62, pm10: 108, no2: 42, so2: 12,
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    source: "MPCB (DEMO DATA)",
  },
  Bengaluru: {
    station: "BTM Layout, Bengaluru",
    city: "Bengaluru",
    lat: 12.9166, lon: 77.5979, distanceKm: 3.2,
    pm25: 48, pm10: 82, no2: 35,
    timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    source: "KSPCB (DEMO DATA)",
  },
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

export function demoReading(city?: string): MockReading {
  return DEMO_CITIES[city ?? DEFAULT_DEMO_CITY] ?? DEMO_CITIES[DEFAULT_DEMO_CITY];
}

/** 24-hour trend data for the demo city — realistic winter smog pattern (Delhi) */
export function demoTrend(city?: string): Array<{ hour: string; pm25: number; pm10: number; aqi: number }> {
  const base = city === "Mumbai" ? 60 : city === "Bengaluru" ? 45 : 170;
  return Array.from({ length: 24 }, (_, i) => {
    // Morning peak (6-9 AM), afternoon dip (12-3 PM), evening peak (7-10 PM)
    const hourFactor =
      (i >= 6 && i <= 9)  ? 1.3 :
      (i >= 7 && i <= 10) ? 1.2 :
      (i >= 12 && i <= 15) ? 0.8 :
      (i >= 19 && i <= 22) ? 1.25 :
      (i >= 0 && i <= 5)   ? 1.1 : 1.0;
    const pm25 = Math.round(base * hourFactor + (Math.random() * 10 - 5));
    const pm10 = Math.round(pm25 * 1.7);
    const aqi = Math.min(500, Math.round(pm25 * 1.1));
    return { hour: `${i.toString().padStart(2, "0")}:00`, pm25, pm10, aqi };
  });
}

export function demoCities(): string[] {
  return Object.keys(DEMO_CITIES);
}
