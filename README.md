# Urban Air Quality Assistant

An AI-powered environmental intelligence and decision-support platform helping Indian families, students, commuters, and communities handle severe winter smog. Provides low-emission daily routines, indoor air-quality coaching, smart commute alternatives, and science-backed recommendations tailored to location and lifestyle — using CPCB, WHO, CAQM, IMD, and IITM data.

> **Not a generic chatbot or static AQI dashboard.** It is a personalized decision tool.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests (72 tests across 3 suites)
npm test

# 3. Start development server
npm run dev

# 4. Open http://localhost:3000 in your browser
```

The application runs in **demo mode** out of the box with zero external configuration required. All mock data is clearly badged with `DEMO DATA`.

---

## 🎨 Strict Visual Identity & Palette

Built with a clean, accessible, high-trust environmental dashboard aesthetic:
- **Midnight Navy** (`#14213d`): Header, footer, primary headings, text surfaces
- **Cream** (`#F4EDE0`): Warm page background
- **Coral** (`#FF6B5B`): Interactive buttons, badges, highlights, links on hover
- **Cards**: Pure white (`#ffffff`), 14px border radius (`border-radius: 14px`), soft elevation shadows
- **AQI Categories**: Color-coded strictly inside the AQI gauge, charts, and status indicators

---

## 🔑 Environment Variables

Copy `.env.example` to `.env.local` to configure live providers (demo mode is enabled by default):

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Yes | Site URL (default: `http://localhost:3000`) |
| `NEXT_PUBLIC_DATA_MODE` | Yes | `demo` (default) or `live` |
| `LLM_PROVIDER` | No | `gemini` (default) or `openai` |
| `LLM_MODEL` | No | `gemini-1.5-flash` (default) or `gpt-4o-mini` |
| `LLM_API_KEY` | No* | Gemini or OpenAI API key. Without it, deterministic demo AI responses are used. |
| `OPENAQ_API_KEY` | No* | OpenAQ v3 key for real-time station data. Without it, demo station data is used. |
| `SUPABASE_URL` | No | Supabase project URL (for auth & persistence) |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Supabase service role key (server-side only) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anonymous public key (client-side) |
| `CONTACT_EMAIL` | No | Destination for contact form notifications |

\* All external API keys are optional. The platform is fully functional in demonstration mode with explicit badging.

---

## 🏗️ Architecture

Strict separation of concerns across 3 top-level source folders under `src/` and Next.js App Router under `src/app/`:

```
src/
  components/           # UI components only (pure presentation, zero fetch/business logic)
    AqiGauge.tsx          # CPCB AQI indicator with DEMO / LIVE / STALE badges
    ChatPanel.tsx         # AI Assistant streaming chat UI with citation pills
    ContactForm.tsx       # Validated contact form with inline error/success states
    Footer.tsx            # Accessible footer with dynamic copyright year & verified links
    Header.tsx            # Sticky header with accessible mobile navigation & logo link
    PlannerPanel.tsx      # Time-of-day checklist with filters, benefits & evidence sources
    SuggestedQuestions.tsx# Fast conversational prompt selector
    TrendChart.tsx        # 24-hour Recharts area chart with NAAQS reference lines
    WeatherWidget.tsx     # Inversion & smog formation risk indicator based on meteorology

  services/             # Business logic & I/O
    aqiService.ts         # Provider abstraction: OpenAQ v3 live adapter + mock fallback
    commuteService.ts     # Transport alternatives & severe AQI safety advisories
    contactService.ts     # Contact submissions handler
    indoorCoachService.ts # CADR room sizing, ventilation windows, & purifier guidance
    llmService.ts         # Server-side Gemini & OpenAI RAG assistant adapter
    mockProvider.ts       # Realistic, clearly labelled DEMO data for 5 Indian metro cities
    plannerService.ts     # Deterministic CPCB/WHO/CAQM time-of-day action generator
    weatherService.ts     # Open-Meteo meteorological fetcher & temperature inversion evaluator

  utils/                # Pure deterministic helpers
    aqi.ts                # Deterministic Indian CPCB AQI engine (6 bands, sub-index max)
    cadr.ts               # ASHRAE 52.2 & BEE India purifier CADR calculations
    constants.ts          # Emission factors, verified research library, community links
    date.ts               # Date & time formatting (IST), relative timestamps & staleness checks
    emissions.ts          # IPCC AR6 & MoEFCC GHG Platform 2022 CO2e comparisons
    env.ts                # Centralized environment access with server-side safety checks
    validators.ts         # Strongly-typed Result<T> input validation

app/                    # Next.js App Router pages and API routes
  api/chat/route.ts       # Rate-limited Gemini RAG chat endpoint
  api/contact/route.ts    # Server-side validated contact endpoint
  assistant/page.tsx      # AI Assistant interface
  community/page.tsx      # Official government & international clean-air resources
  commute/page.tsx        # Smart Commute Assistant with CO2e calculator
  contact/page.tsx        # Contact Us page
  disclaimer/page.tsx     # Medical and data limitation disclaimers
  error.tsx               # Production error boundary
  impact/page.tsx         # Sustainable Impact Tracker
  indoor/page.tsx         # Indoor Air Quality Coach
  layout.tsx              # Root layout with SEO metadata & PWA manifest
  not-found.tsx           # Custom accessible 404 page
  onboarding/page.tsx     # Privacy-first household onboarding flow with skip
  page.tsx                # Main Air Quality Dashboard
  planner/page.tsx        # Daily Action Planner
  privacy/page.tsx        # Transparent privacy & health data policy
  research/page.tsx       # Searchable evidence library (WHO, CPCB, CAQM, IITM, NCDC)

supabase/
  schema.sql            # PostgreSQL schema with pgvector, RLS policies, & indexes

public/
  favicon.svg           # Scalable SVG logo favicon
  manifest.json         # PWA web manifest
```

