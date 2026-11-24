/**
 * AQI Service — provider abstraction.
 * Live adapter: OpenAQ v3 API (requires OPENAQ_API_KEY).
 * Falls back to demo data with explicit labelling.
 * Never presents demo data as live.
 */
import { env } from "@/utils/env";
import { overallAqi, type Pollutant } from "@/utils/aqi";
import { isStale, formatRelative } from "@/utils/date";
import { demoReading, demoTrend } from "./mockProvider";
import type { Result } from "@/utils/validators";

export interface AqiView {
  aqi: number;
  label: string;
  color: string;
  categoryBg: string;
  station: string;
  city: string;
  pm25: number;
  pm10: number;
  no2?: number;
  so2?: number;
  co?: number;
  o3?: number;
  distanceKm: number;
  lat: number;
  lon: number;
  timestamp: string;
  relativeTime: string;
  source: string;
  isDemo: boolean;
  stale: boolean;
  mainPollutant: string;
  mainPollutantLabel: string;
}

export interface TrendPoint {
  hour: string;
  pm25: number;
  pm10: number;
  aqi: number;
}

export async function getAirQuality(city?: string): Promise<Result<AqiView>> {
  if (env.dataMode === "live" && env.openAqKey) {
    try {
      return await fetchOpenAQ(city);
    } catch (err) {
      console.error("[aqiService] OpenAQ fetch failed, falling back to demo:", err);
    }
  }
  return getDemoAirQuality(city);
}

export async function getTrend(city?: string): Promise<TrendPoint[]> {
  return demoTrend(city);
}

function getDemoAirQuality(city?: string): Result<AqiView> {
  const r = demoReading(city);
  const res = overallAqi({ pm25: r.pm25, pm10: r.pm10, no2: r.no2, so2: r.so2, co: r.co, o3: r.o3 });
  if (!res) return { ok: false, error: "Could not compute AQI from demo data." };
  const pollutantLabels: Record<Pollutant, string> = {
    pm25: "PM2.5", pm10: "PM10", no2: "NO₂", so2: "SO₂",
    co: "CO", o3: "O₃", nh3: "NH₃", pb: "Pb",
  };
  return {
    ok: true,
    value: {
      aqi: res.aqi,
      label: res.category.label,
      color: res.category.color,
      categoryBg: res.category.bg,
      station: r.station,
      city: r.city,
      pm25: r.pm25,
      pm10: r.pm10,
      no2: r.no2,
      so2: r.so2,
      co: r.co,
      o3: r.o3,
      distanceKm: r.distanceKm,
      lat: r.lat,
      lon: r.lon,
      timestamp: r.timestamp,
      relativeTime: formatRelative(r.timestamp),
      source: r.source,
      isDemo: true,
      stale: isStale(r.timestamp),
      mainPollutant: res.mainPollutant,
      mainPollutantLabel: pollutantLabels[res.mainPollutant],
    },
  };
}

/** OpenAQ v3 API adapter */
async function fetchOpenAQ(city?: string): Promise<Result<AqiView>> {
  const cityQuery = encodeURIComponent(city ?? "Delhi");
  const url = `https://api.openaq.org/v3/locations?city=${cityQuery}&limit=5&order_by=lastUpdated&sort=desc&radius=25000`;
  const res = await fetch(url, {
    headers: { "X-API-Key": env.openAqKey },
    next: { revalidate: 300 }, // cache 5 min
  });
  if (!res.ok) throw new Error(`OpenAQ HTTP ${res.status}`);
  const json = await res.json();
  const loc = json.results?.[0];
  if (!loc) return { ok: false, error: "No monitoring station found near your location." };

  // Extract latest readings
  const readings: Partial<Record<Pollutant, number>> = {};
  for (const sensor of loc.sensors ?? []) {
    const p = mapOpenAQParam(sensor.parameter?.name);
    if (p && sensor.latest?.value !== undefined) readings[p] = sensor.latest.value;
  }

  const aqiRes = overallAqi(readings);
  if (!aqiRes) return { ok: false, error: "Insufficient pollutant data from station." };

  const timestamp = loc.datetimeLast?.utc ?? new Date().toISOString();
  return {
    ok: true,
    value: {
      aqi: aqiRes.aqi,
      label: aqiRes.category.label,
      color: aqiRes.category.color,
      categoryBg: aqiRes.category.bg,
      station: loc.name ?? "Unknown Station",
      city: loc.locality ?? city ?? "India",
      pm25: readings.pm25 ?? 0,
      pm10: readings.pm10 ?? 0,
      no2: readings.no2,
      so2: readings.so2,
      co: readings.co,
      o3: readings.o3,
      distanceKm: loc.distance ? Math.round(loc.distance / 100) / 10 : 0,
      lat: loc.coordinates?.latitude ?? 0,
      lon: loc.coordinates?.longitude ?? 0,
      timestamp,
      relativeTime: formatRelative(timestamp),
      source: "OpenAQ / CPCB",
      isDemo: false,
      stale: isStale(timestamp),
      mainPollutant: aqiRes.mainPollutant,
      mainPollutantLabel: aqiRes.mainPollutant.toUpperCase(),
    },
  };
}

function mapOpenAQParam(name?: string): Pollutant | null {
  const map: Record<string, Pollutant> = {
    "pm25": "pm25", "pm2.5": "pm25",
    "pm10": "pm10",
    "no2": "no2",
    "so2": "so2",
    "co": "co",
    "o3": "o3",
    "nh3": "nh3",
    "pb": "pb",
  };
  return map[(name ?? "").toLowerCase()] ?? null;
}
