import { NextResponse } from "next/server";
import { validateContact } from "@/utils/validators";
import { env } from "@/utils/env";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const validation = validateContact(body);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const { name, email, message } = validation.value;

    // In production: send email via SendGrid/Resend/etc
    // For now: log server-side (never expose to client)
    console.info("[contact]", { name, email, messageLength: message.length, timestamp: new Date().toISOString() });

    if (env.contactEmail) {
      // TODO: integrate email service
      console.info(`[contact] Would send to ${env.contactEmail}`);
    }

    return NextResponse.json({ ok: true, message: "Message received. Thank you!" });
  } catch (err) {
    console.error("[contact API]", err);
    return NextResponse.json({ error: "Internal server error. Please try again." }, { status: 500 });
  }
}
