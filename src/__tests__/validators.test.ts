/**
 * Tests for utils/validators.ts
 */
import { validateContact, validateChatMessage, validateIndoorProfile, validateLocation, validateCommuteInput } from "../utils/validators";

describe("validateContact", () => {
  const valid = { name: "Priya Sharma", email: "priya@example.com", message: "Hello, I need help with air quality." };

  test("valid input returns ok:true", () => {
    const r = validateContact(valid);
    expect(r.ok).toBe(true);
  });

  test("short name returns error", () => {
    const r = validateContact({ ...valid, name: "P" });
    expect(r.ok).toBe(false);
  });

  test("invalid email returns error", () => {
    const r = validateContact({ ...valid, email: "not-an-email" });
    expect(r.ok).toBe(false);
  });

  test("short message returns error", () => {
    const r = validateContact({ ...valid, message: "Hi" });
    expect(r.ok).toBe(false);
  });

  test("message over 2000 chars returns error", () => {
    const r = validateContact({ ...valid, message: "a".repeat(2001) });
    expect(r.ok).toBe(false);
  });

  test("null input returns error", () => {
    const r = validateContact(null);
    expect(r.ok).toBe(false);
  });

  test("trims whitespace from fields", () => {
    const r = validateContact({ name: "  Priya  ", email: " priya@example.com ", message: "   Hello, I need help.   " });
    if (r.ok) {
      expect(r.value.name).toBe("Priya");
      expect(r.value.email).toBe("priya@example.com");
    }
  });
});

describe("validateChatMessage", () => {
  test("valid message returns ok:true", () => {
    const r = validateChatMessage({ message: "What purifier do I need?" });
    expect(r.ok).toBe(true);
  });

  test("empty message returns error", () => {
    const r = validateChatMessage({ message: "" });
    expect(r.ok).toBe(false);
  });

  test("message over 1000 chars returns error", () => {
    const r = validateChatMessage({ message: "a".repeat(1001) });
    expect(r.ok).toBe(false);
  });

  test("optional location is preserved", () => {
    const r = validateChatMessage({ message: "Help me", location: "Delhi" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.location).toBe("Delhi");
  });
});

describe("validateIndoorProfile", () => {
  const valid = { areaSqm: 20, occupants: 3, cookingFuel: "lpg", hasPurifier: false, ventilationType: "windows", budget: "medium" };

  test("valid profile returns ok:true", () => {
    const r = validateIndoorProfile(valid);
    expect(r.ok).toBe(true);
  });

  test("area below 5 returns error", () => {
    const r = validateIndoorProfile({ ...valid, areaSqm: 3 });
    expect(r.ok).toBe(false);
  });

  test("area above 500 returns error", () => {
    const r = validateIndoorProfile({ ...valid, areaSqm: 600 });
    expect(r.ok).toBe(false);
  });

  test("invalid cooking fuel returns error", () => {
    const r = validateIndoorProfile({ ...valid, cookingFuel: "nuclear" });
    expect(r.ok).toBe(false);
  });

  test("invalid budget returns error", () => {
    const r = validateIndoorProfile({ ...valid, budget: "ultra" });
    expect(r.ok).toBe(false);
  });
});

describe("validateLocation", () => {
  test("valid city returns ok:true", () => {
    const r = validateLocation("Delhi");
    expect(r.ok).toBe(true);
  });

  test("single char returns error", () => {
    const r = validateLocation("D");
    expect(r.ok).toBe(false);
  });

  test("empty string returns error", () => {
    const r = validateLocation("");
    expect(r.ok).toBe(false);
  });

  test("very long string returns error", () => {
    const r = validateLocation("a".repeat(101));
    expect(r.ok).toBe(false);
  });
});

describe("validateCommuteInput", () => {
  const valid = { distanceKm: 10, baseline: "petrolCar", alternative: "metro" };

  test("valid input returns ok:true", () => {
    const r = validateCommuteInput(valid);
    expect(r.ok).toBe(true);
  });

  test("distance 0 returns error", () => {
    const r = validateCommuteInput({ ...valid, distanceKm: 0 });
    expect(r.ok).toBe(false);
  });

  test("distance > 500 returns error", () => {
    const r = validateCommuteInput({ ...valid, distanceKm: 501 });
    expect(r.ok).toBe(false);
  });

  test("missing baseline returns error", () => {
    const r = validateCommuteInput({ distanceKm: 10, alternative: "metro" });
    expect(r.ok).toBe(false);
  });
});

