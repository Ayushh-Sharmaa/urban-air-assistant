/**
 * Smart Commute service — transport alternatives and timing.
 * No "pollution-safe route" claims. No strenuous outdoor travel at Severe AQI.
 * CO₂e figures use documented emission factors.
 */
import { commuteComparison, labelForMode, type TransportMode } from "@/utils/emissions";

export interface CommuteOption {
  mode: TransportMode;
  label: string;
  co2ePerKm: number;
  recommended: boolean;
  reason: string;
  limitations: string[];
  safeAtSevereAqi: boolean;
}

export interface CommuteAdvice {
  options: CommuteOption[];
  departureTiming: string[];
  warnings: string[];
  comparison?: ReturnType<typeof commuteComparison>;
}

const BASE_OPTIONS: CommuteOption[] = [
  {
    mode: "metro",
    label: "Metro",
    co2ePerKm: 0.031,
    recommended: true,
    reason: "84% lower CO₂e than petrol car. Enclosed carriages reduce PM2.5 exposure vs open auto/bike.",
    limitations: ["Limited to metro cities and corridors", "Last-mile connectivity needed"],
    safeAtSevereAqi: true,
  },
  {
    mode: "bus",
    label: "Bus (DTC/BEST/BMTC)",
    co2ePerKm: 0.089,
    recommended: true,
    reason: "54% lower CO₂e than petrol car. Modern CNG/electric buses significantly cleaner.",
    limitations: ["Slower than metro", "Waiting at stops increases exposure"],
    safeAtSevereAqi: true,
  },
  {
    mode: "cng",
    label: "CNG Vehicle",
    co2ePerKm: 0.108,
    recommended: true,
    reason: "44% lower CO₂e than petrol car. Mandatory for commercial vehicles in many Indian cities.",
    limitations: ["Still emits PM2.5 from brake/tyre wear"],
    safeAtSevereAqi: true,
  },
  {
    mode: "electric",
    label: "Electric Vehicle",
    co2ePerKm: 0.082,
    recommended: true,
    reason: "57% lower CO₂e than petrol car (Indian grid average). Zero tailpipe emissions.",
    limitations: ["Brake and tyre wear still produce PM2.5", "Grid emissions vary by state"],
    safeAtSevereAqi: true,
  },
  {
    mode: "petrolCar",
    label: "Petrol Car",
    co2ePerKm: 0.192,
    recommended: false,
    reason: "Highest CO₂e per km among motorised options. Contributes to road congestion and emissions.",
    limitations: [],
    safeAtSevereAqi: true,
  },
  {
    mode: "dieselCar",
    label: "Diesel Car",
    co2ePerKm: 0.171,
    recommended: false,
    reason: "Diesel engines emit significantly more PM2.5 and NOx than petrol. Banned under GRAP Stage III+ in NCR.",
    limitations: ["Banned in GRAP Stage III/IV in Delhi-NCR"],
    safeAtSevereAqi: false,
  },
  {
    mode: "autoRickshaw",
    label: "Auto-Rickshaw (CNG)",
    co2ePerKm: 0.097,
    recommended: true,
    reason: "CNG autos are significantly cleaner than petrol/diesel equivalents. Good for last-mile.",
    limitations: ["Open cabin — higher outdoor air exposure than car"],
    safeAtSevereAqi: false, // open cabin
  },
  {
    mode: "bicycle",
    label: "Bicycle",
    co2ePerKm: 0.0,
    recommended: false, // depends on AQI
    reason: "Zero emissions. However, heavy breathing during cycling significantly increases PM2.5 inhalation dose.",
    limitations: ["Not recommended above AQI 150", "Increases PM2.5 intake due to elevated breathing rate"],
    safeAtSevereAqi: false,
  },
  {
    mode: "walking",
    label: "Walking",
    co2ePerKm: 0.0,
    recommended: false, // depends on AQI
    reason: "Zero emissions. Same PM2.5 concern as cycling — heavy breathing increases lung dose.",
    limitations: ["Not recommended above AQI 200 for more than 15 minutes", "Wear N95 if unavoidable"],
    safeAtSevereAqi: false,
  },
];

export function getCommuteAdvice(aqi: number, baseline?: TransportMode, alternative?: TransportMode, distanceKm?: number): CommuteAdvice {
  const isSevere = aqi > 400;
  const isVeryPoor = aqi > 300;

  const options = BASE_OPTIONS.map((opt) => {
    if (isSevere && !opt.safeAtSevereAqi) {
      return { ...opt, recommended: false, reason: `${opt.reason} ⚠️ Avoid at Severe AQI — open exposure significantly increases PM2.5 inhalation.` };
    }
    if (isVeryPoor && (opt.mode === "bicycle" || opt.mode === "walking")) {
      return { ...opt, recommended: false };
    }
    return opt;
  });

  const departureTiming = isSevere
    ? ["Avoid all non-essential travel today (Severe AQI)", "If travel is unavoidable, use fully enclosed, filtered vehicle", "Depart only after 10 AM if absolutely necessary"]
    : [
        "🌅 10 AM–12 PM: Lowest daily AQI — best departure window (IMD)",
        "🌇 Avoid 7–9 AM peak: highest PM2.5 of the day due to temperature inversion",
        "🌆 Avoid 6–9 PM peak: evening traffic causes sharp AQI rise",
        "🌙 If shift work: wear N95 for night travel; PM2.5 elevated after 10 PM",
      ];

  const warnings = [
    "⚠️ No 'pollution-safe routes' exist — the entire city shares the same airshed.",
    "⚠️ AQI values represent station readings, not your specific street — treat as indicative.",
    "ℹ️ Switching to EV reduces CO₂e but PM2.5 from brake/tyre wear remains — emissions ≠ exposure.",
    ...(isSevere ? ["🚨 SEVERE AQI: No strenuous outdoor travel or exercise. Essential travel only in enclosed vehicle."] : []),
    ...(isVeryPoor ? ["🔴 VERY POOR AQI: Minimise time outdoors. Wear N95 mask for all outdoor exposure."] : []),
  ];

  let comparison: CommuteAdvice["comparison"];
  if (baseline && alternative && distanceKm) {
    comparison = commuteComparison(baseline, alternative, distanceKm);
  }

  return { options, departureTiming, warnings, comparison };
}

export { labelForMode };
export type { TransportMode };

