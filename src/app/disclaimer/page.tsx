import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Important disclaimer about Urban Air Quality Assistant data, health advice limitations, and data sources.",
};

export default function DisclaimerPage() {
  return (
    <div className="container page-pad container-narrow">
      <h1 className="mb-4">Disclaimer</h1>

      <div className="card mb-3" style={{ borderLeft: "4px solid var(--coral)" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: ".75rem" }}>Not Medical Advice</h2>
        <p className="text-sm">
          This tool provides general air quality guidance based on official CPCB, WHO, and CAQM standards.
          It does NOT diagnose medical conditions, prescribe treatment, or provide individualised medical advice.
          Always consult a qualified healthcare professional for health concerns. In an emergency, call 112.
        </p>
      </div>

      <div className="card mb-3">
        <h2 style={{ fontSize: "1.1rem", marginBottom: ".75rem" }}>Data Limitations</h2>
        <ul style={{ paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: ".5rem", fontSize: ".93rem" }}>
          <li>AQI readings represent specific monitoring stations, not your exact location or street.</li>
          <li>Demo data is clearly labelled and must not be treated as live readings.</li>
          <li>AI responses are based on training data and cited sources; they may not reflect the most recent developments.</li>
          <li>Emission factor calculations are estimates based on published factors; actual values vary.</li>
          <li>Weather-based smog risk assessments are indicative, not forecasts.</li>
        </ul>
      </div>

      <div className="card mb-3">
        <h2 style={{ fontSize: "1.1rem", marginBottom: ".75rem" }}>Sources</h2>
        <p className="text-sm">
          Recommendations are based on: CPCB National Ambient Air Quality Standards (NAAQS), WHO Global Air Quality Guidelines 2021,
          CAQM Winter Action Plan 2024–25, IMD meteorological data, IITM research, NCDC health burden data, US EPA guidance,
          ASHRAE standards, and BEE India ratings. See the Research Library for full citations.
        </p>
      </div>

      <p className="text-sm text-muted">Last updated: November 2024.</p>
    </div>
  );
}

