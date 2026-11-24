"use client";
import { useState } from "react";
import { Car, Info, AlertTriangle, ArrowRight } from "lucide-react";
import { getCommuteAdvice, labelForMode, type TransportMode } from "@/services/commuteService";
import { commuteComparison } from "@/utils/emissions";

const MODES: TransportMode[] = ["petrolCar","dieselCar","cng","electric","bus","metro","autoRickshaw","bicycle","walking"];

export default function CommutePage() {
  const [aqi] = useState(178);
  const [baseline, setBaseline] = useState<TransportMode>("petrolCar");
  const [alternative, setAlternative] = useState<TransportMode>("metro");
  const [distance, setDistance] = useState(10);
  const [calculated, setCalculated] = useState(false);

  const advice = getCommuteAdvice(aqi, baseline, alternative, calculated ? distance : undefined);
  const comparison = calculated ? commuteComparison(baseline, alternative, distance) : null;

  return (
    <div className="container page-pad">
      <div className="flex items-center gap-2 mb-1">
        <Car size={24} style={{ color: "var(--coral)" }} />
        <h1>Smart Commute</h1>
      </div>
      <p className="text-muted mb-4" style={{ maxWidth: 640 }}>
        Lower-emission transport alternatives, optimal departure timing, and CO₂e savings — all with documented emission factors and visible assumptions.
      </p>

      {/* Demo AQI badge */}
      <div className="msg warn mb-4" style={{ display: "inline-flex" }}>
        <span className="badge badge-demo" style={{ flexShrink: 0 }}>DEMO DATA</span>
        <span className="text-sm">Using demo AQI {aqi} (Moderate) for Delhi. Enable live data for real readings.</span>
      </div>

      {/* Severe AQI warning */}
      {aqi > 400 && (
        <div className="msg err mb-4" role="alert">
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <strong>SEVERE AQI — No outdoor travel or strenuous activity recommended.</strong>
        </div>
      )}

      {/* Warnings */}
      <div style={{ display: "flex", flexDirection: "column", gap: ".5rem", marginBottom: "1.5rem" }}>
        {advice.warnings.map((w, i) => (
          <div key={i} className={`msg ${w.startsWith("🚨") ? "err" : w.startsWith("🔴") ? "warn" : "info"}`}>
            <span className="text-sm">{w}</span>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-4">
        {/* CO₂e calculator */}
        <div className="card">
          <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>CO₂e Savings Calculator</h2>
          <div className="field">
            <label htmlFor="baseline">Your current transport</label>
            <select id="baseline" value={baseline} onChange={e => setBaseline(e.target.value as TransportMode)}>
              {MODES.map(m => <option key={m} value={m}>{labelForMode(m)}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="alt">Alternative to try</label>
            <select id="alt" value={alternative} onChange={e => setAlternative(e.target.value as TransportMode)}>
              {MODES.map(m => <option key={m} value={m}>{labelForMode(m)}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="dist">One-way distance (km)</label>
            <input id="dist" type="number" min={0.5} max={500} step={0.5} value={distance}
              onChange={e => setDistance(Number(e.target.value))} />
          </div>
          <button className="btn" onClick={() => setCalculated(true)}>
            Calculate CO₂e Savings <ArrowRight size={14} />
          </button>

          {comparison && (
            <div className="mt-3">
              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: ".75rem" }}>
                <div className="card-flat rounded p-2 text-center">
                  <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--err)" }}>{comparison.baselineKgCo2e} kg</div>
                  <div className="text-xs text-muted">{labelForMode(baseline)}</div>
                </div>
                <div className="card-flat rounded p-2 text-center">
                  <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--ok)" }}>{comparison.alternativeKgCo2e} kg</div>
                  <div className="text-xs text-muted">{labelForMode(alternative)}</div>
                </div>
              </div>
              <div className="msg ok mt-2">
                <span className="text-sm">
                  <strong>You save {comparison.savedKgCo2e} kg CO₂e per trip ({comparison.savedPercentage}% less)</strong>
                  — {(comparison.savedKgCo2e * 2 * 240).toFixed(1)} kg CO₂e/year at 240 working days.
                </span>
              </div>
              <details className="assumptions">
                <summary>Emission factor assumptions</summary>
                <ul>{comparison.assumptions.map((a, i) => <li key={i}>{a}</li>)}</ul>
              </details>
            </div>
          )}
        </div>

        {/* Departure timing */}
        <div className="card">
          <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>⏰ Optimal Departure Timing</h2>
          {advice.departureTiming.map((t, i) => (
            <div key={i} className="text-sm mb-2 flex items-start gap-2">
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--coral)", flexShrink: 0, marginTop: 5 }} />
              <span>{t}</span>
            </div>
          ))}
          <p className="text-xs text-muted mt-2">Source: IMD boundary layer meteorology; CPCB station hourly patterns</p>
        </div>
      </div>

      {/* Transport options table */}
      <section className="card mb-3" aria-labelledby="options-heading">
        <h2 id="options-heading" style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Transport Options</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".87rem" }} role="table" aria-label="Transport options comparison">
            <thead>
              <tr style={{ background: "rgba(11, 19, 36, 0.9)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: ".6rem .75rem", textAlign: "left", color: "var(--cream)" }}>Mode</th>
                <th style={{ padding: ".6rem .75rem", textAlign: "left", color: "var(--cream)" }}>CO₂e/km</th>
                <th style={{ padding: ".6rem .75rem", textAlign: "left", color: "var(--cream)" }}>Severe AQI</th>
                <th style={{ padding: ".6rem .75rem", textAlign: "left", color: "var(--cream)" }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {advice.options.map((opt, i) => (
                <tr key={opt.mode} style={{ background: i % 2 === 0 ? "rgba(20, 33, 61, 0.4)" : "rgba(14, 24, 46, 0.6)", borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: ".6rem .75rem", fontWeight: 600 }}>
                    {opt.label}
                    {opt.recommended && <span className="badge badge-live" style={{ marginLeft: ".4rem", fontSize: ".65rem" }}>Recommended</span>}
                  </td>
                  <td style={{ padding: ".6rem .75rem" }}>{opt.co2ePerKm} kg</td>
                  <td style={{ padding: ".6rem .75rem" }}>
                    <span style={{ color: opt.safeAtSevereAqi ? "var(--ok)" : "var(--err)", fontWeight: 600 }}>
                      {opt.safeAtSevereAqi ? "✓ OK" : "✗ Avoid"}
                    </span>
                  </td>
                  <td style={{ padding: ".6rem .75rem", color: "var(--muted)", fontSize: ".82rem" }}>{opt.limitations.join("; ") || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted mt-2">Emission factors: IPCC AR6 transport annex; Indian grid average MoEFCC 2023. CO₂e = well-to-wheel.</p>
      </section>

      <div className="msg info">
        <Info size={14} style={{ flexShrink: 0 }} />
        <span className="text-xs">
          CO₂e calculations show emissions impact, NOT PM2.5 exposure reduction — these are separate metrics.
          Switching to EV reduces carbon but PM2.5 from brake/tyre wear remains. No &apos;pollution-safe routes&apos; exist — the city shares the same airshed.
        </span>
      </div>
    </div>
  );
}
