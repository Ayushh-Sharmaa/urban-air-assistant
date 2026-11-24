"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, Shield, HeartHandshake, Home, ArrowLeft } from "lucide-react";

interface OnboardingData {
  city: string;
  householdSize: number;
  homeType: "apartment" | "independent_house" | "other";
  workSchedule: "standard" | "flexible" | "remote" | "shift";
  exerciseHabit: "outdoor_morning" | "outdoor_evening" | "gym_indoor" | "none";
  primaryTransport: "metro" | "bus" | "car" | "two_wheeler" | "walk_cycle";
  cookingFuel: "lpg" | "png" | "induction" | "electric" | "biomass";
  hasPurifier: boolean;
  purifierCadr?: number;
  ventilation: "windows" | "mechanical" | "both" | "none";
  budget: "low" | "medium" | "high";
  shareHealthConsent: boolean;
  vulnerableGroups?: string[];
}

export default function OnboardingClient() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    city: "Delhi",
    householdSize: 3,
    homeType: "apartment",
    workSchedule: "standard",
    exerciseHabit: "outdoor_morning",
    primaryTransport: "metro",
    cookingFuel: "lpg",
    hasPurifier: false,
    ventilation: "windows",
    budget: "medium",
    shareHealthConsent: false,
    vulnerableGroups: [],
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleVulnerability = (group: string) => {
    setData((prev) => {
      const current = prev.vulnerableGroups || [];
      const next = current.includes(group)
        ? current.filter((g) => g !== group)
        : [...current, group];
      return { ...prev, vulnerableGroups: next };
    });
  };

  const handleFinish = () => {
    // Persist to local storage for privacy-first, client-side session use
    if (typeof window !== "undefined") {
      localStorage.setItem("urban_air_profile", JSON.stringify(data));
    }
    setSavedSuccess(true);
    setTimeout(() => {
      router.push(`/?city=${encodeURIComponent(data.city)}`);
    }, 1200);
  };

  return (
    <div className="container page-pad container-narrow">
      <div className="flex items-center justify-between mb-4">
        <Link href="/" className="btn btn-ghost btn-sm" aria-label="Skip to Dashboard">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
        <button
          onClick={() => router.push("/")}
          className="text-xs text-muted"
          style={{ background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
        >
          Skip onboarding
        </button>
      </div>

      <div className="card mb-4">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-3 border-bottom pb-2">
          <span className="text-xs font-bold text-muted uppercase tracking-wider">
            Step {step} of 3
          </span>
          <div className="flex gap-1">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                style={{
                  width: 24,
                  height: 6,
                  borderRadius: 99,
                  background: s <= step ? "var(--coral)" : "var(--border)",
                  transition: "background 0.2s",
                }}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div>
            <h1 style={{ fontSize: "1.35rem", marginBottom: ".4rem" }}>
              Location & Household Setup
            </h1>
            <p className="text-sm text-muted mb-3">
              Configure your primary monitoring area and daily living routine.
            </p>

            <div className="field">
              <label htmlFor="city">City in India</label>
              <select
                id="city"
                value={data.city}
                onChange={(e) => setData({ ...data, city: e.target.value })}
              >
                <option value="Delhi">Delhi-NCR (Anand Vihar / Mandir Marg)</option>
                <option value="Mumbai">Mumbai (Bandra / Colaba)</option>
                <option value="Bengaluru">Bengaluru (BTM Layout / Silk Board)</option>
                <option value="Kolkata">Kolkata (Jadavpur / Victoria)</option>
                <option value="Chennai">Chennai (Manali / Alandur)</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="householdSize">Total Household Occupants</label>
              <input
                id="householdSize"
                type="number"
                min={1}
                max={20}
                value={data.householdSize}
                onChange={(e) => setData({ ...data, householdSize: Number(e.target.value) })}
              />
            </div>

            <div className="field">
              <label htmlFor="homeType">Home Housing Type</label>
              <select
                id="homeType"
                value={data.homeType}
                onChange={(e) => setData({ ...data, homeType: e.target.value as OnboardingData["homeType"] })}
              >
                <option value="apartment">Apartment / High-rise</option>
                <option value="independent_house">Independent Builder Floor / House</option>
                <option value="other">Other / Studio</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="workSchedule">Work or Study Routine</label>
              <select
                id="workSchedule"
                value={data.workSchedule}
                onChange={(e) => setData({ ...data, workSchedule: e.target.value as OnboardingData["workSchedule"] })}
              >
                <option value="standard">Standard commute (9 AM - 6 PM)</option>
                <option value="flexible">Flexible hours</option>
                <option value="remote">Work from home / Remote</option>
                <option value="shift">Night / Early morning shift</option>
              </select>
            </div>

            <div className="flex justify-end mt-3">
              <button className="btn" onClick={() => setStep(2)}>
                Next: Indoor Setup <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 style={{ fontSize: "1.35rem", marginBottom: ".4rem" }}>
              Indoor Air & Energy Profile
            </h1>
            <p className="text-sm text-muted mb-3">
              Help us calibrate your CADR calculations and ventilation advice.
            </p>

            <div className="field">
              <label htmlFor="cookingFuel">Primary Cooking Fuel</label>
              <select
                id="cookingFuel"
                value={data.cookingFuel}
                onChange={(e) => setData({ ...data, cookingFuel: e.target.value as OnboardingData["cookingFuel"] })}
              >
                <option value="lpg">LPG (Cylinder)</option>
                <option value="png">PNG (Piped Natural Gas)</option>
                <option value="induction">Induction Cooktop</option>
                <option value="electric">Electric Stove</option>
                <option value="biomass">Biomass / Firewood / Kerosene</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="ventilation">Ventilation Setup</label>
              <select
                id="ventilation"
                value={data.ventilation}
                onChange={(e) => setData({ ...data, ventilation: e.target.value as OnboardingData["ventilation"] })}
              >
                <option value="windows">Natural windows & balcony doors</option>
                <option value="mechanical">Exhaust fans / Kitchen chimney</option>
                <option value="both">Both windows and mechanical exhausts</option>
                <option value="none">Sealed room with split AC only</option>
              </select>
            </div>

            <div className="field">
              <label style={{ display: "flex", gap: ".5rem", alignItems: "center", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={data.hasPurifier}
                  onChange={(e) => setData({ ...data, hasPurifier: e.target.checked })}
                  style={{ width: "1.1rem", height: "1.1rem", accentColor: "var(--ok)" }}
                />
                Our household already owns a HEPA Air Purifier
              </label>
            </div>

            {data.hasPurifier && (
              <div className="field">
                <label htmlFor="purifierCadr">Purifier CADR Rating (m³/h, optional)</label>
                <input
                  id="purifierCadr"
                  type="number"
                  placeholder="e.g. 260"
                  value={data.purifierCadr || ""}
                  onChange={(e) => setData({ ...data, purifierCadr: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            )}

            <div className="field">
              <label htmlFor="budget">Monthly Budget for Clean Air Interventions</label>
              <select
                id="budget"
                value={data.budget}
                onChange={(e) => setData({ ...data, budget: e.target.value as OnboardingData["budget"] })}
              >
                <option value="low">Free & low-cost hacks (₹0 - ₹500)</option>
                <option value="medium">Moderate upgrades (₹500 - ₹3,000)</option>
                <option value="high">Comprehensive equipment (₹3,000+)</option>
              </select>
            </div>

            <div className="flex justify-between mt-3">
              <button className="btn btn-ghost" onClick={() => setStep(1)}>
                <ArrowLeft size={14} /> Back
              </button>
              <button className="btn" onClick={() => setStep(3)}>
                Next: Health & Vulnerability <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 style={{ fontSize: "1.35rem", marginBottom: ".4rem" }}>
              Vulnerability Profile (Optional)
            </h1>
            <p className="text-sm text-muted mb-3">
              Health information is 100% voluntary, stored client-side only, and can be skipped without affecting base functionality.
            </p>

            <div className="msg info mb-3">
              <Shield size={16} style={{ flexShrink: 0 }} />
              <span className="text-xs">
                <strong>Strict Privacy Guarantee:</strong> We never share health or profile data with third parties. No medical diagnoses or guarantees are made.
              </span>
            </div>

            <div className="field">
              <label style={{ display: "flex", gap: ".5rem", alignItems: "center", cursor: "pointer", fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={data.shareHealthConsent}
                  onChange={(e) => setData({ ...data, shareHealthConsent: e.target.checked })}
                  style={{ width: "1.1rem", height: "1.1rem", accentColor: "var(--coral)" }}
                />
                I consent to providing household vulnerability indicators for tailored alert sensitivity
              </label>
            </div>

            {data.shareHealthConsent && (
              <div style={{ padding: "0.75rem", background: "rgba(11,19,36,0.6)", border: "1px solid var(--border)", borderRadius: "8px", marginBottom: "1rem" }}>
                <span className="text-sm font-bold mb-2 block" style={{ color: "var(--cream)" }}>
                  Select applicable groups in your household:
                </span>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {[
                    { id: "elderly", label: "Senior adults (60+ years)" },
                    { id: "children", label: "Infants / Toddlers / School children" },
                    { id: "asthma", label: "Asthma, COPD or chronic respiratory conditions" },
                    { id: "cardio", label: "Cardiovascular conditions" },
                    { id: "pregnant", label: "Expectant mothers" },
                  ].map((item) => (
                    <label key={item.id} style={{ display: "flex", gap: ".5rem", alignItems: "center", fontSize: ".9rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={(data.vulnerableGroups || []).includes(item.id)}
                        onChange={() => toggleVulnerability(item.id)}
                        style={{ width: "1rem", height: "1rem", accentColor: "var(--coral)" }}
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {savedSuccess && (
              <div className="msg ok mb-3">
                <CheckCircle2 size={16} />
                <span>Profile customized successfully! Redirecting to your dashboard...</span>
              </div>
            )}

            <div className="flex justify-between mt-3">
              <button className="btn btn-ghost" onClick={() => setStep(2)}>
                <ArrowLeft size={14} /> Back
              </button>
              <button className="btn" onClick={handleFinish}>
                <HeartHandshake size={16} /> Complete & Save Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

