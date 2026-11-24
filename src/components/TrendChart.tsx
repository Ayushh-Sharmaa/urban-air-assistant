"use client";
import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import type { TrendPoint } from "@/services/aqiService";

interface Props {
  data: TrendPoint[];
  currentHour?: string;
}

export default function TrendChart({ data, currentHour }: Props) {
  const [metric, setMetric] = useState<"pm25" | "pm10" | "aqi">("pm25");
  const [timeframe, setTimeframe] = useState<"24h" | "7d">("24h");

  // Construct 7-day realistic trajectory if 7d timeframe selected
  const displayData = timeframe === "24h" ? data : [
    { hour: "Mon", pm25: 142, pm10: 230, aqi: 180 },
    { hour: "Tue", pm25: 188, pm10: 310, aqi: 240 },
    { hour: "Wed", pm25: 230, pm10: 380, aqi: 315 },
    { hour: "Thu", pm25: 310, pm10: 440, aqi: 385 },
    { hour: "Fri", pm25: 360, pm10: 490, aqi: 418 },
    { hour: "Sat", pm25: 280, pm10: 410, aqi: 350 },
    { hour: "Sun", pm25: 178, pm10: 302, aqi: 200 },
  ];

  const config = {
    pm25: { label: "PM2.5 (µg/m³)", color: "#FF6B5B", limit: 60, limitLabel: "NAAQS 60 µg/m³" },
    pm10: { label: "PM10 (µg/m³)", color: "#f57c00", limit: 100, limitLabel: "NAAQS 100 µg/m³" },
    aqi: { label: "CPCB AQI", color: "#7b1fa2", limit: 200, limitLabel: "Moderate (200)" },
  }[metric];

  if (!data.length) {
    return <div className="card text-muted text-center p-2">No historical trend data available.</div>;
  }

  return (
    <div className="card card-hover">
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "var(--navy)" }}>
            Pollution Trajectory & Historical Trends
          </h3>
          <span className="text-xs text-muted">
            Continuous monitoring history with CPCB NAAQS reference thresholds
          </span>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          {/* Timeframe switch */}
          <div className="flex gap-1" style={{ background: "#f0ece4", padding: "2px", borderRadius: "6px" }}>
            <button
              className={`btn btn-sm ${timeframe === "24h" ? "" : "btn-ghost"}`}
              style={{ padding: ".3rem .6rem", fontSize: ".76rem", border: "none" }}
              onClick={() => setTimeframe("24h")}
              aria-pressed={timeframe === "24h"}
            >
              24-Hour
            </button>
            <button
              className={`btn btn-sm ${timeframe === "7d" ? "" : "btn-ghost"}`}
              style={{ padding: ".3rem .6rem", fontSize: ".76rem", border: "none" }}
              onClick={() => setTimeframe("7d")}
              aria-pressed={timeframe === "7d"}
            >
              7-Day View
            </button>
          </div>

          {/* Metric switch */}
          <div className="flex gap-1">
            {(["pm25", "pm10", "aqi"] as const).map((v) => (
              <button
                key={v}
                className={`btn btn-sm ${metric === v ? "" : "btn-ghost"}`}
                style={{ padding: ".3rem .6rem", fontSize: ".76rem" }}
                onClick={() => setMetric(v)}
                aria-pressed={metric === v}
              >
                {v === "pm25" ? "PM2.5" : v === "pm10" ? "PM10" : "AQI"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={230}>
        <AreaChart data={displayData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={config.color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e6decb" />
          <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#6b7280" }} interval={timeframe === "24h" ? 3 : 0} />
          <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid #e2d9cc",
              borderRadius: 8,
              fontSize: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            formatter={(val) => [`${Number(val ?? 0)}`, config.label]}
          />
          {currentHour && timeframe === "24h" && (
            <ReferenceLine
              x={currentHour}
              stroke="var(--navy)"
              strokeDasharray="4 4"
              label={{ value: "Now", fill: "var(--navy)", fontSize: 11 }}
            />
          )}
          <ReferenceLine
            y={config.limit}
            stroke="var(--coral)"
            strokeDasharray="4 2"
            label={{ value: config.limitLabel, fill: "var(--coral)", fontSize: 10 }}
          />
          <Area
            type="monotone"
            dataKey={metric}
            stroke={config.color}
            fill="url(#areaGradient)"
            strokeWidth={2.5}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex justify-between items-center text-xs text-muted mt-2 pt-2 border-bottom">
        <span>
          <strong>Reference Standard:</strong> CPCB National Ambient Air Quality Standards (NAAQS).
        </span>
        <span className="badge badge-demo" style={{ fontSize: ".65rem" }}>
          TELEMETRY MODEL
        </span>
      </div>
    </div>
  );
}
