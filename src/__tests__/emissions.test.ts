/**
 * Tests for utils/emissions.ts
 */
import { commuteComparison, cookingComparison } from "../utils/emissions";

describe("commuteComparison", () => {
  test("metro vs petrol car saves CO2e", () => {
    const r = commuteComparison("petrolCar", "metro", 10);
    expect(r.savedKgCo2e).toBeGreaterThan(0);
    expect(r.savedPercentage).toBeGreaterThan(0);
    expect(r.baselineKgCo2e).toBeGreaterThan(r.alternativeKgCo2e);
  });

  test("same mode = zero savings", () => {
    const r = commuteComparison("petrolCar", "petrolCar", 10);
    expect(r.savedKgCo2e).toBe(0);
    expect(r.savedPercentage).toBe(0);
  });

  test("bicycle vs petrol = 100% savings", () => {
    const r = commuteComparison("petrolCar", "bicycle", 10);
    expect(r.alternativeKgCo2e).toBe(0);
    expect(r.savedPercentage).toBe(100);
  });

  test("saved never negative", () => {
    const r = commuteComparison("metro", "petrolCar", 10);
    expect(r.savedKgCo2e).toBeGreaterThanOrEqual(0);
  });

  test("includes documented assumptions", () => {
    const r = commuteComparison("petrolCar", "metro", 10);
    expect(r.assumptions.length).toBeGreaterThan(0);
    expect(r.assumptions.some((a: string) => a.includes("IPCC") || a.includes("MoEFCC"))).toBe(true);
  });

  test("distance proportionality", () => {
    const r10 = commuteComparison("petrolCar", "metro", 10);
    const r20 = commuteComparison("petrolCar", "metro", 20);
    expect(r20.savedKgCo2e).toBeCloseTo(r10.savedKgCo2e * 2, 1);
  });
});

describe("cookingComparison", () => {
  test("induction vs biomass saves CO2e per day", () => {
    const r = cookingComparison("biomass", "induction", 3);
    expect(r.savedKgCo2ePerDay).toBeGreaterThan(0);
    expect(r.savedKgCo2ePerYear).toBeGreaterThan(0);
  });

  test("annual savings = daily * 365", () => {
    const r = cookingComparison("biomass", "induction", 3);
    expect(r.savedKgCo2ePerYear).toBeCloseTo(r.savedKgCo2ePerDay * 365, 1);
  });

  test("includes documented assumptions", () => {
    const r = cookingComparison("biomass", "lpg", 3);
    expect(r.assumptions.some((a: string) => a.includes("MoEFCC") || a.includes("GHG Platform"))).toBe(true);
  });

  test("saved never negative", () => {
    const r = cookingComparison("lpg", "biomass", 3);
    expect(r.savedKgCo2ePerDay).toBeGreaterThanOrEqual(0);
  });
});
