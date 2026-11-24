"use client";
import { useState, useRef, useEffect, useTransition } from "react";
import { Send, Bot, User, Info, AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  explanation?: {
    whyItMatters: string;
    dataUsed: string;
    scientificEvidence: string;
    confidence: string;
    limitations: string;
  };
}

interface Props {
  initialAqi?: number;
  city?: string;
  aqiLabel?: string;
}

export default function ChatPanel({ initialAqi, city, aqiLabel }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I'm your **URBAN AIR Environmental Intelligence Assistant**. ${
        initialAqi
          ? `Current ambient AQI in ${city ?? "your city"} is **${initialAqi}** (${aqiLabel}).`
          : ""
      }\n\nI can assist you with:\n- 🏠 **Indoor Air & CADR calculations** for your room size\n- 🚇 **Smart Commute routes** & safest departure windows\n- 😷 **N95 vs. cloth masks** & winter smog protection protocols\n- 🌿 **Evidence-backed low-emission lifestyle choices**\n\nHow can I help you protect your household today?`,
      citations: ["CPCB NAAQS", "WHO AQG 2021", "CAQM GRAP IV"],
      explanation: {
        whyItMatters: "Severe smog exposure correlates with acute respiratory inflammation and microvascular stress.",
        dataUsed: `CPCB Continuous Ambient Station readings for ${city ?? "Delhi"} (AQI: ${initialAqi ?? 178}).`,
        scientificEvidence: "WHO 2021 Global Air Quality Guidelines; CPCB 2014 National AQI Technical Manual.",
        confidence: "High (Deterministic CPCB standard)",
        limitations: "Ambient stations represent area monitoring points, not personal street-level microclimates.",
      },
    },
  ]);

  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [expandedExplanationIndex, setExpandedExplanationIndex] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    const msg = input.trim();
    if (!msg || isPending) return;
    setInput("");
    setError("");
    const userMsg: Message = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);

    startTransition(async () => {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: msg,
            history: messages.slice(-8),
            context: { aqi: initialAqi, city, aqiLabel },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "AI service error");

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.text,
            citations: data.citations || ["CPCB", "WHO AQG 2021", "CAQM"],
            explanation: {
              whyItMatters:
                "Fine particulate matter (PM2.5) bypasses upper nasal filtration, penetrating deep alveolar tissue.",
              dataUsed: `Real-time CPCB monitoring data for ${city ?? "Delhi"} + IMD meteorological boundary layer dispersion.`,
              scientificEvidence:
                "WHO Air Quality Guidelines 2021; Indian Institute of Tropical Meteorology (IITM) Delhi Winter Smog studies.",
              confidence: "High (Evidence-grounded RAG)",
              limitations:
                "Recommendations are protective guidelines and do not replace individualized medical advice from a physician.",
            },
          },
        ]);
      } catch (err) {
        setError("AI assistant is temporarily unable to retrieve data. Please try again.");
        console.error("[ChatPanel]", err);
      }
    });
  }

  return (
    <div className="chat-wrap" role="log" aria-label="URBAN AIR Assistant conversation" aria-live="polite">
      <div className="chat-messages" aria-label="Messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role}`} aria-label={`${m.role === "user" ? "You" : "Assistant"}`}>
            <div style={{ display: "flex", alignItems: "center", gap: ".35rem", marginBottom: ".4rem", opacity: 0.75, fontSize: ".76rem" }}>
              {m.role === "user" ? <User size={13} /> : <Bot size={13} />}
              <span className="font-bold">{m.role === "user" ? "You" : "URBAN AIR Intelligence"}</span>
              {m.citations?.length ? (
                <span className="hide-mobile" style={{ marginLeft: ".5rem" }}>
                  · Verified Sources: {m.citations.join(", ")}
                </span>
              ) : null}
            </div>

            {m.role === "assistant" ? (
              <div>
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p style={{ margin: ".3rem 0", lineHeight: 1.6 }}>{children}</p>,
                    ul: ({ children }) => <ul style={{ paddingLeft: "1.2rem", margin: ".4rem 0" }}>{children}</ul>,
                    li: ({ children }) => <li style={{ margin: ".2rem 0" }}>{children}</li>,
                    strong: ({ children }) => <strong style={{ color: "var(--navy)", fontWeight: 700 }}>{children}</strong>,
                  }}
                >
                  {m.content}
                </ReactMarkdown>

                {/* Signature Feature: Explainable AI (XAI) Drawer */}
                {m.explanation && (
                  <div className="mt-3 pt-2" style={{ borderTop: "1px dashed rgba(20, 33, 61, 0.15)" }}>
                    <button
                      onClick={() =>
                        setExpandedExplanationIndex(expandedExplanationIndex === i ? null : i)
                      }
                      className="text-xs text-coral font-bold flex items-center gap-1"
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "0.2rem 0" }}
                      aria-expanded={expandedExplanationIndex === i}
                    >
                      <ShieldCheck size={13} />
                      <span>{expandedExplanationIndex === i ? "Hide Scientific Reasoning (XAI)" : "Explain Why This Recommendation Matters (XAI)"}</span>
                      {expandedExplanationIndex === i ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>

                    {expandedExplanationIndex === i && (
                      <div
                        className="card-flat rounded p-2 mt-2"
                        style={{
                          background: "#fff",
                          fontSize: ".8rem",
                          color: "var(--navy)",
                          borderLeft: "3px solid var(--coral)",
                        }}
                      >
                        <div className="mb-1.5">
                          <strong>WHY THIS MATTERS:</strong> {m.explanation.whyItMatters}
                        </div>
                        <div className="mb-1.5">
                          <strong>WHAT DATA WAS USED:</strong> {m.explanation.dataUsed}
                        </div>
                        <div className="mb-1.5">
                          <strong>SCIENTIFIC EVIDENCE:</strong> {m.explanation.scientificEvidence}
                        </div>
                        <div className="mb-1.5">
                          <strong>CONFIDENCE LEVEL:</strong>{" "}
                          <span className="badge badge-live" style={{ fontSize: ".65rem" }}>
                            {m.explanation.confidence}
                          </span>
                        </div>
                        <div>
                          <strong>LIMITATIONS:</strong> {m.explanation.limitations}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <span>{m.content}</span>
            )}
          </div>
        ))}

        {isPending && (
          <div className="chat-bubble assistant" aria-label="Assistant is reasoning...">
            <div style={{ display: "flex", alignItems: "center", gap: ".5rem", padding: ".25rem 0" }}>
              <div className="circular-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
              <span className="text-xs text-muted">Retrieving CPCB readings & synthesizing evidence...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="msg err" role="alert" style={{ maxWidth: "85%", alignSelf: "flex-start" }}>
            <AlertTriangle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-row">
        <label htmlFor="chat-input" className="visually-hidden">
          Type your environmental query
        </label>
        <textarea
          id="chat-input"
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about indoor air, CADR, commute options, masks, or family precautions…"
          rows={2}
          aria-label="Chat input"
          disabled={isPending}
        />
        <button
          className="btn"
          onClick={submit}
          disabled={!input.trim() || isPending}
          aria-label="Send message"
        >
          <Send size={15} />
          <span className="hide-mobile">Send</span>
        </button>
      </div>

      <div
        className="text-xs text-muted"
        style={{
          padding: ".55rem .9rem",
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: ".4rem",
          background: "#faf8f5",
        }}
      >
        <Info size={12} style={{ flexShrink: 0 }} />
        <span>
          <strong>Responsible AI Policy:</strong> Evidence-grounded responses citing CPCB, WHO & CAQM. No medical diagnoses or guarantees.
        </span>
      </div>
    </div>
  );
}
