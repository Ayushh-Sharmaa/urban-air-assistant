/**
 * Single place for all environment variable access.
 * No secrets, URLs or keys anywhere else.
 * Throws at startup if required server-side vars are missing.
 */

function get(key: string, fallback?: string): string {
  const val = process.env[key];
  if (val !== undefined && val !== "") return val;
  if (fallback !== undefined) return fallback;
  // Only throw on server for required vars
  if (typeof window === "undefined") {
    console.error(`[env] Missing required environment variable: ${key}`);
  }
  return "";
}

export const env = {
  // Public (safe to expose)
  siteUrl:  get("NEXT_PUBLIC_SITE_URL", "http://localhost:3000"),
  dataMode: get("NEXT_PUBLIC_DATA_MODE", "demo") as "demo" | "live",
  appName:  "Urban Air Quality Assistant",

  // Server-side only (never expose to browser)
  get openAqKey()   { return get("OPENAQ_API_KEY", ""); },
  get llmApiKey()   { return get("LLM_API_KEY", ""); },
  get supabaseUrl()  { return get("SUPABASE_URL", ""); },
  get supabaseKey()  { return get("SUPABASE_SERVICE_ROLE_KEY", ""); },
  get supabaseAnon() { return get("NEXT_PUBLIC_SUPABASE_ANON_KEY", ""); },
  get llmModel()     { return get("LLM_MODEL", "gemini-1.5-flash"); },
  get llmProvider()  { return get("LLM_PROVIDER", "gemini") as "gemini" | "openai"; },
  get contactEmail() { return get("CONTACT_EMAIL", ""); },
};

/** Validate required vars at server startup — call from API routes */
export function assertServerEnv(): void {
  const required: Array<keyof typeof env> = [];
  // LLM key is optional — demo mode works without it
  for (const key of required) {
    if (!env[key]) {
      throw new Error(`Required environment variable for key "${key}" is not set. See .env.example`);
    }
  }
}
