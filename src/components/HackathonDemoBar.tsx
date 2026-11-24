"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, AlertOctagon, CheckCircle2, WifiOff, HelpCircle, X, ChevronRight } from "lucide-react";
import { HACKATHON_SCENARIOS, type DemoScenarioId } from "@/services/mockProvider";

export default function HackathonDemoBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentScenario = (searchParams.get("scenario") as DemoScenarioId) || "default";
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);

  const selectScenario = (id: DemoScenarioId) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id === "default") {
      params.delete("scenario");
      params.set("city", "Delhi");
    } else {
      params.set("scenario", id);
      if (id === "severe-smog") params.set("city", "Delhi");
      else if (id === "moderate") params.set("city", "Bengaluru");
      else if (id === "stale-fallback") params.set("city", "Delhi");
    }
    router.push(`/?${params.toString()}`);
  };

  const WALKTHROUGH_STEPS = [
    {
      title: "1. Real-time CPCB Air Intelligence",
      description:
        "Deterministic sub-index calculation based on CPCB 2014 standards (never US AQI). Distinguishes station readings from street-level exposure and includes temperature inversion risk.",
      badge: "Scientific Integrity",
    },
    {
      title: "2. Personalized Daily Planner",
      description:
        "Time-of-day actions (morning, afternoon, evening, night) rated by confidence, effort, and cost. Explicitly labels exposure reduction vs. carbon emission mitigation.",
      badge: "Decision Tool",
    },
    {
      title: "3. Indoor Air Coach & CADR Modeling",
      description:
        "Calculates room volume and required purifier clean air delivery rate (ASHRAE 52.2). Strictly warns against dangerous ozone generators and debunks houseplant myths.",
      badge: "Health Protection",
    },
    {
      title: "4. Smart Commute & Emissions Ledger",
      description:
        "Side-by-side mode comparison using IPCC AR6 & MoEFCC GHG Platform 2022 factors. Prevents strenuous outdoor exercise during Severe AQI (>400).",
      badge: "Climate & Health",
    },
    {
      title: "5. Explainable AI Assistant",
      description:
        "RAG architecture citing WHO AQG 2021, CPCB, CAQM, IMD, and IITM research. Emits uncertainty disclaimers and strictly refuses medical diagnoses.",
      badge: "Responsible AI",
    },
  ];

  return (
    <>
      <aside className="hackathon-bar" aria-label="Competition evaluation controls">
        <div className="container hackathon-bar-inner">
          <div className="hackathon-badge">
            <Sparkles size={14} className="text-coral" />
            <span className="font-bold">HACKATHON DEMO MODE</span>
          </div>

          <div className="hackathon-scenarios" role="group" aria-label="Demo scenarios">
            <span className="scenario-label hide-mobile">Preset Scenarios:</span>
            <button
              onClick={() => selectScenario("severe-smog")}
              className={`scenario-btn ${currentScenario === "severe-smog" ? "active severe" : ""}`}
              title="Delhi peak smog episode — AQI 435 Severe"
            >
              <AlertOctagon size={12} />
              <span>A: Severe Smog</span>
            </button>
            <button
              onClick={() => selectScenario("moderate")}
              className={`scenario-btn ${currentScenario === "moderate" ? "active moderate" : ""}`}
              title="Bengaluru corridor — AQI 82 Satisfactory"
            >
              <CheckCircle2 size={12} />
              <span>B: Moderate AQI</span>
            </button>
            <button
              onClick={() => selectScenario("stale-fallback")}
              className={`scenario-btn ${currentScenario === "stale-fallback" ? "active stale" : ""}`}
              title="Telemetry latency / station sensor offline fallback"
            >
              <WifiOff size={12} />
              <span>C: Stale Telemetry</span>
            </button>
          </div>

          <button
            onClick={() => setShowWalkthrough(true)}
            className="btn btn-outline btn-sm walkthrough-btn"
            aria-haspopup="dialog"
          >
            <HelpCircle size={13} />
            <span>Judge Walkthrough</span>
          </button>
        </div>
      </aside>

      {/* Guided Walkthrough Modal */}
      {showWalkthrough && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="walkthrough-title">
          <div className="modal-card">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={18} style={{ color: "var(--coral)" }} />
                <h3 id="walkthrough-title" style={{ fontSize: "1.15rem", margin: 0 }}>
                  URBAN AIR — Competition Walkthrough
                </h3>
              </div>
              <button
                onClick={() => setShowWalkthrough(false)}
                className="close-btn"
                aria-label="Close walkthrough"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-muted mb-3">
              Explore how URBAN AIR solves winter smog through deterministic CPCB calculations, verified health guidance, and actionable lifestyle intelligence.
            </p>

            <div className="walkthrough-step-card mb-3" style={{ background: "rgba(11, 19, 36, 0.75)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "1.2rem" }}>
              <span className="badge badge-new mb-2">{WALKTHROUGH_STEPS[walkthroughStep].badge}</span>
              <h4 style={{ fontSize: "1rem", marginBottom: ".3rem", color: "var(--cream)" }}>
                {WALKTHROUGH_STEPS[walkthroughStep].title}
              </h4>
              <p className="text-sm" style={{ color: "var(--cream-muted)", lineHeight: 1.55 }}>
                {WALKTHROUGH_STEPS[walkthroughStep].description}
              </p>
            </div>

            {/* Stepper dots */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-1">
                {WALKTHROUGH_STEPS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setWalkthroughStep(idx)}
                    aria-label={`Go to step ${idx + 1}`}
                    style={{
                      width: idx === walkthroughStep ? 24 : 8,
                      height: 8,
                      borderRadius: 4,
                      background: idx === walkthroughStep ? "var(--coral)" : "var(--border)",
                      border: "none",
                      cursor: "pointer",
                      transition: "all .2s ease",
                    }}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                {walkthroughStep < WALKTHROUGH_STEPS.length - 1 ? (
                  <button
                    className="btn btn-sm"
                    onClick={() => setWalkthroughStep((s) => s + 1)}
                  >
                    Next Step <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    className="btn btn-sm"
                    onClick={() => setShowWalkthrough(false)}
                  >
                    Start Exploring
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

