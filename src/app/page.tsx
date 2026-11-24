import type { Metadata } from "next";
import { getAirQuality, getTrend } from "@/services/aqiService";
import { getWeather } from "@/services/weatherService";
import { generateDailyPlan } from "@/services/plannerService";
import { demoCities } from "@/services/mockProvider";
import AqiGauge from "@/components/AqiGauge";
import TrendChart from "@/components/TrendChart";
import WeatherWidget from "@/components/WeatherWidget";
import AirBriefingModal from "@/components/AirBriefingModal";
import CitySelector from "@/components/CitySelector";
import Link from "next/link";
import {
  Calendar,
  House,
  Car,
  MessageSquare,
  ArrowRight,
  AlertTriangle,
  HeartHandshake,
  BarChart2,
  BookOpen,
  Users,
  Compass,
  ShieldCheck,
  Activity,
  Flame,
  ChevronRight,
} from "lucide-react";
import { healthAdvisory } from "@/utils/aqi";

export const metadata: Metadata = {
  title: "URBAN AIR — Environmental Intelligence for Everyday Life",
  description:
    "Real-time CPCB air intelligence, personalized winter smog protection plans, CADR indoor coaching, and sustainable choices for Indian families.",
};

export const revalidate = 300; // 5 min ISR

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; scenario?: string }>;
}) {
  const { city: cityParam, scenario } = await searchParams;
  // If scenario is set, city defaults accordingly
  let city = cityParam ?? "Delhi";
  if (scenario === "moderate") city = cityParam ?? "Bengaluru";

  const [aqiResult, trend, weatherResult] = await Promise.all([
    getAirQuality(scenario || city),
    getTrend(scenario || city),
    getAirQuality(scenario || city).then((r) =>
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
      {/* Immersive Atmospheric Hero */}
      <section className="hero-atmospheric" aria-label="Hero Introduction">
        <div className="hero-glow-orb" aria-hidden />

        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="badge badge-demo">DECISION SUPPORT PLATFORM</span>
            <span className="text-xs text-muted" style={{ color: "rgba(244,237,224,0.7)" }}>
              • CPCB & WHO Standards
            </span>
          </div>

          <h1>
            THE AIR IS CHANGING.
            <span>YOUR DAILY DECISIONS SHOULD TOO.</span>
          </h1>

          <p>
            Real-time air intelligence, personalized protection plans, and sustainable choices
            for a healthier urban life in India.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex gap-2 justify-center items-center mb-4" style={{ flexWrap: "wrap" }}>
            <a href="#intelligence" className="btn btn-lg">
              <Compass size={18} /> Explore Your Air
            </a>
            <AirBriefingModal aqiData={aqiData} weather={weather} city={city} />
          </div>

          {/* City / Location Search Bar */}
          <CitySelector currentCity={city} cities={cities} />
        </div>
      </section>

      {/* Main Environmental Intelligence Section */}
      <section id="intelligence" className="container page-pad">
        {/* Welcome briefing */}
        <div className="flex justify-between items-baseline mb-4 flex-wrap gap-2">
          <div>
            <h2 style={{ fontSize: "1.6rem", margin: 0, color: "var(--navy)" }}>
              Environmental Intelligence Dashboard
            </h2>
            <span className="text-xs text-muted">
              Monitoring Station: {aqiData?.station || city} · Coordinates ({aqiData?.lat ?? 28.64}°N, {aqiData?.lon ?? 77.31}°E)
            </span>
          </div>

          <div className="flex gap-2">
            <Link href="/planner" className="btn btn-ghost btn-sm">
              <Calendar size={14} /> Full Daily Plan
            </Link>
            <Link href="/onboarding" className="btn btn-outline btn-sm">
              <HeartHandshake size={14} /> Customize Household Profile
            </Link>
          </div>
        </div>

        {/* Telemetry Error State */}
        {!aqiResult.ok && (
          <div className="msg err mb-3" role="alert">
            <AlertTriangle size={16} />
            <span>Telemetry error: {aqiResult.error}</span>
          </div>
        )}

        {/* Primary Row: Centerpiece AQI Gauge + Priority Action Center */}
        <div className="grid-2 mb-4" style={{ alignItems: "stretch" }}>
          <AqiGauge data={aqiData} />

          {/* Quick Actions & Decision Card */}
          {aqiData && advisory && (
            <div className="card flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 style={{ fontSize: "1.15rem", margin: 0 }}>
                    Today&apos;s Priority Decision Center
                  </h3>
                  <span className="badge" style={{ background: aqiData.color, color: "#fff" }}>
                    {aqiData.label} AQI
                  </span>
                </div>

                <div
                  className="msg mb-3"
                  style={{
                    background: aqiData.categoryBg,
                    border: `1.5px solid ${aqiData.color}35`,
                  }}
                >
                  <span style={{ fontSize: ".88rem", lineHeight: 1.5 }}>
                    <strong>Health Interpretation:</strong> {advisory.general}
                  </span>
                </div>

                <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-2">
                  Immediate Recommended Actions
                </span>

                <div className="flex flex-col gap-2">
                  {plan?.morning.slice(0, 3).map((a) => (
                    <div
                      key={a.id}
                      className="card-flat rounded p-2 flex items-start gap-2"
                      style={{ borderLeft: `3px solid var(--coral)` }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: ".92rem", color: "var(--navy)" }}>
                          {a.action}
                        </div>
                        <div className="text-xs text-muted mt-0.5">{a.reason}</div>
                      </div>
                      <span className="badge badge-new" style={{ fontSize: ".65rem", flexShrink: 0 }}>
                        {a.confidence} Confidence
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center mt-3 pt-3 border-bottom">
                <span className="text-xs text-muted">
                  Sources: CPCB NAAQS, WHO AQG 2021, CAQM GRAP IV
                </span>
                <Link href="/planner" className="btn btn-outline btn-sm">
                  View 24h Action Plan <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Atmospheric Inversion & Weather Context */}
        {weather && (
          <div className="mb-4">
            <WeatherWidget data={weather} />
          </div>
        )}

        {/* 24-Hour Analytics & Smog Progression Chart */}
        {trend.length > 0 && (
          <div className="mb-4">
            <TrendChart data={trend} />
          </div>
        )}

        {/* Editorial Scroll Storytelling Section */}
        <div className="card mb-4" style={{ background: "#faf7f2", border: "1.5px solid var(--border)" }}>
          <h3 style={{ fontSize: "1.25rem", marginBottom: ".4rem", color: "var(--navy)" }}>
            Why Standard AQI Dashboards Fail Urban Families
          </h3>
          <p className="text-sm text-muted mb-3" style={{ maxWidth: 760 }}>
            Raw AQI numbers tell you how bad the air was two hours ago at a government station miles away.
            They do not tell you when to safely open bedroom windows, how to avoid personal PM2.5 lung exposure,
            or how to size a room purifier without being misled by marketing.
          </p>

          <div className="grid-3 gap-2">
            <div className="card-flat rounded p-2">
              <Activity size={20} className="text-coral mb-1" />
              <strong className="text-sm block" style={{ color: "var(--navy)" }}>
                Atmospheric Dynamics
              </strong>
              <p className="text-xs text-muted mt-1">
                Nocturnal temperature inversions trap morning emissions; pollutants disperse mid-morning (10 AM–12 PM) as convective mixing expands the boundary layer.
              </p>
            </div>

            <div className="card-flat rounded p-2">
              <ShieldCheck size={20} className="text-coral mb-1" />
              <strong className="text-sm block" style={{ color: "var(--navy)" }}>
                Indoor Defense vs. Myths
              </strong>
              <p className="text-xs text-muted mt-1">
                Houseplants and ozone generators fail at room-scale air cleaning. We calculate exact CADR (Clean Air Delivery Rate) according to ASHRAE 52.2 standards.
              </p>
            </div>

            <div className="card-flat rounded p-2">
              <Flame size={20} className="text-coral mb-1" />
              <strong className="text-sm block" style={{ color: "var(--navy)" }}>
                Emissions vs. Inhalation
              </strong>
              <p className="text-xs text-muted mt-1">
                Switching to an EV reduces CO₂e footprint, but brake and tyre friction still emit particulate matter. We separate climate emissions from personal lung dose.
              </p>
            </div>
          </div>
        </div>

        {/* Environmental Intelligence Modules Navigator */}
        <h3 className="mb-3" style={{ fontSize: "1.3rem" }}>
          Decision Support Modules
        </h3>
        <div className="grid-3 mb-4">
          {[
            {
              href: "/planner",
              icon: Calendar,
              title: "Daily Action Planner",
              desc: "Morning-to-night routine with effort ratings, cost brackets, and completion checks.",
            },
            {
              href: "/indoor",
              icon: House,
              title: "Indoor Air Quality Coach",
              desc: "Interactive CADR room blueprint, ventilation windows, and HEPA filter care.",
            },
            {
              href: "/commute",
              icon: Car,
              title: "Smart Commute Assistant",
              desc: "Evaluate travel alternatives, avoid open exposure during Severe AQI, and calculate CO₂e.",
            },
            {
              href: "/impact",
              icon: BarChart2,
              title: "Sustainable Impact Tracker",
              desc: "Track emissions avoided using documented IPCC AR6 & MoEFCC GHG Platform factors.",
            },
            {
              href: "/assistant",
              icon: MessageSquare,
              title: "Explainable AI Assistant",
              desc: "Ask personalized questions grounded in WHO, CPCB, and CAQM research with full citations.",
            },
            {
              href: "/research",
              icon: BookOpen,
              title: "Research & Evidence Library",
              desc: "Curated peer-reviewed studies, NAAQS standards, and health burden data.",
            },
          ].map((f) => (
            <Link key={f.href} href={f.href}>
              <div className="card card-hover" style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <f.icon size={26} style={{ color: "var(--coral)", marginBottom: ".6rem" }} />
                  <h4 style={{ fontSize: "1.05rem", marginBottom: ".35rem", color: "var(--navy)" }}>
                    {f.title}
                  </h4>
                  <p className="text-xs text-muted" style={{ lineHeight: 1.55 }}>
                    {f.desc}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-coral font-bold mt-3">
                  <span>Open Module</span>
                  <ChevronRight size={13} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Data Integrity Transparency Footer */}
        <div className="msg info">
          <span className="text-xs" style={{ lineHeight: 1.5 }}>
            <strong>Data Integrity Guarantee:</strong> Telemetry reflects {aqiData?.source ?? "DEMO DATA"}.
            Station measurements indicate ambient air at monitoring points and should not be construed as street-level microclimate predictions.
            {aqiData?.isDemo && " Currently operating in DEMO MODE. Set NEXT_PUBLIC_DATA_MODE=live and provide OPENAQ_API_KEY for real-time station feeds."}
          </span>
        </div>
      </section>
    </>
  );
}
