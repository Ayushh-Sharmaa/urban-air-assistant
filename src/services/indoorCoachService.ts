/**
 * Indoor Air Coach service — CADR recommendations, ventilation, and low-cost alternatives.
 * No claims that HEPA removes everything or that plants clean air.
 * No ozone generator recommendations.
 */
import { calculateCadr, ventilationWindows, FILTER_CARE } from "@/utils/cadr";
import type { IndoorProfile } from "@/utils/validators";

export interface IndoorRecommendation {
  id: string;
  title: string;
  description: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  estimatedCost: "Free" | "₹0–500" | "₹500–2000" | "₹2000–10000" | "₹10000+";
  source: string;
  warning?: string;
}

export interface IndoorCoachResult {
  cadr: ReturnType<typeof calculateCadr>;
  ventilationWindows: ReturnType<typeof ventilationWindows>;
  filterCare: typeof FILTER_CARE;
  recommendations: IndoorRecommendation[];
  purifierAdequacy?: { current: number; needed: number; adequate: boolean };
}

export function getIndoorCoachAdvice(profile: IndoorProfile, aqi: number): IndoorCoachResult {
  const cadr = calculateCadr({ areaSqm: profile.areaSqm, targetAch: aqi > 300 ? 5 : 3 });
  const windows = ventilationWindows(aqi);
  const recommendations: IndoorRecommendation[] = [];

  // Cooking fuel
  if (profile.cookingFuel === "biomass") {
    recommendations.push({
      id: "fuel-biomass",
      title: "🚨 Switch from biomass/wood to LPG or induction",
      description: "Biomass burning indoors generates PM2.5 at 5–10× NAAQS limits within minutes of lighting. This is the single highest indoor PM2.5 risk factor. Apply for Pradhan Mantri Ujjwala Yojana (PMUY) for subsidised LPG connection.",
      priority: "Critical",
      estimatedCost: "₹0–500",
      source: "WHO Household Air Pollution guidelines; NCDC burden report 2022; PMUY scheme",
      warning: "Biomass smoke contains PM2.5, CO, and carcinogenic polycyclic aromatic hydrocarbons. This is a critical health risk — not just an AQI issue.",
    });
  }

  // Purifier adequacy
  let purifierAdequacy: IndoorCoachResult["purifierAdequacy"];
  if (profile.hasPurifier && profile.purifierCadr) {
    const adequate = profile.purifierCadr >= cadr.minCadr;
    purifierAdequacy = { current: profile.purifierCadr, needed: cadr.recommendedCadr, adequate };
    if (!adequate) {
      recommendations.push({
        id: "purifier-undersized",
        title: "Air purifier may be undersized for this room",
        description: `Your purifier (CADR: ${profile.purifierCadr} m³/h) provides less than the minimum recommended ${cadr.minCadr} m³/h for a ${profile.areaSqm} m² room. Consider adding a second unit or upgrading.`,
        priority: "High",
        estimatedCost: "₹2000–10000",
        source: "ASHRAE 52.2; BEE India air purifier standards",
      });
    }
  } else if (!profile.hasPurifier) {
    recommendations.push({
      id: "purifier-needed",
      title: `Get a HEPA purifier rated ≥${cadr.recommendedCadr} m³/h CADR`,
      description: `For your ${profile.areaSqm} m² room, you need a purifier with CADR ≥ ${cadr.minCadr} m³/h (minimum) to ${cadr.recommendedCadr} m³/h (recommended for ${aqi > 300 ? "Very Poor/Severe" : "current"} AQI). Look for BEE 4–5 star rated purifiers with certified HEPA H13.`,
      priority: aqi > 300 ? "Critical" : "High",
      estimatedCost: "₹2000–10000",
      source: "ASHRAE 52.2; BEE India; US EPA Air Cleaners guide 2018",
      warning: "Avoid ozone-generating 'air purifiers' and ionisers — ozone is a lung irritant and classified as an air pollutant by WHO.",
    });
  }

  // Low-cost alternatives
  recommendations.push({
    id: "sealing",
    title: "Seal window and door gaps with foam weather-stripping",
    description: "PM2.5 enters primarily through gaps around windows and doors. Foam strips (available at ₹100–300/m) can reduce infiltration by 20–40%.",
    priority: "High",
    estimatedCost: "₹500–2000",
    source: "Lawrence Berkeley National Lab building infiltration studies; adapted for Indian urban housing",
  });

  if (profile.ventilationType === "none" || profile.ventilationType === "windows") {
    recommendations.push({
      id: "ventilation-timing",
      title: "Ventilate only 10 AM–12 PM on days below AQI 300",
      description: "Open windows only during the mid-morning dispersion window. Keep closed all other times. Never ventilate at night or early morning.",
      priority: "High",
      estimatedCost: "Free",
      source: "IITM/IMD boundary layer meteorology; CPCB station hourly data",
    });
  }

  if (profile.budget === "low") {
    recommendations.push({
      id: "diy-purifier",
      title: "DIY box-fan purifier (Corsi-Rosenthal box) — budget option",
      description: `Attach a standard MERV-13 filter (₹200–400) to a 60W box fan to create a low-cost air purifier. Studies show CADR of ~200–300 m³/h. NOT a replacement for certified HEPA, but significantly reduces PM2.5. Good for large halls or when purifier budget is limited.`,
      priority: "Medium",
      estimatedCost: "₹500–2000",
      source: "Corsi-Rosenthal box studies (2020–2022); MERV-13 PM2.5 capture studies",
      warning: "Ensure fan motor rating matches filter airflow resistance. Use MERV-13, not MERV-8.",
    });
  }

  recommendations.push({
    id: "no-ozone",
    title: "⚠️ Avoid ozone generators and ionisers",
    description: "Ozone-generating devices are marketed as 'air purifiers' but ozone is itself an air pollutant harmful to lung tissue. WHO and US EPA classify ozone as a primary pollutant.",
    priority: "Critical",
    estimatedCost: "Free",
    source: "WHO AQG 2021; US EPA ozone generators fact sheet; CPCB air quality standards",
    warning: "This is a safety warning. Never use ozone generators in occupied spaces.",
  });

  if (profile.occupants > 3) {
    recommendations.push({
      id: "co2-monitor",
      title: "Add CO₂ monitor to track ventilation adequacy",
      description: `With ${profile.occupants} occupants, CO₂ can build up quickly. Keep below 1000 ppm (ventilate at 10 AM–12 PM window). CO₂ rise indicates stale air, though CO₂ itself does not capture PM2.5 levels.`,
      priority: "Medium",
      estimatedCost: "₹2000–10000",
      source: "ASHRAE 62.1 ventilation standard; WHO indoor air quality guidelines",
    });
  }

  return { cadr, ventilationWindows: windows, filterCare: FILTER_CARE, recommendations, purifierAdequacy };
}

