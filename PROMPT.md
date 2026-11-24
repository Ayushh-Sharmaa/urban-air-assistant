# MASTER PROMPT: Urban Air Quality Assistant (PromptWars Challenge 06)

You are a senior full-stack engineer. Extend the existing repository (do NOT restart). Follow its structure and conventions exactly, and keep every change production quality.

## 1. Product
Build a GenAI-powered assistant that helps Indian families and communities handle severe winter smog. It must suggest low-emission daily routines, indoor air-quality hacks and sustainable alternatives tailored to location and lifestyle, and clearly explain the direct impact of each choice. It is a decision tool, not a generic chatbot or static AQI dashboard.

## 2. Stack
Next.js (App Router), React, TypeScript (strict), plain CSS variables or Tailwind, Lucide icons, Recharts, Supabase (auth, Postgres, RLS), pgvector for RAG, configurable LLM (Gemini default). API keys server-side only.

## 3. Design (strict palette)
- Navy `#14213d` (header, footer, headings, text), Cream `#F4EDE0` (page background), Coral `#FF6B5B` (buttons, accents, links on hover).
- White cards, rounded 14px, light shadow, generous spacing, clear hierarchy, accessible contrast (WCAG AA), light theme.
- AQI category colours may be used ONLY inside the AQI gauge and charts.
- Clean, minimal, trustworthy. Not a generic AI SaaS landing page.

## 4. Mandatory quality checklist (must all pass)
UI/UX: no horizontal scrolling at any width (320px+) · mobile hamburger menu (accessible, closes on navigation) · mobile overview/dashboard layout fixed and compact · logo is a clickable link to home · custom 404 page · favicon · unique, descriptive page title per page · meta description · fixed footer links (none broken) · copyright year generated dynamically · compressed images (next/image, WebP/AVIF, lazy loading, explicit sizes) · every button works · success message and error message on every form/action · no placeholder or lorem text · remove unused navigation items · no broken links anywhere.

## 5. Architecture (3 top-level source folders only)
```
src/
  components/  UI only (Header, Footer, AqiGauge, PollutantCard, ChatPanel, ContactForm, ...). No business logic, no fetch calls inside.
  services/    Business logic and I/O: aqiService, providers (OpenAQ, CPCB adapters, mock), weatherService, ragService, llmService, contactService.
  utils/       Pure helpers: aqi.ts (CPCB engine), cadr.ts, emissions.ts, validators.ts, date.ts, env.ts, constants.ts.
app/           Next.js routes and API routes only; thin, delegate to services.
```
Rules: separate business logic from UI · remove duplicate and dead code · consistent naming (PascalCase components, camelCase functions, kebab-case files for non-components, UPPER_SNAKE constants) · single responsibility per file · no circular imports.

## 6. Error handling and environment
- Every service call wrapped with typed `Result` handling; user-friendly messages in UI, details logged server-side only.
- Loading skeletons, empty, error and stale-data states for every data view.
- Error boundaries and `not-found`/`error` pages.
- All environment-specific values in `.env.local`, read only through `utils/env.ts`. Ship `.env.example`. No secrets, URLs or keys hardcoded. Validate required env vars at startup.

## 7. Core features
1. **Dashboard**: location, AQI gauge, Indian CPCB category, main pollutant, PM2.5, PM10 (µg/m³), station, distance, timestamp, source, freshness badge, weather, trend chart, daily briefing, recommended actions.
2. **AQI engine** (deterministic): CPCB sub-index per pollutant, overall AQI = max sub-index, categories 0-50 Good, 51-100 Satisfactory, 101-200 Moderate, 201-300 Poor, 301-400 Very Poor, 401-500 Severe. Never compute from missing, invalid or stale values. Never use the US AQI.
3. **Daily Planner**: morning/afternoon/evening/night actions, each with action, reason, expected benefit, confidence, source, effort, cost, completion checkbox.
4. **Indoor Air Coach**: questionnaire (home/room size, occupants, cooking fuel, ventilation, purifier, budget), transparent CADR calculator, ventilation timing, filter care, ozone-generator warning, low-cost alternatives. No claims that HEPA removes everything or that plants clean air.
5. **Smart Commute**: transport alternatives, departure timing, no strenuous outdoor travel at Severe AQI, no unsupported "pollution-safe route" claims.
6. **Impact Tracker**: CO2e avoided with documented emission factors and visible assumptions. No fabricated PM2.5 reductions; keep exposure and emissions separate.
7. **AI Assistant (RAG)**: retrieves live AQI, weather, official advisories and a verified knowledge base (WHO, CPCB, NCDC, CAQM, IMD, IITM); cites sources; explains reasoning; states data limits; no diagnoses, no guarantees, no invented readings or sources.
8. **Community** (verified official links only) and **Research** library (title, issuer, date, URL, summary, applicability, evidence type).
9. **Onboarding** with skip; health information optional and consent-based.

## 8. Data and trust
- Provider abstraction; never hardcode fabricated endpoints; credentialed sources get adapters plus env vars.
- Demo mode with a visible `DEMO DATA` badge on every mock value. Never present mock data as live.
- Distinguish station readings from estimates; never claim a station represents the user's street.

## 9. Security and performance
Server-side keys, input validation (client and server), rate limiting, Supabase RLS, minimal health-data storage, secure headers. Mobile-first, lazy loading, API caching, SEO metadata, PWA-ready, semantic HTML, keyboard and screen-reader accessible.

## 10. Output
Make changes file by file following the structure above. Include tests for `utils/aqi.ts`, validators and emissions. Update README with setup, env docs and architecture. At the end, list every checklist item in section 4 with PASS/FAIL and fix all FAILs.
