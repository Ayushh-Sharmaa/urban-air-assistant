import type { Metadata } from "next";
import OnboardingClient from "./OnboardingClient";

export const metadata: Metadata = {
  title: "Household Onboarding — Tailored Smog Defense",
  description: "Personalize your Urban Air Quality Assistant profile: household size, room specifications, commute, and optional sensitive group alerts.",
};

export default function OnboardingPage() {
  return <OnboardingClient />;
}

