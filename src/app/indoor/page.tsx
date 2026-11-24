import type { Metadata } from "next";
import IndoorClient from "./IndoorClient";

export const metadata: Metadata = {
  title: "Indoor Air Coach — CADR Calculator & Purifier Guide",
  description: "Personalised CADR calculator, ventilation timing, purifier guide and low-cost indoor air quality improvements for Indian homes — based on ASHRAE and BEE India standards.",
};

export default function IndoorPage() {
  return <IndoorClient />;
}

