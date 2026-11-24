import { NextResponse } from "next/server";
import { validateChatMessage } from "@/utils/validators";
import { chat } from "@/services/llmService";

// Simple in-memory rate limiter (per IP, resets on restart)
const rateLimitMap = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 20; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const validation = validateChatMessage(body);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { message } = validation.value;
    const history = Array.isArray(body.history) ? body.history.slice(-10) : [];
    const context = body.context ?? {};

    const messages = [
      ...history.map((m: { role: string; content: string }) => ({
        role: (m.role === "user" || m.role === "assistant") ? m.role : "user" as "user" | "assistant",
        content: String(m.content ?? "").slice(0, 1000),
      })),
      { role: "user" as const, content: message },
    ];

    const result = await chat(messages, context);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 503 });
    }

    return NextResponse.json({ text: result.value.text, model: result.value.model, citations: result.value.citations });
  } catch (err) {
    console.error("[chat API]", err);
    return NextResponse.json({ error: "Internal server error. Please try again." }, { status: 500 });
  }
}

