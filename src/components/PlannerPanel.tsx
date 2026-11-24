"use client";
import { useState } from "react";
import type { DailyPlan, PlannerAction } from "@/services/plannerService";
import { CheckCircle, Circle, Info, ChevronDown, ChevronUp } from "lucide-react";

interface Props { plan: DailyPlan; }

const PERIODS: Array<{ key: keyof DailyPlan; label: string; emoji: string }> = [
  { key: "morning",   label: "Morning",   emoji: "🌅" },
  { key: "afternoon", label: "Afternoon", emoji: "☀️" },
  { key: "evening",   label: "Evening",   emoji: "🌆" },
  { key: "night",     label: "Night",     emoji: "🌙" },
];

export default function PlannerPanel({ plan }: Props) {
  const [active, setActive] = useState<string>(plan.currentPeriod);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const actions = plan[active as keyof DailyPlan] as PlannerAction[];

  const totalDone = Object.values(checked).filter(Boolean).length;
  const totalActions = ["morning", "afternoon", "evening", "night"].flatMap(
    (p) => (plan[p as keyof DailyPlan] as PlannerAction[]).length
  ).reduce((a, b) => a + b, 0);

  return (
    <div>
      {/* Briefing */}
      <div className="msg info mb-3">
        <Info size={15} style={{ flexShrink: 0 }} />
        <span dangerouslySetInnerHTML={{ __html: plan.briefing.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-3">
        <div style={{ flex: 1, height: 6, borderRadius: 999, background: "var(--border)", overflow: "hidden" }}>
          <div style={{ width: `${(totalDone / totalActions) * 100}%`, height: "100%", background: "var(--ok)", transition: "width .3s" }} />
        </div>
        <span className="text-sm text-muted">{totalDone}/{totalActions} done</span>
      </div>

      {/* Period tabs */}
      <div className="tabs" role="tablist" aria-label="Time of day">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            role="tab"
            aria-selected={active === p.key}
            className={`tab-btn ${active === p.key ? "active" : ""}`}
            onClick={() => setActive(p.key)}
          >
            {p.emoji} {p.label}
            {p.key === plan.currentPeriod && (
              <span className="badge badge-new" style={{ fontSize: ".65rem", padding: ".1rem .4rem" }}>Now</span>
            )}
          </button>
        ))}
      </div>

      {/* Actions list */}
      <ul className="checklist" role="tabpanel" aria-label={`${active} actions`}>
        {(actions as PlannerAction[]).map((action) => {
          const done = !!checked[action.id];
          const open = !!expanded[action.id];
          return (
            <li key={action.id}>
              <div
                className={`check-item ${done ? "done" : ""}`}
                onClick={() => setChecked((c) => ({ ...c, [action.id]: !c[action.id] }))}
              >
                <input
                  type="checkbox"
                  id={`check-${action.id}`}
                  checked={done}
                  onChange={() => setChecked((c) => ({ ...c, [action.id]: !c[action.id] }))}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={action.action}
                />
                <div className="check-content" style={{ flex: 1 }}>
                  <div className="flex justify-between items-start" style={{ gap: ".5rem" }}>
                    <div className="check-title" style={{ textDecoration: done ? "line-through" : undefined, color: done ? "var(--muted)" : undefined }}>
                      {action.action}
                    </div>
                    <div className="flex gap-1" style={{ flexShrink: 0 }}>
                      <span className={`badge ${action.confidence === "High" ? "badge-live" : action.confidence === "Medium" ? "badge-new" : ""}`} style={{ fontSize: ".65rem" }}>
                        {action.confidence}
                      </span>
                      <span className="text-xs text-muted">{action.effort}</span>
                    </div>
                  </div>
                  <button
                    className="text-xs"
                    style={{ color: "var(--coral)", background: "none", border: "none", cursor: "pointer", padding: "0", marginTop: ".2rem", display: "flex", alignItems: "center", gap: ".2rem" }}
                    onClick={(e) => { e.stopPropagation(); setExpanded((x) => ({ ...x, [action.id]: !x[action.id] })); }}
                    aria-expanded={open}
                  >
                    {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {open ? "Less" : "Details"}
                  </button>
                  {open && (
                    <div className="mt-1" style={{ fontSize: ".82rem", color: "var(--muted)" }}>
                      <p><strong>Why:</strong> {action.reason}</p>
                      <p><strong>Benefit:</strong> {action.expectedBenefit}</p>
                      <p><strong>Cost:</strong> {action.estimatedCost}</p>
                      <p><strong>Source:</strong> {action.source}</p>
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

