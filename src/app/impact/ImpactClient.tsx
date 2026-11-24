"use client";
import { useState } from "react";
import { BarChart2, Info, TrendingDown } from "lucide-react";
import { commuteComparison, cookingComparison, labelForMode, labelForFuel, type TransportMode, type CookingFuel } from "@/utils/emissions";

export default function ImpactPage() {
  const [commuteMode, setCommuteMode] = useState<TransportMode>("metro");
  const [distance, setDistance] = useState(15);
  const [days, setDays] = useState(240);
  const [cooking, setCooking] = useState<CookingFuel>("lpg");
  const [meals, setMeals] = useState(3);

  const commuteResult = commuteComparison("petrolCar", commuteMode, distance);
  const cookingResult = cookingComparison("biomass", cooking, meals);
  const totalYearlySaved = commuteResult.savedKgCo2e * 2 * days + cookingResult.savedKgCo2ePerYear;

  return (
    <div className="container page-pad">
      <div className="flex items-center gap-2 mb-1">
        <BarChart2 size={24} style={{ color: "var(--coral)" }} />
        <h1>Impact Tracker</h1>
      </div>
      <p className="text-muted mb-4" style={{ maxWidth: 640 }}>
        Track your CO₂e avoided with documented emission factors and visible assumptions.
        <strong> CO₂e ≠ PM2.5 reduction</strong> — these are tracked separately and never conflated.
      </p>

      <div className="msg warn mb-4">
        <Info size={14} style={{ flexShrink: 0 }} />
        <span className="text-sm">
          <strong>Important:</strong> These figures show <em>carbon emissions avoided</em>, not PM2.5 exposure reduction.
          Switching transport mode may reduce CO₂e but PM2.5 from brake/tyre wear persists.
          Emissions and exposure are fundamentally different and tracked separately here.
        </span>
      </div>

      <div className="grid-2 mb-4">
        {/* Commute impact */}
        <div className="card">
          <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>🚌 Commute Impact</h2>
          <p className="text-sm text-muted mb-3">Comparing vs petrol car baseline</p>

          <div className="field">
            <label htmlFor="alt-mode">Your transport mode</label>
            <select id="alt-mode" value={commuteMode} onChange={e => setCommuteMode(e.target.value as TransportMode)}>
              {(["metro","bus","cng","electric","autoRickshaw","bicycle","walking","petrolCar","dieselCar"] as TransportMode[])
                .map(m => <option key={m} value={m}>{labelForMode(m)}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="imp-dist">One-way distance (km)</label>
            <input id="imp-dist" type="number" min={1} max={200} value={distance}
              onChange={e => setDistance(Number(e.target.value))} />
          </div>
          <div className="field">
            <label htmlFor="imp-days">Working days per year</label>
            <input id="imp-days" type="number" min={1} max={365} value={days}
              onChange={e => setDays(Number(e.target.value))} />
          </div>

          <div className="card-flat rounded p-2 mt-2">
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: commuteResult.savedKgCo2e > 0 ? "var(--ok)" : "var(--err)" }}>
              {(commuteResult.savedKgCo2e * 2 * days).toFixed(1)} kg CO₂e/year
            </div>
            <div className="text-sm text-muted">saved vs petrol car ({commuteResult.savedPercentage}% reduction per trip)</div>
          </div>

          <details className="assumptions mt-2">
            <summary>Emission factor assumptions</summary>
            <ul>{commuteResult.assumptions.map((a, i) => <li key={i}>{a}</li>)}</ul>
          </details>
        </div>

        {/* Cooking impact */}
        <div className="card">
          <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>🍳 Cooking Fuel Impact</h2>
          <p className="text-sm text-muted mb-3">Comparing vs biomass/wood baseline</p>

          <div className="field">
            <label htmlFor="cook-fuel">Your current fuel</label>
            <select id="cook-fuel" value={cooking} onChange={e => setCooking(e.target.value as CookingFuel)}>
              {(["lpg","png","induction","electric","biomass"] as CookingFuel[])
                .map(f => <option key={f} value={f}>{labelForFuel(f)}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="cook-meals">Meals cooked per day</label>
            <input id="cook-meals" type="number" min={1} max={10} value={meals}
              onChange={e => setMeals(Number(e.target.value))} />
          </div>

          <div className="card-flat rounded p-2 mt-2">
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: cookingResult.savedKgCo2ePerYear > 0 ? "var(--ok)" : "var(--muted)" }}>
              {cookingResult.savedKgCo2ePerYear} kg CO₂e/year
            </div>
            <div className="text-sm text-muted">saved vs biomass ({cookingResult.savedKgCo2ePerDay} kg/day)</div>
          </div>

          <div className="msg info mt-2" style={{ padding: ".5rem .75rem" }}>
            <span className="text-xs">
              Switching from biomass to LPG also significantly reduces indoor PM2.5 — a separate health benefit not shown in CO₂e figures.
            </span>
          </div>

          <details className="assumptions mt-2">
            <summary>Emission factor assumptions</summary>
            <ul>{cookingResult.assumptions.map((a, i) => <li key={i}>{a}</li>)}</ul>
          </details>
        </div>
      </div>

      {/* Total */}
      <div className="card" style={{ background: "var(--navy)", color: "var(--cream)", textAlign: "center", padding: "2rem" }}>
        <TrendingDown size={32} style={{ color: "var(--coral)", margin: "0 auto .5rem" }} />
        <div style={{ fontSize: "2.5rem", fontWeight: 900, color: totalYearlySaved > 0 ? "#6ee7b7" : "var(--coral)" }}>
          {totalYearlySaved.toFixed(1)} kg CO₂e
        </div>
        <div style={{ color: "rgba(244,237,224,.8)", fontSize: "1.1rem", marginTop: ".25rem" }}>estimated saved per year</div>
        <p style={{ color: "rgba(244,237,224,.55)", fontSize: ".82rem", marginTop: "1rem", maxWidth: 480, margin: "1rem auto 0" }}>
          Equivalent to planting ~{Math.round(totalYearlySaved / 20)} trees (1 tree ≈ 20 kg CO₂/year absorption, rough estimate).
          Figures represent CO₂e only. Actual PM2.5 exposure impact depends on many additional factors.
        </p>
      </div>

      <div className="msg info mt-4">
        <Info size={14} style={{ flexShrink: 0 }} />
        <span className="text-xs">
          All emission factors from IPCC AR6, MoEFCC GHG Platform India 2022, and peer-reviewed literature.
          Figures are estimates — actual values depend on vehicle efficiency, load, and grid mix.
          CO₂e figures do NOT represent PM2.5 exposure reduction — no fabricated PM2.5 reduction claims are made.
        </span>
      </div>
    </div>
  );
}
