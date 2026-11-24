"use client";
import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import type { TrendPoint } from "@/services/aqiService";

interface Props { data: TrendPoint[]; currentHour?: string; }

export default function TrendChart({ data, currentHour }: Props) {
  const [view, setView] = useState<"pm25" | "pm10" | "aqi">("pm25");

  const config = {
    pm25: { label: "PM2.5 (µg/m³)", color: "#FF6B5B", limit: 60 },
    pm10: { label: "PM10 (µg/m³)",  color: "#f57c00", limit: 100 },
    aqi:  { label: "AQI",           color: "#7b1fa2", limit: 200 },
  }[view];

  if (!data.length) {
    return <div className="card text-muted text-center p-2">No trend data available.</div>;
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-2" style={{ flexWrap: "wrap", gap: ".5rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>24-Hour Trend</h3>
        <div className="flex gap-1">
          {(["pm25", "pm10", "aqi"] as const).map((v) => (
            <button
              key={v}
              className={`btn btn-sm ${view === v ? "" : "btn-ghost"}`}
              onClick={() => setView(v)}
              aria-pressed={view === v}
            >
              {v === "pm25" ? "PM2.5" : v === "pm10" ? "PM10" : "AQI"}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2d9cc" />
          <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#6b7280" }} interval={3} />
          <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
          <Tooltip
            contentStyle={{ background: "#fff", border: "1px solid #e2d9cc", borderRadius: 8, fontSize: 12 }}
            formatter={(val) => [Number(val ?? 0), config.label]}
          />
          {currentHour && <ReferenceLine x={currentHour} stroke="var(--navy)" strokeDasharray="4 4" label={{ value: "Now", fill: "var(--navy)", fontSize: 11 }} />}
          <ReferenceLine y={config.limit} stroke="#FF6B5B" strokeDasharray="4 2" label={{ value: "NAAQS limit", fill: "#FF6B5B", fontSize: 10 }} />
          <Area
            type="monotone" dataKey={view}
            stroke={config.color} fill={config.color}
            fillOpacity={0.15} strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-xs text-muted mt-1">
        NAAQS 24-h standard: PM2.5 60 µg/m³, PM10 100 µg/m³ (CPCB 2024).
        {" "}Trend is {data[0]?.hour ? "derived from demo data — representative of winter smog patterns" : "unavailable"}.
      </p>
    </div>
  );
}
