import type { Metadata } from "next";
import { getAirQuality } from "@/services/aqiService";
import { generateDailyPlan } from "@/services/plannerService";
import PlannerPanel from "@/components/PlannerPanel";
import { Calendar, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Daily Planner — Morning to Night AQI Actions",
  description: "Personalised morning, afternoon, evening and night air quality actions based on your city's AQI. Science-backed, effort-rated, with sources.",
};

export const revalidate = 300;

export default async function PlannerPage({ searchParams }: { searchParams: Promise<{ city?: string }> }) {
  const { city = "Delhi" } = await searchParams;
  const aqiResult = await getAirQuality(city);
  const aqiData = aqiResult.ok ? aqiResult.value : null;
  const plan = generateDailyPlan(aqiData?.aqi ?? 178, city);

  return (
    <div className="container page-pad">
      <div className="flex items-center gap-2 mb-1">
        <Calendar size={24} style={{ color: "var(--coral)" }} />
        <h1>Daily Planner</h1>
      </div>
      <p className="text-muted mb-4" style={{ maxWidth: 600 }}>
        Time-of-day actions tailored to today&apos;s AQI in {city}. Each action includes reason, expected benefit, effort level, estimated cost, and evidence source.
      </p>

      {aqiData?.isDemo && (
        <div className="msg warn mb-3">
          <span className="badge badge-demo" style={{ flexShrink: 0 }}>DEMO DATA</span>
          <span className="text-sm">Plans are based on demo AQI ({aqiData.aqi} — {aqiData.label}). Enable live data for real readings.</span>
        </div>
      )}

      <PlannerPanel plan={plan} />

      <div className="msg info mt-4">
        <Info size={14} style={{ flexShrink: 0 }} />
        <span className="text-xs">
          Actions are based on CPCB health advisories, WHO AQG 2021, CAQM guidelines, and IMD meteorological patterns.
          Confidence levels reflect strength of evidence. This is not medical advice — consult a doctor for health concerns.
        </span>
      </div>
    </div>
  );
}

