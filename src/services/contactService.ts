/**
 * Contact service — sends contact form submission.
 * Server-side only. Logs to console in demo mode.
 */

export async function sendContact(payload: { name: string; email: string; message: string }): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    return res.ok ? { ok: true } : { ok: false, error: data.error ?? "Something went wrong. Please try again." };
  } catch {
    return { ok: false, error: "Network error. Please check your connection and try again." };
  }
}
