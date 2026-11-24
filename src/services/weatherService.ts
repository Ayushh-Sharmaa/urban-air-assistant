/**
 * Weather service — real weather context for smog formation.
 * Currently uses Open-Meteo (no API key required, free tier).
 */
import type { Result } from "@/utils/validators";

export interface WeatherData {
  temperatureC: number;
  humidity: number;
  windSpeedKmh: number;
  windDirection: string;
  description: string;
  smogRisk: "Low" | "Moderate" | "High" | "Very High";
  smogRiskReason: string;
}

/** Compass direction from degrees */
function windDir(deg: number): string {
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

/** Assess smog formation risk from meteorological conditions */
function assessSmogRisk(temp: number, humidity: number, windSpeed: number): WeatherData["smogRisk"] {
  // Low wind + high humidity + winter temp = high smog formation risk
  if (windSpeed < 3 && humidity > 70 && temp < 20) return "Very High";
  if (windSpeed < 8 && humidity > 60) return "High";
  if (windSpeed < 15 || humidity > 50) return "Moderate";
  return "Low";
}

function smogRiskReason(risk: WeatherData["smogRisk"], windSpeed: number, humidity: number, temp: number): string {
  if (risk === "Very High") return `Calm winds (${windSpeed} km/h), high humidity (${humidity}%), and cold temperature (${temp}°C) create strong temperature inversion — pollutants trapped at ground level.`;
  if (risk === "High") return `Low wind speed and elevated humidity favour pollutant accumulation. Avoid prolonged outdoor exposure.`;
  if (risk === "Moderate") return `Moderate meteorological conditions. Smog formation possible, especially at peak traffic hours.`;
  return `Good dispersion conditions — wind helps clear pollutants. AQI may improve during the day.`;
}

export async function getWeather(lat: number, lon: number): Promise<Result<WeatherData>> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code&wind_speed_unit=kmh&timezone=Asia%2FKolkata`;
    const res = await fetch(url, { next: { revalidate: 1800 } }); // 30 min cache
    if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
    const data = await res.json();
    const c = data.current;
    const temp = Math.round(c.temperature_2m);
    const humidity = Math.round(c.relative_humidity_2m);
    const windSpeed = Math.round(c.wind_speed_10m);
    const windDirection = windDir(c.wind_direction_10m);
    const wmo = c.weather_code;
    const description = wmoDescription(wmo);
    const smogRisk = assessSmogRisk(temp, humidity, windSpeed);
    return {
      ok: true,
      value: { temperatureC: temp, humidity, windSpeedKmh: windSpeed, windDirection, description, smogRisk, smogRiskReason: smogRiskReason(smogRisk, windSpeed, humidity, temp) },
    };
  } catch (err) {
    console.error("[weatherService]", err);
    // Return plausible demo weather for Delhi winter
    return {
      ok: true,
      value: {
        temperatureC: 14, humidity: 72, windSpeedKmh: 4, windDirection: "NW",
        description: "Foggy (DEMO)", smogRisk: "Very High",
        smogRiskReason: "Demo weather: calm NW winds, high humidity, cold temperature — classic winter smog conditions for Delhi IGP.",
      },
    };
  }
}

function wmoDescription(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 49) return "Foggy / Hazy";
  if (code <= 69) return "Drizzle / Rain";
  if (code <= 79) return "Sleet / Snow";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}

