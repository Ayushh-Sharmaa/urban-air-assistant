import type { Metadata } from "next";
import ImpactClient from "./ImpactClient";

export const metadata: Metadata = {
  title: "Impact Tracker — CO₂e Savings Calculator",
  description: "Track your CO₂e avoided from transport and cooking choices. Documented emission factors (IPCC AR6, MoEFCC 2022). Emissions and exposure tracked separately.",
};

export default function ImpactPage() {
  return <ImpactClient />;
}

