/**
 * LLM Service — Gemini (default) or OpenAI.
 * All API keys are server-side only.
 * No diagnoses, no guarantees, no invented readings or sources.
 */
import { env } from "@/utils/env";
import type { Result } from "@/utils/validators";

export interface LLMMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface LLMResponse {
  text: string;
  model: string;
  citations: string[];
}

const SYSTEM_PROMPT = `You are the Urban Air Quality Assistant — a trusted guide for Indian families navigating severe winter smog.

RULES:
- Base all recommendations on CPCB, WHO, CAQM, IMD, and IITM guidance. Cite sources.
- State data limits clearly: "Based on the current AQI reading of X from DEMO DATA..."
- Do NOT diagnose medical conditions. Do NOT prescribe medication. Always recommend consulting a doctor for health concerns.
- Do NOT guarantee outcomes ("this will cure..."). Use hedged language: "may help", "evidence suggests".
- Do NOT invent AQI readings, station names, or sources. If you don't know, say so.
- Distinguish between CO₂e reductions (emissions) and PM2.5 exposure reduction — they are different things.
- Do NOT claim plants clean indoor air at room scale. Do NOT recommend ozone generators.
- When AQI is Severe (>400), always recommend staying indoors with HEPA purifier — no strenuous outdoor activity.
- Keep responses helpful, concise, and actionable. Use bullet points for action lists.
- Format: Use markdown. Lead with the most urgent recommendation.`;

export async function chat(
  messages: LLMMessage[],
  context?: { aqi?: number; city?: string; aqiLabel?: string }
): Promise<Result<LLMResponse>> {
  const contextStr = context
    ? `\n\nCurrent context: City=${context.city ?? "Unknown"}, AQI=${context.aqi ?? "Unknown"} (${context.aqiLabel ?? "Unknown category"}). ${context.aqi && context.aqi > 400 ? "⚠️ SEVERE AQI — prioritise indoor safety." : ""}`
    : "";

  const systemWithContext = SYSTEM_PROMPT + contextStr;

  if (!env.llmApiKey) {
    return getDemoResponse(messages, context);
  }

  try {
    if (env.llmProvider === "gemini") {
      return await callGemini(messages, systemWithContext);
    }
    return await callOpenAI(messages, systemWithContext);
  } catch (err) {
    console.error("[llmService] LLM call failed:", err);
    return { ok: false, error: "AI assistant is temporarily unavailable. Please try again." };
  }
}

async function callGemini(
  messages: LLMMessage[],
  systemPrompt: string
): Promise<Result<LLMResponse>> {
  const model = env.llmModel;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.llmApiKey}`;

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
    safetySettings: [
      { category: "HARM_CATEGORY_MEDICAL", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    ],
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[llmService] Gemini error:", err);
    return { ok: false, error: "AI service error. Please try again later." };
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return { ok: true, value: { text, model, citations: extractCitations(text) } };
}

async function callOpenAI(
  messages: LLMMessage[],
  systemPrompt: string
): Promise<Result<LLMResponse>> {
  const model = env.llmModel.startsWith("gpt") ? env.llmModel : "gpt-4o-mini";
  const url = "https://api.openai.com/v1/chat/completions";

  const body = {
    model,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    temperature: 0.4,
    max_tokens: 1024,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.llmApiKey}` },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[llmService] OpenAI error:", err);
    return { ok: false, error: "AI service error. Please try again later." };
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  return { ok: true, value: { text, model, citations: extractCitations(text) } };
}

function extractCitations(text: string): string[] {
  const matches = text.match(/\b(CPCB|WHO|CAQM|IMD|IITM|NCDC|IPCC|EPA|BEE)\b/g) ?? [];
  return [...new Set(matches)];
}

/** Demo response when no LLM key is configured */
function getDemoResponse(
  messages: LLMMessage[],
  context?: { aqi?: number; city?: string; aqiLabel?: string }
): Result<LLMResponse> {
  const lastMsg = messages.at(-1)?.content?.toLowerCase() ?? "";
  const aqi = context?.aqi ?? 178;
  const city = context?.city ?? "Delhi";
  const label = context?.aqiLabel ?? "Moderate";

  let text = "";

  if (lastMsg.includes("purifier") || lastMsg.includes("indoor") || lastMsg.includes("hepa")) {
    text = `## Indoor Air Quality Recommendations\n\n**Current AQI: ${aqi} (${label})** in ${city} [DEMO DATA]\n\n- ✅ **Use a HEPA purifier** rated for your room size. At AQI ${aqi}, run it on medium-high.\n- 🪟 **Close windows** during peak pollution hours (early morning and evening).\n- 🌡️ **Ventilate 10 AM–12 PM** when boundary layer rises and pollutants disperse (IMD guidance).\n- ⚠️ **Avoid ozone generators** — ozone is itself an air pollutant harmful to lungs (WHO 2021).\n- 🌿 **Plants do not clean air** at room scale — do not rely on them for AQI protection.\n\n*Source: WHO AQG 2021; US EPA Residential Air Cleaners guide (2018); IMD meteorological data*\n\n> ⚠️ This is a demo response. Add your LLM API key for personalised AI guidance.`;
  } else if (lastMsg.includes("commute") || lastMsg.includes("travel") || lastMsg.includes("outside")) {
    text = `## Commute Advice for ${city}\n\n**Current AQI: ${aqi} (${label})** [DEMO DATA]\n\n${aqi > 400 ? "🚨 **SEVERE AQI** — avoid all outdoor travel if possible. Essential travel only.\n\n" : ""}- 🚇 **Metro or bus** reduces your personal CO₂e by up to 83% vs a petrol car.\n- ⏰ **Travel 10 AM–12 PM** when AQI is typically lowest in Indian cities (IMD).\n- 😷 **Wear N95 mask** (not cloth) for PM2.5 protection if outdoors at this AQI level.\n- 🚴 **Cycling** is not recommended above AQI 200 — heavy breathing increases PM2.5 intake.\n\n*Note: Switching to EV reduces CO₂e but PM2.5 from brake/tyre wear remains. Emissions ≠ exposure.*\n\n> ⚠️ This is a demo response. Add your LLM API key for personalised AI guidance.`;
  } else {
    text = `## Daily Air Quality Briefing — ${city}\n\n**Current AQI: ${aqi} (${label})** [DEMO DATA]\n\n### Top Actions for Today\n\n1. 😷 **Wear N95 mask** for all outdoor activities at this AQI level.\n2. 🏠 **Keep windows closed** during morning (6–9 AM) and evening (7–10 PM) peaks.\n3. 🌬️ **Run HEPA purifier** in bedroom and living area.\n4. 🏃 **Postpone outdoor exercise** to 10 AM–12 PM or exercise indoors.\n5. 🍳 **Avoid biomass/wood cooking** — it significantly worsens indoor PM2.5.\n\n### Why This Matters\nAt AQI ${aqi}, sensitive groups (children, elderly, those with respiratory conditions) may experience health effects. Even healthy adults should reduce prolonged outdoor exertion.\n\n*Sources: CPCB AQI health advisory; WHO AQG 2021; CAQM Winter Action Plan 2024–25*\n\n> ⚠️ This is a demo response. Set LLM_API_KEY in .env.local for personalised AI guidance.`;
  }

  return { ok: true, value: { text, model: "demo", citations: ["CPCB", "WHO", "CAQM", "IMD"] } };
}

