/**
 * Daily Planner service — generates time-of-day actions based on AQI.
 * All recommendations are based on CPCB, WHO, CAQM guidance.
 * Confidence levels and sources are explicitly stated.
 */
import { healthAdvisory } from "@/utils/aqi";
import { currentHourIST } from "@/utils/date";

export interface PlannerAction {
  id: string;
  action: string;
  reason: string;
  expectedBenefit: string;
  confidence: "High" | "Medium" | "Low";
  source: string;
  effort: "Low" | "Medium" | "High";
  estimatedCost: "Free" | "₹0–200" | "₹200–1000" | "₹1000+";
  completed: boolean;
}

export interface DailyPlan {
  morning: PlannerAction[];
  afternoon: PlannerAction[];
  evening: PlannerAction[];
  night: PlannerAction[];
  briefing: string;
  currentPeriod: "morning" | "afternoon" | "evening" | "night";
}

function getCurrentPeriod(): DailyPlan["currentPeriod"] {
  const h = currentHourIST();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

export function generateDailyPlan(aqi: number, city?: string): DailyPlan {
  const advisory = healthAdvisory(aqi);
  const isSevere = aqi > 400;
  const isVeryPoor = aqi > 300;
  const isPoor = aqi > 200;
  const isModerate = aqi > 100;

  const morning: PlannerAction[] = [
    {
      id: "m1",
      action: "Check CPCB AQI before stepping out",
      reason: "AQI peaks 6–9 AM due to nocturnal temperature inversion trapping overnight emissions.",
      expectedBenefit: "Avoid highest PM2.5 exposure of the day",
      confidence: "High",
      source: "IMD / IITM boundary layer research; CPCB station data",
      effort: "Low",
      estimatedCost: "Free",
      completed: false,
    },
    {
      id: "m2",
      action: isSevere ? "Stay indoors — SEVERE AQI" : isPoor ? "Wear N95 mask for all outdoor activity" : isModerate ? "Wear N95 mask if exercising outdoors" : "Wear mask if sensitive group member",
      reason: isSevere ? "AQI > 400: health emergency. All outdoor activity risks acute PM2.5 exposure." : "N95 (IS 9473) masks filter ≥95% of PM2.5 when properly fitted.",
      expectedBenefit: "Significantly reduce PM2.5 inhalation dose",
      confidence: "High",
      source: "CPCB health advisory; WHO AQG 2021",
      effort: "Low",
      estimatedCost: "₹0–200",
      completed: false,
    },
    {
      id: "m3",
      action: "Keep windows and doors closed until 10 AM",
      reason: "Early morning PM2.5 is highest. Temperature inversion lifts only after 9–10 AM.",
      expectedBenefit: "Reduce indoor PM2.5 infiltration by 30–60%",
      confidence: "High",
      source: "IITM/IMD meteorological guidance; ASHRAE ventilation standards",
      effort: "Low",
      estimatedCost: "Free",
      completed: false,
    },
    {
      id: "m4",
      action: "Run HEPA purifier on high through morning peak",
      reason: "Indoor infiltration of outdoor PM2.5 continues even with windows closed through gaps.",
      expectedBenefit: "Maintain indoor PM2.5 below 60 µg/m³ (NAAQS 24-h standard)",
      confidence: "High",
      source: "US EPA Residential Air Cleaners guide (2018); BEE India",
      effort: "Low",
      estimatedCost: "Free",
      completed: false,
    },
    {
      id: "m5",
      action: "Cook with LPG/induction, not biomass or wood",
      reason: "Biomass burning indoors produces PM2.5 concentrations 5–10× NAAQS limits within minutes.",
      expectedBenefit: "Prevents acute indoor PM2.5 spike during cooking",
      confidence: "High",
      source: "NCDC health burden report 2022; WHO household air pollution guidelines",
      effort: "Low",
      estimatedCost: "Free",
      completed: false,
    },
  ];

  const afternoon: PlannerAction[] = [
    {
      id: "a1",
      action: "10 AM–12 PM: best window for ventilation or outdoor activity",
      reason: "Convective mixing and rising boundary layer disperses pollutants — lowest daily PM2.5 in most Indian cities.",
      expectedBenefit: "Reduce PM2.5 exposure vs morning/evening by 20–40%",
      confidence: "High",
      source: "IMD / IITM seasonal boundary layer studies; CPCB hourly station data",
      effort: "Low",
      estimatedCost: "Free",
      completed: false,
    },
    {
      id: "a2",
      action: isSevere || isVeryPoor ? "No outdoor exercise today" : "Exercise before 12 PM or move workout indoors",
      reason: isSevere ? "At Severe AQI, strenuous breathing significantly increases PM2.5 lung dose." : "Afternoon AQI rises again after 2 PM as traffic increases.",
      expectedBenefit: "Avoid elevated PM2.5 inhalation from increased breathing rate",
      confidence: "High",
      source: "CAQM public advisory; CPCB AQI health guidelines",
      effort: "Medium",
      estimatedCost: "Free",
      completed: false,
    },
    {
      id: "a3",
      action: "Replace short car trips with metro or bus",
      reason: "Metro emits 0.031 kg CO₂e/km vs 0.192 kg for petrol car. Reduces road congestion and traffic emissions.",
      expectedBenefit: "84% lower CO₂e per trip; reduces your contribution to Delhi's traffic pollution",
      confidence: "High",
      source: "IPCC AR6 transport annex; MoEFCC GHG Platform India 2022",
      effort: "Medium",
      estimatedCost: "₹0–200",
      completed: false,
    },
    {
      id: "a4",
      action: "Check and replace HEPA filter if older than 6 months",
      reason: "A clogged HEPA filter loses effectiveness and may re-circulate captured particles.",
      expectedBenefit: "Maintains full HEPA filtration efficiency",
      confidence: "High",
      source: "BEE India air purifier guidelines; ASHRAE 52.2",
      effort: "Low",
      estimatedCost: "₹1000+",
      completed: false,
    },
  ];

  const evening: PlannerAction[] = [
    {
      id: "e1",
      action: "Close all windows by 6 PM — evening PM2.5 peak begins",
      reason: "Evening traffic, cooling temperatures, and reduced mixing height cause PM2.5 to rise sharply from 6–10 PM.",
      expectedBenefit: "Prevents evening spike from entering home",
      confidence: "High",
      source: "CPCB hourly data analysis; IMD Delhi winter smog patterns",
      effort: "Low",
      estimatedCost: "Free",
      completed: false,
    },
    {
      id: "e2",
      action: "No outdoor barbecue, fireplace, or burning waste",
      reason: "Open burning is a major PM2.5 source. Illegal under GRAP Stage I–IV in NCR.",
      expectedBenefit: "Prevents neighbourhood PM2.5 spike; legal compliance",
      confidence: "High",
      source: "CAQM GRAP guidelines; Environment Protection Act, India",
      effort: "Low",
      estimatedCost: "Free",
      completed: false,
    },
    {
      id: "e3",
      action: "Report stubble burning or waste burning to CAQM helpline 1800-11-1600",
      reason: "Crop residue burning contributes 20–60% of Delhi's peak PM2.5 in Oct–Nov (IITM modelling).",
      expectedBenefit: "Community action — enforcement can reduce neighbourhood AQI",
      confidence: "Medium",
      source: "CAQM Helpline; IITM stubble burning study 2023",
      effort: "Low",
      estimatedCost: "Free",
      completed: false,
    },
    {
      id: "e4",
      action: "Damp-mop floors and wipe surfaces to reduce settled PM10",
      reason: "Resuspension of settled dust increases indoor PM10. Wet mopping captures it rather than re-aerosolising.",
      expectedBenefit: "Reduces PM10 resuspension; improves indoor air quality",
      confidence: "Medium",
      source: "US EPA indoor air quality guide; CPCB indoor pollution guidance",
      effort: "Medium",
      estimatedCost: "Free",
      completed: false,
    },
  ];

  const night: PlannerAction[] = [
    {
      id: "n1",
      action: "Run HEPA purifier in bedroom overnight on medium setting",
      reason: "8 hours of sleep with elevated PM2.5 exposure significantly increases daily inhalation dose.",
      expectedBenefit: "Reduces overnight PM2.5 exposure by 50–80% (HEPA efficiency at room scale)",
      confidence: "High",
      source: "US EPA Air Cleaners guide 2018; CPCB indoor air quality guidelines",
      effort: "Low",
      estimatedCost: "Free",
      completed: false,
    },
    {
      id: "n2",
      action: "Seal visible window and door gaps with foam weather-stripping",
      reason: "Gaps around windows/doors are the primary PM2.5 infiltration route in Indian urban homes.",
      expectedBenefit: "Can reduce indoor PM2.5 by 20–40% when combined with HEPA purifier",
      confidence: "Medium",
      source: "Lawrence Berkeley National Lab infiltration studies; adapted to Indian housing typology",
      effort: "Medium",
      estimatedCost: "₹200–1000",
      completed: false,
    },
    {
      id: "n3",
      action: isSevere ? "Consult doctor if experiencing chest tightness, persistent cough, or breathlessness" : "Note any symptoms (cough, eye irritation) in a health log",
      reason: "Early symptom detection helps identify personal AQI sensitivity thresholds.",
      expectedBenefit: "Personalised health awareness; early intervention if needed",
      confidence: "High",
      source: "NCDC health advisory; WHO PM2.5 health effects guidance",
      effort: "Low",
      estimatedCost: "Free",
      completed: false,
    },
    {
      id: "n4",
      action: "Plan tomorrow's commute for 10 AM–12 PM departure if flexible",
      reason: "Staggering peak-hour travel reduces both personal exposure and collective road congestion.",
      expectedBenefit: "Lower personal PM2.5 exposure; contributes to reducing traffic emissions",
      confidence: "Medium",
      source: "CAQM traffic advisory; IMD Delhi AQI hourly patterns",
      effort: "Low",
      estimatedCost: "Free",
      completed: false,
    },
  ];

  const briefing = `${city ?? "Your city"} AQI is **${aqi}** (${aqi <= 50 ? "Good" : aqi <= 100 ? "Satisfactory" : aqi <= 200 ? "Moderate" : aqi <= 300 ? "Poor" : aqi <= 400 ? "Very Poor" : "⚠️ Severe"}). ${advisory.general} For sensitive groups: ${advisory.sensitive}`;

  return { morning, afternoon, evening, night, briefing, currentPeriod: getCurrentPeriod() };
}

