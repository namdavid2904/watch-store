const DEFAULT_CASE_DIAMETER_MM = 40;

/**
 * Parses a product case dimension string (e.g. "41mm", "38.5 mm") into millimeters.
 */
export function parseCaseDiameterMm(caseDimension: string | null | undefined): number {
  if (!caseDimension?.trim()) {
    return DEFAULT_CASE_DIAMETER_MM;
  }

  const mmMatch = caseDimension.match(/(\d+(?:\.\d+)?)\s*mm/i);
  if (mmMatch?.[1]) {
    return Number.parseFloat(mmMatch[1]);
  }

  const numeric = Number.parseFloat(caseDimension);
  return Number.isFinite(numeric) ? numeric : DEFAULT_CASE_DIAMETER_MM;
}

/** Screen pixels per millimeter of case diameter at scale 1. */
export const PX_PER_MM = 6.5;

export const OVERLAY_MIN_PX = 140;
export const OVERLAY_MAX_BASE_PX = 280;

/**
 * Diameter in pixels for the try-on asset ring, scaled by user pinch/slider.
 */
export function computeOverlayDiameterPx(caseDiameterMm: number, scale: number): number {
  const fromSpec = caseDiameterMm * PX_PER_MM * scale;
  const capped = Math.min(fromSpec, OVERLAY_MAX_BASE_PX * scale);
  return Math.max(OVERLAY_MIN_PX, capped);
}

/**
 * Effective on-screen case diameter after user scale adjustment.
 */
export function computeEffectiveDiameterMm(caseDiameterMm: number, scale: number): number {
  return Math.round(caseDiameterMm * scale * 10) / 10;
}

export { DEFAULT_CASE_DIAMETER_MM };
