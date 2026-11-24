import type { AqiView } from "@/services/aqiService";
import { formatRelative } from "@/utils/date";
import { AlertTriangle, Info, Wifi, WifiOff } from "lucide-react";

interface Props { data: AqiView | null; loading?: boolean; }

export default function AqiGauge({ data, loading }: Props) {
  if (loading) return <GaugeSkeleton />;
  if (!data) {
    return (
      <div className="card" role="status" aria-label="Air quality unavailable">
        <div className="gauge-wrap" style={{ padding: "1.5rem 0" }}>
          <WifiOff size={40} style={{ color: "var(--muted)" }} />
          <p className="mt-2 text-muted text-center">Air-quality data is currently unavailable.</p>
          <p className="text-sm text-muted text-center mt-1">Check your connection or try again later.</p>
        </div>
      </div>
    );
  }

  const pct = Math.min(100, (data.aqi / 500) * 100);

  return (
    <div className="card" aria-label={`AQI ${data.aqi} — ${data.label}`}>
      {/* Badges */}
      <div className="flex gap-1 mb-2" style={{ flexWrap: "wrap" }}>
        {data.isDemo && <span className="badge badge-demo">DEMO DATA</span>}
        {data.stale && (
          <span className="badge badge-stale" role="alert">
            <AlertTriangle size={10} /> STALE DATA
          </span>
        )}
        {!data.isDemo && !data.stale && <span className="badge badge-live"><Wifi size={10} /> LIVE</span>}
      </div>

      {/* AQI number */}
      <div className="gauge-wrap">
        <div
          className="gauge-number"
          style={{ color: data.color }}
          aria-label={`AQI value: ${data.aqi}`}
        >
          {data.aqi}
        </div>
        <div className="gauge-label" style={{ color: data.color }}>{data.label}</div>
        <p className="text-xs text-muted">Indian CPCB AQI</p>
      </div>

      {/* AQI bar */}
      <div className="aqi-bar" role="presentation" aria-hidden>
        <div className="aqi-bar-thumb" style={{ left: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-muted" style={{ marginBottom: ".75rem" }}>
        <span>0 Good</span><span>Severe 500</span>
      </div>

      {/* Pollutant readings */}
      <div className="grid-3" style={{ marginBottom: ".75rem" }}>
        <PollutantMini label="PM2.5" value={data.pm25} unit="µg/m³" highlight={data.mainPollutant === "pm25"} />
        <PollutantMini label="PM10"  value={data.pm10} unit="µg/m³" highlight={data.mainPollutant === "pm10"} />
        {data.no2 && <PollutantMini label="NO₂"   value={data.no2}  unit="µg/m³" highlight={data.mainPollutant === "no2"} />}
        {data.so2 && <PollutantMini label="SO₂"   value={data.so2}  unit="µg/m³" />}
        {data.o3  && <PollutantMini label="O₃"    value={data.o3}   unit="µg/m³" />}
        {data.co  && <PollutantMini label="CO"    value={data.co}   unit="mg/m³" />}
      </div>

      {/* Meta */}
      <div
        className="text-xs text-muted"
        style={{ borderTop: "1px solid var(--border)", paddingTop: ".6rem", display: "flex", alignItems: "center", gap: ".4rem", flexWrap: "wrap" }}
      >
        <Info size={11} />
        <span>{data.station}</span>
        <span>·</span>
        <span>{formatRelative(data.timestamp)}</span>
        <span>·</span>
        <span>{data.distanceKm} km away</span>
        <span>·</span>
        <span>{data.source}</span>
      </div>
    </div>
  );
}

function PollutantMini({ label, value, unit, highlight }: { label: string; value: number; unit: string; highlight?: boolean }) {
  return (
    <div
      className="card-flat rounded p-2 text-center"
      style={{ background: highlight ? "#fff8f7" : undefined, borderColor: highlight ? "var(--coral)" : undefined }}
    >
      <div className="pollutant-value" style={{ fontSize: "1.25rem", color: highlight ? "var(--coral)" : "var(--navy)" }}>{value}</div>
      <div className="pollutant-name">{label}</div>
      <div className="pollutant-unit">{unit}</div>
    </div>
  );
}

function GaugeSkeleton() {
  return (
    <div className="card">
      <div className="skeleton skeleton-h" style={{ width: "30%" }} />
      <div className="skeleton skeleton-h2" style={{ margin: "1rem auto", display: "block" }} />
      <div className="skeleton skeleton-block" style={{ height: "60px", marginBottom: "1rem" }} />
      <div className="grid-3">
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: "80px" }} />)}
      </div>
    </div>
  );
}
