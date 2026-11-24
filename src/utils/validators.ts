/** Shared Result type used across services */
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

/** Contact form */
export interface ContactInput {
  name: string;
  email: string;
  message: string;
}

export function validateContact(input: unknown): Result<ContactInput> {
  const d = (input ?? {}) as Record<string, unknown>;
  const name = String(d.name ?? "").trim();
  const email = String(d.email ?? "").trim();
  const message = String(d.message ?? "").trim();
  if (name.length < 2) return { ok: false, error: "Please enter your name (at least 2 characters)." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Please enter a valid email address." };
  if (message.length < 10) return { ok: false, error: "Message must be at least 10 characters." };
  if (message.length > 2000) return { ok: false, error: "Message must be under 2000 characters." };
  return { ok: true, value: { name, email, message } };
}

/** Chat message */
export interface ChatInput {
  message: string;
  location?: string;
}

export function validateChatMessage(input: unknown): Result<ChatInput> {
  const d = (input ?? {}) as Record<string, unknown>;
  const message = String(d.message ?? "").trim();
  const location = d.location ? String(d.location).trim() : undefined;
  if (!message) return { ok: false, error: "Message cannot be empty." };
  if (message.length > 1000) return { ok: false, error: "Message must be under 1000 characters." };
  return { ok: true, value: { message, location } };
}

/** Indoor coach questionnaire */
export interface IndoorProfile {
  areaSqm: number;
  occupants: number;
  cookingFuel: "lpg" | "png" | "biomass" | "electric" | "induction";
  hasPurifier: boolean;
  purifierCadr?: number;
  ventilationType: "windows" | "mechanical" | "both" | "none";
  budget: "low" | "medium" | "high";
}

export function validateIndoorProfile(input: unknown): Result<IndoorProfile> {
  const d = (input ?? {}) as Record<string, unknown>;
  const areaSqm = Number(d.areaSqm);
  const occupants = Number(d.occupants);
  if (!Number.isFinite(areaSqm) || areaSqm < 5 || areaSqm > 500)
    return { ok: false, error: "Room area must be between 5 and 500 m²." };
  if (!Number.isFinite(occupants) || occupants < 1 || occupants > 20)
    return { ok: false, error: "Occupants must be between 1 and 20." };
  const validFuels = ["lpg", "png", "biomass", "electric", "induction"];
  if (!validFuels.includes(String(d.cookingFuel)))
    return { ok: false, error: "Invalid cooking fuel selection." };
  const validVents = ["windows", "mechanical", "both", "none"];
  if (!validVents.includes(String(d.ventilationType)))
    return { ok: false, error: "Invalid ventilation type." };
  const validBudgets = ["low", "medium", "high"];
  if (!validBudgets.includes(String(d.budget)))
    return { ok: false, error: "Invalid budget selection." };
  return {
    ok: true,
    value: {
      areaSqm,
      occupants,
      cookingFuel: d.cookingFuel as IndoorProfile["cookingFuel"],
      hasPurifier: Boolean(d.hasPurifier),
      purifierCadr: d.purifierCadr ? Number(d.purifierCadr) : undefined,
      ventilationType: d.ventilationType as IndoorProfile["ventilationType"],
      budget: d.budget as IndoorProfile["budget"],
    },
  };
}

/** Location input */
export function validateLocation(input: unknown): Result<string> {
  const loc = String(input ?? "").trim();
  if (loc.length < 2) return { ok: false, error: "Please enter a valid city or area name." };
  if (loc.length > 100) return { ok: false, error: "Location name is too long." };
  return { ok: true, value: loc };
}

/** Commute inputs */
export interface CommuteInput {
  distanceKm: number;
  baseline: string;
  alternative: string;
}

export function validateCommuteInput(input: unknown): Result<CommuteInput> {
  const d = (input ?? {}) as Record<string, unknown>;
  const distanceKm = Number(d.distanceKm);
  if (!Number.isFinite(distanceKm) || distanceKm <= 0 || distanceKm > 500)
    return { ok: false, error: "Distance must be between 0 and 500 km." };
  if (!d.baseline) return { ok: false, error: "Please select your current transport mode." };
  if (!d.alternative) return { ok: false, error: "Please select an alternative transport mode." };
  return { ok: true, value: { distanceKm, baseline: String(d.baseline), alternative: String(d.alternative) } };
}
