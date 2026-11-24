import type { Metadata } from "next";
import { COMMUNITY_LINKS } from "@/utils/constants";
import { Users, ExternalLink, Shield, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Community Resources — Official Air Quality Links",
  description: "Verified official resources for air quality monitoring, advisories, and community action in India — CPCB, CAQM, IMD, WHO, and more.",
};

export default function CommunityPage() {
  const categories = [...new Set(COMMUNITY_LINKS.map((l) => l.category))];

  return (
    <div className="container page-pad">
      <div className="flex items-center gap-2 mb-1">
        <Users size={24} style={{ color: "var(--coral)" }} />
        <h1>Community Resources</h1>
      </div>
      <p className="text-muted mb-4" style={{ maxWidth: 600 }}>
        Verified official links for air quality data, guidelines, and community action. Only government and internationally recognised sources are listed.
      </p>

      <div className="msg info mb-4" style={{ maxWidth: 640 }}>
        <Shield size={14} style={{ flexShrink: 0 }} />
        <span className="text-sm">
          All links are to official government and international organisation websites. We do not link to commercial or unverified sources.
        </span>
      </div>

      {categories.map((cat) => (
        <section key={cat} className="mb-4" aria-labelledby={`cat-${cat.replace(/ /g, "-")}`}>
          <h2 id={`cat-${cat.replace(/ /g, "-")}`} style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>{cat}</h2>
          <div className="grid-2">
            {COMMUNITY_LINKS.filter((l) => l.category === cat).map((link) => (
              <div key={link.id} className="card card-flat">
                <h3 style={{ fontSize: "1rem", marginBottom: ".35rem" }}>{link.name}</h3>
                <p className="text-sm text-muted mb-2">{link.description}</p>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  aria-label={`Visit ${link.name} (opens in new tab)`}
                >
                  <ExternalLink size={13} /> Visit site
                </a>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* CAQM helpline */}
      <div className="card" style={{ background: "var(--navy)", color: "var(--cream)", marginTop: "1.5rem" }}>
        <h2 style={{ color: "var(--cream)", marginBottom: ".5rem" }}>📞 Report Pollution</h2>
        <p style={{ color: "rgba(244,237,224,.85)", marginBottom: "1rem" }}>
          Report stubble burning, construction dust, or waste burning to the CAQM helpline. Crop residue burning contributes 20–60% of Delhi&apos;s peak PM2.5 (IITM 2023).
        </p>
        <a
          href="tel:18001111600"
          className="btn"
          aria-label="Call CAQM Helpline 1800-11-1600"
          style={{ display: "inline-flex" }}
        >
          📞 CAQM Helpline: 1800-11-1600
        </a>
        <p className="text-xs" style={{ marginTop: ".75rem", color: "rgba(244,237,224,.55)" }}>
          Source: Commission for Air Quality Management in NCR and Adjoining Areas (CAQM). Toll-free.
        </p>
      </div>

      <div className="msg info mt-4">
        <Info size={14} style={{ flexShrink: 0 }} />
        <span className="text-xs">
          Community action amplifies individual choices. Reporting violations and using official channels can lead to enforcement action that improves neighbourhood AQI.
        </span>
      </div>
    </div>
  );
}

