"use client";
import { useState, useTransition } from "react";
import { sendContact } from "@/services/contactService";
import { validateContact } from "@/utils/validators";
import { Send, CheckCircle, AlertCircle } from "lucide-react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (status !== "idle") setStatus("idle");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");
    const validation = validateContact(form);
    if (!validation.ok) { setStatus("error"); setErrorMsg(validation.error); return; }

    startTransition(async () => {
      const result = await sendContact(form);
      if (result.ok) {
        setStatus("success");
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
        setErrorMsg(result.error ?? "Something went wrong. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Contact form">
      {status === "success" && (
        <div className="msg ok mb-2" role="alert">
          <CheckCircle size={16} />
          <span>Thank you! We&apos;ll get back to you soon.</span>
        </div>
      )}
      {status === "error" && (
        <div className="msg err mb-2" role="alert">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="field">
        <label htmlFor="name">Your name</label>
        <input
          id="name" name="name" type="text" value={form.name}
          onChange={handleChange} autoComplete="name" required
          placeholder="e.g. Priya Sharma" aria-required="true"
        />
      </div>
      <div className="field">
        <label htmlFor="email">Email address</label>
        <input
          id="email" name="email" type="email" value={form.email}
          onChange={handleChange} autoComplete="email" required
          placeholder="priya@example.com" aria-required="true"
        />
      </div>
      <div className="field">
        <label htmlFor="message">Message</label>
        <textarea
          id="message" name="message" value={form.message}
          onChange={handleChange} required rows={4}
          placeholder="Your feedback, question, or suggestion..."
          aria-required="true"
        />
        <span className="field-hint">{form.message.length}/2000 characters</span>
      </div>

      <button type="submit" className="btn" disabled={isPending} aria-busy={isPending}>
        <Send size={15} />
        {isPending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
