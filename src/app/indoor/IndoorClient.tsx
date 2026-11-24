"use client";
import { useState } from "react";
import { House, Info, AlertTriangle } from "lucide-react";
import { getIndoorCoachAdvice } from "@/services/indoorCoachService";
import { validateIndoorProfile, type IndoorProfile } from "@/utils/validators";

const PRIORITY_COLOR: Record<string, string> = {
  Critical: "#d32f2f", High: "#f57c00", Medium: "#e0a800", Low: "var(--ok)",
};

export default function IndoorPage() {
  const [profile, setProfile] = useState<Partial<IndoorProfile>>({
    areaSqm: 20, occupants: 3, cookingFuel: "lpg", hasPurifier: false, ventilationType: "windows", budget: "medium",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [aqi] = useState(178);

  const result = submitted
    ? (() => {
        const v = validateIndoorProfile(profile);
        return v.ok ? getIndoorCoachAdvice(v.value, aqi) : null;
      })()
    : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validateIndoorProfile(profile);
    if (!v.ok) { setError(v.error); return; }
    setError("");
    setSubmitted(true);
  }

  return (
    <div className="container page-pad">
      <div className="flex items-center gap-2 mb-1">
        <House size={24} style={{ color: "var(--coral)" }} />
        <h1>Indoor Air Coach</h1>
      </div>
      <p className="text-muted mb-4" style={{ maxWidth: 600 }}>
        Tell us about your home and we&apos;ll calculate your CADR needs, ventilation windows, and low-cost protective actions — based on ASHRAE, BEE India, and WHO standards.
      </p>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 560 }}>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "1.25rem" }}>Your Home Profile</h2>

          {error && (
            <div className="msg err mb-3" role="alert">
              <AlertTriangle size={14} /><span>{error}</span>
            </div>
          )}

          <div className="field">
            <label htmlFor="area">Room/apartment area (m²)</label>
            <input id="area" type="number" min={5} max={500} value={profile.areaSqm ?? ""}
              onChange={e => setProfile(p => ({ ...p, areaSqm: Number(e.target.value) }))} required />
            <span className="field-hint">Main living area where most time is spent</span>
          </div>
          <div className="field">
            <label htmlFor="occ">Number of occupants</label>
            <input id="occ" type="number" min={1} max={20} value={profile.occupants ?? ""}
              onChange={e => setProfile(p => ({ ...p, occupants: Number(e.target.value) }))} required />
          </div>
          <div className="field">
            <label htmlFor="fuel">Primary cooking fuel</label>
            <select id="fuel" value={profile.cookingFuel}
              onChange={e => setProfile(p => ({ ...p, cookingFuel: e.target.value as IndoorProfile["cookingFuel"] }))}>
              <option value="lpg">LPG</option>
              <option value="png">Piped Natural Gas (PNG)</option>
              <option value="induction">Induction Stove</option>
              <option value="electric">Electric Stove</option>
              <option value="biomass">Wood / Biomass / Charcoal</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="vent">Ventilation type</label>
            <select id="vent" value={profile.ventilationType}
              onChange={e => setProfile(p => ({ ...p, ventilationType: e.target.value as IndoorProfile["ventilationType"] }))}>
              <option value="windows">Windows only</option>
              <option value="mechanical">Mechanical (exhaust fan / AC)</option>
              <option value="both">Both windows and mechanical</option>
              <option value="none">None / always sealed</option>
            </select>
          </div>
          <div className="field">
            <label style={{ display: "flex", gap: ".5rem", alignItems: "center", cursor: "pointer" }}>
              <input type="checkbox" checked={!!profile.hasPurifier}
                onChange={e => setProfile(p => ({ ...p, hasPurifier: e.target.checked }))}
                style={{ width: "1.1rem", height: "1.1rem", accentColor: "var(--ok)" }} />
              I have a HEPA air purifier
            </label>
          </div>
          {profile.hasPurifier && (
            <div className="field">
              <label htmlFor="cadr">Purifier CADR rating (m³/h), if known</label>
              <input id="cadr" type="number" min={0} max={2000} value={profile.purifierCadr ?? ""}
                onChange={e => setProfile(p => ({ ...p, purifierCadr: e.target.value ? Number(e.target.value) : undefined }))}
                placeholder="e.g. 300" />
              <span className="field-hint">Usually on the box or spec sheet</span>
            </div>
          )}
          <div className="field">
            <label htmlFor="budget">Budget for indoor air improvements</label>
            <select id="budget" value={profile.budget}
              onChange={e => setProfile(p => ({ ...p, budget: e.target.value as IndoorProfile["budget"] }))}>
              <option value="low">Low (₹0–2,000)</option>
              <option value="medium">Medium (₹2,000–15,000)</option>
              <option value="high">High (₹15,000+)</option>
            </select>
          </div>
          <button type="submit" className="btn">Get Personalised Recommendations</button>
        </form>
      ) : (
        <div>
          <button className="btn btn-outline btn-sm mb-4" onClick={() => setSubmitted(false)}>← Edit Profile</button>

          {result && (
            <>
              <section className="card mb-3" aria-labelledby="cadr-heading">
                <h2 id="cadr-heading" style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>📊 CADR Calculator</h2>
                <div className="grid-3 mb-2">
                  {[
                    { v: `${result.cadr.roomVolumeCubicM} m³`, l: "Room volume" },
                    { v: String(result.cadr.minCadr), l: "Min CADR (m³/h)" },
                    { v: String(result.cadr.recommendedCadr), l: "Recommended CADR" },
                  ].map(({ v, l }) => (
                    <div key={l} className="card-flat rounded p-2 text-center">
                      <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--navy)" }}>{v}</div>
                      <div className="text-xs text-muted">{l}</div>
                    </div>
                  ))}
                </div>
                <details className="assumptions">
                  <summary>Calculation assumptions</summary>
                  <ul>{result.cadr.assumptions.map((a, i) => <li key={i}>{a}</li>)}</ul>
                </details>
                {result.cadr.warnings.map((w, i) => (
                  <div key={i} className="msg warn mt-2" style={{ padding: ".5rem .75rem" }}>
                    <AlertTriangle size={12} style={{ flexShrink: 0 }} />
                    <span className="text-xs">{w}</span>
                  </div>
                ))}
              </section>

              <section className="card mb-3" aria-labelledby="vent-heading">
                <h2 id="vent-heading" style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>🪟 Ventilation Windows</h2>
                {result.ventilationWindows.map((w, i) => (
                  <div key={i} className={`flex items-start gap-2 mb-2 ${w.recommended ? "msg ok" : "msg warn"}`}
                    style={{ padding: ".6rem .8rem" }}>
                    <span>{w.recommended ? "✅" : "⚠️"}</span>
                    <div>
                      <strong className="text-sm">{w.label}</strong>
                      <p className="text-xs">{w.reason}</p>
                    </div>
                  </div>
                ))}
              </section>

              <section className="card mb-3" aria-labelledby="rec-heading">
                <h2 id="rec-heading" style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>💡 Recommendations</h2>
                {result.recommendations.map((r) => (
                  <div key={r.id} className="card-flat rounded p-2 mb-2"
                    style={{ borderLeft: `4px solid ${PRIORITY_COLOR[r.priority] ?? "var(--muted)"}` }}>
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <strong className="text-sm" style={{ flex: 1 }}>{r.title}</strong>
                      <div className="flex gap-1" style={{ flexShrink: 0 }}>
                        <span className="badge" style={{ background: PRIORITY_COLOR[r.priority], color: "#fff", fontSize: ".65rem" }}>{r.priority}</span>
                        <span className="text-xs text-muted">{r.estimatedCost}</span>
                      </div>
                    </div>
                    <p className="text-sm">{r.description}</p>
                    {r.warning && (
                      <div className="msg warn mt-1" style={{ padding: ".4rem .65rem" }}>
                        <AlertTriangle size={11} style={{ flexShrink: 0 }} />
                        <span className="text-xs">{r.warning}</span>
                      </div>
                    )}
                    <p className="text-xs text-muted mt-1">Source: {r.source}</p>
                  </div>
                ))}
              </section>

              <section className="card mb-3">
                <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>🔧 Filter Care Guide</h2>
                {result.filterCare.map((f, i) => (
                  <div key={i} className="mb-3">
                    <h3 style={{ fontSize: ".95rem" }}>{f.filterType}</h3>
                    <p className="text-sm text-muted mb-1">
                      Replace every {f.replaceEveryMonths < 100 ? `${f.replaceEveryMonths} months` : "when needed (washable)"}
                      {" · "}Check every {f.checkEveryWeeks} weeks
                    </p>
                    <ul style={{ paddingLeft: "1.2rem", fontSize: ".85rem", display: "flex", flexDirection: "column", gap: ".2rem" }}>
                      {f.tips.map((t, j) => <li key={j}>{t}</li>)}
                    </ul>
                  </div>
                ))}
              </section>
            </>
          )}

          <div className="msg info">
            <Info size={14} style={{ flexShrink: 0 }} />
            <span className="text-xs">
              Recommendations based on ASHRAE 52.2, BEE India air purifier standards, US EPA Air Cleaners guide (2018), and WHO indoor air quality guidelines.
              HEPA purifiers effectively reduce PM2.5 but do not remove all pollutants. Not medical advice.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
