const DEFAULT_CASE_DIAMETER_MM = 40;

/**
 * Parses a product case dimension string (e.g. "41mm", "38.5 mm") into millimeters.
 */
export function parseCaseDiameterMm(caseDimension: string | null | undefined): number {
  if (!caseDimension?.trim()) {
    return DEFAULT_CASE_DIAMETER_MM;
  }

  const mmMatch = caseDimension.match(/(\d+(?:\.\d+)?)\s*mm/i);
  if (mmMatch) {
    return Number.parseFloat(mmMatch[1]);
  }

  const numeric = Number.parseFloat(caseDimension);
  return Number.isFinite(numeric) ? numeric : DEFAULT_CASE_DIAMETER_MM;
}

export { DEFAULT_CASE_DIAMETER_MM };
