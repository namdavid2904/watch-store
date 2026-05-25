import { describe, expect, it } from "vitest";
import { toOverlayGroupTransform } from "./try-on-transform-math";

describe("toOverlayGroupTransform", () => {
  it("maps drag offset to world position", () => {
    const result = toOverlayGroupTransform(
      { x: 100, y: 50, scale: 1, rotation: 0 },
      41
    );
    expect(result.position[0]).toBeGreaterThan(0);
    expect(result.position[1]).toBeLessThan(0);
  });

  it("increases scale with user scale factor", () => {
    const base = toOverlayGroupTransform({ x: 0, y: 0, scale: 1, rotation: 0 }, 41);
    const enlarged = toOverlayGroupTransform({ x: 0, y: 0, scale: 1.5, rotation: 0 }, 41);
    expect(enlarged.scale).toBeGreaterThan(base.scale);
  });

  it("converts rotation degrees to radians on z axis", () => {
    const result = toOverlayGroupTransform({ x: 0, y: 0, scale: 1, rotation: 90 }, 40);
    expect(result.rotation[2]).toBeCloseTo(Math.PI / 2, 4);
  });
});
