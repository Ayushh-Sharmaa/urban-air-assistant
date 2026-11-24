/**
 * Emissions calculator — CO2e avoided.
 * Uses documented emission factors from IPCC AR6 and MoEFCC GHG Platform India 2022.
 * IMPORTANT: This computes CO2e, NOT PM2.5 reduction.
 * Exposure and emissions are tracked separately.
 */
import { EMISSION_FACTORS } from "./constants";

export type TransportMode = keyof typeof TRANSPORT_EF;

const TRANSPORT_EF = {
  petrolCar:    EMISSION_FACTORS.petrolCar,
  dieselCar:    EMISSION_FACTORS.dieselCar,
  cng:          EMISSION_FACTORS.cng,
  electric:     EMISSION_FACTORS.electric,
  bus:          EMISSION_FACTORS.bus,
  metro:        EMISSION_FACTORS.metro,
  autoRickshaw: EMISSION_FACTORS.autoRickshaw,
  bicycle:      EMISSION_FACTORS.bicycle,
  walking:      EMISSION_FACTORS.walking,
} as const;

export interface CommuteComparison {
  baselineKgCo2e: number;
  alternativeKgCo2e: number;
  savedKgCo2e: number;
  savedPercentage: number;
  /** Documented assumptions visible to user */
  assumptions: string[];
}

/**
 * Calculate CO2e for a one-way trip and the savings vs a baseline.
 * @param baseline - current transport mode
 * @param alternative - proposed alternative mode
 * @param distanceKm - trip distance in km
 */
export function commuteComparison(
  baseline: TransportMode,
  alternative: TransportMode,
  distanceKm: number
): CommuteComparison {
  const baselineEf = TRANSPORT_EF[baseline];
  const altEf = TRANSPORT_EF[alternative];
  const baselineKgCo2e = baselineEf * distanceKm;
  const alternativeKgCo2e = altEf * distanceKm;
  const savedKgCo2e = Math.max(0, baselineKgCo2e - alternativeKgCo2e);
  const savedPercentage =
    baselineKgCo2e > 0 ? Math.round((savedKgCo2e / baselineKgCo2e) * 100) : 0;

  return {
    baselineKgCo2e: round2(baselineKgCo2e),
    alternativeKgCo2e: round2(alternativeKgCo2e),
    savedKgCo2e: round2(savedKgCo2e),
    savedPercentage,
    assumptions: [
      `Emission factors: ${baseline} = ${baselineEf} kg CO₂e/km, ${alternative} = ${altEf} kg CO₂e/km`,
      "Source: IPCC AR6 transport annex; Indian grid average MoEFCC 2023",
      "One-way trip. Multiply by 2 for round trip.",
      "Figures represent direct + upstream (well-to-wheel) CO₂e",
      "CO₂e ≠ PM2.5. Switching to EV reduces carbon but may not reduce local PM2.5 from brake/tyre wear.",
    ],
  };
}

export type CookingFuel = "lpg" | "png" | "biomass" | "electric" | "induction";

const COOKING_EF: Record<CookingFuel, number> = {
  lpg:       EMISSION_FACTORS.lpg,
  png:       EMISSION_FACTORS.png,
  biomass:   EMISSION_FACTORS.biomass,
  electric:  EMISSION_FACTORS.gridElectricity * 1.5, // ~1.5 kWh/meal equivalent
  induction: EMISSION_FACTORS.gridElectricity * 1.0, // ~1 kWh/meal equivalent (induction more efficient)
};

export interface CookingComparison {
  baselineKgCo2ePerDay: number;
  alternativeKgCo2ePerDay: number;
  savedKgCo2ePerDay: number;
  savedKgCo2ePerYear: number;
  assumptions: string[];
}

/**
 * Compare cooking fuel CO2e per day (3 meals).
 */
export function cookingComparison(
  baseline: CookingFuel,
  alternative: CookingFuel,
  mealsPerDay = 3
): CookingComparison {
  const baseEf = COOKING_EF[baseline];
  const altEf = COOKING_EF[alternative];
  // LPG: ~0.5 kg per meal; biomass: ~1 kg per meal; electricity: per kWh
  const kgPerMeal = (fuel: CookingFuel) =>
    fuel === "lpg" || fuel === "png" || fuel === "biomass" ? 0.5 : 1;

  const baselineKgCo2ePerDay = round2(baseEf * kgPerMeal(baseline) * mealsPerDay);
  const alternativeKgCo2ePerDay = round2(altEf * kgPerMeal(alternative) * mealsPerDay);
  const savedKgCo2ePerDay = round2(Math.max(0, baselineKgCo2ePerDay - alternativeKgCo2ePerDay));
  const savedKgCo2ePerYear = round2(savedKgCo2ePerDay * 365);

  return {
    baselineKgCo2ePerDay,
    alternativeKgCo2ePerDay,
    savedKgCo2ePerDay,
    savedKgCo2ePerYear,
    assumptions: [
      `Emission factors: ${baseline} = ${COOKING_EF[baseline]} kg CO₂e/unit, ${alternative} = ${COOKING_EF[alternative]} kg CO₂e/unit`,
      "Sources: MoEFCC GHG Platform India 2022; Indian grid 0.716 kg CO₂e/kWh",
      `Assumes ~${kgPerMeal(baseline)} kg fuel or 1 kWh per meal`,
      "Biomass figures include non-CO₂ GHGs (CH₄, N₂O) at GWP100",
      "Switching from biomass to LPG also significantly reduces indoor PM2.5 — a separate health benefit not shown here.",
    ],
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function labelForMode(mode: TransportMode): string {
  const labels: Record<TransportMode, string> = {
    petrolCar: "Petrol Car",
    dieselCar: "Diesel Car",
    cng: "CNG Vehicle",
    electric: "Electric Vehicle",
    bus: "Bus",
    metro: "Metro",
    autoRickshaw: "Auto-Rickshaw",
    bicycle: "Bicycle",
    walking: "Walking",
  };
  return labels[mode];
}

export function labelForFuel(fuel: CookingFuel): string {
  const labels: Record<CookingFuel, string> = {
    lpg: "LPG",
    png: "Piped Natural Gas",
    biomass: "Wood / Biomass",
    electric: "Electric Stove (grid)",
    induction: "Induction Stove (grid)",
  };
  return labels[fuel];
}

