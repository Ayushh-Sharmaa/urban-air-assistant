import Link from "next/link";
import { currentYear } from "@/utils/date";
import { Wind } from "lucide-react";

const FOOTER_LINKS = {
  Features: [
    { href: "/",          label: "Dashboard" },
    { href: "/planner",   label: "Daily Planner" },
    { href: "/indoor",    label: "Indoor Coach" },
    { href: "/commute",   label: "Smart Commute" },
    { href: "/impact",    label: "Impact Tracker" },
    { href: "/assistant", label: "AI Assistant" },
    { href: "/onboarding",label: "Household Onboarding" },
  ],
  Resources: [
    { href: "/community", label: "Community" },
    { href: "/research",  label: "Research Library" },
    { href: "https://airquality.cpcb.gov.in/", label: "CPCB AQI Portal", external: true },
    { href: "https://caqm.nic.in/",            label: "CAQM Guidelines",  external: true },
    { href: "https://www.who.int/india/health-topics/air-pollution", label: "WHO India", external: true },
  ],
  Legal: [
    { href: "/contact",  label: "Contact Us" },
    { href: "/privacy",  label: "Privacy Policy" },
    { href: "/disclaimer", label: "Disclaimer" },
  ],
};

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading} className="footer-col">
              <h4>{heading}</h4>
              {links.map((l) =>
                "external" in l && l.external ? (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                    {l.label} ↗
                  </a>
                ) : (
                  <Link key={l.href} href={l.href}>{l.label}</Link>
                )
              )}
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <p>
            <Wind size={13} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} />
            © {currentYear()} Urban Air Quality Assistant. Data sources: CPCB, WHO, CAQM, IMD, IITM.{" "}
            <strong>Not a substitute for medical advice.</strong>
          </p>
          <p style={{ marginTop: ".4rem" }}>
            Built for Indian families navigating winter smog. Guidance based on CPCB NAAQS and WHO AQG 2021.
          </p>
        </div>
      </div>
    </footer>
  );
}
