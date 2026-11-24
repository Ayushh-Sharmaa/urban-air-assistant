// Application-wide constants. UPPER_SNAKE_CASE. No secrets here.

export const APP_NAME = "Urban Air Quality Assistant";
export const APP_TAGLINE = "Breathe smarter. Live healthier.";
export const APP_DESCRIPTION =
  "AI-powered daily smog guidance for Indian families — low-emission routines, indoor air coaching, and science-backed recommendations tailored to your location and lifestyle.";

/** Palatte tokens kept in sync with CSS variables */
export const COLORS = {
  navy: "#14213d",
  cream: "#F4EDE0",
  coral: "#FF6B5B",
  white: "#ffffff",
} as const;

/** CPCB AQI category thresholds */
export const AQI_CATEGORIES = [
  { max: 50,  label: "Good",        color: "#1f7a4d", bg: "#e3f3ea" },
  { max: 100, label: "Satisfactory",color: "#6aa84f", bg: "#eef5e3" },
  { max: 200, label: "Moderate",    color: "#e0a800", bg: "#fff8df" },
  { max: 300, label: "Poor",        color: "#f57c00", bg: "#fef0e6" },
  { max: 400, label: "Very Poor",   color: "#d32f2f", bg: "#fbe5e3" },
  { max: 500, label: "Severe",      color: "#7b1fa2", bg: "#f3e5f5" },
] as const;

/** Emission factors (kg CO2e per unit) — documented source: MoEFCC GHG Platform India 2022 */
export const EMISSION_FACTORS = {
  /** kg CO2e per km — source: IPCC AR6 transport annex */
  petrolCar:    0.192,
  dieselCar:    0.171,
  cng:          0.108,
  electric:     0.082,  // Indian grid average (MoEFCC 2023)
  bus:          0.089,  // per passenger-km
  metro:        0.031,  // per passenger-km
  autoRickshaw: 0.097,
  bicycle:      0.0,
  walking:      0.0,
  /** kg CO2e per kWh electricity (Indian grid) */
  gridElectricity: 0.716,
  /** kg CO2e per kg LPG (cooking) */
  lpg:  3.03,
  /** kg CO2e per kg biomass/wood (cooking) */
  biomass: 1.65,
  /** kg CO2e per kg PNG (piped natural gas) */
  png: 2.74,
} as const;

/** CADR (Clean Air Delivery Rate) reference values — ASHRAE 52.2 / BEE India */
export const CADR_REFERENCE = {
  /** m² coverage per CADR rating (1 ACH minimum, 5 ACH recommended) */
  sqmPerCadr: 0.6,
  /** typical room height India (m) */
  roomHeightM: 2.75,
  /** recommended ACH for Severe AQI */
  targetAch: 5,
} as const;

export const STALE_HOURS = 2; // data older than this is flagged stale

export const MAX_CONTACT_MESSAGE = 2000;
export const MIN_CONTACT_MESSAGE = 10;

export const RESEARCH_LIBRARY = [
  {
    id: "who-aq-guidelines-2021",
    title: "WHO Global Air Quality Guidelines 2021",
    issuer: "World Health Organization",
    date: "2021-09-22",
    url: "https://www.who.int/publications/i/item/9789240034228",
    summary:
      "Updated WHO AQG values: PM2.5 annual 5 µg/m³, 24-h 15 µg/m³; PM10 annual 15 µg/m³, 24-h 45 µg/m³. India exceeds all these by 5–10×.",
    applicability: "High — global standard; directly relevant to Indian urban settings.",
    evidenceType: "Systematic review",
  },
  {
    id: "cpcb-naaqs-2024",
    title: "National Ambient Air Quality Standards (NAAQS) India",
    issuer: "Central Pollution Control Board",
    date: "2024-01-01",
    url: "https://cpcb.nic.in/national-ambient-air-quality-standards/",
    summary:
      "India's legally binding standards: PM2.5 24-h 60 µg/m³ (annual 40); PM10 24-h 100 µg/m³ (annual 60). Stricter 2024 revision under review.",
    applicability: "High — mandatory compliance standard for Indian monitoring stations.",
    evidenceType: "Regulatory standard",
  },
  {
    id: "caqm-winter-plan-2024",
    title: "CAQM Winter Action Plan 2024–25 for NCR",
    issuer: "Commission for Air Quality Management in NCR",
    date: "2024-10-01",
    url: "https://caqm.nic.in/",
    summary:
      "GRAP stages (I–IV), stubble burning restrictions, construction bans, truck entry rules. Stage IV triggered at AQI > 450.",
    applicability: "High — directly applies to Delhi-NCR, legally enforceable.",
    evidenceType: "Regulatory action plan",
  },
  {
    id: "iitm-aeronet-2023",
    title: "Long-range transport and health burden of PM2.5 over Indo-Gangetic Plain",
    issuer: "Indian Institute of Tropical Meteorology (IITM)",
    date: "2023-07-15",
    url: "https://www.iitm.res.in/",
    summary:
      "Modelled contribution of crop-residue burning to IGP PM2.5 during Oct–Nov. Stubble contributes 20–60% of PM2.5 peaks in Delhi.",
    applicability: "Medium — model study; useful for seasonal context.",
    evidenceType: "Modelling study",
  },
  {
    id: "ncdc-smog-health-2022",
    title: "Health effects of air pollution in India — National burden estimates",
    issuer: "National Centre for Disease Control",
    date: "2022-04-20",
    url: "https://ncdc.mohfw.gov.in/",
    summary:
      "1.67 million premature deaths annually attributable to outdoor and indoor air pollution in India. Children and elderly most vulnerable.",
    applicability: "High — national burden data; underlines urgency of protective actions.",
    evidenceType: "Epidemiological study",
  },
  {
    id: "hepa-filtration-epa",
    title: "Residential Air Cleaners: A Technical Summary (3rd Ed.)",
    issuer: "US EPA",
    date: "2018-07-01",
    url: "https://www.epa.gov/indoor-air-quality-iaq/residential-air-cleaners-technical-summary",
    summary:
      "HEPA removes ≥99.97% of particles ≥0.3 µm in lab conditions. Real-world performance depends on CADR, room sealing, and filter condition.",
    applicability: "Medium — lab conditions differ from Indian homes; use as upper bound.",
    evidenceType: "Technical review",
  },
] as const;

export const COMMUNITY_LINKS = [
  {
    id: "cpcb-portal",
    name: "CPCB Air Quality Portal",
    url: "https://airquality.cpcb.gov.in/",
    description: "Official real-time AQI data for 400+ stations across India.",
    category: "Official data",
  },
  {
    id: "sameer-app",
    name: "SAMEER App (CPCB)",
    url: "https://play.google.com/store/apps/details?id=com.cpcb.sameer",
    description: "CPCB's official Android app for real-time AQI monitoring.",
    category: "Mobile app",
  },
  {
    id: "caqm",
    name: "CAQM — NCR Air Quality Commission",
    url: "https://caqm.nic.in/",
    description: "Official GRAP guidelines and winter action plans for Delhi-NCR.",
    category: "Regulatory body",
  },
  {
    id: "imd",
    name: "India Meteorological Department",
    url: "https://mausam.imd.gov.in/",
    description: "Official weather forecasts; meteorological conditions affect smog formation.",
    category: "Weather data",
  },
  {
    id: "who-india",
    name: "WHO India — Air Pollution",
    url: "https://www.who.int/india/health-topics/air-pollution",
    description: "WHO guidance and country data on air pollution health impacts.",
    category: "International guidance",
  },
] as const;