---

## 🧪 Testing

The repository includes a comprehensive Jest test suite with 72 automated assertions:

```bash
npm test
```

### Coverage
- **`src/__tests__/aqi.test.ts`**: CPCB sub-index formulas across all concentration boundaries, pollutant units, max sub-index computation, category mappings (Good to Severe), invalid input guards (`NaN`, negatives, `Infinity`), and health advisories.
- **`src/__tests__/validators.test.ts`**: Contact form validation, chat input bounds, indoor room/purifier profile checks, commute parameters, and city location validation.
- **`src/__tests__/emissions.test.ts`**: Trip-level CO₂e comparisons, transport emission factor assumptions, cooking fuel daily/annual calculations, and zero-savings edge cases.

---

## 📊 Core Features

1. **Dashboard**: Live station AQI, CPCB category, dominant pollutant, PM2.5 and PM10 in µg/m³, station distance, measurement timestamp, data freshness badge, meteorological smog risk, 24-hour trend chart, and daily briefing.
2. **Deterministic AQI Engine**:
   - Strictly implements the Indian Central Pollution Control Board (CPCB) methodology.
   - AQI = $\max(\text{sub-indices})$.
   - Standard 6 categories: Good (0–50), Satisfactory (51–100), Moderate (101–200), Poor (201–300), Very Poor (301–400), Severe (401–500).
   - Never fabricates readings; never uses US EPA AQI breakpoints for Indian standards.
3. **Daily Planner**: Morning, afternoon, evening, and night actions. Each action specifies expected benefit, confidence level, evidence source, effort level, cost bracket, and completion tracker.
4. **Indoor Air Coach**: Room volume and CADR requirement calculator (ASHRAE 52.2 / BEE India), ventilation timing windows based on IMD boundary layer mixing, filter replacement cadence, and strict warnings against ozone generators.
5. **Smart Commute**: Compares public transit, metro, CNG, EV, cycling, and walking. Forbids strenuous outdoor travel and open transport at Severe AQI (>400).
6. **Impact Tracker**: Computes avoided CO₂e based on documented IPCC AR6 and MoEFCC GHG Platform 2022 factors. Keeps carbon emissions avoided strictly separate from PM2.5 inhalation dose.
7. **AI Assistant with RAG**: Grounded in official guidance from WHO, CPCB, CAQM, IMD, IITM, and NCDC. Discloses data limitations, rejects medical diagnosis requests, and avoids hallucinatory citations.
8. **Research Library & Community**: Peer-reviewed studies, official regulatory standards (NAAQS, GRAP), and verified government complaint links (CAQM Helpline: 1800-11-1600).
9. **Household Onboarding**: 3-step setup with voluntary health consent and skip options.

---

## 🛡️ Responsible AI & Health Standards

- **No Medical Diagnoses**: The platform explicitly disclaims diagnostic authority.
- **No Ozone Generators**: Ozone is an identified lung irritant and air pollutant under WHO AQG 2021; ozone-emitting devices are strictly flagged as hazardous.
- **Houseplants Caveat**: Clarifies that indoor plants have negligible effect on room-scale particulate matter.
- **Emissions ≠ Exposure**: Reductions in CO₂e emissions from electric vehicles or mode shifts are never conflated with personal PM2.5 exposure reductions.

---

## 📋 Mandatory Quality Checklist Audit

| Item | Status | Verification Detail |
|---|:---:|---|
| No horizontal scrolling at 320px+ | ✅ PASS | Responsive box-sizing, fluid clamp typography, mobile flex wrapping |
| Mobile hamburger menu | ✅ PASS | Fully accessible with keyboard navigation, ARIA controls, auto-closes on route change |
| Logo is clickable link to home | ✅ PASS | Header `<Link href="/">` wraps brand mark |
| Custom 404 page | ✅ PASS | Dedicated [not-found.tsx](file:///c:/Users/ayush/Downloads/urban-air-quality-assistant/src/app/not-found.tsx) with navigation |
| Favicon | ✅ PASS | Scalable SVG favicon linked in layout metadata |
| Unique page title per page | ✅ PASS | Configured with Next.js Metadata title templates across all routes |
| Meta descriptions | ✅ PASS | Custom, informative descriptions on every page |
| Fixed footer links | ✅ PASS | All internal links route properly; external links point to verified authorities |
| Dynamic copyright year | ✅ PASS | Generated via `currentYear()` helper |
| Compressed images | ✅ PASS | Next.js configuration enables AVIF and WebP formats |
| Every button works | ✅ PASS | Form submits, filters, tab switches, and city selectors verified |
| Form feedback states | ✅ PASS | Success and error message banners on every interactive action |
| Zero placeholder / lorem text | ✅ PASS | All copy is domain-specific, scientific, and realistic |
| Loading skeletons & boundaries | ✅ PASS | Skeletons for gauges and trends; global [error.tsx](file:///c:/Users/ayush/Downloads/urban-air-quality-assistant/src/app/error.tsx) boundary |
| Visible DEMO DATA badge | ✅ PASS | Prominent badge on all mock data views; never claims demo data is live |
| Accessible semantic HTML | ✅ PASS | WCAG AA color contrast, ARIA landmarks, roles, and live regions |

---

## 📄 License

Built for PromptWars Challenge 06. Guidance based on publicly available standards from CPCB, WHO, and CAQM. Not a substitute for professional medical advice. For emergencies, contact 112.
