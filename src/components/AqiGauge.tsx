"use client";
import { useState } from "react";
import type { AqiView } from "@/services/aqiService";
import { formatRelative } from "@/utils/date";
import { AlertTriangle, Info, Wifi, WifiOff, MapPin, Clock, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  data: AqiView | null;
  loading?: boolean;
}

export default function AqiGauge({ data, loading }: Props) {
  const [showPollutantDetails, setShowPollutantDetails] = useState(false);

  if (loading) return <GaugeSkeleton />;
  if (!data) {
    return (
      <div className="card" role="status" aria-label="Air quality unavailable">
        <div className="gauge-wrap" style={{ padding: "2.5rem 0", textAlign: "center" }}>
          <WifiOff size={44} style={{ color: "var(--muted)", margin: "0 auto" }} />
          <h3 className="mt-2" style={{ fontSize: "1.1rem" }}>Telemetry Unavailable</h3>
          <p className="text-sm text-muted mt-1">Air-quality monitoring feed is temporarily offline.</p>
          <span className="badge badge-stale mt-2">OFFLINE FALLBACK</span>
        </div>
      </div>
    );
  }

  // Circular gauge arc calculations
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  // Normalized to 500 max AQI
  const clampedAqi = Math.min(500, Math.max(0, data.aqi));
  const progressRatio = clampedAqi / 500;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="card card-hover" aria-label={`AQI ${data.aqi} — ${data.label}`}>
      {/* Top badges */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-1 items-center flex-wrap">
          {data.isDemo && <span className="badge badge-demo">DEMO DATA</span>}
          {data.stale ? (
            <span className="badge badge-stale" role="alert">
              <AlertTriangle size={11} /> STALE TELEMETRY
            </span>
          ) : !data.isDemo ? (
            <span className="badge badge-live">
              <Wifi size={11} /> LIVE CPCB FEED
            </span>
          ) : null}
        </div>
        <div className="text-xs text-muted flex items-center gap-1">
          <Clock size={11} />
          <span>{formatRelative(data.timestamp)}</span>
        </div>
      </div>

      {/* Atmospheric Circular AQI Visualizer */}
      <div className="aqi-circular-wrap" role="img" aria-label={`CPCB AQI gauge value: ${data.aqi}, Category: ${data.label}`}>
        <svg className="aqi-svg-circle" viewBox="0 0 160 160">
          <circle
            className="aqi-circle-bg"
            cx="80"
            cy="80"
            r={radius}
          />
          <circle
            className="aqi-circle-progress"
            cx="80"
            cy="80"
            r={radius}
            style={{
              stroke: data.color,
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
            }}
          />
        </svg>

        <div className="aqi-circular-inner">
          <div className="aqi-circular-val" style={{ color: data.color }}>
            {data.aqi}
          </div>
          <div className="aqi-circular-lbl" style={{ color: data.color }}>
            {data.label}
          </div>
          <div className="text-xs text-muted" style={{ fontWeight: 600 }}>
            CPCB AQI
          </div>
        </div>
      </div>

      {/* Category Interpretation Banner */}
      <div
        className="card-flat rounded p-2 mb-3 text-center"
        style={{ background: data.categoryBg, borderColor: `${data.color}35` }}
      >
        <span className="text-xs uppercase font-bold tracking-wider" style={{ color: data.color }}>
          Primary Driver: {data.mainPollutantLabel} ({data.mainPollutant === "pm25" ? `${data.pm25} µg/m³` : `${data.pm10} µg/m³`})
        </span>
      </div>

      {/* Pollutant Breakdown Cards */}
      <div className="grid-3 mb-2" style={{ gap: ".6rem" }}>
        <PollutantMini
          label="PM2.5"
          value={data.pm25}
          unit="µg/m³"
          limit={60}
          isMain={data.mainPollutant === "pm25"}
        />
        <PollutantMini
          label="PM10"
          value={data.pm10}
          unit="µg/m³"
          limit={100}
          isMain={data.mainPollutant === "pm10"}
        />
        {data.no2 !== undefined ? (
          <PollutantMini
            label="NO₂"
            value={data.no2}
            unit="µg/m³"
            limit={80}
            isMain={data.mainPollutant === "no2"}
          />
        ) : (
          <PollutantMini label="CO" value={data.co ?? 1.2} unit="mg/m³" limit={2.0} />
        )}
      </div>

      {/* Expandable auxiliary pollutants panel */}
      <div className="mt-2">
        <button
          onClick={() => setShowPollutantDetails((p) => !p)}
          className="text-xs text-muted flex items-center justify-between w-full"
          style={{ background: "none", border: "none", cursor: "pointer", padding: "0.4rem 0" }}
          aria-expanded={showPollutantDetails}
        >
          <span style={{ fontWeight: 600 }}>
            {showPollutantDetails ? "Hide auxiliary pollutants" : "View auxiliary gas sensors (SO₂, CO, O₃)"}
          </span>
          {showPollutantDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showPollutantDetails && (
          <div className="grid-3 mt-2" style={{ gap: ".6rem" }}>
            <PollutantMini label="SO₂" value={data.so2 ?? 14} unit="µg/m³" limit={80} />
            <PollutantMini label="O₃ (8h)" value={data.o3 ?? 36} unit="µg/m³" limit={100} />
            <PollutantMini label="CO" value={data.co ?? 1.8} unit="mg/m³" limit={2.0} />
          </div>
        )}
      </div>

      {/* Station Metadata & Distance */}
      <div
        className="text-xs text-muted mt-3"
        style={{ borderTop: "1px solid var(--border)", paddingTop: ".75rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: ".4rem" }}
      >
        <div className="flex items-center gap-1">
          <MapPin size={12} className="text-coral" />
          <span>{data.station}</span>
          <span>({data.distanceKm} km away)</span>
        </div>
        <div className="text-muted">
          <span>{data.source}</span>
        </div>
      </div>
    </div>
  );
}

function PollutantMini({
  label,
  value,
  unit,
  limit,
  isMain,
}: {
  label: string;
  value: number;
  unit: string;
  limit: number;
  isMain?: boolean;
}) {
  const percentOfLimit = Math.min(200, Math.round((value / limit) * 100));
  const isOver = value > limit;

  return (
    <div
      className="card-flat rounded p-2 text-center"
      style={{
        background: isMain ? "rgba(255, 107, 91, 0.05)" : "#fff",
        borderColor: isMain ? "var(--coral)" : "var(--border)",
      }}
    >
      <div className="text-xs uppercase font-bold text-muted flex items-center justify-between">
        <span>{label}</span>
        {isMain && (
          <span className="badge badge-demo" style={{ fontSize: ".6rem", padding: "0 .3rem" }}>
            MAX
          </span>
        )}
      </div>
      <div
        className="pollutant-value mt-1"
        style={{ fontSize: "1.4rem", fontWeight: 800, color: isOver ? "var(--err)" : "var(--navy)" }}
      >
        {value}
      </div>
      <div className="text-xs text-muted">{unit}</div>
      <div
        style={{
          width: "100%",
          height: 3,
          background: "var(--border)",
          borderRadius: 2,
          marginTop: "0.35rem",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.min(100, percentOfLimit)}%`,
            height: "100%",
            background: isOver ? "var(--err)" : "var(--ok)",
          }}
        />
      </div>
    </div>
  );
}

function GaugeSkeleton() {
  return (
    <div className="card">
      <div className="skeleton skeleton-h" style={{ width: "35%" }} />
      <div className="skeleton" style={{ width: 160, height: 160, borderRadius: "50%", margin: "1.5rem auto" }} />
      <div className="skeleton skeleton-block" style={{ height: "40px", marginBottom: "1rem" }} />
      <div className="grid-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: "70px" }} />
        ))}
      </div>
    </div>
  );
}
