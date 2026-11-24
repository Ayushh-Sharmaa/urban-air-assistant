import type { WeatherData } from "@/services/weatherService";
import { Thermometer, Droplets, Wind, Compass, Layers, AlertTriangle, ShieldCheck } from "lucide-react";

interface Props {
  data: WeatherData | null;
}

const RISK_COLOR: Record<WeatherData["smogRisk"], string> = {
  Low: "var(--ok)",
  Moderate: "#e0a800",
  High: "#f57c00",
  "Very High": "#d32f2f",
};

export default function WeatherWidget({ data }: Props) {
  if (!data) return null;

  return (
    <div className="card card-hover" style={{ background: "#ffffff", border: "1px solid var(--border)" }}>
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-coral" />
          <h3 style={{ fontSize: "1.08rem", fontWeight: 800, margin: 0, color: "var(--navy)" }}>
            Atmospheric Context & Nocturnal Inversion Stagnation
          </h3>
        </div>
        <span
          className="badge"
          style={{ background: RISK_COLOR[data.smogRisk], color: "#fff", fontSize: ".76rem" }}
          aria-label={`Atmospheric stagnation risk: ${data.smogRisk}`}
        >
          {data.smogRisk} Smog Stagnation Risk
        </span>
      </div>

      <div className="grid-2 gap-3" style={{ alignItems: "center" }}>
        {/* Weather parameters */}
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: ".6rem" }}>
          <div className="card-flat rounded p-2 text-center">
            <Thermometer size={16} style={{ color: "var(--coral)", margin: "0 auto" }} />
            <div className="text-sm font-bold mt-1" style={{ color: "var(--navy)" }}>
              {data.temperatureC}°C
            </div>
            <span className="text-xs text-muted">Ambient Temp</span>
          </div>

          <div className="card-flat rounded p-2 text-center">
            <Droplets size={16} style={{ color: "#1565c0", margin: "0 auto" }} />
            <div className="text-sm font-bold mt-1" style={{ color: "var(--navy)" }}>
              {data.humidity}%
            </div>
            <span className="text-xs text-muted">Humidity (RH)</span>
          </div>

          <div className="card-flat rounded p-2 text-center">
            <Wind size={16} style={{ color: "var(--navy)", margin: "0 auto" }} />
            <div className="text-sm font-bold mt-1" style={{ color: "var(--navy)" }}>
              {data.windSpeedKmh} <span className="text-xs">km/h</span>
            </div>
            <span className="text-xs text-muted">Surface Velocity</span>
          </div>

          <div className="card-flat rounded p-2 text-center">
            <Compass size={16} style={{ color: "var(--coral)", margin: "0 auto" }} />
            <div className="text-sm font-bold mt-1" style={{ color: "var(--navy)" }}>
              {data.windDirection}
            </div>
            <span className="text-xs text-muted">Wind Trajectory</span>
          </div>
        </div>

        {/* Smog Stagnation Assessment */}
        <div className="card-flat rounded p-2" style={{ background: "#fbf9f5" }}>
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle size={14} style={{ color: RISK_COLOR[data.smogRisk] }} />
            <strong className="text-xs uppercase tracking-wider" style={{ color: "var(--navy)" }}>
              Dispersion Model Analysis
            </strong>
          </div>
          <p className="text-xs" style={{ color: "var(--navy)", lineHeight: 1.55 }}>
            {data.smogRiskReason}
          </p>
          <div className="text-xs text-muted mt-2 pt-1 border-bottom flex items-center gap-1">
            <ShieldCheck size={11} />
            <span>Model correlation based on Open-Meteo & IMD Indo-Gangetic Plain boundary layer heuristics.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
