"use client";
import { useState, useRef, useEffect, useTransition } from "react";
import { Send, Bot, User, Info, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message { role: "user" | "assistant"; content: string; citations?: string[]; }
interface Props { initialAqi?: number; city?: string; aqiLabel?: string; }

export default function ChatPanel({ initialAqi, city, aqiLabel }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I'm your Urban Air Quality Assistant. ${initialAqi ? `Current AQI in ${city ?? "your city"} is **${initialAqi}** (${aqiLabel}).` : ""}\n\nI can help you with:\n- 🏠 Indoor air quality and purifier recommendations\n- 🚌 Commute alternatives and timing\n- 😷 Protective actions for your AQI level\n- 🌿 Low-emission lifestyle tips\n\nWhat would you like to know?`,
      citations: ["CPCB", "WHO", "CAQM"],
    },
  ]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
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
            history: messages.slice(-8), // last 8 messages for context
            context: { aqi: initialAqi, city, aqiLabel },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "AI service error");
        setMessages((prev) => [...prev, { role: "assistant", content: data.text, citations: data.citations }]);
      } catch (err) {
        setError("Sorry, I couldn't get a response. Please try again.");
        console.error("[ChatPanel]", err);
      }
    });
  }

  return (
    <div className="chat-wrap" role="log" aria-label="AI assistant conversation" aria-live="polite">
      <div className="chat-messages" aria-label="Messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role}`} aria-label={`${m.role === "user" ? "You" : "Assistant"}: ${m.content.slice(0, 60)}`}>
            <div style={{ display: "flex", alignItems: "center", gap: ".35rem", marginBottom: ".35rem", opacity: .6, fontSize: ".75rem" }}>
              {m.role === "user" ? <User size={12} /> : <Bot size={12} />}
              <span>{m.role === "user" ? "You" : "AI Assistant"}</span>
              {m.citations?.length ? (
                <span style={{ marginLeft: ".5rem" }}>· Sources: {m.citations.join(", ")}</span>
              ) : null}
            </div>
            {m.role === "assistant" ? (
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p style={{ margin: ".2rem 0" }}>{children}</p>,
                  ul: ({ children }) => <ul style={{ paddingLeft: "1.2rem", margin: ".3rem 0" }}>{children}</ul>,
                  li: ({ children }) => <li style={{ margin: ".15rem 0" }}>{children}</li>,
                  strong: ({ children }) => <strong style={{ color: "var(--navy)" }}>{children}</strong>,
                }}
              >
                {m.content}
              </ReactMarkdown>
            ) : (
              <span>{m.content}</span>
            )}
          </div>
        ))}
        {isPending && (
          <div className="chat-bubble assistant" aria-label="Assistant is typing">
            <div style={{ display: "flex", gap: ".3rem", padding: ".2rem 0" }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--muted)", animation: `bounce .9s ${i * 0.15}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        {error && (
          <div className="msg err" role="alert" style={{ maxWidth: "80%", alignSelf: "flex-start" }}>
            <AlertTriangle size={14} />
            <span>{error}</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-row">
        <label htmlFor="chat-input" className="visually-hidden">Type your message</label>
        <textarea
          id="chat-input"
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about indoor air, commute, protective masks…"
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

      <div className="text-xs text-muted" style={{ padding: ".5rem .75rem", borderTop: "1px solid var(--border)", display: "flex", gap: ".4rem" }}>
        <Info size={11} style={{ flexShrink: 0, marginTop: "1px" }} />
        Not medical advice. Based on CPCB, WHO, CAQM guidelines. Data limits stated. No diagnoses or guarantees.
      </div>

      <style>{`@keyframes bounce { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-5px) } }`}</style>
    </div>
  );
}

