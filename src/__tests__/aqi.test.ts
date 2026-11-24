/**
 * Tests for utils/aqi.ts — CPCB AQI engine.
 * Run with: npx jest src/__tests__/aqi.test.ts
 */
import { subIndex, overallAqi, categoryFor, pollutantLabel, pollutantUnit, healthAdvisory } from "../utils/aqi";

describe("subIndex — CPCB PM2.5", () => {
  test("0 µg/m³ → AQI 0", () => expect(subIndex("pm25", 0)).toBe(0));
  test("30 µg/m³ → AQI 50 (top of Good)", () => expect(subIndex("pm25", 30)).toBe(50));
  test("60 µg/m³ → AQI 100 (top of Satisfactory)", () => expect(subIndex("pm25", 60)).toBe(100));
  test("90 µg/m³ → AQI 200 (top of Moderate — boundary)", () => expect(subIndex("pm25", 90)).toBe(200));
  test("250 µg/m³ → AQI 400 (top of Very Poor)", () => expect(subIndex("pm25", 250)).toBe(400));
  test("> 500 µg/m³ → AQI 500 (Severe cap)", () => expect(subIndex("pm25", 999)).toBe(500));
  test("negative → null (invalid)", () => expect(subIndex("pm25", -1)).toBeNull());
  test("NaN → null (invalid)", () => expect(subIndex("pm25", NaN)).toBeNull());
  test("Infinity → null (invalid)", () => expect(subIndex("pm25", Infinity)).toBeNull());
});

describe("subIndex — CPCB PM10", () => {
  test("50 µg/m³ → AQI 50 (top of Good)", () => expect(subIndex("pm10", 50)).toBe(50));
  test("100 µg/m³ → AQI 100 (top of Satisfactory)", () => expect(subIndex("pm10", 100)).toBe(100));
  test("350 µg/m³ → AQI 300 (top of Poor)", () => expect(subIndex("pm10", 350)).toBe(300));
});

describe("overallAqi", () => {
  test("returns max sub-index pollutant", () => {
    const result = overallAqi({ pm25: 90, pm10: 100 }); // pm25→200, pm10→100; max is pm25
    expect(result).not.toBeNull();
    expect(result!.aqi).toBe(200);
    expect(result!.mainPollutant).toBe("pm25");
  });

  test("returns null for empty object", () => {
    expect(overallAqi({})).toBeNull();
  });

  test("returns null for all invalid values", () => {
    expect(overallAqi({ pm25: -1, pm10: NaN })).toBeNull();
  });

  test("ignores undefined values", () => {
    const result = overallAqi({ pm25: 30, pm10: undefined });
    expect(result).not.toBeNull();
    expect(result!.mainPollutant).toBe("pm25");
  });

  test("AQI never exceeds 500", () => {
    const result = overallAqi({ pm25: 999, pm10: 999 });
    expect(result!.aqi).toBeLessThanOrEqual(500);
  });

  test("category label matches expected range", () => {
    const good = overallAqi({ pm25: 10 });
    expect(good!.category.label).toBe("Good");

    const severe = overallAqi({ pm25: 400 });
    expect(severe!.category.label).toBe("Severe");
  });
});

describe("categoryFor", () => {
  test("AQI 0 → Good", () => expect(categoryFor(0).label).toBe("Good"));
  test("AQI 50 → Good", () => expect(categoryFor(50).label).toBe("Good"));
  test("AQI 51 → Satisfactory", () => expect(categoryFor(51).label).toBe("Satisfactory"));
  test("AQI 100 → Satisfactory", () => expect(categoryFor(100).label).toBe("Satisfactory"));
  test("AQI 101 → Moderate", () => expect(categoryFor(101).label).toBe("Moderate"));
  test("AQI 200 → Moderate", () => expect(categoryFor(200).label).toBe("Moderate"));
  test("AQI 201 → Poor", () => expect(categoryFor(201).label).toBe("Poor"));
  test("AQI 300 → Poor", () => expect(categoryFor(300).label).toBe("Poor"));
  test("AQI 301 → Very Poor", () => expect(categoryFor(301).label).toBe("Very Poor"));
  test("AQI 400 → Very Poor", () => expect(categoryFor(400).label).toBe("Very Poor"));
  test("AQI 401 → Severe", () => expect(categoryFor(401).label).toBe("Severe"));
  test("AQI 500 → Severe", () => expect(categoryFor(500).label).toBe("Severe"));
  test("AQI 999 → Severe (clamp)", () => expect(categoryFor(999).label).toBe("Severe"));
});

describe("pollutantLabel and pollutantUnit", () => {
  test("pm25 label is PM2.5", () => expect(pollutantLabel("pm25")).toBe("PM2.5"));
  test("pm10 label is PM10", () => expect(pollutantLabel("pm10")).toBe("PM10"));
  test("no2 unit is µg/m³", () => expect(pollutantUnit("no2")).toBe("µg/m³"));
  test("co unit is mg/m³", () => expect(pollutantUnit("co")).toBe("mg/m³"));
});

describe("healthAdvisory", () => {
  test("Good AQI gives positive advisory", () => {
    const { general } = healthAdvisory(25);
    expect(general.toLowerCase()).toContain("good");
  });
  test("Severe AQI includes emergency language", () => {
    const { general } = healthAdvisory(450);
    expect(general.toLowerCase()).toContain("indoor");
  });
  test("All AQI levels return non-empty strings", () => {
    [0, 50, 100, 200, 300, 400, 500].forEach(aqi => {
      const { general, sensitive } = healthAdvisory(aqi);
      expect(general.length).toBeGreaterThan(0);
      expect(sensitive.length).toBeGreaterThan(0);
    });
  });
});
