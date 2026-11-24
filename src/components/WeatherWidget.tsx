import type { WeatherData } from "@/services/weatherService";
import { Thermometer, Droplets, Wind, AlertTriangle } from "lucide-react";

interface Props { data: WeatherData | null; }

const RISK_COLOR: Record<WeatherData["smogRisk"], string> = {
  Low: "var(--ok)",
  Moderate: "#e0a800",
  High: "#f57c00",
  "Very High": "#d32f2f",
};

export default function WeatherWidget({ data }: Props) {
  if (!data) return null;
  return (
    <div className="card card-flat" style={{ background: "#f8f4ee" }}>
      <div className="flex justify-between items-center mb-2" style={{ flexWrap: "wrap", gap: ".5rem" }}>
        <h3 style={{ fontSize: ".95rem", fontWeight: 700 }}>Weather Conditions</h3>
        <span
          className="badge"
          style={{ background: RISK_COLOR[data.smogRisk], color: "#fff" }}
          aria-label={`Smog formation risk: ${data.smogRisk}`}
        >
          {data.smogRisk} Smog Risk
        </span>
      </div>

      <div className="weather-row">
        <div className="weather-item">
          <Thermometer size={15} style={{ color: "var(--coral)" }} />
          <span>{data.temperatureC}°C</span>
        </div>
        <div className="weather-item">
          <Droplets size={15} style={{ color: "#1565c0" }} />
          <span>{data.humidity}% RH</span>
        </div>
        <div className="weather-item">
          <Wind size={15} style={{ color: "var(--navy)" }} />
          <span>{data.windSpeedKmh} km/h {data.windDirection}</span>
        </div>
        <div className="weather-item text-muted">
          <span>{data.description}</span>
        </div>
      </div>

      <div className="msg warn mt-2" style={{ padding: ".55rem .75rem" }}>
        <AlertTriangle size={13} style={{ flexShrink: 0 }} />
        <span className="text-xs">{data.smogRiskReason}</span>
      </div>
    </div>
  );
}

