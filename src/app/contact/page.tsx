import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { Mail, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the Urban Air Quality Assistant team. Share feedback, report issues, or ask questions about air quality guidance.",
};

export default function ContactPage() {
  return (
    <div className="container page-pad">
      <div className="container-narrow">
        <div className="flex items-center gap-2 mb-1">
          <Mail size={24} style={{ color: "var(--coral)" }} />
          <h1>Contact Us</h1>
        </div>
        <p className="text-muted mb-4">
          Share feedback, report a data issue, suggest a feature, or ask a question about air quality guidance.
        </p>

        <div className="card mb-4" style={{ maxWidth: 520 }}>
          <ContactForm />
        </div>

        <div className="msg info">
          <Info size={14} style={{ flexShrink: 0 }} />
          <span className="text-xs">
            For health emergencies, contact emergency services. For official air quality complaints, use CAQM Helpline: 1800-11-1600.
            We typically respond within 2–3 business days.
          </span>
        </div>
      </div>
    </div>
  );
}

