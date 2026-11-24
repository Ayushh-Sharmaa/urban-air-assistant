/**
 * CADR (Clean Air Delivery Rate) calculator.
 * References: ASHRAE 52.2, BEE India air purifier guidelines.
 * IMPORTANT: We state real-world caveats and do NOT claim
 * HEPA removes all pollutants or that plants clean indoor air.
 */
import { CADR_REFERENCE } from "./constants";

export interface RoomSpec {
  /** Room area in square metres */
  areaSqm: number;
  /** Room height in metres (default 2.75 m) */
  heightM?: number;
  /** Desired air changes per hour */
  targetAch?: number;
}

export interface CadrResult {
  /** Minimum recommended CADR in m³/h */
  minCadr: number;
  /** Recommended CADR for effective protection */
  recommendedCadr: number;
  /** Volume of room in m³ */
  roomVolumeCubicM: number;
  /** Air changes per hour with the recommended CADR */
  achievedAch: number;
  assumptions: string[];
  warnings: string[];
}

/**
 * Calculate the recommended CADR for a room.
 */
export function calculateCadr(spec: RoomSpec): CadrResult {
  const height = spec.heightM ?? CADR_REFERENCE.roomHeightM;
  const ach = spec.targetAch ?? CADR_REFERENCE.targetAch;
  const volume = spec.areaSqm * height;
  const minCadr = Math.ceil(volume * 1); // 1 ACH minimum
  const recommendedCadr = Math.ceil(volume * ach); // target ACH
  const achievedAch = Math.round((recommendedCadr / volume) * 10) / 10;

  return {
    minCadr,
    recommendedCadr,
    roomVolumeCubicM: Math.round(volume * 10) / 10,
    achievedAch,
    assumptions: [
      `Room: ${spec.areaSqm} m² × ${height} m = ${Math.round(volume * 10) / 10} m³`,
      `Target: ${ach} air changes per hour (ASHRAE recommendation for PM2.5 reduction)`,
      "CADR is measured under lab conditions; real-world effectiveness depends on room sealing",
      "Sources: ASHRAE 52.2; BEE India Star-rated air purifiers; US EPA residential air cleaners guide (2018)",
    ],
    warnings: [
      "HEPA purifiers effectively capture PM2.5 and PM10 but do NOT remove gases, VOCs, or CO.",
      "Ozone-generating 'air purifiers' are hazardous — ozone is itself an air pollutant. Avoid them.",
      "Plants have negligible air-purification effect at room scale — do not rely on them for AQI protection.",
      "Filter replacement is critical: a clogged filter can re-release particles and harbour mould.",
      "Purifiers supplement (not replace) source control, ventilation, and sealing of gaps.",
    ],
  };
}

export interface VentilationWindow {
  hour: number; // 0-23
  label: string;
  recommended: boolean;
  reason: string;
}

/**
 * Returns recommended ventilation windows based on AQI and typical Delhi meteorology.
 * Based on IITM/IMD guidance: boundary layer height increases mid-morning.
 */
export function ventilationWindows(aqiValue: number): VentilationWindow[] {
  if (aqiValue > 400) {
    return [
      { hour: -1, label: "No ventilation advised", recommended: false, reason: "Severe AQI — keep windows closed. Use HEPA purifier indoors." },
    ];
  }
  if (aqiValue > 300) {
    return [
      { hour: -1, label: "Very limited ventilation", recommended: false, reason: "Very Poor AQI — open windows only briefly if essential. Keep gaps sealed." },
    ];
  }
  return [
    { hour: 10, label: "10–12 AM", recommended: true,  reason: "Boundary layer rises mid-morning; pollutants disperse. Best window for ventilation." },
    { hour: 11, label: "11 AM–1 PM", recommended: true,  reason: "Usually lowest PM2.5 of the day in urban India (IMD/IITM data)." },
    { hour: 2,  label: "2–4 PM",  recommended: aqiValue < 200, reason: "Acceptable on Moderate or better days. Avoid near busy roads." },
    { hour: 5,  label: "Before 7 AM", recommended: false, reason: "Temperature inversion traps pollutants overnight — highest morning PM2.5." },
    { hour: 20, label: "After 8 PM", recommended: false, reason: "Nocturnal boundary layer re-traps pollutants. Avoid ventilation at night." },
  ];
}

export interface FilterCareGuide {
  filterType: string;
  replaceEveryMonths: number;
  checkEveryWeeks: number;
  tips: string[];
}

export const FILTER_CARE: FilterCareGuide[] = [
  {
    filterType: "HEPA (H13/H14)",
    replaceEveryMonths: 6,
    checkEveryWeeks: 4,
    tips: [
      "Check indicator light or timer; replace immediately if flow drops noticeably.",
      "Never wash a true HEPA filter — water destroys the fibre structure.",
      "In Severe AQI months (Nov–Jan in Delhi), replace every 3–4 months.",
    ],
  },
  {
    filterType: "Pre-filter (washable)",
    replaceEveryMonths: 999, // washable
    checkEveryWeeks: 2,
    tips: [
      "Wash with cold water monthly; dry fully before reinstalling.",
      "A clogged pre-filter reduces HEPA lifespan — keep it clean.",
    ],
  },
  {
    filterType: "Activated Carbon / Deodorising",
    replaceEveryMonths: 3,
    checkEveryWeeks: 4,
    tips: [
      "Carbon saturates faster in kitchens and near roads.",
      "Replace every 3 months or when odours return; it does not indicate when saturated.",
    ],
  },
];

