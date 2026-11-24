import type { Metadata } from "next";
import { getAirQuality } from "@/services/aqiService";
import ChatPanel from "@/components/ChatPanel";
import SuggestedQuestions from "@/components/SuggestedQuestions";
import { Bot, Info, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Assistant — Ask About Air Quality",
  description: "Ask your Urban Air Quality AI assistant about indoor air, commute options, smog protection, and daily routines. Powered by Gemini with CPCB, WHO and CAQM sources.",
};

export default async function AssistantPage({ searchParams }: { searchParams: Promise<{ city?: string }> }) {
  const { city = "Delhi" } = await searchParams;
  const aqiResult = await getAirQuality(city);
  const aqiData = aqiResult.ok ? aqiResult.value : null;

  return (
    <div className="container page-pad">
      <div className="flex items-center gap-2 mb-1">
        <Bot size={24} style={{ color: "var(--coral)" }} />
        <h1>AI Assistant</h1>
      </div>
      <p className="text-muted mb-3" style={{ maxWidth: 600 }}>
        Ask me anything about air quality, indoor protection, commute alternatives, or low-emission daily routines. I cite CPCB, WHO, CAQM and IMD sources.
      </p>

      {aqiData?.isDemo && (
        <div className="msg warn mb-3">
          <span className="badge badge-demo" style={{ flexShrink: 0 }}>DEMO DATA</span>
          <span className="text-sm">AI context is based on demo AQI ({aqiData.aqi} — {aqiData.label} in {city}). Enable live data for real-time personalisation.</span>
        </div>
      )}

      {/* Suggested questions */}
      <div className="mb-3">
        <p className="text-sm text-muted mb-2">Suggested questions:</p>
        <SuggestedQuestions />
      </div>

      <ChatPanel initialAqi={aqiData?.aqi} city={city} aqiLabel={aqiData?.label} />

      <div className="grid-2 mt-4">
        <div className="msg warn">
          <Shield size={14} style={{ flexShrink: 0 }} />
          <span className="text-xs">
            <strong>Not medical advice.</strong> This AI does not diagnose conditions, prescribe treatment, or guarantee outcomes.
            Consult a qualified doctor for health concerns. Always follow official CPCB and CAQM advisories.
          </span>
        </div>
        <div className="msg info">
          <Info size={14} style={{ flexShrink: 0 }} />
          <span className="text-xs">
            AI responses are based on CPCB, WHO AQG 2021, CAQM, IMD, and IITM sources. Data limits and uncertainties are always stated.
            {!aqiData || aqiData.isDemo ? " Add LLM_API_KEY for personalised Gemini-powered responses." : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
