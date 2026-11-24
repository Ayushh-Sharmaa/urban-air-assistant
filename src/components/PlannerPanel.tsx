"use client";
import { useState } from "react";
import type { DailyPlan, PlannerAction } from "@/services/plannerService";
import { CheckCircle2, Circle, Info, ChevronDown, ChevronUp, ShieldCheck, Sparkles } from "lucide-react";

interface Props {
  plan: DailyPlan;
}

const PERIODS: Array<{ key: keyof DailyPlan; label: string; emoji: string }> = [
  { key: "morning", label: "Morning", emoji: "🌅" },
  { key: "afternoon", label: "Afternoon", emoji: "☀️" },
  { key: "evening", label: "Evening", emoji: "🌆" },
  { key: "night", label: "Night", emoji: "🌙" },
];

export default function PlannerPanel({ plan }: Props) {
  const [active, setActive] = useState<string>(plan.currentPeriod);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [recentCompleted, setRecentCompleted] = useState<string | null>(null);

  const actions = (plan[active as keyof DailyPlan] as PlannerAction[]) || [];

  const handleToggle = (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setChecked((c) => ({ ...c, [id]: nextStatus }));
    if (nextStatus) {
      setRecentCompleted(id);
      setTimeout(() => setRecentCompleted(null), 2500);
    }
  };

  const totalDone = Object.values(checked).filter(Boolean).length;
  const totalActions = ["morning", "afternoon", "evening", "night"]
    .flatMap((p) => (plan[p as keyof DailyPlan] as PlannerAction[]) || [])
    .reduce((a, b) => a + (b ? 1 : 0), 0);
  const completionPercentage = totalActions > 0 ? Math.round((totalDone / totalActions) * 100) : 0;

  return (
    <div>
      {/* Briefing */}
      <div className="msg info mb-3">
        <Info size={16} style={{ flexShrink: 0 }} />
        <span dangerouslySetInnerHTML={{ __html: plan.briefing.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
      </div>

      {/* Daily Progress Visualizer */}
      <div className="card-flat rounded p-2 mb-3" style={{ background: "#fff" }}>
        <div className="flex justify-between items-center mb-1.5">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-coral" />
            <strong className="text-xs uppercase tracking-wider text-muted">Daily Smog Defense Execution</strong>
          </div>
          <span className="text-xs font-bold" style={{ color: "var(--navy)" }}>
            {totalDone} of {totalActions} completed ({completionPercentage}%)
          </span>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: "var(--border)", overflow: "hidden" }}>
          <div
            style={{
              width: `${completionPercentage}%`,
              height: "100%",
              background: "var(--ok)",
              transition: "width .4s ease",
            }}
          />
        </div>
      </div>

      {/* Period Tabs */}
      <div className="tabs" role="tablist" aria-label="Time of day">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            role="tab"
            aria-selected={active === p.key}
            className={`tab-btn ${active === p.key ? "active" : ""}`}
            onClick={() => setActive(p.key)}
          >
            <span>{p.emoji}</span>
            <span>{p.label}</span>
            {p.key === plan.currentPeriod && (
              <span className="badge badge-new" style={{ fontSize: ".65rem", padding: ".1rem .4rem" }}>
                Current
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Actions List */}
      <ul className="checklist" role="tabpanel" aria-label={`${active} actions`}>
        {actions.map((action) => {
          const done = !!checked[action.id];
          const open = !!expanded[action.id];
          const isExposure = !action.action.toLowerCase().includes("car") && !action.action.toLowerCase().includes("trip");

          return (
            <li key={action.id}>
              <div
                className={`check-item ${done ? "done" : ""}`}
                onClick={() => handleToggle(action.id, done)}
                style={{
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  borderLeft: done ? "4px solid var(--ok)" : "4px solid var(--border)",
                }}
              >
                <input
                  type="checkbox"
                  id={`check-${action.id}`}
                  checked={done}
                  onChange={() => handleToggle(action.id, done)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={action.action}
                  style={{ width: "1.2rem", height: "1.2rem", accentColor: "var(--ok)", cursor: "pointer" }}
                />

                <div className="check-content" style={{ flex: 1 }}>
                  <div className="flex justify-between items-start" style={{ gap: ".5rem" }}>
                    <div
                      className="check-title"
                      style={{
                        textDecoration: done ? "line-through" : undefined,
                        color: done ? "var(--muted)" : "var(--navy)",
                        fontWeight: 700,
                        fontSize: ".94rem",
                      }}
                    >
                      {action.action}
                    </div>

                    <div className="flex gap-1" style={{ flexShrink: 0 }}>
                      <span
                        className="badge"
                        style={{
                          fontSize: ".65rem",
                          background: isExposure ? "#e8edf5" : "#e3f3ea",
                          color: isExposure ? "var(--navy)" : "var(--ok)",
                        }}
                      >
                        {isExposure ? "Exposure Reduction" : "Emissions Mitigation"}
                      </span>
                      <span className="badge badge-new" style={{ fontSize: ".65rem" }}>
                        {action.confidence}
                      </span>
                    </div>
                  </div>

                  {recentCompleted === action.id && (
                    <div className="text-xs text-ok font-bold mt-1 flex items-center gap-1" style={{ color: "var(--ok)" }}>
                      <CheckCircle2 size={12} /> Action marked completed!
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-1">
                    <button
                      className="text-xs text-coral font-bold flex items-center gap-1"
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "0.2rem 0" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpanded((x) => ({ ...x, [action.id]: !x[action.id] }));
                      }}
                      aria-expanded={open}
                    >
                      <ShieldCheck size={12} />
                      <span>{open ? "Hide Evidence" : "Why this recommendation?"}</span>
                      {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>

                    <div className="text-xs text-muted flex gap-2">
                      <span>Effort: <strong>{action.effort}</strong></span>
                      <span>Cost: <strong>{action.estimatedCost}</strong></span>
                    </div>
                  </div>

                  {open && (
                    <div
                      className="card-flat rounded p-2 mt-2"
                      style={{
                        fontSize: ".82rem",
                        background: "#faf8f5",
                        color: "var(--navy)",
                        borderLeft: "2px solid var(--coral)",
                      }}
                    >
                      <p className="mb-1">
                        <strong>SCIENTIFIC REASON:</strong> {action.reason}
                      </p>
                      <p className="mb-1">
                        <strong>EXPECTED BENEFIT:</strong> {action.expectedBenefit}
                      </p>
                      <p>
                        <strong>EVIDENCE CITATION:</strong> {action.source}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
