"use client";
import { useState } from "react";
import { House, Info, AlertTriangle, Wind, Sparkles, CheckCircle, ShieldAlert, Cpu } from "lucide-react";
import { getIndoorCoachAdvice } from "@/services/indoorCoachService";
import { validateIndoorProfile, type IndoorProfile } from "@/utils/validators";

const PRIORITY_COLOR: Record<string, string> = {
  Critical: "#d32f2f",
  High: "#f57c00",
  Medium: "#e0a800",
  Low: "var(--ok)",
};

export default function IndoorClient() {
  const [profile, setProfile] = useState<Partial<IndoorProfile>>({
    areaSqm: 24,
    occupants: 3,
    cookingFuel: "lpg",
    hasPurifier: true,
    purifierCadr: 280,
    ventilationType: "windows",
    budget: "medium",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [aqi] = useState(178);

  const area = profile.areaSqm ?? 24;
  const heightM = 2.75;
  const volumeM3 = Math.round(area * heightM * 10) / 10;
  const minCadr = Math.ceil(volumeM3 * 1);
  const recCadr = Math.ceil(volumeM3 * (aqi > 300 ? 5 : 3));
  const userCadr = profile.hasPurifier ? profile.purifierCadr || 0 : 0;
  const isCadrAdequate = userCadr >= recCadr;

  // Approximate room dimensions for visualizer
  const roomLength = Math.max(3, Math.round(Math.sqrt(area * 1.3) * 10) / 10);
  const roomWidth = Math.max(2.5, Math.round((area / roomLength) * 10) / 10);

  const result = submitted
    ? (() => {
        const v = validateIndoorProfile(profile);
        return v.ok ? getIndoorCoachAdvice(v.value, aqi) : null;
      })()
    : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validateIndoorProfile(profile);
    if (!v.ok) {
      setError(v.error);
      return;
    }
    setError("");
    setSubmitted(true);
  }

  return (
    <div className="container page-pad">
      <div className="flex items-center gap-2 mb-1">
        <House size={26} style={{ color: "var(--coral)" }} />
        <h1>Indoor Air Quality Coach</h1>
      </div>
      <p className="text-muted mb-4" style={{ maxWidth: 660 }}>
        Personalized CADR modeling, interactive room airflow blueprint, ventilation timing, and low-cost mitigation based on ASHRAE 52.2 and BEE India standards.
      </p>

      {!submitted ? (
        <div className="grid-2 gap-3 items-start">
          {/* Input Form */}
          <form onSubmit={handleSubmit} className="card">
            <h2 style={{ fontSize: "1.15rem", marginBottom: "1.25rem" }}>
              1. Room & Appliance Specifications
            </h2>

            {error && (
              <div className="msg err mb-3" role="alert">
                <AlertTriangle size={15} />
                <span>{error}</span>
              </div>
            )}

            <div className="field">
              <label htmlFor="area">Room Floor Area (m²)</label>
              <input
                id="area"
                type="number"
                min={5}
                max={500}
                value={profile.areaSqm ?? ""}
                onChange={(e) => setProfile((p) => ({ ...p, areaSqm: Number(e.target.value) }))}
                required
              />
              <span className="field-hint">e.g. Master bedroom or living room</span>
            </div>

            <div className="field">
              <label htmlFor="occ">Number of Occupants</label>
              <input
                id="occ"
                type="number"
                min={1}
                max={20}
                value={profile.occupants ?? ""}
                onChange={(e) => setProfile((p) => ({ ...p, occupants: Number(e.target.value) }))}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="fuel">Kitchen / Cooking Fuel</label>
              <select
                id="fuel"
                value={profile.cookingFuel}
                onChange={(e) => setProfile((p) => ({ ...p, cookingFuel: e.target.value as IndoorProfile["cookingFuel"] }))}
              >
                <option value="lpg">LPG (Liquefied Petroleum Gas)</option>
                <option value="png">PNG (Piped Natural Gas)</option>
                <option value="induction">Induction Cooktop (Zero local combustion)</option>
                <option value="electric">Electric Stove</option>
                <option value="biomass">Biomass / Firewood / Coal (High Risk)</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="vent">Ventilation Infiltration Setup</label>
              <select
                id="vent"
                value={profile.ventilationType}
                onChange={(e) => setProfile((p) => ({ ...p, ventilationType: e.target.value as IndoorProfile["ventilationType"] }))}
              >
                <option value="windows">Natural windows & balconies</option>
                <option value="mechanical">Exhaust fans / Kitchen chimney</option>
                <option value="both">Both windows and mechanical exhausts</option>
                <option value="none">Sealed room with AC (no fresh air intake)</option>
              </select>
            </div>

            <div className="field">
              <label style={{ display: "flex", gap: ".5rem", alignItems: "center", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={!!profile.hasPurifier}
                  onChange={(e) => setProfile((p) => ({ ...p, hasPurifier: e.target.checked }))}
                  style={{ width: "1.1rem", height: "1.1rem", accentColor: "var(--ok)" }}
                />
                We have a HEPA air purifier in this room
              </label>
            </div>

            {profile.hasPurifier && (
              <div className="field">
                <label htmlFor="cadr">Purifier CADR Rating (m³/h)</label>
                <input
                  id="cadr"
                  type="number"
                  min={0}
                  max={2000}
                  value={profile.purifierCadr ?? ""}
                  onChange={(e) => setProfile((p) => ({ ...p, purifierCadr: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="e.g. 260"
                />
                <span className="field-hint">Clean Air Delivery Rate stated on purifier rating label</span>
              </div>
            )}

            <div className="field">
              <label htmlFor="budget">Monthly Budget for Air Improvements</label>
              <select
                id="budget"
                value={profile.budget}
                onChange={(e) => setProfile((p) => ({ ...p, budget: e.target.value as IndoorProfile["budget"] }))}
              >
                <option value="low">Low (₹0 – ₹1,500 DIY/sealing)</option>
                <option value="medium">Medium (₹1,500 – ₹8,000 mid-range HEPA)</option>
                <option value="high">High (₹8,000+ premium multi-room)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-lg w-full mt-2">
              <Sparkles size={16} /> Generate Comprehensive Plan
            </button>
          </form>

          {/* Interactive Live Room Diagram & CADR Blueprint */}
          <div className="card">
            <h2 style={{ fontSize: "1.15rem", marginBottom: ".5rem" }}>
              2. Interactive Blueprint & Live Sizing
            </h2>
            <p className="text-xs text-muted mb-3">
              Real-time room layout dynamically scaled to your floor area and ventilation parameters.
            </p>

            <div className="room-canvas-wrap">
              <div
                className="room-box"
                style={{
                  width: `${Math.min(280, Math.max(140, area * 6))}px`,
                  height: `${Math.min(220, Math.max(120, area * 4.5))}px`,
                }}
              >
                <span className="text-xs font-bold text-muted uppercase tracking-wider">
                  {roomLength}m × {roomWidth}m ({area} m²)
                </span>
                <span className="text-sm font-bold mt-1" style={{ color: "var(--navy)" }}>
                  {volumeM3} m³ Volume
                </span>
                <span className="text-xs text-muted">Ceiling: {heightM}m</span>

                {profile.cookingFuel === "biomass" && (
                  <div
                    className="badge"
                    style={{
                      background: "#d32f2f",
                      color: "#fff",
                      marginTop: ".5rem",
                      fontSize: ".68rem",
                    }}
                  >
                    <ShieldAlert size={11} /> Biomass Emission Risk
                  </div>
                )}

                {profile.hasPurifier && (
                  <div className="purifier-icon-badge">
                    <Wind size={12} />
                    <span>HEPA ({userCadr} m³/h)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Live CADR Gauge Sizing */}
            <div className="grid-2 gap-2 mt-3">
              <div className="card-flat rounded p-2 text-center">
                <span className="text-xs text-muted uppercase font-bold">Recommended CADR</span>
                <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--coral)" }}>
                  {recCadr} <span className="text-xs">m³/h</span>
                </div>
                <span className="text-xs text-muted">for {aqi > 300 ? "5 ACH (Severe Smog)" : "3 ACH"}</span>
              </div>

              <div className="card-flat rounded p-2 text-center">
                <span className="text-xs text-muted uppercase font-bold">Purifier Sizing Status</span>
                <div
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 800,
                    color: profile.hasPurifier ? (isCadrAdequate ? "var(--ok)" : "var(--warn)") : "var(--muted)",
                    marginTop: ".25rem",
                  }}
                >
                  {profile.hasPurifier
                    ? isCadrAdequate
                      ? "✓ Adequately Sized"
                      : "⚠ Undersized for Peak Smog"
                    : "No Purifier Specified"}
                </div>
                <span className="text-xs text-muted">
                  {profile.hasPurifier ? `${userCadr} m³/h vs ${recCadr} m³/h target` : "Select HEPA purifier option"}
                </span>
              </div>
            </div>

            <details className="assumptions mt-3">
              <summary>ASHRAE 52.2 & BEE Calculation Assumptions</summary>
              <ul>
                <li>Room Volume = Area ({area} m²) × Standard Ceiling ({heightM} m) = {volumeM3} m³.</li>
                <li>Target ACH: 5 Air Changes/Hour during winter smog episodes; 3 ACH baseline.</li>
                <li>CADR is tested under standard lab chambers; real-world sealing loss typically ranges 15–30%.</li>
              </ul>
            </details>
          </div>
        </div>
      ) : (
        /* Full Submitted Results Page */
        <div>
          <button className="btn btn-outline btn-sm mb-4" onClick={() => setSubmitted(false)}>
            ← Adjust Home Specifications
          </button>

          {result && (
            <>
              {/* CADR Calculator Results */}
              <section className="card mb-3" aria-labelledby="cadr-heading">
                <h2 id="cadr-heading" style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>
                  📊 Clean Air Delivery Rate (CADR) Audit
                </h2>
                <div className="grid-3 mb-2">
                  <div className="card-flat rounded p-2 text-center">
                    <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--navy)" }}>
                      {result.cadr.roomVolumeCubicM} m³
                    </div>
                    <div className="text-xs text-muted">Room Volume</div>
                  </div>
                  <div className="card-flat rounded p-2 text-center">
                    <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--ok)" }}>
                      {result.cadr.minCadr} m³/h
                    </div>
                    <div className="text-xs text-muted">Minimum Threshold (1 ACH)</div>
                  </div>
                  <div className="card-flat rounded p-2 text-center">
                    <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--coral)" }}>
                      {result.cadr.recommendedCadr} m³/h
                    </div>
                    <div className="text-xs text-muted">Target CADR ({result.cadr.achievedAch} ACH)</div>
                  </div>
                </div>

                <details className="assumptions">
                  <summary>Calculation methodology</summary>
                  <ul>
                    {result.cadr.assumptions.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </details>

                {result.cadr.warnings.map((w, i) => (
                  <div key={i} className="msg warn mt-2">
                    <AlertTriangle size={13} style={{ flexShrink: 0 }} />
                    <span className="text-xs">{w}</span>
                  </div>
                ))}
              </section>

              {/* Ventilation Windows */}
              <section className="card mb-3" aria-labelledby="vent-heading">
                <h2 id="vent-heading" style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>
                  🪟 Meteorological Ventilation Windows
                </h2>
                {result.ventilationWindows.map((w, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 mb-2 ${w.recommended ? "msg ok" : "msg warn"}`}
                    style={{ padding: ".6rem .85rem" }}
                  >
                    <span>{w.recommended ? "✅" : "⚠️"}</span>
                    <div>
                      <strong className="text-sm">{w.label}</strong>
                      <p className="text-xs">{w.reason}</p>
                    </div>
                  </div>
                ))}
              </section>

              {/* Tactical Recommendations */}
              <section className="card mb-3" aria-labelledby="rec-heading">
                <h2 id="rec-heading" style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>
                  💡 Tactical Indoor Interventions
                </h2>
                {result.recommendations.map((r) => (
                  <div
                    key={r.id}
                    className="card-flat rounded p-2 mb-2"
                    style={{ borderLeft: `4px solid ${PRIORITY_COLOR[r.priority] ?? "var(--muted)"}` }}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <strong className="text-sm" style={{ flex: 1 }}>
                        {r.title}
                      </strong>
                      <div className="flex gap-1" style={{ flexShrink: 0 }}>
                        <span
                          className="badge"
                          style={{ background: PRIORITY_COLOR[r.priority], color: "#fff", fontSize: ".65rem" }}
                        >
                          {r.priority}
                        </span>
                        <span className="text-xs text-muted">{r.estimatedCost}</span>
                      </div>
                    </div>
                    <p className="text-sm">{r.description}</p>
                    {r.warning && (
                      <div className="msg warn mt-1">
                        <AlertTriangle size={11} style={{ flexShrink: 0 }} />
                        <span className="text-xs">{r.warning}</span>
                      </div>
                    )}
                    <p className="text-xs text-muted mt-1">Source: {r.source}</p>
                  </div>
                ))}
              </section>

              {/* Filter Care */}
              <section className="card mb-3">
                <h2 style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>
                  🔧 Filter Maintenance & Maintenance Protocols
                </h2>
                {result.filterCare.map((f, i) => (
                  <div key={i} className="mb-3">
                    <h3 style={{ fontSize: ".95rem" }}>{f.filterType}</h3>
                    <p className="text-sm text-muted mb-1">
                      Replace every {f.replaceEveryMonths < 100 ? `${f.replaceEveryMonths} months` : "washable when saturated"} · Check every {f.checkEveryWeeks} weeks
                    </p>
                    <ul style={{ paddingLeft: "1.2rem", fontSize: ".85rem", display: "flex", flexDirection: "column", gap: ".2rem" }}>
                      {f.tips.map((t, j) => (
                        <li key={j}>{t}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            </>
          )}

          <div className="msg info">
            <Info size={14} style={{ flexShrink: 0 }} />
            <span className="text-xs">
              Recommendations based on ASHRAE 52.2, BEE India Star ratings for room air cleaners, US EPA (2018), and WHO household air guidelines.
              HEPA purifiers remove particulate matter (PM2.5/PM10) but do not filter gases like carbon monoxide. Not medical advice.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
