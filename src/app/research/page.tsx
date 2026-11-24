import type { Metadata } from "next";
import { RESEARCH_LIBRARY } from "@/utils/constants";
import { BookOpen, ExternalLink, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Research Library — Air Quality Science",
  description: "Curated scientific literature, WHO guidelines, CPCB standards, and official research on Indian air quality, smog health impacts, and protective measures.",
};

export default function ResearchPage() {
  return (
    <div className="container page-pad">
      <div className="flex items-center gap-2 mb-1">
        <BookOpen size={24} style={{ color: "var(--coral)" }} />
        <h1>Research Library</h1>
      </div>
      <p className="text-muted mb-4" style={{ maxWidth: 640 }}>
        Curated scientific literature, regulatory standards, and official guidance used to inform this tool&apos;s recommendations. All sources are verified, dated, and attributed.
      </p>

      <div className="msg info mb-4">
        <Info size={14} style={{ flexShrink: 0 }} />
        <span className="text-sm">
          Only peer-reviewed, official, or regulatory sources are included. Evidence type and applicability are explicitly stated for each entry.
          Recommendations are always clearly distinguished from evidence.
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {RESEARCH_LIBRARY.map((r) => (
          <article key={r.id} className="card research-card" aria-labelledby={`title-${r.id}`}>
            <span className="research-evidence">{r.evidenceType}</span>
            <h2 id={`title-${r.id}`} style={{ fontSize: "1.05rem", marginBottom: ".35rem" }}>{r.title}</h2>
            <div className="flex gap-3 text-xs text-muted mb-2" style={{ flexWrap: "wrap" }}>
              <span>🏛️ {r.issuer}</span>
              <span>📅 {new Date(r.date).toLocaleDateString("en-IN", { year: "numeric", month: "long" })}</span>
            </div>
            <p className="text-sm mb-2">{r.summary}</p>
            <p className="text-sm mb-2">
              <strong>Applicability: </strong>
              <span className="text-muted">{r.applicability}</span>
            </p>
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              aria-label={`Read full paper: ${r.title} (opens in new tab)`}
            >
              <ExternalLink size={13} /> Read full document
            </a>
          </article>
        ))}
      </div>

      <div className="msg info mt-4">
        <Info size={14} style={{ flexShrink: 0 }} />
        <span className="text-xs">
          This library covers CPCB NAAQS standards, WHO Global AQG 2021, CAQM winter action plans, IITM/IMD research, and NCDC health burden data.
          Sources are reviewed and updated periodically. If you spot an outdated or incorrect citation, please contact us.
        </span>
      </div>
    </div>
  );
}

