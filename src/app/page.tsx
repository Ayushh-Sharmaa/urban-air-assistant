import type { Metadata } from "next";
import { getAirQuality, getTrend } from "@/services/aqiService";
import { getWeather } from "@/services/weatherService";
import { generateDailyPlan } from "@/services/plannerService";
import { demoCities } from "@/services/mockProvider";
import AqiGauge from "@/components/AqiGauge";
import TrendChart from "@/components/TrendChart";
import WeatherWidget from "@/components/WeatherWidget";
import Link from "next/link";
import { Calendar, House, Car, MessageSquare, ArrowRight, AlertTriangle, HeartHandshake, BarChart2 } from "lucide-react";
import { healthAdvisory } from "@/utils/aqi";

export const metadata: Metadata = {
  title: "Dashboard — Today's Air Quality",
  description: "Real-time AQI, pollutant levels, weather conditions, and today's recommended actions for your city. Indian CPCB air quality data.",
};

export const revalidate = 300; // 5 min ISR

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city: cityParam } = await searchParams;
  const city = cityParam ?? "Delhi";

  const [aqiResult, trend, weatherResult] = await Promise.all([
    getAirQuality(city),
    getTrend(city),
    getAirQuality(city).then((r) =>
      r.ok ? getWeather(r.value.lat, r.value.lon) : Promise.resolve(null)
    ),
  ]);

  const aqiData = aqiResult.ok ? aqiResult.value : null;
  const weather = weatherResult?.ok ? weatherResult.value : null;
  const plan = aqiData ? generateDailyPlan(aqiData.aqi, city) : null;
  const advisory = aqiData ? healthAdvisory(aqiData.aqi) : null;
  const cities = demoCities();

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <h1>Today&apos;s Air Quality<br /><span>in {city}</span></h1>
          <p>Real-time AQI, weather conditions, and science-backed protective actions for Indian families.</p>

          {/* City selector */}
          <form method="GET" style={{ display: "inline-flex", gap: ".5rem", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            <label htmlFor="city-select" className="visually-hidden">Select city</label>
            <select
              id="city-select"
              name="city"
              defaultValue={city}
              style={{ padding: ".6rem 1rem", borderRadius: 8, border: "1px solid rgba(255,255,255,.3)", background: "rgba(255,255,255,.1)", color: "#fff", fontSize: "1rem", cursor: "pointer" }}
              onChange={(e) => { if (typeof window !== "undefined") { window.location.href = `/?city=${e.target.value}`; } }}
            >
              {cities.map((c) => <option key={c} value={c} style={{ color: "#000" }}>{c}</option>)}
            </select>
            <button type="submit" className="btn">View AQI</button>
            <Link href="/onboarding" className="btn btn-outline" style={{ borderColor: "rgba(255,255,255,0.7)", color: "#fff" }}>
              <HeartHandshake size={15} /> Personalize Profile
            </Link>
          </form>
        </div>
      </section>

      <div className="container page-pad">
        {/* Error state */}
        {!aqiResult.ok && (
          <div className="msg err mb-3" role="alert">
            <AlertTriangle size={16} />
            <span>Could not load air quality data: {aqiResult.error}</span>
          </div>
        )}

        {/* Main grid */}
        <div className="grid-2" style={{ marginBottom: "1.5rem" }}>
          <AqiGauge data={aqiData} />

          {/* Quick actions */}
          {aqiData && advisory && (
            <div className="card">
              <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Today&apos;s Priority Actions</h2>
              <div
                className="msg"
                style={{ background: `${aqiData.categoryBg}`, border: `1px solid ${aqiData.color}20`, marginBottom: "1rem" }}
              >
                <span style={{ fontSize: ".9rem" }}>{advisory.general}</span>
              </div>
              {plan?.morning.slice(0, 3).map((a) => (
                <div key={a.id} className="flex items-start gap-2 mb-2 text-sm" style={{ paddingBottom: ".5rem", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--coral)", flexShrink: 0, marginTop: 5 }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{a.action}</div>
                    <div className="text-xs text-muted">{a.expectedBenefit}</div>
                  </div>
                </div>
              ))}
              <Link href="/planner" className="btn btn-outline" style={{ marginTop: ".75rem", display: "inline-flex" }}>
                Full Daily Plan <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>

        {/* Weather */}
        {weather && <div style={{ marginBottom: "1.5rem" }}><WeatherWidget data={weather} /></div>}

        {/* Trend chart */}
        {trend.length > 0 && <div style={{ marginBottom: "1.5rem" }}><TrendChart data={trend} /></div>}

        {/* Feature nav cards */}
        <h2 className="mb-3" style={{ marginTop: "1rem" }}>What do you need help with?</h2>
        <div className="grid-3 mb-4">
          {[
            { href: "/planner",    icon: Calendar,       title: "Daily Planner",     desc: "Morning-to-night actions tailored to today's AQI." },
            { href: "/indoor",     icon: House,          title: "Indoor Air Coach",  desc: "CADR calculator, ventilation timing, purifier guide." },
            { href: "/commute",    icon: Car,            title: "Smart Commute",     desc: "Lower-emission alternatives and safest departure times." },
            { href: "/impact",     icon: BarChart2,      title: "Impact Tracker",    desc: "Calculate CO₂e emissions avoided with transparent factors." },
            { href: "/onboarding", icon: HeartHandshake, title: "Household Setup",   desc: "Customize recommendations for family members and room size." },
            { href: "/assistant",  icon: MessageSquare,  title: "AI Assistant",      desc: "Ask anything about air quality, smog, and protection." },
          ].map((f) => (
            <Link key={f.href} href={f.href} style={{ textDecoration: "none" }}>
              <div className="card" style={{ transition: "transform .18s, box-shadow .18s", cursor: "pointer" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(20,33,61,.12)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
              >
                <f.icon size={24} style={{ color: "var(--coral)", marginBottom: ".5rem" }} />
                <h3 style={{ fontSize: "1rem", marginBottom: ".35rem" }}>{f.title}</h3>
                <p className="text-sm text-muted">{f.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Data disclaimer */}
        <div className="msg info">
          <span className="text-xs">
            ℹ️ AQI data is from {aqiData?.source ?? "DEMO"}. Station readings represent a monitoring point, not your specific street.
            {aqiData?.isDemo && " This is DEMO DATA — set NEXT_PUBLIC_DATA_MODE=live and add OPENAQ_API_KEY for live readings."}
          </span>
        </div>
      </div>
    </>
  );
}
