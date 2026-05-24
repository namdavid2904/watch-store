import { describe, expect, it } from "vitest";
import {
  computeEffectiveDiameterMm,
  computeOverlayDiameterPx,
  parseCaseDiameterMm,
} from "./watch-sizing";

describe("parseCaseDiameterMm", () => {
  it("parses mm suffix", () => {
    expect(parseCaseDiameterMm("41mm")).toBe(41);
  });

  it("falls back when empty", () => {
    expect(parseCaseDiameterMm(null)).toBe(40);
  });
});

describe("computeOverlayDiameterPx", () => {
  it("scales with user transform", () => {
    const base = computeOverlayDiameterPx(41, 1);
    const enlarged = computeOverlayDiameterPx(41, 1.5);
    expect(enlarged).toBeGreaterThan(base);
  });

  it("respects minimum size", () => {
    expect(computeOverlayDiameterPx(10, 0.35)).toBeGreaterThanOrEqual(140);
  });
});

describe("computeEffectiveDiameterMm", () => {
  it("reflects case diameter times scale", () => {
    expect(computeEffectiveDiameterMm(41, 1.1)).toBe(45.1);
  });
});
