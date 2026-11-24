import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Urban Air Quality Assistant handles your data. Minimal data collection, no health data stored without consent.",
};

export default function PrivacyPage() {
  return (
    <div className="container page-pad container-narrow">
      <h1 className="mb-4">Privacy Policy</h1>

      <div className="card mb-3">
        <h2 style={{ fontSize: "1.1rem", marginBottom: ".75rem" }}>Data We Collect</h2>
        <ul style={{ paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: ".5rem", fontSize: ".93rem" }}>
          <li><strong>Location data:</strong> City name only (you choose it). We do not use GPS or precise location.</li>
          <li><strong>Contact form:</strong> Name, email, and message — only when you submit the form.</li>
          <li><strong>Chat messages:</strong> Sent to the AI service (Gemini/OpenAI) for processing. Not stored permanently.</li>
          <li><strong>Health profile:</strong> Optional. Used only for in-session calculations. Not stored without explicit consent.</li>
        </ul>
      </div>

      <div className="card mb-3">
        <h2 style={{ fontSize: "1.1rem", marginBottom: ".75rem" }}>What We Do Not Do</h2>
        <ul style={{ paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: ".5rem", fontSize: ".93rem" }}>
          <li>We do not sell or share your data with advertisers.</li>
          <li>We do not store health data without your explicit consent.</li>
          <li>We do not use tracking cookies for advertising.</li>
          <li>We do not share precise location with third parties.</li>
        </ul>
      </div>

      <div className="card mb-3">
        <h2 style={{ fontSize: "1.1rem", marginBottom: ".75rem" }}>AI Service Providers</h2>
        <p className="text-sm">When you use the AI Assistant, messages are processed by our configured LLM provider (Gemini or OpenAI). These providers have their own privacy policies. We do not permanently store conversation logs.</p>
      </div>

      <p className="text-sm text-muted">Last updated: November 2024. Contact us via the Contact page for privacy questions.</p>
    </div>
  );
}

