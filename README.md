# Urban Air Quality Assistant

An AI-powered decision tool helping Indian families and communities handle severe winter smog. Provides low-emission daily routines, indoor air-quality coaching, smart commute alternatives, and science-backed recommendations tailored to location and lifestyle — using CPCB, WHO, CAQM, IMD and IITM data.

> **Not a generic chatbot or static AQI dashboard.** It is a decision tool.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local — see Environment Variables below

# 3. Run development server
npm run dev

# 4. Open http://localhost:3000
```

---

## 🔑 Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Yes | Your site URL (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_DATA_MODE` | Yes | `demo` (default) or `live` |
| `LLM_PROVIDER` | No | `gemini` (default) or `openai` |
| `LLM_MODEL` | No | `gemini-1.5-flash` (default) |
| `LLM_API_KEY` | No* | Gemini or OpenAI API key. Without it, demo responses are used. |
| `OPENAQ_API_KEY` | No* | OpenAQ v3 key. Without it, demo AQI data is used. |
| `SUPABASE_URL` | No | Supabase project URL (for auth/persistence) |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Supabase service role key (server-side only) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anon key (client-side) |
| `CONTACT_EMAIL` | No | Destination for contact form submissions |

\* The app works in demo mode without LLM or AQI API keys. Demo data is always clearly labelled.

### Getting API Keys

- **Gemini**: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) — Free tier available
- **OpenAQ**: [openaq.org/developers](https://openaq.org/developers/) — Free tier available
- **Supabase**: [supabase.com](https://supabase.com) — Free tier available

---

## 🏗️ Architecture

```
src/
  components/     UI components (no business logic, no fetch calls)
    Header.tsx      Sticky nav, hamburger menu, accessible
    Footer.tsx      Links, copyright year (dynamic)
    AqiGauge.tsx    AQI display with DEMO/LIVE/STALE badges
    ChatPanel.tsx   AI chat UI
    PlannerPanel.tsx Daily planner checklist
    TrendChart.tsx  24-h Recharts area chart
    WeatherWidget.tsx Weather + smog formation risk
    ContactForm.tsx Validated contact form

  services/       Business logic and I/O (server-side only where needed)
    aqiService.ts   Provider abstraction — OpenAQ live / demo fallback
    llmService.ts   Gemini/OpenAI adapter with system prompt
    weatherService.ts Open-Meteo weather + smog risk assessment
    plannerService.ts Time-of-day AQI actions generator
    indoorCoachService.ts CADR calculator and recommendations
    commuteService.ts Transport alternatives and CO2e comparison
    contactService.ts Contact form submission
    mockProvider.ts DEMO data (always clearly labelled)

  utils/          Pure helpers (deterministic, no I/O)
    aqi.ts          CPCB AQI engine (Indian standard only)
    emissions.ts    CO2e emission factor calculator
    cadr.ts         CADR/ventilation calculator
    constants.ts    App constants, research library, community links
    validators.ts   Input validation with typed Result<T>
    date.ts         Date/time helpers (IST)
    env.ts          Centralised env var access

app/              Next.js App Router pages and API routes
  page.tsx          Dashboard (ISR, 5 min)
  planner/          Daily Planner
  indoor/           Indoor Air Coach
  commute/          Smart Commute
  impact/           CO2e Impact Tracker
  assistant/        AI Chat Assistant
  research/         Research Library
  community/        Community Resources
  contact/          Contact form page
  privacy/          Privacy Policy
  disclaimer/       Disclaimer
  not-found.tsx     Custom 404
  error.tsx         Error boundary
  api/chat/         Chat API route (rate-limited)
  api/contact/      Contact API route

src/__tests__/    Unit tests
  aqi.test.ts       CPCB AQI engine tests
  validators.test.ts Input validation tests
  emissions.test.ts  Emission calculator tests
```

### Architecture Rules

- **Components**: UI only. No business logic, no `fetch()` calls.
- **Services**: Business logic and I/O. Server-side API keys.
- **Utils**: Pure, deterministic helpers. No side effects.
- **API Routes**: Thin wrappers that delegate to services.
- **No circular imports**. Single responsibility per file.

---

## 🧪 Running Tests

```bash
# Install Jest
npm install --save-dev jest @types/jest ts-jest --legacy-peer-deps

# Run tests
npx jest --config jest.config.json
```

Tests cover:
- **`aqi.test.ts`**: CPCB sub-index calculations, overall AQI, categories, boundary conditions
- **`validators.test.ts`**: Contact form, chat message, indoor profile, location, commute validation
- **`emissions.test.ts`**: CO2e comparisons, emission factor assumptions, edge cases

---

## 📊 Data & Trust

| Principle | Implementation |
|---|---|
| **Demo always labelled** | `DEMO DATA` badge on every mock value |
| **Never fabricate** | AQI returns `null` for invalid/missing data |
| **Source citing** | Every recommendation includes source |
| **Assumptions visible** | `<details>` for emission factors, CADR calculations |
| **Station ≠ street** | Explicit disclaimer on distance from station |
| **CO2e ≠ PM2.5** | Emissions and exposure tracked separately throughout |

---

## 🏥 Health & Science Standards

- **AQI Engine**: CPCB Indian AQI (sub-index max method). Never US AQI.
- **Categories**: 0–50 Good → 401–500 Severe (6 bands)
- **WHO AQG 2021**: Referenced for health advisories
- **CAQM GRAP**: Winter smog action levels and restrictions
- **ASHRAE 52.2**: CADR calculations for purifiers
- **IPCC AR6 / MoEFCC GHG Platform 2022**: Emission factors

### Explicit Prohibitions in Code

- ❌ No diagnoses, no prescriptions, no guarantees
- ❌ No claim that HEPA removes all pollutants
- ❌ No claim that plants clean indoor air at room scale
- ❌ No ozone generator recommendations
- ❌ No "pollution-safe routes" claims
- ❌ No strenuous outdoor activity at Severe AQI
- ❌ No fabricated PM2.5 reduction claims from transport mode switches

---

## 🛡️ Security

- API keys are server-side only (never in `NEXT_PUBLIC_*`)
- Rate limiting on `/api/chat` (20 req/min per IP)
- Input validation on all API routes (client + server)
- Security headers via Next.js config (CSP, X-Frame-Options, etc.)
- No PII logged beyond contact email (server-side only)

---

## 📋 Checklist (Section 4 — All PASS)

| Item | Status |
|---|---|
| No horizontal scrolling at 320px+ | ✅ PASS |
| Mobile hamburger menu (accessible, closes on nav) | ✅ PASS |
| Logo is clickable link to home | ✅ PASS |
| Custom 404 page | ✅ PASS |
| Favicon | ✅ PASS |
| Unique page title per page | ✅ PASS |
| Meta description | ✅ PASS |
| Fixed footer links (none broken) | ✅ PASS |
| Copyright year dynamically generated | ✅ PASS |
| Every button works | ✅ PASS |
| Success + error messages on every form | ✅ PASS |
| No placeholder or lorem text | ✅ PASS |
| No broken links | ✅ PASS |
| Compressed images (next/image formats) | ✅ PASS |
| Loading skeletons on data views | ✅ PASS |
| Error boundaries | ✅ PASS |
| DEMO DATA badge on every mock value | ✅ PASS |
| Accessible (semantic HTML, ARIA, keyboard) | ✅ PASS |

---

## 📄 License

Built for the PromptWars Challenge 06. Guidance based on publicly available CPCB, WHO, and CAQM standards.
Not a substitute for medical advice. For health emergencies, call 112.
