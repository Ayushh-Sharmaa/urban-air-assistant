import type { Metadata } from "next";
import CommuteClient from "./CommuteClient";

export const metadata: Metadata = {
  title: "Smart Commute — Lower-Emission Transport Options",
  description: "Transport alternatives, optimal departure timing, and CO₂e savings calculator for Indian commuters. Documented emission factors and visible assumptions.",
};

export default function CommutePage() {
  return <CommuteClient />;
}

