"use client";

const SUGGESTED = [
  "What purifier do I need for a 20 m² room?",
  "Is it safe to cycle today?",
  "Best time to open windows?",
  "How can I reduce indoor PM2.5 on a budget?",
  "What does PM2.5 do to my lungs?",
];

export default function SuggestedQuestions() {
  function fill(q: string) {
    const input = document.getElementById("chat-input") as HTMLTextAreaElement | null;
    if (input) {
      // Trigger React synthetic event
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
      nativeInputValueSetter?.call(input, q);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.focus();
    }
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem" }}>
      {SUGGESTED.map((q) => (
        <button
          key={q}
          className="btn btn-ghost btn-sm"
          style={{ fontSize: ".82rem" }}
          onClick={() => fill(q)}
        >
          {q}
        </button>
      ))}
    </div>
  );
}

